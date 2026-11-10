import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useLanguage } from "../../context/LanguageContext";
import "./AdminSidebar.css";

const MOBILE_QUERY = "(max-width: 900px)";

/**
 * Admin shell: collapsible sidebar, mobile drawer, main content outlet.
 * Toggle via the HR badge (sidebar header or top bar when closed).
 */
export default function AdminLayout() {
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
      className={`admin-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${
        isMobile ? "is-mobile" : "is-desktop"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeSidebarOnMobile}
        />
      )}

      <AdminSidebar
        open={sidebarOpen}
        onToggle={toggleSidebar}
        onNavigate={closeSidebarOnMobile}
      />

      <main className="admin-main">
        <div className="admin-topbar">
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
