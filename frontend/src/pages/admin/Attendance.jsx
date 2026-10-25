import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Attendance() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


    // =========================================================
    // STATE
    // =========================================================

    const [attendance, setAttendance] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    const [dateFilter, setDateFilter] = useState("");

    const [selectedRecord, setSelectedRecord] = useState(null);


    // =========================================================
    // LOAD ATTENDANCE
    // =========================================================

    const loadAttendance = async (showRefresh = false) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const { data } = await api.get("attendance/");

            const results = data.results || data;

            setAttendance(
                Array.isArray(results)
                    ? results
                    : []
            );

        } catch (error) {

            console.error(
                "Attendance error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            if (error.response?.status === 401) {

                setError(
                    t('sessionExpired')
                );

            } else if (error.response?.status === 403) {

                setError(
                    t('forbidden')
                );

            } else {

                setError(
                    t('attendanceLoadError')
                );
            }

        } finally {

            setLoading(false);

            setRefreshing(false);

        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadAttendance();

    }, []);


    // =========================================================
    // FILTER DATA
    // =========================================================

    const filteredAttendance = useMemo(() => {

        return attendance.filter(record => {

            // -----------------------------------------------
            // SEARCH
            // -----------------------------------------------

            const employeeName =
                record.employee_name || "";

            const matchesSearch =
                employeeName
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );


            // -----------------------------------------------
            // STATUS
            // -----------------------------------------------

            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : record.status === statusFilter;


            // -----------------------------------------------
            // DATE
            // -----------------------------------------------

            const matchesDate =
                !dateFilter
                    ? true
                    : record.date === dateFilter;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesDate
            );

        });

    }, [
        attendance,
        search,
        statusFilter,
        dateFilter
    ]);


    // =========================================================
    // STATISTICS
    // =========================================================

    const stats = useMemo(() => {

        const present =
            attendance.filter(
                record =>
                    record.status === "present"
            ).length;


        const late =
            attendance.filter(
                record =>
                    record.status === "late"
            ).length;


        const absent =
            attendance.filter(
                record =>
                    record.status === "absent"
            ).length;


        const checkedOut =
            attendance.filter(
                record =>
                    record.check_out
            ).length;


        return {

            total: attendance.length,

            present,

            late,

            absent,

            checkedOut,

        };

    }, [attendance]);
// =========================================================
    // FORMAT DATE
    // =========================================================
// =========================================================
    // STATUS LABEL
    // =========================================================

    const getStatusLabel = statusLabel;


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            t('confirmDelete')
        );

        if (!confirmed) {
            return;
        }


        try {

            setError("");
            setSuccess("");

            await api.delete(
                `attendance/${id}/`
            );


            setAttendance(prev =>
                prev.filter(
                    record =>
                        record.id !== id
                )
            );


            setSelectedRecord(null);


            setSuccess(
                t('successGeneric')
            );


        } catch (error) {

            console.error(
                "Delete attendance error:",
                error
            );

            setError(
                t('errorGeneric')
            );

        }

    };


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {

        setSearch("");

        setStatusFilter("all");

        setDateFilter("");

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="admin-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1>{t('attendance')}</h1>

                    <p>
                        {t('attendanceSubtitle')}
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={() =>
                        loadAttendance(true)
                    }
                    disabled={refreshing}
                >

                    {refreshing
                        ? t('refreshing')
                        : t('refresh')
                    }

                </button>

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

                <div className="success-message">

                    {success}

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="stats-grid">


                {/* TOTAL */}

                <div className="stat-card">

                    <div className="stat-title">
                        {t('all')}
                    </div>

                    <div className="stat-number">
                        {stats.total}
                    </div>

                </div>


                {/* PRESENT */}

                <div className="stat-card">

                    <div className="stat-title">
                        {t('present')}
                    </div>

                    <div className="stat-number">
                        {stats.present}
                    </div>

                </div>


                {/* LATE */}

                <div className="stat-card">

                    <div className="stat-title">
                        {t('late')}
                    </div>

                    <div className="stat-number">
                        {stats.late}
                    </div>

                </div>


                {/* ABSENT */}

                <div className="stat-card">

                    <div className="stat-title">
                        {t('absent')}
                    </div>

                    <div className="stat-number">
                        {stats.absent}
                    </div>

                </div>


                {/* CHECKED OUT */}

                <div className="stat-card">

                    <div className="stat-title">
                        {t('checkedOut')}
                    </div>

                    <div className="stat-number">
                        {stats.checkedOut}
                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="admin-card attendance-filters">

                <div className="filter-grid">


                    {/* SEARCH */}

                    <div className="form-group">

                        <label>
                            {t('searchEmployee')}
                        </label>

                        <input
                            type="text"
                            placeholder={t('employeeNamePlaceholder')}
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* STATUS */}

                    <div className="form-group">

                        <label>{t('status')}</label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">{t('all')}</option>

                            <option value="present">{t('present')}</option>

                            <option value="late">{t('late')}</option>

                            <option value="absent">{t('absent')}</option>

                        </select>

                    </div>


                    {/* DATE */}

                    <div className="form-group">

                        <label>{t('date')}</label>

                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) =>
                                setDateFilter(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* CLEAR */}

                    <div className="filter-button">

                        <button
                            className="secondary-btn"
                            onClick={clearFilters}
                        >

                            {t('clearFilters')}
                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="admin-card">

                <div className="table-header">

                    <h2>
                        {t('attendanceHistory')}
                    </h2>

                    <span>
                        {filteredAttendance.length} {t('records')}
                    </span>

                </div>


                {loading ? (

                    <div className="loading-box">{t('loadingData')}</div>

                ) : filteredAttendance.length === 0 ? (

                    <div className="empty-box">

                        <h3>
                            {t('noData')}
                        </h3>

                        <p>
                            {t('noData')}
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>{t('employee')}</th>

                                    <th>{t('date')}</th>

                                    <th>{t('checkIn')}</th>

                                    <th>{t('checkOut')}</th>

                                    <th>{t('workedHours')}</th>

                                    <th>{t('overtimeHours')}</th>

                                    <th>{t('status')}</th>

                                    <th>{t('actions')}</th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredAttendance.map(
                                    (record, index) => (

                                        <tr
                                            key={record.id}
                                        >

                                            <td>
                                                {index + 1}
                                            </td>


                                            {/* EMPLOYEE */}

                                            <td>

                                                <strong>
                                                    {
                                                        record.employee_name
                                                        || "-"
                                                    }
                                                </strong>

                                            </td>


                                            {/* DATE */}

                                            <td>
                                                {
                                                    formatDate(
                                                        record.date
                                                    )
                                                }
                                            </td>


                                            {/* CHECK IN */}

                                            <td>

                                                {record.check_in ? (

                                                    <span className="time-value">

                                                        {
                                                            formatTime(
                                                                record.check_in
                                                            )
                                                        }

                                                    </span>

                                                ) : (

                                                    <span>
                                                        -
                                                    </span>

                                                )}

                                            </td>


                                            {/* CHECK OUT */}

                                            <td>

                                                {record.check_out ? (

                                                    <span className="time-value">

                                                        {
                                                            formatTime(
                                                                record.check_out
                                                            )
                                                        }

                                                    </span>

                                                ) : (

                                                    <span className="not-checked-out">
                                                        {t('notCheckedOut')}
                                                    </span>

                                                )}

                                            </td>


                                            {/* WORKED HOURS */}

                                            <td>

                                                {
                                                    record.worked_hours
                                                    ?? "0.00"
                                                }

                                            </td>


                                            {/* OVERTIME */}

                                            <td>

                                                {
                                                    record.overtime_hours
                                                    ?? "0.00"
                                                }

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={
                                                        `status-badge status-${record.status}`
                                                    }
                                                >

                                                    {
                                                        getStatusLabel(
                                                            record.status
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <button
                                                    className="secondary-btn small-btn"
                                                    onClick={() =>
                                                        setSelectedRecord(
                                                            record
                                                        )
                                                    }
                                                >

                                                    {t('details')}
                                                </button>


                                                <button
                                                    className="danger-btn small-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            record.id
                                                        )
                                                    }
                                                >

                                                    {t('delete')}
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {selectedRecord && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedRecord(null)
                    }
                >

                    <div
                        className="modal-card"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <h2>
                                {t('attendanceDetails')}
                            </h2>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedRecord(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="details-grid">


                            <div className="detail-item">

                                <span>{t('employee')}</span>

                                <strong>
                                    {
                                        selectedRecord.employee_name
                                        || "-"
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>{t('date')}</span>

                                <strong>
                                    {
                                        selectedRecord.date
                                        || "-"
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    {t('checkIn')}
                                </span>

                                <strong>
                                    {
                                        formatTime(
                                            selectedRecord.check_in
                                        )
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    {t('checkOut')}
                                </span>

                                <strong>
                                    {
                                        formatTime(
                                            selectedRecord.check_out
                                        )
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    {t('workedHours')}
                                </span>

                                <strong>
                                    {
                                        selectedRecord.worked_hours
                                        ?? "0.00"
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>{t('overtimeHours')}</span>

                                <strong>
                                    {
                                        selectedRecord.overtime_hours
                                        ?? "0.00"
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>{t('status')}</span>

                                <strong>

                                    <span
                                        className={
                                            `status-badge status-${selectedRecord.status}`
                                        }
                                    >

                                        {
                                            getStatusLabel(
                                                selectedRecord.status
                                            )
                                        }

                                    </span>

                                </strong>

                            </div>

                        </div>


                        <div className="modal-footer">

                            <button
                                className="secondary-btn"
                                onClick={() =>
                                    setSelectedRecord(null)
                                }
                            >

                                {t('close')}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}