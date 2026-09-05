import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";

export default function EmployeePayroll() {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPayrolls = async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get("payroll/");
            setPayrolls(data.results || data);
        } catch (error) {
            console.error("Payroll error:", error);
            setError("دریافت اطلاعات حقوق و دستمزد با مشکل مواجه شد.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayrolls();
    }, []);

    const formatMoney = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        return `${Number(value).toLocaleString("fa-IR")} افغانی`;
    };

    return (
        <div className="employee-page" dir="rtl">
            <div className="page-header">
                <div>
                    <h1>حقوق و دستمزد</h1>
                    <p>مشاهده فیش‌های حقوقی ثبت‌شده برای شما</p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={loadPayrolls}
                    disabled={loading}
                >
                    ↻ بروزرسانی
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="employee-card">
                <div className="card-header">
                    <h2>فیش‌های حقوقی</h2>
                    <span>{payrolls.length} مورد</span>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ماه</th>
                                <th>حقوق پایه</th>
                                <th>اضافه‌کاری</th>
                                <th>کسری</th>
                                <th>مبلغ نهایی</th>
                                <th>وضعیت</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="table-message">
                                        در حال دریافت اطلاعات...
                                    </td>
                                </tr>
                            ) : payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="table-message">
                                        هنوز فیش حقوقی برای شما ثبت نشده است.
                                    </td>
                                </tr>
                            ) : (
                                payrolls.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.month || item.period || "-"}</td>
                                        <td>{formatMoney(item.basic_salary || item.base_salary)}</td>
                                        <td className="salary-positive">
                                            {formatMoney(item.overtime_amount || item.overtime)}
                                        </td>
                                        <td className="salary-negative">
                                            {formatMoney(item.deduction || item.deductions)}
                                        </td>
                                        <td className="salary-total">
                                            {formatMoney(item.net_salary || item.total_salary)}
                                        </td>
                                        <td>
                                            <span className="status-badge status-approved">
                                                {item.status || "ثبت شده"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}