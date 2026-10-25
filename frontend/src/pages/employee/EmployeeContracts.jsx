import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeeContracts() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadContracts = async () => {

        try {

            setLoading(true);
            setError("");

            const { data } = await api.get("contracts/");

            setContracts(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Contracts error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "دریافت قراردادها با مشکل مواجه شد."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadContracts();

    }, []);


    // ============================================================
    // CONTRACT TYPE
    // ============================================================

    const getContractType = (type) => {

        switch (type) {

            case "full-time":
                return t('fullTime');

            case "part-time":
                return t('partTime');

            case "contractor":
                return t('contractor');

            default:
                return type || "-";
        }
    };


    // ============================================================
    // STATUS
    // ============================================================

    const getStatus = (status) => {

        switch (status) {

            case "active":
                return t('active');

            case "expired":
                return t('expired');

            default:
                return status || "-";
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div
                className="employee-page"
                dir={isRtl ? "rtl" : "ltr"}
            >

                <h1>
                    {t('myContracts')}
                </h1>

                <p>
                    در حال دریافت قراردادها...
                </p>

            </div>

        );
    }


    return (

        <div
            className="employee-page"
            dir={isRtl ? "rtl" : "ltr"}
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="employee-page-header">

                <div>

                    <h1>
                        {t('myContracts')}
                    </h1>

                    <p>
                        مشاهده قراردادهای کاری
                    </p>

                </div>


                <button
                    className="employee-primary-btn"
                    onClick={loadContracts}
                >{t('refresh')}</button>

            </div>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="employee-error">
                    {error}
                </div>

            )}


            {/* ====================================================
                CONTRACT LIST
            ==================================================== */}

            {contracts.length === 0 ? (

                <div className="employee-card">

                    <div className="employee-empty">

                        {t('noContracts')}
                    </div>

                </div>

            ) : (

                <div className="employee-contract-grid">

                    {contracts.map(contract => (

                        <div
                            className="employee-contract-card"
                            key={contract.id}
                        >

                            {/* HEADER */}

                            <div className="contract-header">

                                <div>

                                    <h2>
                                        قرارداد #{contract.id}
                                    </h2>

                                    <p>
                                        {
                                            getContractType(
                                                contract.contract_type
                                            )
                                        }
                                    </p>

                                </div>


                                <span
                                    className={
                                        `contract-status ${contract.status}`
                                    }
                                >

                                    {
                                        getStatus(
                                            contract.status
                                        )
                                    }

                                </span>

                            </div>


                            {/* INFORMATION */}

                            <div className="contract-info">

                                <div>

                                    <span>{t('startDate')}</span>

                                    <strong>
                                        {
                                            contract.start_date ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>{t('endDate')}</span>

                                    <strong>
                                        {
                                            contract.end_date ||
                                            t('noEnd')
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>{t('salary')}</span>

                                    <strong>
                                        {
                                            contract.salary ??
                                            "0"
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* FILE */}

                            {contract.file && (

                                <div className="contract-file">

                                    <a
                                        href={
                                            contract.file
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {t('viewFile')}
                                    </a>

                                </div>

                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>

    );
}