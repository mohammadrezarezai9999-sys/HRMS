import { NavLink } from "react-router-dom";

const menuItems = [
    { to: "/employee/dashboard", icon: "🏠", label: "داشبورد" },
    { to: "/employee/profile", icon: "👤", label: "پروفایل من" },
    { to: "/employee/attendance", icon: "⏰", label: "حضور و غیاب" },
    { to: "/employee/leaves", icon: "🏖️", label: "مرخصی‌ها" },
    { to: "/employee/contracts", icon: "📄", label: "قراردادها" },
    { to: "/employee/payroll", icon: "💰", label: "حقوق و دستمزد" },
    { to: "/employee/performance", icon: "⭐", label: "ارزیابی عملکرد" },
    { to: "/employee/documents", icon: "📁", label: "اسناد من" },
    { to: "/employee/notifications", icon: "🔔", label: "اعلان‌ها" },
];

export default function EmployeeSidebar() {
    return (
        <aside className="employee-sidebar" dir="rtl">
            <div className="employee-sidebar-header">
                <div className="employee-logo">HR</div>

                <div>
                    <h2>پنل کارمند</h2>
                    <p>سامانه منابع انسانی</p>
                </div>
            </div>

            <p className="employee-menu-title">منوی کاربری</p>

            <nav className="employee-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `employee-nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="employee-nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}