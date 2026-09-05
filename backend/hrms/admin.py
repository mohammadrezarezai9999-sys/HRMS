from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Department, Position, EmployeeProfile, Attendance,
    EmployeeContract, LeaveType, LeaveRequest, Payroll,
    PerformanceReview, EmployeeDocument, Notification,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (('نقش', {'fields': ('role',)}),)


admin.site.register(Department)
admin.site.register(Position)
admin.site.register(EmployeeProfile)
admin.site.register(Attendance)
admin.site.register(EmployeeContract)
admin.site.register(LeaveType)
admin.site.register(LeaveRequest)
admin.site.register(Payroll)
admin.site.register(PerformanceReview)
admin.site.register(EmployeeDocument)
admin.site.register(Notification)