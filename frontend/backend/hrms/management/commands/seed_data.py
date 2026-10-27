"""
Seed sample data for HRMS.

Order:
  1. Department
  2. Position
  3. User (+ EmployeeProfile)
  4. Attendance (and related: LeaveType, LeaveRequest, Contract, Payroll, Notification)

All user passwords: 12345678

Usage:
  python manage.py seed_data
  python manage.py seed_data --clear   # wipe existing sample data first
"""

from datetime import date, datetime, timedelta, time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from hrms.models import (
    User,
    Department,
    Position,
    EmployeeProfile,
    Attendance,
    EmployeeContract,
    LeaveType,
    LeaveRequest,
    Payroll,
    PerformanceReview,
    Notification,
)

DEFAULT_PASSWORD = "12345678"


class Command(BaseCommand):
    help = "Seed departments, positions, users, attendance and related sample data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing HRMS data (except superusers) before seeding",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            self._clear()

        self.stdout.write(self.style.MIGRATE_HEADING("=== 1. Departments ==="))
        depts = self._seed_departments()

        self.stdout.write(self.style.MIGRATE_HEADING("=== 2. Positions ==="))
        positions = self._seed_positions(depts)

        self.stdout.write(self.style.MIGRATE_HEADING("=== 3. Users & Profiles ==="))
        users, profiles = self._seed_users(depts, positions)

        self.stdout.write(self.style.MIGRATE_HEADING("=== 4. Leave types ==="))
        leave_types = self._seed_leave_types()

        self.stdout.write(self.style.MIGRATE_HEADING("=== 5. Attendance ==="))
        self._seed_attendance(profiles)

        self.stdout.write(self.style.MIGRATE_HEADING("=== 6. Contracts, Leaves, Payroll, Reviews, Notifications ==="))
        self._seed_contracts(profiles)
        self._seed_leave_requests(profiles, leave_types, users["admin"])
        self._seed_payroll(profiles)
        self._seed_performance(profiles, users["admin"])
        self._seed_notifications(users)

        # Link department managers
        depts["IT"].manager = profiles["reza"]
        depts["IT"].save(update_fields=["manager"])
        depts["HR"].manager = profiles["sara"]
        depts["HR"].save(update_fields=["manager"])

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Seed completed successfully."))
        self.stdout.write("")
        self.stdout.write(self.style.WARNING("Login credentials (password for all: 12345678)"))
        self.stdout.write("  admin      / 12345678   → ADMIN")
        self.stdout.write("  reza       / 12345678   → EMPLOYEE (IT Manager)")
        self.stdout.write("  sara       / 12345678   → EMPLOYEE (HR Manager)")
        self.stdout.write("  ali        / 12345678   → EMPLOYEE")
        self.stdout.write("  maryam     / 12345678   → EMPLOYEE")
        self.stdout.write("  hossein    / 12345678   → EMPLOYEE")
        self.stdout.write("  fatemeh    / 12345678   → EMPLOYEE")

    # ------------------------------------------------------------------
    def _clear(self):
        self.stdout.write(self.style.WARNING("Clearing existing data..."))
        Notification.objects.all().delete()
        PerformanceReview.objects.all().delete()
        Payroll.objects.all().delete()
        LeaveRequest.objects.all().delete()
        LeaveType.objects.all().delete()
        EmployeeContract.objects.all().delete()
        Attendance.objects.all().delete()
        # Clear manager FK before deleting profiles
        Department.objects.update(manager=None)
        EmployeeProfile.objects.all().delete()
        Position.objects.all().delete()
        Department.objects.all().delete()
        # Keep only non-seed users if any; delete our known usernames
        User.objects.filter(
            username__in=["admin", "reza", "sara", "ali", "maryam", "hossein", "fatemeh"]
        ).delete()
        self.stdout.write(self.style.SUCCESS("Cleared."))

    # ------------------------------------------------------------------
    def _seed_departments(self):
        data = [
            ("IT", "دپارتمان فناوری اطلاعات و توسعه نرم‌افزار"),
            ("HR", "منابع انسانی و جذب نیرو"),
            ("Finance", "امور مالی و حسابداری"),
            ("Sales", "فروش و بازاریابی"),
            ("Operations", "عملیات و پشتیبانی"),
        ]
        result = {}
        for name, desc in data:
            obj, created = Department.objects.get_or_create(
                name=name,
                defaults={"description": desc},
            )
            result[name] = obj
            self.stdout.write(f"  {'+' if created else '='} Department: {name}")
        return result

    # ------------------------------------------------------------------
    def _seed_positions(self, depts):
        data = [
            ("IT Manager", "IT", Decimal("45000000")),
            ("Senior Developer", "IT", Decimal("35000000")),
            ("Junior Developer", "IT", Decimal("22000000")),
            ("HR Manager", "HR", Decimal("40000000")),
            ("HR Specialist", "HR", Decimal("25000000")),
            ("Accountant", "Finance", Decimal("28000000")),
            ("Sales Manager", "Sales", Decimal("38000000")),
            ("Sales Representative", "Sales", Decimal("20000000")),
            ("Operations Lead", "Operations", Decimal("32000000")),
        ]
        result = {}
        for title, dept_name, salary in data:
            obj, created = Position.objects.get_or_create(
                title=title,
                department=depts[dept_name],
                defaults={"base_salary": salary},
            )
            result[title] = obj
            self.stdout.write(f"  {'+' if created else '='} Position: {title}")
        return result

    # ------------------------------------------------------------------
    def _seed_users(self, depts, positions):
        """Create users then employee profiles. Password for all: 12345678"""
        users_spec = [
            # username, first, last, email, role, dept, position, phone, hire
            ("admin", "مدیر", "سیستم", "admin@hrms.local", User.Role.ADMIN, None, None, "0720000000", None),
            ("reza", "رضا", "محمدی", "reza@hrms.local", User.Role.EMPLOYEE, "IT", "IT Manager", "0781111111", date(2022, 3, 15)),
            ("sara", "سارا", "احمدی", "sara@hrms.local", User.Role.EMPLOYEE, "HR", "HR Manager", "0792222222", date(2021, 6, 1)),
            ("ali", "علی", "کریمی", "ali@hrms.local", User.Role.EMPLOYEE, "IT", "Senior Developer", "0773333333", date(2023, 1, 10)),
            ("maryam", "مریم", "حسینی", "maryam@hrms.local", User.Role.EMPLOYEE, "IT", "Junior Developer", "0724444444", date(2024, 2, 20)),
            ("hossein", "حسین", "رضایی", "hossein@hrms.local", User.Role.EMPLOYEE, "Finance", "Accountant", "0735555555", date(2022, 9, 5)),
            ("fatemeh", "فاطمه", "نوری", "fatemeh@hrms.local", User.Role.EMPLOYEE, "Sales", "Sales Representative", "0776666666", date(2023, 7, 12)),
        ]

        users = {}
        profiles = {}

        for username, first, last, email, role, dept_key, pos_key, phone, hire in users_spec:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "email": email,
                    "role": role,
                    "is_staff": role == User.Role.ADMIN,
                    "is_superuser": role == User.Role.ADMIN,
                },
            )
            # Always set password so --clear re-runs are consistent
            user.set_password(DEFAULT_PASSWORD)
            user.role = role
            user.first_name = first
            user.last_name = last
            user.email = email
            if role == User.Role.ADMIN:
                user.is_staff = True
                user.is_superuser = True
            user.save()
            users[username] = user
            self.stdout.write(f"  {'+' if created else '='} User: {username} ({role})")

            if role == User.Role.EMPLOYEE:
                profile, p_created = EmployeeProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "department": depts.get(dept_key) if dept_key else None,
                        "position": positions.get(pos_key) if pos_key else None,
                        "hire_date": hire,
                        "phone": phone,
                        "address": "تهران، ایران",
                    },
                )
                if not p_created:
                    profile.department = depts.get(dept_key) if dept_key else None
                    profile.position = positions.get(pos_key) if pos_key else None
                    profile.hire_date = hire
                    profile.phone = phone
                    profile.save()
                profiles[username] = profile
                self.stdout.write(f"      profile → {dept_key} / {pos_key}")

        return users, profiles

    # ------------------------------------------------------------------
    def _seed_leave_types(self):
        data = [
            ("مرخصی استحقاقی", 26),
            ("مرخصی استعلاجی", 15),
            ("مرخصی بدون حقوق", 30),
            ("مرخصی زایمان", 270),
        ]
        result = {}
        for name, days in data:
            obj, created = LeaveType.objects.get_or_create(
                name=name,
                defaults={"max_days_per_year": days},
            )
            result[name] = obj
            self.stdout.write(f"  {'+' if created else '='} LeaveType: {name}")
        return result

    # ------------------------------------------------------------------
    def _seed_attendance(self, profiles):
        """Last 14 working days of attendance for each employee."""
        today = timezone.localdate()
        statuses_cycle = [
            Attendance.Status.PRESENT,
            Attendance.Status.PRESENT,
            Attendance.Status.LATE,
            Attendance.Status.PRESENT,
            Attendance.Status.ABSENT,
            Attendance.Status.PRESENT,
            Attendance.Status.PRESENT,
        ]

        created_count = 0
        for username, profile in profiles.items():
            days_added = 0
            d = today - timedelta(days=1)
            while days_added < 14:
                # skip Fridays (weekday 4 in Iran often, but use weekend Sat/Fri style: weekday 4=Fri, 5=Sat)
                if d.weekday() not in (4, 5):  # Fri, Sat as weekend in Iran
                    status = statuses_cycle[days_added % len(statuses_cycle)]
                    check_in = check_out = worked = overtime = None
                    if status == Attendance.Status.PRESENT:
                        check_in = timezone.make_aware(datetime.combine(d, time(8, 30)))
                        check_out = timezone.make_aware(datetime.combine(d, time(17, 0)))
                        worked = Decimal("8.50")
                        overtime = Decimal("0.00")
                    elif status == Attendance.Status.LATE:
                        check_in = timezone.make_aware(datetime.combine(d, time(9, 15)))
                        check_out = timezone.make_aware(datetime.combine(d, time(17, 30)))
                        worked = Decimal("8.25")
                        overtime = Decimal("0.50")
                    else:  # ABSENT
                        worked = Decimal("0.00")
                        overtime = Decimal("0.00")

                    _, was_created = Attendance.objects.get_or_create(
                        employee=profile,
                        date=d,
                        defaults={
                            "check_in": check_in,
                            "check_out": check_out,
                            "worked_hours": worked or Decimal("0"),
                            "overtime_hours": overtime or Decimal("0"),
                            "status": status,
                        },
                    )
                    if was_created:
                        created_count += 1
                    days_added += 1
                d -= timedelta(days=1)

        self.stdout.write(f"  + Attendance records created: {created_count}")

    # ------------------------------------------------------------------
    def _seed_contracts(self, profiles):
        for username, profile in profiles.items():
            salary = profile.position.base_salary if profile.position else Decimal("20000000")
            _, created = EmployeeContract.objects.get_or_create(
                employee=profile,
                start_date=profile.hire_date or date(2023, 1, 1),
                defaults={
                    "end_date": None,
                    "contract_type": EmployeeContract.ContractType.FULL_TIME,
                    "salary": salary,
                    "status": EmployeeContract.Status.ACTIVE,
                },
            )
            if created:
                self.stdout.write(f"  + Contract: {username}")

    # ------------------------------------------------------------------
    def _seed_leave_requests(self, profiles, leave_types, admin_user):
        annual = leave_types.get("مرخصی استحقاقی")
        sick = leave_types.get("مرخصی استعلاجی")
        if not annual:
            return

        samples = [
            ("ali", annual, date(2025, 3, 10), date(2025, 3, 12), "سفر خانوادگی", LeaveRequest.Status.APPROVED),
            ("maryam", sick, date(2025, 4, 1), date(2025, 4, 2), "بیماری", LeaveRequest.Status.APPROVED),
            ("hossein", annual, date(2025, 5, 15), date(2025, 5, 20), "مرخصی تابستانی", LeaveRequest.Status.PENDING),
            ("fatemeh", annual, date(2025, 2, 5), date(2025, 2, 6), "کار شخصی", LeaveRequest.Status.REJECTED),
        ]
        for uname, lt, start, end, reason, status in samples:
            profile = profiles.get(uname)
            if not profile:
                continue
            _, created = LeaveRequest.objects.get_or_create(
                employee=profile,
                leave_type=lt,
                start_date=start,
                end_date=end,
                defaults={
                    "reason": reason,
                    "status": status,
                    "reviewed_by": admin_user if status != LeaveRequest.Status.PENDING else None,
                },
            )
            if created:
                self.stdout.write(f"  + LeaveRequest: {uname} ({status})")

    # ------------------------------------------------------------------
    def _seed_payroll(self, profiles):
        # Current and previous month
        today = timezone.localdate()
        months = []
        y, m = today.year, today.month
        months.append((m, y))
        if m == 1:
            months.append((12, y - 1))
        else:
            months.append((m - 1, y))

        for username, profile in profiles.items():
            base = profile.position.base_salary if profile.position else Decimal("20000000")
            for month, year in months:
                _, created = Payroll.objects.get_or_create(
                    employee=profile,
                    month=month,
                    year=year,
                    defaults={
                        "base_salary": base,
                        "overtime_pay": Decimal("500000"),
                        "bonus": Decimal("1000000"),
                        "deduction": Decimal("200000"),
                    },
                )
                if created:
                    self.stdout.write(f"  + Payroll: {username} {month}/{year}")

    # ------------------------------------------------------------------
    def _seed_performance(self, profiles, admin_user):
        for username, profile in profiles.items():
            _, created = PerformanceReview.objects.get_or_create(
                employee=profile,
                period="1404-Q1",
                defaults={
                    "reviewer": admin_user,
                    "score": Decimal("85.50"),
                    "comments": "عملکرد خوب در دوره اخیر.",
                },
            )
            if created:
                self.stdout.write(f"  + Review: {username}")

    # ------------------------------------------------------------------
    def _seed_notifications(self, users):
        messages = [
            ("admin", "سیستم با موفقیت راه‌اندازی شد."),
            ("reza", "درخواست مرخصی جدید برای بررسی دارید."),
            ("sara", "پروفایل شما به‌روزرسانی شد."),
            ("ali", "فیش حقوقی ماه جاری آماده است."),
            ("maryam", "جلسه ارزیابی عملکرد هفته آینده برگزار می‌شود."),
            ("hossein", "یادآوری: گزارش مالی تا پایان هفته."),
            ("fatemeh", "هدف فروش ماهانه به‌روزرسانی شد."),
        ]
        for uname, msg in messages:
            user = users.get(uname)
            if not user:
                continue
            Notification.objects.create(user=user, message=msg, is_read=False)
            self.stdout.write(f"  + Notification → {uname}")
