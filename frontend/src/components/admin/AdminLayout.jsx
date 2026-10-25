import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminLayout() {
  const { isRtl } = useLanguage();
  return (
    <div className="admin-layout" dir={isRtl ? "rtl" : "ltr"}>
      <AdminSidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
