# hrms/serializers.py
from rest_framework import serializers
from .models import (
    User, Department, Position, EmployeeProfile, Attendance,
    EmployeeContract, LeaveType, LeaveRequest, Payroll,
    PerformanceReview, EmployeeDocument, Notification,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active']
        read_only_fields = ['id']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'


class EmployeeProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_title = serializers.CharField(source='position.title', read_only=True)

    class Meta:
        model = EmployeeProfile
        fields = [
            'id', 'user', 'department', 'department_name', 'position', 'position_title',
            'hire_date', 'phone', 'address', 'avatar',
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'date', 'check_in', 'check_out',
            'worked_hours', 'overtime_hours', 'status',
        ]
        read_only_fields = ['worked_hours', 'overtime_hours', 'status', 'check_in', 'check_out']


class EmployeeContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeContract
        fields = '__all__'


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'


class LeaveRequestSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'leave_type', 'leave_type_name', 'start_date',
            'end_date', 'reason', 'status', 'reviewed_by',
        ]
        read_only_fields = ['status', 'reviewed_by']


class PayrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payroll
        fields = '__all__'
        read_only_fields = ['net_salary']


# ============================================================
# PERFORMANCE
# ============================================================

class PerformanceReviewSerializer(serializers.ModelSerializer):

    employee_name = serializers.CharField(
        source='employee.user.get_full_name',
        read_only=True
    )

    reviewer_name = serializers.CharField(
        source='reviewer.get_full_name',
        read_only=True
    )

    class Meta:
        model = PerformanceReview

        fields = [
            'id',
            'employee',
            'employee_name',
            'reviewer',
            'reviewer_name',
            'period',
            'score',
            'comments',
        ]

        read_only_fields = [
            'id',
            'reviewer',
        ]


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source='user.get_full_name',
        read_only=True
    )

    class Meta:
        model = Notification

        fields = [
            'id',
            'user',
            'user_name',
            'message',
            'is_read',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'user_name',
            'created_at',
        ]