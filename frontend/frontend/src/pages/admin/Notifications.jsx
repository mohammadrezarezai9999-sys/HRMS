import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Notifications() {

    const [notifications, setNotifications] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        user: "",
        message: "",
    });

    // ============================================================
    // LOAD NOTIFICATIONS
    // ============================================================

    const loadNotifications = async () => {

        try {

            const { data } =
                await api.get("notifications/");

            setNotifications(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Notifications error:",
                error
            );

            setError(
                "دریافت اعلان‌ها با مشکل مواجه شد."
            );
        }
    };

    // ============================================================
    // LOAD EMPLOYEES
    // ============================================================

    const loadEmployees = async () => {

        try {

            const { data } =
                await api.get("employees/");

            setEmployees(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Employees error:",
                error
            );

            setError(
                "دریافت کارمندان با مشکل مواجه شد."
            );
        }
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        setLoading(true);

        Promise.all([
            loadNotifications(),
            loadEmployees(),
        ]).finally(() => {

            setLoading(false);

        });

    }, []);

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));

    };

    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setForm({
            user: "",
            message: "",
        });

    };

    // ============================================================
    // EMPLOYEE NAME
    // ============================================================

    const getEmployeeName = (employee) => {

        const first =
            employee.user?.first_name || "";

        const last =
            employee.user?.last_name || "";

        const fullName =
            `${first} ${last}`.trim();

        return (
            fullName ||
            employee.user?.username ||
            `کارمند #${employee.id}`
        );
    };

    // ============================================================
    // SEND NOTIFICATION
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSending(true);
        setError("");
        setSuccess("");

        if (!form.user) {

            setError(
                "لطفاً کارمند را انتخاب کنید."
            );

            setSending(false);

            return;
        }

        if (!form.message.trim()) {

            setError(
                "لطفاً متن اعلان را وارد کنید."
            );

            setSending(false);

            return;
        }

        try {

            await api.post(
                "notifications/",
                {
                    user: Number(form.user),
                    message: form.message,
                }
            );

            setSuccess(
                "اعلان با موفقیت ارسال شد."
            );

            resetForm();

            setShowForm(false);

            loadNotifications();

        } catch (error) {

            console.error(
                "Send notification error:",
                error
            );

            console.error(
                "Backend:",
                error.response?.data
            );

            const backendError =
                error.response?.data;

            if (
                backendError &&
                typeof backendError === "object"
            ) {

                setError(
                    Object.entries(
                        backendError
                    )
                        .map(
                            ([field, message]) =>
                                `${field}: ${
                                    Array.isArray(message)
                                        ? message.join(", ")
                                        : message
                                }`
                        )
                        .join(" | ")
                );

            } else {

                setError(
                    "ارسال اعلان با مشکل مواجه شد."
                );

            }

        } finally {

            setSending(false);

        }
    };

    // ============================================================
    // MARK AS READ
    // ============================================================

    const markAsRead = async (id) => {

        try {

            await api.patch(
                `notifications/${id}/`,
                {
                    is_read: true,
                }
            );

            loadNotifications();

        } catch (error) {

            console.error(error);

            setError(
                "تغییر وضعیت اعلان انجام نشد."
            );
        }
    };

    // ============================================================
    // MARK AS UNREAD
    // ============================================================

    const markAsUnread = async (id) => {

        try {

            await api.patch(
                `notifications/${id}/`,
                {
                    is_read: false,
                }
            );

            loadNotifications();

        } catch (error) {

            console.error(error);

            setError(
                "تغییر وضعیت اعلان انجام نشد."
            );
        }
    };

    // ============================================================
    // DELETE
    // ============================================================

    const deleteNotification = async (id) => {

        if (
            !window.confirm(
                "آیا از حذف این اعلان مطمئن هستید؟"
            )
        ) {
            return;
        }

        try {

            await api.delete(
                `notifications/${id}/`
            );

            setSuccess(
                "اعلان حذف شد."
            );

            loadNotifications();

        } catch (error) {

            console.error(error);

            setError(
                "حذف اعلان انجام نشد."
            );
        }
    };

    // ============================================================
    // EMPLOYEE FROM NOTIFICATION
    // ============================================================

    const getUserName = (userId) => {

        const employee =
            employees.find(
                employee =>
                    employee.user?.id === userId
            );

        if (!employee) {
            return `کاربر #${userId}`;
        }

        return getEmployeeName(employee);
    };

    // ============================================================
    // COUNTS
    // ============================================================

    const unreadCount =
        notifications.filter(
            item => !item.is_read
        ).length;

    const readCount =
        notifications.filter(
            item => item.is_read
        ).length;

    // ============================================================
    // DATE
    // ============================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleString("fa-IR");

    };

    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className="admin-page"
            dir="rtl"
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="page-header">

                <div>

                    <h1>
                        اعلان‌ها
                    </h1>

                    <p>
                        ارسال و مدیریت اعلان‌های کارکنان
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={() => {

                        setShowForm(
                            !showForm
                        );

                        setError("");
                        setSuccess("");

                    }}
                >

                    {showForm
                        ? "بستن فرم"
                        : "+ اعلان جدید"
                    }

                </button>

            </div>


            {/* ====================================================
                SUCCESS
            ==================================================== */}

            {success && (

                <div className="success-message">
                    {success}
                </div>

            )}


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            {/* ====================================================
                SEND FORM
            ==================================================== */}

            {showForm && (

                <div className="admin-card employee-form">

                    <h2>
                        ارسال اعلان جدید
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">

                            {/* EMPLOYEE */}

                            <div className="form-group">

                                <label>
                                    گیرنده
                                </label>

                                <select
                                    name="user"
                                    value={form.user}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        انتخاب کارمند
                                    </option>

                                    {employees.map(
                                        employee => (

                                            <option
                                                key={
                                                    employee.user?.id
                                                }
                                                value={
                                                    employee.user?.id
                                                }
                                            >
                                                {
                                                    getEmployeeName(
                                                        employee
                                                    )
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* MESSAGE */}

                            <div
                                className="form-group"
                                style={{
                                    gridColumn:
                                        "1 / -1"
                                }}
                            >

                                <label>
                                    متن اعلان
                                </label>

                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="متن اعلان را وارد کنید..."
                                    required
                                />

                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={sending}
                            >

                                {sending
                                    ? "در حال ارسال..."
                                    : "ارسال اعلان"
                                }

                            </button>

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => {

                                    setShowForm(false);
                                    resetForm();
                                    setError("");

                                }}
                            >

                                انصراف

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ====================================================
                STATISTICS
            ==================================================== */}

            <div className="kpi-row">

                <div className="kpi">

                    <span>
                        کل اعلان‌ها
                    </span>

                    <b>
                        {notifications.length}
                    </b>

                </div>


                <div className="kpi">

                    <span>
                        خوانده‌نشده
                    </span>

                    <b>
                        {unreadCount}
                    </b>

                </div>


                <div className="kpi">

                    <span>
                        خوانده‌شده
                    </span>

                    <b>
                        {readCount}
                    </b>

                </div>

            </div>


            {/* ====================================================
                TABLE
            ==================================================== */}

            <div className="admin-card">

                <div className="card-header">

                    <div>

                        <h2>
                            لیست اعلان‌ها
                        </h2>

                    </div>

                    <button
                        className="secondary-btn"
                        onClick={loadNotifications}
                    >
                        ↻ بروزرسانی
                    </button>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    #
                                </th>

                                <th>
                                    گیرنده
                                </th>

                                <th>
                                    پیام
                                </th>

                                <th>
                                    وضعیت
                                </th>

                                <th>
                                    تاریخ
                                </th>

                                <th>
                                    عملیات
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "40px"
                                        }}
                                    >
                                        در حال دریافت...
                                    </td>

                                </tr>

                            ) : notifications.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "40px"
                                        }}
                                    >
                                        هیچ اعلانی وجود ندارد.
                                    </td>

                                </tr>

                            ) : (

                                notifications.map(
                                    notification => (

                                        <tr
                                            key={
                                                notification.id
                                            }
                                        >

                                            <td>
                                                {
                                                    notification.id
                                                }
                                            </td>

                                            <td>

                                                {
                                                    notification.user_name
                                                    ||
                                                    getUserName(
                                                        notification.user
                                                    )
                                                }

                                            </td>

                                            <td>

                                                <div
                                                    style={{
                                                        maxWidth:
                                                            "350px",
                                                        whiteSpace:
                                                            "normal"
                                                    }}
                                                >
                                                    {
                                                        notification.message
                                                    }
                                                </div>

                                            </td>

                                            <td>

                                                {notification.is_read ? (

                                                    <span className="status-badge">
                                                        خوانده‌شده
                                                    </span>

                                                ) : (

                                                    <span className="status-badge pending">
                                                        جدید
                                                    </span>

                                                )}

                                            </td>

                                            <td>

                                                {
                                                    formatDate(
                                                        notification.created_at
                                                    )
                                                }

                                            </td>

                                            <td>

                                                <div className="table-actions">

                                                    {notification.is_read ? (

                                                        <button
                                                            className="secondary-btn"
                                                            onClick={() =>
                                                                markAsUnread(
                                                                    notification.id
                                                                )
                                                            }
                                                        >
                                                            خوانده‌نشده
                                                        </button>

                                                    ) : (

                                                        <button
                                                            className="primary-btn"
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id
                                                                )
                                                            }
                                                        >
                                                            خوانده شد
                                                        </button>

                                                    )}

                                                    <button
                                                        className="danger-btn"
                                                        onClick={() =>
                                                            deleteNotification(
                                                                notification.id
                                                            )
                                                        }
                                                    >
                                                        حذف
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}