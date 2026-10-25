import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Notifications() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


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
                t('loadError')
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

            setError(t('employeesLoadError'));
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

            setError(t('selectEmployeeRequired'));

            setSending(false);

            return;
        }

        if (!form.message.trim()) {

            setError(
                t('messageRequired')
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

            setSuccess(t('successGeneric'));

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

                setError(t('saveError'));

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

            setError(t('saveError'));
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

            setError(t('saveError'));
        }
    };

    // ============================================================
    // DELETE
    // ============================================================

    const deleteNotification = async (id) => {

        if (
            !window.confirm(
                t('confirmDelete')
            )
        ) {
            return;
        }

        try {

            await api.delete(
                `notifications/${id}/`
            );

            setSuccess(t('successGeneric'));

            loadNotifications();

        } catch (error) {

            console.error(error);

            setError(t('deleteError'));
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
// ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className="admin-page"
            dir={isRtl ? "rtl" : "ltr"}
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="page-header">

                <div>

                    <h1>{t('notifications')}</h1>

                    <p>
                        {t('notificationsSubtitle')}
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
                        ? t('closeForm')
                        : t('addNotification')
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
                        {t('addNotification')}
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">

                            {/* EMPLOYEE */}

                            <div className="form-group">

                                <label>
                                    {t('recipient')}
                                </label>

                                <select
                                    name="user"
                                    value={form.user}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">{t('selectEmployee')}</option>

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
                                    {t('message')}
                                </label>

                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder={t('messagePlaceholder')}
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
                                    ? t('sending')
                                    : t('addNotification')
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

                                {t('cancel')}
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
                        {t('totalNotifications')}
                    </span>

                    <b>
                        {notifications.length}
                    </b>

                </div>


                <div className="kpi">

                    <span>
                        {t('unread')}
                    </span>

                    <b>
                        {unreadCount}
                    </b>

                </div>


                <div className="kpi">

                    <span>
                        {t('isRead')}
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
                            {t('notificationsList')}
                        </h2>

                    </div>

                    <button
                        className="secondary-btn"
                        onClick={loadNotifications}
                    >{t('refresh')}</button>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    #
                                </th>

                                <th>
                                    {t('recipient')}
                                </th>

                                <th>{t('message')}</th>

                                <th>{t('status')}</th>

                                <th>{t('date')}</th>

                                <th>{t('actions')}</th>

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
                                        {t('loadingData')}
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
                                        {t('noNotifications')}
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
                                                        {t('isRead')}
                                                    </span>

                                                ) : (

                                                    <span className="status-badge pending">
                                                        {t('newBadge')}
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
                                                            {t('unread')}
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
                                                            {t('markedRead')}
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
                                                        {t('delete')}
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