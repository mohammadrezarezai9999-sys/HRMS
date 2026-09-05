import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminLayout from "./components/admin/AdminLayout";

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
import Payroll from "./pages/admin/Payroll";
import Performance from "./pages/admin/Performance";
import Documents from "./pages/admin/Documents";
import Notifications from "./pages/admin/Notifications";

// ---------- Employee Pages ----------

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import LeaveTypes from "./pages/admin/LeaveTypes";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeAttendance from "./pages/employee/EmployeeAttendance";
import EmployeeContracts from "./pages/employee/EmployeeContracts";
import EmployeeLeaves from "./pages/employee/EmployeeLeaves";
import EmployeePayroll from "./pages/employee/EmployeePayroll";
import EmployeePerformance from "./pages/employee/EmployeePerformance";
import EmployeeNotifications from "./pages/employee/EmployeeNotifications";
import EmployeeDocuments from "./pages/employee/EmployeeDocuments";

// ============================================================
// LAYOUTS
// ============================================================

function EmployeeLayout() {
    return (
        <div className="employee-layout" style={{ display: "flex" }}>
            <aside style={{ width: 220, padding: 20, background: "#f5f5f5" }}>
                <h3>پنل کارمند</h3>
                <nav>
                    <a href="/employee">داشبورد</a>
                </nav>
            </aside>
            <main style={{ padding: 30, flex: 1 }}>
                <Outlet />
            </main>
        </div>
    );
}

function RootRedirect() {
    const { user, role, isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading">در حال بارگذاری...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/employee" replace />;
}

// ============================================================
// APP
// ============================================================

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* ---------- LOGIN ---------- */}
                    <Route path="/login" element={<Login />} />

                    {/* ---------- PROTECTED ---------- */}
                    <Route element={<ProtectedRoute />}>
                        {/* ---- ADMIN ---- */}
                        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route path="leave-types" element={<LeaveTypes />}/>
                                <Route index element={<AdminDashboard />} />
                                <Route path="users" element={<Users />} />
                                <Route path="employees" element={<Employees />} />
                                <Route path="departments" element={<Departments />} />
                                <Route path="positions" element={<Positions />} />
                                <Route path="attendance" element={<Attendance />} />
                                <Route path="contracts" element={<Contracts />} />
                                <Route path="leaves" element={<Leaves />} />
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
                                <Route path="profile" element={<EmployeeProfile />}/>
                                <Route path="contract" element={<EmployeeContracts/>}/>
                                <Route path="attendance" element={<EmployeeAttendance />}/>
                                <Route path="leaves"   element={<EmployeeLeaves />}/>
                                <Route path="payroll" element={<EmployeePayroll />} />
                                <Route path="performance" element={<EmployeePerformance />} />
                                <Route path="documents" element={<EmployeeDocuments />} />
                                <Route path="notifications" element={<EmployeeNotifications />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* ---------- ROOT REDIRECT ---------- */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* ---------- 404 ---------- */}
                    <Route
                        path="*"
                        element={
                            <h2 style={{ padding: 50, textAlign: "center" }}>
                                404 - صفحه یافت نشد
                            </h2>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}