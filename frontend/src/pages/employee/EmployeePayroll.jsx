import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeePayroll() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();

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
            setError(t('loadError'));
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
        <div className="employee-page" dir={isRtl ? "rtl" : "ltr"}>
            <div className="page-header">
                <div>
                    <h1>{t('payroll')}</h1>
                    <p>{t('myPayrollSubtitle')}</p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={loadPayrolls}
                    disabled={loading}
                >{t('refresh')}</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="employee-card">
                <div className="card-header">
                    <h2>{t('payslips')}</h2>
                    <span>{payrolls.length} مورد</span>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('month')}</th>
                                <th>{t('baseSalary')}</th>
                                <th>{t('overtimeHours')}</th>
                                <th>{t('deduction')}</th>
                                <th>{t('netSalary')}</th>
                                <th>{t('status')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="table-message">{t('loadingData')}</td>
                                </tr>
                            ) : payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="table-message">
                                        {t('noPayroll')}
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
                                                {item.status || t('submitted')}
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