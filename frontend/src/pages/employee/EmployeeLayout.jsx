import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "./EmployeePages.css";


export default function EmployeeLayout() {
    return (
        <div className="employee-layout">
            <EmployeeSidebar />

            <main className="employee-main-content">
                <Outlet />
            </main>
        </div>
    );
}