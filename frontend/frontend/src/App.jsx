import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminLayout from "./components/admin/AdminLayout";
import EmployeeLayout from "./pages/employee/EmployeeLayout";

// ---------- Public ----------
import Login from "./pages/Login";

// ---------- Admin Pages ----------
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Employees from "./pages/admin/Employees";
import Departments from "./pages/admin/Departments";
import Positions from "./pages/admin/Positions";
import Attendance from "./pages/admin/Attendance";
import Contracts from "./pages/admin/Contracts";
import Leaves from "./pages/admin/Leaves";
import LeaveTypes from "./pages/admin/LeaveTypes";
import Payroll from "./pages/admin/Payroll";
import Performance from "./pages/admin/Performance";
import Documents from "./pages/admin/Documents";
import Notifications from "./pages/admin/Notifications";

// ---------- Employee Pages ----------
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeAttendance from "./pages/employee/EmployeeAttendance";
import EmployeeContracts from "./pages/employee/EmployeeContracts";
import EmployeeLeaves from "./pages/employee/EmployeeLeaves";
import EmployeePayroll from "./pages/employee/EmployeePayroll";
import EmployeePerformance from "./pages/employee/EmployeePerformance";
import EmployeeNotifications from "./pages/employee/EmployeeNotifications";
import EmployeeDocuments from "./pages/employee/EmployeeDocuments";

function RootRedirect() {
  const { user, role, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return <div className="loading">{t('loading')}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/employee" replace />;
}

export default function App() {
  const { t } = useLanguage();

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Global language switcher — top corner */}
        <LanguageSwitcher />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            {/* ---- ADMIN ---- */}
            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="employees" element={<Employees />} />
                <Route path="departments" element={<Departments />} />
                <Route path="positions" element={<Positions />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="leave-types" element={<LeaveTypes />} />
                <Route path="payroll" element={<Payroll />} />
                <Route path="performance" element={<Performance />} />
                <Route path="documents" element={<Documents />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* ---- EMPLOYEE ---- */}
            <Route element={<RoleRoute allowedRoles={["EMPLOYEE"]} />}>
              <Route path="/employee" element={<EmployeeLayout />}>
                <Route index element={<EmployeeDashboard />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="contract" element={<EmployeeContracts />} />
                <Route path="contracts" element={<EmployeeContracts />} />
                <Route path="attendance" element={<EmployeeAttendance />} />
                <Route path="leaves" element={<EmployeeLeaves />} />
                <Route path="payroll" element={<EmployeePayroll />} />
                <Route path="performance" element={<EmployeePerformance />} />
                <Route path="documents" element={<EmployeeDocuments />} />
                <Route path="notifications" element={<EmployeeNotifications />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<RootRedirect />} />

          <Route
            path="*"
            element={
              <h2 style={{ padding: 50, textAlign: "center" }}>
                {t('notFound')}
              </h2>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
