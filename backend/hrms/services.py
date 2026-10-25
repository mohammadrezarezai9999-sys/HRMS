
from decimal import Decimal
from django.utils import timezone

STANDARD_WORK_HOURS = Decimal('8.00')
LATE_THRESHOLD_MINUTES = 15


def check_in(attendance):
    now = timezone.now()
    attendance.check_in = now
    scheduled_start = now.replace(hour=8, minute=0, second=0, microsecond=0)
    if now > scheduled_start + timezone.timedelta(minutes=LATE_THRESHOLD_MINUTES):
        attendance.status = attendance.Status.LATE
    else:
        attendance.status = attendance.Status.PRESENT
    attendance.save()
    return attendance


def check_out(attendance):
    now = timezone.now()
    attendance.check_out = now

    if attendance.check_in:
        delta = now - attendance.check_in
        worked = Decimal(delta.total_seconds()) / Decimal(3600)
        worked = worked.quantize(Decimal('0.01'))
        attendance.worked_hours = worked
        attendance.overtime_hours = max(worked - STANDARD_WORK_HOURS, Decimal('0.00'))

    attendance.save()
    return attendance


def calculate_net_salary(base_salary, overtime_pay=0, bonus=0, deduction=0):
   
    return (Decimal(base_salary) + Decimal(overtime_pay) + Decimal(bonus) - Decimal(deduction))


def generate_monthly_payroll(employee_profile, month, year, overtime_rate=Decimal('1.5')):
    
    from .models import Attendance, Payroll

    records = Attendance.objects.filter(
        employee=employee_profile,
        date__month=month,
        date__year=year,
    )
    total_overtime = sum((r.overtime_hours for r in records), Decimal('0'))
    base_salary = employee_profile.position.base_salary if employee_profile.position else Decimal('0')
    hourly_rate = (base_salary / Decimal(160)) if base_salary else Decimal('0')
    overtime_pay = (total_overtime * hourly_rate * overtime_rate).quantize(Decimal('0.01'))

    payroll, _ = Payroll.objects.update_or_create(
        employee=employee_profile, month=month, year=year,
        defaults={
            'base_salary': base_salary,
            'overtime_pay': overtime_pay,
            'net_salary': calculate_net_salary(base_salary, overtime_pay),
        }
    )
    return payroll