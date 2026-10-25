from django.utils import timezone

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services

from .models import (
    Department,
    Position,
    EmployeeProfile,
    Attendance,
    EmployeeContract,
    LeaveType,
    LeaveRequest,
    Payroll,
    PerformanceReview,
    EmployeeDocument,
    Notification,
    User,
)

from .permissions import (
    IsAdmin,
    IsOwnerOrAdmin,
    IsOwnerReadOnlyOrAdminWrite,
)

from .serializers import (
    DepartmentSerializer,
    PositionSerializer,
    EmployeeProfileSerializer,
    AttendanceSerializer,
    EmployeeContractSerializer,
    LeaveTypeSerializer,
    LeaveRequestSerializer,
    PayrollSerializer,
    PerformanceReviewSerializer,
    EmployeeDocumentSerializer,
    NotificationSerializer,
    UserSerializer,
    UserCreateSerializer,
)


# ============================================================
# ME
# ============================================================

class MeView(APIView):
    """
    GET /api/me/

    اطلاعات کاربر لاگین‌شده را برمی‌گرداند.
    React از role برای انتخاب Dashboard استفاده می‌کند.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            UserSerializer(request.user).data
        )


# ============================================================
# ADMIN DASHBOARD
# ============================================================

class DashboardView(APIView):
    """
    GET /api/dashboard/

    اطلاعات خلاصه داشبورد مدیریت را برمی‌گرداند.
    فقط ADMIN اجازه دسترسی دارد.
    """

    permission_classes = [IsAdmin]

    def get(self, request):

        # ----------------------------------------------------
        # تاریخ امروز
        # ----------------------------------------------------

        today = timezone.localdate()


        # ----------------------------------------------------
        # کارمندان
        # ----------------------------------------------------

        employee_count = EmployeeProfile.objects.count()


        # ----------------------------------------------------
        # دپارتمان‌ها
        # ----------------------------------------------------

        department_count = Department.objects.count()


        # ----------------------------------------------------
        # سمت‌ها
        # ----------------------------------------------------

        position_count = Position.objects.count()


        # ----------------------------------------------------
        # حضور امروز
        # ----------------------------------------------------

        today_attendance = Attendance.objects.filter(
            date=today
        )


        present_count = today_attendance.filter(
            status=Attendance.Status.PRESENT
        ).count()


        late_count = today_attendance.filter(
            status=Attendance.Status.LATE
        ).count()


        absent_count = today_attendance.filter(
            status=Attendance.Status.ABSENT
        ).count()


        # ----------------------------------------------------
        # مرخصی‌ها
        # ----------------------------------------------------

        pending_leave_count = LeaveRequest.objects.filter(
            status=LeaveRequest.Status.PENDING
        ).count()


        approved_leave_count = LeaveRequest.objects.filter(
            status=LeaveRequest.Status.APPROVED
        ).count()


        rejected_leave_count = LeaveRequest.objects.filter(
            status=LeaveRequest.Status.REJECTED
        ).count()


        # ----------------------------------------------------
        # قراردادها
        # ----------------------------------------------------

        active_contract_count = EmployeeContract.objects.filter(
            status=EmployeeContract.Status.ACTIVE
        ).count()


        expired_contract_count = EmployeeContract.objects.filter(
            status=EmployeeContract.Status.EXPIRED
        ).count()


        # ----------------------------------------------------
        # Payroll
        # ----------------------------------------------------

        payroll_count = Payroll.objects.count()


        # ----------------------------------------------------
        # Performance
        # ----------------------------------------------------

        performance_count = PerformanceReview.objects.count()


        # ----------------------------------------------------
        # Documents
        # ----------------------------------------------------

        document_count = EmployeeDocument.objects.count()


        # ----------------------------------------------------
        # Notifications
        # ----------------------------------------------------

        unread_notification_count = Notification.objects.filter(
            is_read=False
        ).count()


        # ----------------------------------------------------
        # آخرین حضور و غیاب
        # ----------------------------------------------------

        recent_attendance = Attendance.objects.select_related(
            'employee__user'
        ).order_by(
            '-date',
            '-check_in'
        )[:10]


        recent_attendance_data = AttendanceSerializer(
            recent_attendance,
            many=True
        ).data


        # ----------------------------------------------------
        # last leave request
        # ----------------------------------------------------

        recent_leave_requests = LeaveRequest.objects.select_related(
            'employee__user',
            'leave_type'
        ).order_by(
            '-id'
        )[:10]


        recent_leave_data = LeaveRequestSerializer(
            recent_leave_requests,
            many=True
        ).data


        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return Response({

            'date': today,

            'stats': {

                'employees': employee_count,

                'present': present_count,

                'late': late_count,

                'absent': absent_count,

                'departments': department_count,

                'positions': position_count,

                'pending_leaves': pending_leave_count,

                'approved_leaves': approved_leave_count,

                'rejected_leaves': rejected_leave_count,

                'active_contracts': active_contract_count,

                'expired_contracts': expired_contract_count,

                'payroll': payroll_count,

                'performance': performance_count,

                'documents': document_count,

                'unread_notifications': unread_notification_count,

            },

            'today_attendance': recent_attendance_data,

            'recent_leave_requests': recent_leave_data,

        })



# ============================================================
# USERS
# ============================================================

class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all().order_by('id')
    permission_classes = [IsAdmin]

    def get_serializer_class(self):

        if self.action == 'create':
            return UserCreateSerializer

        return UserSerializer


# ============================================================
# DEPARTMENT
# ============================================================

class DepartmentViewSet(viewsets.ModelViewSet):

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdmin]


# ============================================================
# POSITION
# ============================================================

class PositionViewSet(viewsets.ModelViewSet):

    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [IsAdmin]


# ============================================================
# EMPLOYEE PROFILE
# ============================================================

class EmployeeProfileViewSet(viewsets.ModelViewSet):

    serializer_class = EmployeeProfileSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):

        user = self.request.user

        if user.is_admin_role:
            return EmployeeProfile.objects.select_related(
                'user',
                'department',
                'position'
            ).all()

        return EmployeeProfile.objects.filter(
            user=user
        )


# ============================================================
# ATTENDANCE
# ============================================================

class AttendanceViewSet(viewsets.ModelViewSet):

    serializer_class = AttendanceSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):

        user = self.request.user

        queryset = Attendance.objects.select_related(
            'employee__user'
        ).all()

        if user.is_admin_role:
            return queryset

        return queryset.filter(
            employee__user=user
        )

    # --------------------------------------------------------
    # CHECK IN
    # --------------------------------------------------------

    @action(
    detail=False,
    methods=['post'],
    url_path='check-in'
)
    def check_in_action(self, request):

        """
        POST /api/attendance/check-in/

        ثبت ورود کارمند
        """

        # ==========================================
        # بررسی اینکه کاربر Employee است
        # ==========================================

        if request.user.role != User.Role.EMPLOYEE:

            return Response(
                {
                    "detail": "فقط کارمندان می‌توانند ورود خود را ثبت کنند."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        # ==========================================
        # گرفتن یا ساخت EmployeeProfile
        # ==========================================

        profile, created = EmployeeProfile.objects.get_or_create(
            user=request.user
        )


        # ==========================================
        # تاریخ امروز
        # ==========================================

        today = timezone.localdate()


        # ==========================================
        # رکورد حضور امروز
        # ==========================================

        attendance, created = Attendance.objects.get_or_create(
            employee=profile,
            date=today,
        )


        # ==========================================
        # جلوگیری از ورود دوباره
        # ==========================================

        if attendance.check_in:

            return Response(
                {
                    "detail": "ورود امروز قبلاً ثبت شده است.",

                    "attendance": AttendanceSerializer(
                        attendance
                    ).data
                },

                status=status.HTTP_400_BAD_REQUEST
            )


        # ==========================================
        # ثبت ورود
        # ==========================================

        services.check_in(attendance)


        # ==========================================
        # Response
        # ==========================================

        return Response(
            AttendanceSerializer(
                attendance
            ).data,

            status=status.HTTP_200_OK
        )
    # --------------------------------------------------------
    # CHECK OUT
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=['post'],
        url_path='check-out'
    )
    def check_out_action(self, request):
        """
        POST /api/attendance/check-out/

        کارمند خروج خودش را ثبت می‌کند.
        """

        profile = request.user.profile

        # تاریخ امروز
        today = timezone.localdate()

        # پیدا کردن رکورد امروز
        try:

            attendance = Attendance.objects.get(
                employee=profile,
                date=today,
            )

        except Attendance.DoesNotExist:

            return Response(
                {
                    "detail": "برای امروز رکورد حضور وجود ندارد. ابتدا ورود خود را ثبت کنید."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # اگر ورود ثبت نشده باشد
        if not attendance.check_in:

            return Response(
                {
                    "detail": "ابتدا باید ورود خود را ثبت کنید."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # اگر خروج قبلاً ثبت شده باشد
        if attendance.check_out:

            return Response(
                {
                    "detail": "خروج امروز قبلاً ثبت شده است.",
                    "attendance": AttendanceSerializer(
                        attendance
                    ).data
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ثبت خروج و محاسبه ساعت کار
        services.check_out(attendance)

        return Response(
            AttendanceSerializer(attendance).data,
            status=status.HTTP_200_OK
        )


# ============================================================
# EMPLOYEE CONTRACT
# ============================================================

class EmployeeContractViewSet(viewsets.ModelViewSet):

    serializer_class = EmployeeContractSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):

        user = self.request.user

        queryset = EmployeeContract.objects.all()

        if user.is_admin_role:
            return queryset

        return queryset.filter(
            employee__user=user
        )


# ============================================================
# LEAVE TYPE
# ============================================================

class LeaveTypeViewSet(viewsets.ModelViewSet):

    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAdmin]


# ============================================================
# LEAVE REQUEST
# ============================================================

class LeaveRequestViewSet(viewsets.ModelViewSet):

    serializer_class = LeaveRequestSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):

        user = self.request.user

        queryset = LeaveRequest.objects.all()

        if user.is_admin_role:
            return queryset

        return queryset.filter(
            employee__user=user
        )

    def perform_create(self, serializer):

        serializer.save(
            employee=self.request.user.profile
        )

    # --------------------------------------------------------
    # APPROVE
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=['post']
    )
    def approve(self, request, pk=None):

        leave = self.get_object()

        leave.status = LeaveRequest.Status.APPROVED
        leave.reviewed_by = request.user

        leave.save()

        return Response(
            LeaveRequestSerializer(leave).data
        )

    # --------------------------------------------------------
    # REJECT
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=['post']
    )
    def reject(self, request, pk=None):

        leave = self.get_object()

        leave.status = LeaveRequest.Status.REJECTED
        leave.reviewed_by = request.user

        leave.save()

        return Response(
            LeaveRequestSerializer(leave).data
        )


# ============================================================
# PAYROLL
# ============================================================

class PayrollViewSet(viewsets.ModelViewSet):

    serializer_class = PayrollSerializer
    permission_classes = [IsOwnerReadOnlyOrAdminWrite]

    def get_queryset(self):

        user = self.request.user

        queryset = Payroll.objects.all()

        if user.is_admin_role:
            return queryset

        return queryset.filter(
            employee__user=user
        )


# ============================================================
# PERFORMANCE REVIEW
# ============================================================

# ============================================================
# PERFORMANCE REVIEW
# ============================================================

class PerformanceReviewViewSet(viewsets.ModelViewSet):

    serializer_class = PerformanceReviewSerializer

    permission_classes = [
        IsOwnerReadOnlyOrAdminWrite
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = PerformanceReview.objects.select_related(
            'employee__user',
            'reviewer',
        )

        # ADMIN
        if user.is_admin_role:
            return queryset

        # EMPLOYEE
        return queryset.filter(
            employee__user=user
        )

    def perform_create(self, serializer):

        serializer.save(
            reviewer=self.request.user
        )


# ============================================================
# EMPLOYEE DOCUMENT
# ============================================================

class EmployeeDocumentViewSet(viewsets.ModelViewSet):

    serializer_class = EmployeeDocumentSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):

        user = self.request.user

        queryset = EmployeeDocument.objects.all()

        if user.is_admin_role:
            return queryset

        return queryset.filter(
            employee__user=user
        )


# ============================================================
# NOTIFICATION
# ============================================================

class NotificationViewSet(viewsets.ModelViewSet):

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # --------------------------------------------------------
        # ADMIN
        # --------------------------------------------------------

        if user.is_admin_role:

            return Notification.objects.select_related(
                'user'
            ).all()

        # --------------------------------------------------------
        # EMPLOYEE
        # --------------------------------------------------------

        return Notification.objects.filter(
            user=user
        ).select_related(
            'user'
        )

    def perform_create(self, serializer):

        user = self.request.user

        # --------------------------------------------------------
        # ADMIN
        # --------------------------------------------------------

        if user.is_admin_role:

            serializer.save()

        # --------------------------------------------------------
        # EMPLOYEE
        # --------------------------------------------------------

        else:

            serializer.save(
                user=user
            )