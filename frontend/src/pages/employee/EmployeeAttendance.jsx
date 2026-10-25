import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeeAttendance() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


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
                t('attendanceLoadError')
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadAttendance();

    }, []);
// ============================================================
    // STATUS
    // ============================================================

    const getStatus = (status) => {

        switch (status) {

            case "present":
                return t('present');

            case "late":
                return t('late');

            case "absent":
                return t('absent');

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

                <h1>{t('attendance')}</h1>

                <p>{t('loadingData')}</p>

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

                    <h1>{t('attendance')}</h1>

                    <p>
                        {t('myAttendanceSubtitle')}
                    </p>

                </div>


                <button
                    className="employee-primary-btn"
                    onClick={loadAttendance}
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
                SUMMARY
            ==================================================== */}

            <div className="employee-kpi-row">

                <div className="employee-kpi">

                    <span>
                        {t('totalRecords')}
                    </span>

                    <strong>
                        {attendance.length}
                    </strong>

                </div>


                <div className="employee-kpi">

                    <span>
                        {t('presentDays')}
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

                    <span>{t('kpiLate')}</span>

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
                        {t('totalWorkedHours')}
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
                       {t('hoursUnit')}
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

                                    <th>{t('date')}</th>

                                    <th>{t('checkIn')}</th>

                                    <th>{t('checkOut')}</th>

                                    <th>{t('workedHours')}</th>

                                    <th>
                                        اضافه کاری
                                    </th>

                                    <th>{t('status')}</th>

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
                                                {t('hoursUnit')}
                                            </td>


                                            <td>
                                                {
                                                    record.overtime_hours ??
                                                    "0"
                                                }
                                                {t('hoursUnit')}
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