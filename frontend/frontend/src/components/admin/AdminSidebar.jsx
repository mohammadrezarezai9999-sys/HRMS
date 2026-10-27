import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { title: t('dashboard'), path: "/admin", icon: "🏠" },
    { title: t('users'), path: "/admin/users", icon: "👥" },
    { title: t('employees'), path: "/admin/employees", icon: "🧑‍💼" },
    { title: t('departments'), path: "/admin/departments", icon: "🏢" },
    { title: t('positions'), path: "/admin/positions", icon: "💼" },
    { title: t('attendance'), path: "/admin/attendance", icon: "⏰" },
    { title: t('contracts'), path: "/admin/contracts", icon: "📄" },
    { title: t('leaves'), path: "/admin/leaves", icon: "🏖️" },
    { title: t('leaveTypes'), path: "/admin/leave-types", icon: "📋" },
    { title: t('payroll'), path: "/admin/payroll", icon: "💰" },
    { title: t('performance'), path: "/admin/performance", icon: "⭐" },
    { title: t('documents'), path: "/admin/documents", icon: "📁" },
    { title: t('notifications'), path: "/admin/notifications", icon: "🔔" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">HR</div>
        <div className="logo-text">
          <h2>HRMS</h2>
          <span>{t('managementSystem')}</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-title">{t('systemManagement')}</div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-logout" onClick={handleLogout} type="button">
          <span className="sidebar-icon">🚪</span>
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
