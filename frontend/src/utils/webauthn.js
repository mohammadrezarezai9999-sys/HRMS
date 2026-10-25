/**
 * WebAuthn helpers — PC / phone / external FIDO2 sensors
 */

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuffer(base64url) {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

export function prepareCreateOptions(options) {
  const o = { ...options };
  o.challenge = base64urlToBuffer(options.challenge);
  o.user = { ...options.user, id: base64urlToBuffer(options.user.id) };
  if (o.excludeCredentials) {
    o.excludeCredentials = o.excludeCredentials.map((c) => ({
      ...c,
      id: base64urlToBuffer(c.id),
    }));
  }
  return o;
}

export function prepareRequestOptions(options) {
  const o = { ...options };
  o.challenge = base64urlToBuffer(options.challenge);
  if (o.allowCredentials) {
    o.allowCredentials = o.allowCredentials.map((c) => ({
      ...c,
      id: base64urlToBuffer(c.id),
    }));
  }
  return o;
}

export function credentialToJSON(cred) {
  const clientDataJSON = bufferToBase64url(cred.response.clientDataJSON);
  const rawId = bufferToBase64url(cred.rawId);

  if (cred.response.attestationObject) {
    return {
      id: cred.id,
      rawId,
      type: cred.type,
      response: {
        clientDataJSON,
        attestationObject: bufferToBase64url(cred.response.attestationObject),
      },
      clientExtensionResults: cred.getClientExtensionResults?.() || {},
    };
  }

  return {
    id: cred.id,
    rawId,
    type: cred.type,
    response: {
      clientDataJSON,
      authenticatorData: bufferToBase64url(cred.response.authenticatorData),
      signature: bufferToBase64url(cred.response.signature),
      userHandle: cred.response.userHandle
        ? bufferToBase64url(cred.response.userHandle)
        : null,
    },
    clientExtensionResults: cred.getClientExtensionResults?.() || {},
  };
}

export function isWebAuthnAvailable() {
  return (
    typeof window !== "undefined" &&
    !!window.PublicKeyCredential &&
    typeof navigator.credentials?.create === "function"
  );
}

/**
 * Register fingerprint/authenticator.
 * @param {object} api axios instance
 * @param {object} opts
 * @param {number} [opts.targetUserId] admin enrolls for this employee user id
 * @param {'any'|'platform'|'cross-platform'} [opts.attachment]
 * @param {string} [opts.deviceName]
 */
export async function registerFingerprint(api, opts = {}) {
  const body = {
    attachment: opts.attachment || "any",
  };
  if (opts.targetUserId) body.target_user_id = opts.targetUserId;

  const { data: options } = await api.post("webauthn/register/options/", body);
  const publicKey = prepareCreateOptions(options);
  const cred = await navigator.credentials.create({ publicKey });
  if (!cred) throw new Error("Registration cancelled");

  const payload = credentialToJSON(cred);
  if (opts.targetUserId) payload.target_user_id = opts.targetUserId;
  if (opts.deviceName) payload.device_name = opts.deviceName;

  const { data } = await api.post("webauthn/register/verify/", payload);
  return data;
}

export async function authenticateFingerprint(api) {
  const { data: options } = await api.post("webauthn/auth/options/");
  const publicKey = prepareRequestOptions(options);
  const cred = await navigator.credentials.get({ publicKey });
  if (!cred) throw new Error("Authentication cancelled");
  const payload = credentialToJSON(cred);
  await api.post("webauthn/auth/verify/", payload);
  return true;
}

export async function fingerprintStatus(api, targetUserId) {
  try {
    const params = targetUserId ? { target_user_id: targetUserId } : {};
    const { data } = await api.get("webauthn/status/", { params });
    return data;
  } catch {
    return { registered: false, count: 0 };
  }
}
