
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

export default function AdminSidebar() {

    const menuItems = [
        {
            title: "داشبورد",
            path: "/admin",
            icon: "🏠",
        },
        {
            title: "مدیریت کاربران",
            path: "/admin/users",
            icon: "👥",
        },
        {
            title: "کارمندان",
            path: "/admin/employees",
            icon: "🧑‍💼",
        },
        {
            title: "دپارتمان‌ها",
            path: "/admin/departments",
            icon: "🏢",
        },
        {
            title: "سمت‌ها",
            path: "/admin/positions",
            icon: "💼",
        },
        {
            title: "حضور و غیاب",
            path: "/admin/attendance",
            icon: "⏰",
        },
        {
            title: "قراردادها",
            path: "/admin/contracts",
            icon: "📄",
        },
        {
            title: "مرخصی‌ها",
            path: "/admin/leaves",
            icon: "🏖️",
        },
        {
            title: "حقوق و دستمزد",
            path: "/admin/payroll",
            icon: "💰",
        },
        {
            title: "ارزیابی عملکرد",
            path: "/admin/performance",
            icon: "⭐",
        },
        {
            title: "اسناد کارکنان",
            path: "/admin/documents",
            icon: "📁",
        },
        {
            title: "اعلان‌ها",
            path: "/admin/notifications",
            icon: "🔔",
        },
    ];

    return (
        <aside className="admin-sidebar">

            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    HR
                </div>

                <div className="logo-text">
                    <h2>HRMS</h2>
                    <span>Management System</span>
                </div>
            </div>


            {/* Menu */}
            <nav className="sidebar-menu">

                <div className="menu-title">
                    مدیریت سیستم
                </div>

                {menuItems.map((item) => (

                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/admin"}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >

                        <span className="sidebar-icon">
                            {item.icon}
                        </span>

                        <span className="sidebar-text">
                            {item.title}
                        </span>

                    </NavLink>

                ))}

            </nav>


            {/* Bottom */}
            <div className="sidebar-bottom">

                <button
                    className="sidebar-logout"
                    onClick={() => {
                        localStorage.removeItem("access");
                        localStorage.removeItem("refresh");

                        window.location.href = "/login";
                    }}
                >
                    <span className="sidebar-icon">
                        🚪
                    </span>

                    <span>
                        خروج از حساب
                    </span>
                </button>

            </div>

        </aside>
    );
}
