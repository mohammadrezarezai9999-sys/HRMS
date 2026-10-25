from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """ role=ADMIN"""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class IsOwnerOrAdmin(BasePermission):

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_role:
            return True
        owner = getattr(obj, 'employee', None) or getattr(obj, 'user', None)
        owner_user = getattr(owner, 'user', owner)
        return owner_user == request.user


class IsOwnerReadOnlyOrAdminWrite(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin_role

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_role:
            return True
        if request.method not in SAFE_METHODS:
            return False
        owner = getattr(obj, 'employee', None)
        owner_user = getattr(owner, 'user', owner)
        return owner_user == request.user