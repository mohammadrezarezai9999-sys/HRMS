"""
WebAuthn for:
- built-in PC fingerprint / Windows Hello
- phone biometrics (browser)
- external USB FIDO2 / security-key style authenticators

Admin can enroll a credential for an employee (employee must touch the sensor).
"""

from __future__ import annotations

import json

from django.conf import settings
from django.core.cache import cache
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    options_to_json,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers import base64url_to_bytes, bytes_to_base64url
from webauthn.helpers.structs import (
    AuthenticatorAttachment,
    AuthenticatorSelectionCriteria,
    PublicKeyCredentialDescriptor,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

from .models import User, WebAuthnCredential
from .permissions import IsAdmin


def _rp_id() -> str:
    return getattr(settings, "WEBAUTHN_RP_ID", "localhost")


def _rp_name() -> str:
    return getattr(settings, "WEBAUTHN_RP_NAME", "HRMS")


def _origins():
    raw = getattr(
        settings,
        "WEBAUTHN_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    if isinstance(raw, str):
        return [o.strip() for o in raw.split(",") if o.strip()]
    return list(raw)


def _challenge_key(user_id: int, kind: str) -> str:
    return f"webauthn:{kind}:{user_id}"


def _resolve_target_user(request) -> User | Response:
    """
    Self by default.
    Admin may pass target_user_id to enroll/auth options for an employee.
    """
    target_id = request.data.get("target_user_id") or request.query_params.get(
        "target_user_id"
    )
    if not target_id:
        return request.user

    if not getattr(request.user, "is_admin_role", False) and request.user.role != "ADMIN":
        return Response(
            {"detail": "Only admin can manage another user's fingerprint."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        return User.objects.get(pk=int(target_id))
    except (User.DoesNotExist, ValueError, TypeError):
        return Response(
            {"detail": "User not found."},
            status=status.HTTP_404_NOT_FOUND,
        )


def _attachment_from_request(request):
    """
    attachment:
      - platform  → built-in (laptop/phone sensor)
      - cross-platform → USB / external FIDO2 key
      - any / omitted → browser chooses (widest support)
    """
    raw = (request.data.get("attachment") or "any").lower()
    if raw == "platform":
        return AuthenticatorAttachment.PLATFORM
    if raw in ("cross-platform", "cross_platform", "usb", "external"):
        return AuthenticatorAttachment.CROSS_PLATFORM
    return None  # any


class WebAuthnRegisterOptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target = _resolve_target_user(request)
        if isinstance(target, Response):
            return target

        existing = list(
            WebAuthnCredential.objects.filter(user=target).values_list(
                "credential_id", flat=True
            )
        )
        exclude = [
            PublicKeyCredentialDescriptor(id=base64url_to_bytes(cid))
            for cid in existing
        ]

        attachment = _attachment_from_request(request)
        selection_kwargs = {
            "resident_key": ResidentKeyRequirement.PREFERRED,
            "user_verification": UserVerificationRequirement.PREFERRED,
        }
        if attachment is not None:
            selection_kwargs["authenticator_attachment"] = attachment

        options = generate_registration_options(
            rp_id=_rp_id(),
            rp_name=_rp_name(),
            user_id=str(target.pk).encode("utf-8"),
            user_name=target.username,
            user_display_name=target.get_full_name() or target.username,
            exclude_credentials=exclude,
            authenticator_selection=AuthenticatorSelectionCriteria(**selection_kwargs),
        )
        cache.set(_challenge_key(target.pk, "reg"), options.challenge, timeout=300)
        cache.set(
            _challenge_key(request.user.pk, "reg_target"),
            target.pk,
            timeout=300,
        )
        return Response(json.loads(options_to_json(options)))


class WebAuthnRegisterVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Prefer explicit target, else cached target from options step, else self
        target = _resolve_target_user(request)
        if isinstance(target, Response):
            # If body has no target, try cache
            cached = cache.get(_challenge_key(request.user.pk, "reg_target"))
            if cached:
                try:
                    target = User.objects.get(pk=cached)
                except User.DoesNotExist:
                    target = request.user
            else:
                target = request.user

        challenge = cache.get(_challenge_key(target.pk, "reg"))
        if not challenge:
            return Response(
                {"detail": "Registration challenge expired. Try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            verification = verify_registration_response(
                credential=request.data,
                expected_challenge=challenge,
                expected_rp_id=_rp_id(),
                expected_origin=_origins(),
            )
        except Exception as exc:
            return Response(
                {"detail": f"Registration failed: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        finally:
            cache.delete(_challenge_key(target.pk, "reg"))
            cache.delete(_challenge_key(request.user.pk, "reg_target"))

        cred_id = bytes_to_base64url(verification.credential_id)
        public_key = bytes_to_base64url(verification.credential_public_key)
        device_name = request.data.get("device_name") or "Authenticator"

        WebAuthnCredential.objects.update_or_create(
            credential_id=cred_id,
            defaults={
                "user": target,
                "public_key": public_key,
                "sign_count": verification.sign_count,
                "device_name": device_name,
            },
        )
        return Response(
            {
                "ok": True,
                "credential_id": cred_id,
                "user_id": target.pk,
                "username": target.username,
            }
        )


class WebAuthnAuthOptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user: User = request.user
        creds = list(WebAuthnCredential.objects.filter(user=user))
        if not creds:
            return Response(
                {
                    "detail": "No fingerprint registered. Register first.",
                    "code": "NO_CREDENTIAL",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        allow = [
            PublicKeyCredentialDescriptor(id=base64url_to_bytes(c.credential_id))
            for c in creds
        ]
        options = generate_authentication_options(
            rp_id=_rp_id(),
            allow_credentials=allow,
            user_verification=UserVerificationRequirement.PREFERRED,
        )
        cache.set(_challenge_key(user.pk, "auth"), options.challenge, timeout=300)
        return Response(json.loads(options_to_json(options)))


class WebAuthnAuthVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user: User = request.user
        challenge = cache.get(_challenge_key(user.pk, "auth"))
        if not challenge:
            return Response(
                {"detail": "Auth challenge expired. Try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            cred_id_raw = request.data.get("id") or request.data.get("rawId")
            if not cred_id_raw:
                raise ValueError("Missing credential id")
            record = WebAuthnCredential.objects.get(
                user=user, credential_id=cred_id_raw
            )
            verification = verify_authentication_response(
                credential=request.data,
                expected_challenge=challenge,
                expected_rp_id=_rp_id(),
                expected_origin=_origins(),
                credential_public_key=base64url_to_bytes(record.public_key),
                credential_current_sign_count=record.sign_count,
            )
            record.sign_count = verification.new_sign_count
            record.save(update_fields=["sign_count"])
        except WebAuthnCredential.DoesNotExist:
            return Response(
                {"detail": "Unknown credential."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Authentication failed: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        finally:
            cache.delete(_challenge_key(user.pk, "auth"))

        return Response({"ok": True, "verified": True})


class WebAuthnStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        target_id = request.query_params.get("target_user_id")
        if target_id:
            if not (
                getattr(request.user, "is_admin_role", False)
                or request.user.role == "ADMIN"
            ):
                return Response(status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(pk=int(target_id))
            except (User.DoesNotExist, ValueError):
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            user = request.user

        qs = WebAuthnCredential.objects.filter(user=user)
        return Response(
            {
                "registered": qs.exists(),
                "count": qs.count(),
                "user_id": user.pk,
                "devices": list(qs.values("id", "device_name", "created_at")),
            }
        )
