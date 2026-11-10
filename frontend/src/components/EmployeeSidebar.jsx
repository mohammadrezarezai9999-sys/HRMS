import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * Employee navigation drawer. HR logo toggles sidebar visibility.
 */
export default function EmployeeSidebar({ open, onToggle, onNavigate }) {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { to: "/employee", icon: "🏠", label: t("dashboard"), end: true },
    { to: "/employee/profile", icon: "👤", label: t("myProfile") },
    { to: "/employee/attendance", icon: "⏰", label: t("myAttendance") },
    { to: "/employee/leaves", icon: "🏖️", label: t("myLeaves") },
    { to: "/employee/contracts", icon: "📄", label: t("myContracts") },
    { to: "/employee/payroll", icon: "💰", label: t("myPayroll") },
    { to: "/employee/performance", icon: "⭐", label: t("myPerformance") },
    { to: "/employee/documents", icon: "📁", label: t("myDocuments") },
    { to: "/employee/notifications", icon: "🔔", label: t("myNotifications") },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <aside
      className={`employee-sidebar ${open ? "is-open" : "is-closed"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="employee-sidebar-header employee-logo-btn"
        onClick={onToggle}
        title="Open or close menu"
        aria-expanded={open}
      >
        <div className="employee-logo">HR</div>
        <div className="employee-logo-text">
          <h2>{t("employeePanel")}</h2>
          <p>{t("appName")}</p>
        </div>
      </button>

      <p className="employee-menu-title">{t("userMenu")}</p>

      <nav className="employee-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `employee-nav-link ${isActive ? "active" : ""}`
            }
            onClick={onNavigate}
          >
            <span className="employee-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="employee-sidebar-footer">
        <button type="button" className="employee-logout-btn" onClick={handleLogout}>
          🚪 {t("logout")}
        </button>
      </div>
    </aside>
  );
}
