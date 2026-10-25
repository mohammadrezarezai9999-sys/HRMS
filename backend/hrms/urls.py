from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import webauthn_views

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('departments', views.DepartmentViewSet, basename='department')
router.register('positions', views.PositionViewSet, basename='position')
router.register('employees', views.EmployeeProfileViewSet, basename='employee')
router.register('attendance', views.AttendanceViewSet, basename='attendance')
router.register('contracts', views.EmployeeContractViewSet, basename='contract')
router.register('leave-types', views.LeaveTypeViewSet, basename='leave-type')
router.register('leave-requests', views.LeaveRequestViewSet, basename='leave-request')
router.register('payroll', views.PayrollViewSet, basename='payroll')
router.register('performance', views.PerformanceReviewViewSet, basename='performance')
router.register('documents', views.EmployeeDocumentViewSet, basename='document')
router.register('notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('me/', views.MeView.as_view(), name='me'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('webauthn/register/options/', webauthn_views.WebAuthnRegisterOptionsView.as_view()),
    path('webauthn/register/verify/', webauthn_views.WebAuthnRegisterVerifyView.as_view()),
    path('webauthn/auth/options/', webauthn_views.WebAuthnAuthOptionsView.as_view()),
    path('webauthn/auth/verify/', webauthn_views.WebAuthnAuthVerifyView.as_view()),
    path('webauthn/status/', webauthn_views.WebAuthnStatusView.as_view()),
    path('', include(router.urls)),
]
