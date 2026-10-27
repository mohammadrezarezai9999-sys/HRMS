"""
Domain events: keep User and EmployeeProfile consistent.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User, EmployeeProfile


@receiver(post_save, sender=User)
def ensure_employee_profile(sender, instance, **kwargs):
    """Every EMPLOYEE user must have exactly one EmployeeProfile."""
    if instance.role == User.Role.EMPLOYEE:
        EmployeeProfile.objects.get_or_create(user=instance)
