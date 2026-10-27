"""HRMS domain models."""
# hrms/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


# ============================================================
# USER
# ============================================================
class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        EMPLOYEE = 'EMPLOYEE', 'Employee'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.EMPLOYEE,
    )

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN


# ============================================================
# DEPARTMENT
# ============================================================

class Department(models.Model):

    name = models.CharField(
        max_length=120
    )

    description = models.TextField(
        blank=True
    )

    manager = models.ForeignKey(
        'EmployeeProfile',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='managed_departments',
    )

    def __str__(self):
        return self.name


# ============================================================
# POSITION
# ============================================================

class Position(models.Model):

    title = models.CharField(
        max_length=120
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='positions',
    )

    base_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    def __str__(self):
        return f"{self.title} ({self.department.name})"


# ============================================================
# EMPLOYEE PROFILE
# ============================================================

class EmployeeProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
    )

    position = models.ForeignKey(
        Position,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
    )

    hire_date = models.DateField(
        null=True,
        blank=True,
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    address = models.CharField(
        max_length=255,
        blank=True,
    )

    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.user.get_full_name() or self.user.username


# ============================================================
# ATTENDANCE
# ============================================================

class Attendance(models.Model):

    class Status(models.TextChoices):

        PRESENT = 'present', 'Present'
        LATE = 'late', 'Late'
        ABSENT = 'absent', 'Absent'

    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='attendances',
    )

    # تاریخ حضور
    # برای هر کارمند، هر روز یک رکورد ایجاد می‌شود.
    date = models.DateField(
        default=timezone.localdate,
    )

    # زمان ورود
    check_in = models.DateTimeField(
        null=True,
        blank=True,
    )

    # زمان خروج
    check_out = models.DateTimeField(
        null=True,
        blank=True,
    )

    # مجموع ساعات کار
    worked_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    # ساعات اضافه‌کاری
    overtime_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    # وضعیت حضور
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PRESENT,
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=['employee', 'date'],
                name='unique_employee_attendance_per_day',
            ),
        ]

        ordering = ['-date']

    def __str__(self):
        return f"{self.employee} - {self.date}"


# ============================================================
# EMPLOYEE CONTRACT
# ============================================================

class EmployeeContract(models.Model):

    class ContractType(models.TextChoices):

        FULL_TIME = 'full-time', 'Full time'
        PART_TIME = 'part-time', 'Part time'
        CONTRACTOR = 'contractor', 'Contractor'

    class Status(models.TextChoices):

        ACTIVE = 'active', 'Active'
        EXPIRED = 'expired', 'Expired'

    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='contracts',
    )

    start_date = models.DateField()

    end_date = models.DateField(
        null=True,
        blank=True,
    )

    contract_type = models.CharField(
        max_length=12,
        choices=ContractType.choices,
        default=ContractType.FULL_TIME,
    )

    salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    file = models.FileField(
        upload_to='contracts/',
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"Contract #{self.pk} - {self.employee}"


# ============================================================
# LEAVE TYPE
# ============================================================

class LeaveType(models.Model):

    name = models.CharField(
        max_length=60
    )

    max_days_per_year = models.PositiveIntegerField(
        default=0
    )

    def __str__(self):
        return self.name


# ============================================================
# LEAVE REQUEST
# ============================================================

class LeaveRequest(models.Model):

    class Status(models.TextChoices):

        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='leave_requests',
    )

    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.PROTECT,
        related_name='requests',
    )

    start_date = models.DateField()

    end_date = models.DateField()

    reason = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )

    reviewed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_leaves',
    )

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.status})"


# ============================================================
# PAYROLL
# ============================================================

class Payroll(models.Model):

    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='payrolls',
    )

    month = models.PositiveSmallIntegerField()

    year = models.PositiveSmallIntegerField()

    base_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    overtime_pay = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    bonus = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    deduction = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    net_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=['employee', 'month', 'year'],
                name='unique_employee_payroll_per_month',
            ),
        ]

    def save(self, *args, **kwargs):

        self.net_salary = (
            self.base_salary
            + self.overtime_pay
            + self.bonus
            - self.deduction
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee} - {self.month}/{self.year}"


# ============================================================
# PERFORMANCE REVIEW
# ============================================================

class PerformanceReview(models.Model):

    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='reviews',
    )

    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='given_reviews',
    )

    period = models.CharField(
        max_length=20
    )

    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    comments = models.TextField(
        blank=True
    )

    def __str__(self):
        return f"{self.employee} - {self.period}"


# ============================================================
# EMPLOYEE DOCUMENT
# ============================================================

class EmployeeDocument(models.Model):

    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='documents',
    )

    doc_type = models.CharField(
        max_length=60
    )

    file = models.FileField(
        upload_to='documents/'
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.doc_type} - {self.employee}"


# ============================================================
# NOTIFICATION
# ============================================================

class Notification(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.message[:30]}"


# ============================================================
# WEBAUTHN / FINGERPRINT CREDENTIAL
# ============================================================

class WebAuthnCredential(models.Model):
    """Platform authenticator (Windows Hello, Touch ID, phone fingerprint)."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="webauthn_credentials",
    )
    credential_id = models.TextField(unique=True)
    public_key = models.TextField()
    sign_count = models.PositiveIntegerField(default=0)
    device_name = models.CharField(max_length=120, blank=True, default="Platform authenticator")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} — {self.device_name}"
