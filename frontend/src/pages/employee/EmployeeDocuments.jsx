import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeeDocuments() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();

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
            setError(t('loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const getFileName = (file) => {
        if (!file) return t('documentFile');
        return decodeURIComponent(file.split("/").pop());
    };

    return (
        <div className="employee-page" dir={isRtl ? "rtl" : "ltr"}>
            <div className="page-header">
                <div>
                    <h1>{t('myDocuments')}</h1>
                    <p>{t('myDocumentsSubtitle')}</p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={loadDocuments}
                    disabled={loading}
                >{t('refresh')}</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="employee-card">
                <div className="card-header">
                    <h2>{t('yourFiles')}</h2>
                    <span>{documents.length} سند</span>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <p>{t('loadingData')}</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('noDocuments')}</p>
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
                                            {document.doc_type || document.document_type || t('document')}
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
                                        {t('download')}
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