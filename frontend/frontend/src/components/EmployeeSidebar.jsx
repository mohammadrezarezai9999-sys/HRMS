import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function EmployeeSidebar() {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { to: "/employee", icon: "🏠", label: t('dashboard'), end: true },
    { to: "/employee/profile", icon: "👤", label: t('myProfile') },
    { to: "/employee/attendance", icon: "⏰", label: t('myAttendance') },
    { to: "/employee/leaves", icon: "🏖️", label: t('myLeaves') },
    { to: "/employee/contracts", icon: "📄", label: t('myContracts') },
    { to: "/employee/payroll", icon: "💰", label: t('myPayroll') },
    { to: "/employee/performance", icon: "⭐", label: t('myPerformance') },
    { to: "/employee/documents", icon: "📁", label: t('myDocuments') },
    { to: "/employee/notifications", icon: "🔔", label: t('myNotifications') },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <aside className="employee-sidebar">
      <div className="employee-sidebar-header">
        <div className="employee-logo">HR</div>
        <div>
          <h2>{t('employeePanel')}</h2>
          <p>{t('appName')}</p>
        </div>
      </div>

      <p className="employee-menu-title">{t('userMenu')}</p>

      <nav className="employee-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `employee-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="employee-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: "16px" }}>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            border: "none",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🚪 {t('logout')}
        </button>
      </div>
    </aside>
  );
}
