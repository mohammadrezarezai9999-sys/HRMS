import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import { useLanguage } from "../../context/LanguageContext";
import "./EmployeePages.css";

export default function EmployeeLayout() {
  const { isRtl } = useLanguage();
  return (
    <div className="employee-layout" dir={isRtl ? "rtl" : "ltr"}>
      <EmployeeSidebar />
      <main className="employee-main-content">
        <Outlet />
      </main>
    </div>
  );
}
