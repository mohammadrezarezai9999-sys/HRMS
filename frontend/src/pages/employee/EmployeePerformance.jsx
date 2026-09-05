import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";

export default function EmployeePerformance() {
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPerformances = async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get("performance/");
            setPerformances(data.results || data);
        } catch (error) {
            console.error("Performance error:", error);
            setError("دریافت ارزیابی عملکرد با مشکل مواجه شد.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPerformances();
    }, []);

    return (
        <div className="employee-page" dir="rtl">
            <div className="page-header">
                <div>
                    <h1>ارزیابی عملکرد</h1>
                    <p>مشاهده نتایج ارزیابی‌های ثبت‌شده برای شما</p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={loadPerformances}
                    disabled={loading}
                >
                    ↻ بروزرسانی
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="employee-card">
                <div className="card-header">
                    <h2>سوابق ارزیابی</h2>
                    <span>{performances.length} مورد</span>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>دوره ارزیابی</th>
                                <th>امتیاز</th>
                                <th>ارزیاب</th>
                                <th>توضیحات</th>
                                <th>تاریخ</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="table-message">
                                        در حال دریافت اطلاعات...
                                    </td>
                                </tr>
                            ) : performances.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="table-message">
                                        ارزیابی عملکردی برای شما ثبت نشده است.
                                    </td>
                                </tr>
                            ) : (
                                performances.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.period || item.review_period || "-"}</td>
                                        <td>
                                            <span className="performance-score">
                                                {item.score ?? item.rating ?? "-"}
                                            </span>
                                        </td>
                                        <td>{item.reviewer_name || item.reviewer || "-"}</td>
                                        <td className="performance-comments">
                                            {item.comments || item.feedback || "-"}
                                        </td>
                                        <td>{item.created_at?.slice(0, 10) || "-"}</td>
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