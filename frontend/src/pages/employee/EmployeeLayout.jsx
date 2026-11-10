import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import { useLanguage } from "../../context/LanguageContext";
import "./EmployeePages.css";

const MOBILE_QUERY = "(max-width: 900px)";

/**
 * Employee shell: collapsible sidebar, mobile drawer, page outlet.
 */
export default function EmployeeLayout() {
  const { isRtl } = useLanguage();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? !window.matchMedia(MOBILE_QUERY).matches : true
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const handleChange = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  const closeSidebarOnMobile = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return (
    <div
      className={`employee-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${
        isMobile ? "is-mobile" : "is-desktop"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="employee-sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeSidebarOnMobile}
        />
      )}

      <EmployeeSidebar
        open={sidebarOpen}
        onToggle={toggleSidebar}
        onNavigate={closeSidebarOnMobile}
      />

      <main className="employee-main-content">
        <div className="employee-topbar">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            title="Toggle menu"
          >
            <span className="toggle-hr-badge">HR</span>
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
