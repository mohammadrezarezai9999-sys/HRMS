import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";

export default function EmployeeDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDocuments = async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get("documents/");
            setDocuments(data.results || data);
        } catch (error) {
            console.error("Documents error:", error);
            setError("دریافت اسناد با مشکل مواجه شد.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const getFileName = (file) => {
        if (!file) return "فایل سند";
        return decodeURIComponent(file.split("/").pop());
    };

    return (
        <div className="employee-page" dir="rtl">
            <div className="page-header">
                <div>
                    <h1>اسناد من</h1>
                    <p>مشاهده و دریافت اسناد ثبت‌شده برای شما</p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={loadDocuments}
                    disabled={loading}
                >
                    ↻ بروزرسانی
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="employee-card">
                <div className="card-header">
                    <h2>فایل‌های شما</h2>
                    <span>{documents.length} سند</span>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <p>در حال دریافت اسناد...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="empty-state">
                        <p>هنوز سندی برای شما ثبت نشده است.</p>
                    </div>
                ) : (
                    <div className="document-list">
                        {documents.map((document) => (
                            <div className="document-item" key={document.id}>
                                <div className="document-info">
                                    <div className="document-icon">📄</div>

                                    <div>
                                        <div className="document-name">
                                            {getFileName(document.file)}
                                        </div>

                                        <div className="document-type">
                                            {document.doc_type || document.document_type || "سند"}
                                        </div>
                                    </div>
                                </div>

                                {document.file && (
                                    <a
                                        className="primary-btn"
                                        href={document.file}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        دریافت
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}