import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeePerformance() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();

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
            setError(t('loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPerformances();
    }, []);

    return (
        <div className="employee-page" dir={isRtl ? "rtl" : "ltr"}>
            <div className="page-header">
                <div>
                    <h1>{t('performance')}</h1>
                    <p>{t('myPerformanceSubtitle')}</p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={loadPerformances}
                    disabled={loading}
                >{t('refresh')}</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="employee-card">
                <div className="card-header">
                    <h2>{t('reviewHistory')}</h2>
                    <span>{performances.length} مورد</span>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('reviewPeriod')}</th>
                                <th>{t('score')}</th>
                                <th>{t('reviewer')}</th>
                                <th>{t('description')}</th>
                                <th>{t('date')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="table-message">{t('loadingData')}</td>
                                </tr>
                            ) : performances.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="table-message">
                                        {t('noPerformance')}
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