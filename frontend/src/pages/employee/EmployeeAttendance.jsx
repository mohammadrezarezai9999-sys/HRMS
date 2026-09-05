import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";

export default function EmployeeAttendance() {

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAttendance = async () => {

        try {

            setLoading(true);
            setError("");

            const { data } =
                await api.get("attendance/");

            const records =
                data.results || data;

            setAttendance(records);

        } catch (error) {

            console.error(
                "Attendance error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "دریافت اطلاعات حضور و غیاب با مشکل مواجه شد."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadAttendance();

    }, []);


    // ============================================================
    // FORMAT TIME
    // ============================================================

    const formatTime = (datetime) => {

        if (!datetime) {
            return "-";
        }

        return datetime.slice(11, 16);
    };


    // ============================================================
    // STATUS
    // ============================================================

    const getStatus = (status) => {

        switch (status) {

            case "present":
                return "حاضر";

            case "late":
                return "با تأخیر";

            case "absent":
                return "غایب";

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
                    حضور و غیاب
                </h1>

                <p>
                    در حال دریافت اطلاعات...
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
                        حضور و غیاب
                    </h1>

                    <p>
                        تاریخچه حضور و ساعات کاری شما
                    </p>

                </div>


                <button
                    className="employee-primary-btn"
                    onClick={loadAttendance}
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
                SUMMARY
            ==================================================== */}

            <div className="employee-kpi-row">

                <div className="employee-kpi">

                    <span>
                        مجموع رکوردها
                    </span>

                    <strong>
                        {attendance.length}
                    </strong>

                </div>


                <div className="employee-kpi">

                    <span>
                        روزهای حاضر
                    </span>

                    <strong>
                        {
                            attendance.filter(
                                item =>
                                    item.status === "present"
                            ).length
                        }
                    </strong>

                </div>


                <div className="employee-kpi">

                    <span>
                        تأخیر
                    </span>

                    <strong>
                        {
                            attendance.filter(
                                item =>
                                    item.status === "late"
                            ).length
                        }
                    </strong>

                </div>


                <div className="employee-kpi">

                    <span>
                        مجموع ساعات کار
                    </span>

                    <strong>

                        {
                            attendance
                                .reduce(
                                    (total, item) =>
                                        total +
                                        Number(
                                            item.worked_hours || 0
                                        ),
                                    0
                                )
                                .toFixed(2)
                        }

                    </strong>

                    <small>
                        ساعت
                    </small>

                </div>

            </div>


            {/* ====================================================
                TABLE
            ==================================================== */}

            <div className="employee-card">

                <div className="employee-card-header">

                    <h2>
                        تاریخچه حضور و غیاب
                    </h2>

                </div>


                {attendance.length === 0 ? (

                    <div className="employee-empty">

                        هنوز هیچ رکورد حضور و غیابی
                        ثبت نشده است.

                    </div>

                ) : (

                    <div className="employee-table-wrapper">

                        <table className="employee-table">

                            <thead>

                                <tr>

                                    <th>
                                        تاریخ
                                    </th>

                                    <th>
                                        ورود
                                    </th>

                                    <th>
                                        خروج
                                    </th>

                                    <th>
                                        ساعت کار
                                    </th>

                                    <th>
                                        اضافه کاری
                                    </th>

                                    <th>
                                        وضعیت
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {attendance.map(
                                    record => (

                                        <tr
                                            key={
                                                record.id
                                            }
                                        >

                                            <td>
                                                {
                                                    record.date
                                                }
                                            </td>


                                            <td>
                                                {
                                                    formatTime(
                                                        record.check_in
                                                    )
                                                }
                                            </td>


                                            <td>
                                                {
                                                    formatTime(
                                                        record.check_out
                                                    )
                                                }
                                            </td>


                                            <td>
                                                {
                                                    record.worked_hours ??
                                                    "0"
                                                }
                                                {" ساعت"}
                                            </td>


                                            <td>
                                                {
                                                    record.overtime_hours ??
                                                    "0"
                                                }
                                                {" ساعت"}
                                            </td>


                                            <td>

                                                <span
                                                    className={`attendance-status ${record.status}`}
                                                >

                                                    {
                                                        getStatus(
                                                            record.status
                                                        )
                                                    }

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );
}