import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";

export default function EmployeeContracts() {

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
                return "تمام وقت";

            case "part-time":
                return "پاره وقت";

            case "contractor":
                return "قراردادی";

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
                return "فعال";

            case "expired":
                return "منقضی";

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
                dir="rtl"
            >

                <h1>
                    قراردادهای من
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
            dir="rtl"
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="employee-page-header">

                <div>

                    <h1>
                        قراردادهای من
                    </h1>

                    <p>
                        مشاهده قراردادهای کاری
                    </p>

                </div>


                <button
                    className="employee-primary-btn"
                    onClick={loadContracts}
                >
                    بروزرسانی
                </button>

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

                        هیچ قراردادی برای شما ثبت نشده است.

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

                                    <span>
                                        تاریخ شروع
                                    </span>

                                    <strong>
                                        {
                                            contract.start_date ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        تاریخ پایان
                                    </span>

                                    <strong>
                                        {
                                            contract.end_date ||
                                            "نامحدود"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        حقوق
                                    </span>

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
                                        مشاهده فایل قرارداد
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