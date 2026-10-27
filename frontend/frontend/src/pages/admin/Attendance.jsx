import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Attendance() {

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
                    "دسترسی شما منقضی شده است. لطفاً دوباره وارد شوید."
                );

            } else if (error.response?.status === 403) {

                setError(
                    "شما اجازه مشاهده اطلاعات حضور و غیاب را ندارید."
                );

            } else {

                setError(
                    "دریافت اطلاعات حضور و غیاب با مشکل مواجه شد."
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
    // FORMAT TIME
    // =========================================================

    const formatTime = (datetime) => {

        if (!datetime) {
            return "-";
        }

        try {

            return new Date(datetime)
                .toLocaleTimeString(
                    "fa-AF",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }
                );

        } catch {

            return datetime.slice(11, 16);

        }
    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return date;

    };


    // =========================================================
    // STATUS LABEL
    // =========================================================

    const getStatusLabel = (status) => {

        switch (status) {

            case "present":
                return "حاضر";

            case "late":
                return "دیرکرد";

            case "absent":
                return "غایب";

            default:
                return "-";

        }

    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "آیا مطمئن هستید که می‌خواهید این رکورد حضور و غیاب حذف شود؟"
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
                "رکورد حضور و غیاب با موفقیت حذف شد."
            );


        } catch (error) {

            console.error(
                "Delete attendance error:",
                error
            );

            setError(
                "حذف رکورد با مشکل مواجه شد."
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

                    <h1>
                        حضور و غیاب
                    </h1>

                    <p>
                        مدیریت و مشاهده ورود و خروج کارمندان
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
                        ? "در حال بروزرسانی..."
                        : "↻ بروزرسانی"
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
                        کل رکوردها
                    </div>

                    <div className="stat-number">
                        {stats.total}
                    </div>

                </div>


                {/* PRESENT */}

                <div className="stat-card">

                    <div className="stat-title">
                        حاضر
                    </div>

                    <div className="stat-number">
                        {stats.present}
                    </div>

                </div>


                {/* LATE */}

                <div className="stat-card">

                    <div className="stat-title">
                        دیرکرد
                    </div>

                    <div className="stat-number">
                        {stats.late}
                    </div>

                </div>


                {/* ABSENT */}

                <div className="stat-card">

                    <div className="stat-title">
                        غایب
                    </div>

                    <div className="stat-number">
                        {stats.absent}
                    </div>

                </div>


                {/* CHECKED OUT */}

                <div className="stat-card">

                    <div className="stat-title">
                        خروج ثبت شده
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
                            جستجوی کارمند
                        </label>

                        <input
                            type="text"
                            placeholder="نام کارمند..."
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

                        <label>
                            وضعیت
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">
                                همه
                            </option>

                            <option value="present">
                                حاضر
                            </option>

                            <option value="late">
                                دیرکرد
                            </option>

                            <option value="absent">
                                غایب
                            </option>

                        </select>

                    </div>


                    {/* DATE */}

                    <div className="form-group">

                        <label>
                            تاریخ
                        </label>

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

                            پاک کردن فیلتر

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
                        سوابق حضور و غیاب
                    </h2>

                    <span>
                        {filteredAttendance.length} رکورد
                    </span>

                </div>


                {loading ? (

                    <div className="loading-box">

                        در حال دریافت اطلاعات...

                    </div>

                ) : filteredAttendance.length === 0 ? (

                    <div className="empty-box">

                        <h3>
                            رکوردی پیدا نشد
                        </h3>

                        <p>
                            اطلاعات حضور و غیاب برای فیلتر انتخاب‌شده وجود ندارد.
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

                                    <th>
                                        کارمند
                                    </th>

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
                                        اضافه‌کاری
                                    </th>

                                    <th>
                                        وضعیت
                                    </th>

                                    <th>
                                        عملیات
                                    </th>

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
                                                        خروج ثبت نشده
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

                                                    جزئیات

                                                </button>


                                                <button
                                                    className="danger-btn small-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            record.id
                                                        )
                                                    }
                                                >

                                                    حذف

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
                                جزئیات حضور
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

                                <span>
                                    کارمند
                                </span>

                                <strong>
                                    {
                                        selectedRecord.employee_name
                                        || "-"
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    تاریخ
                                </span>

                                <strong>
                                    {
                                        selectedRecord.date
                                        || "-"
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    زمان ورود
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
                                    زمان خروج
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
                                    ساعات کار
                                </span>

                                <strong>
                                    {
                                        selectedRecord.worked_hours
                                        ?? "0.00"
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    اضافه‌کاری
                                </span>

                                <strong>
                                    {
                                        selectedRecord.overtime_hours
                                        ?? "0.00"
                                    }
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    وضعیت
                                </span>

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

                                بستن

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}