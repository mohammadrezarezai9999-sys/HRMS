import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeeNotifications() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadNotifications = async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get("notifications/");
            setNotifications(data.results || data);
        } catch (error) {
            console.error("Notifications error:", error);
            setError(t('loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const markAsRead = async (notification) => {
        if (notification.is_read) return;

        try {
            await api.patch(`notifications/${notification.id}/`, {
                is_read: true,
            });

            setNotifications((current) =>
                current.map((item) =>
                    item.id === notification.id
                        ? { ...item, is_read: true }
                        : item
                )
            );
        } catch (error) {
            console.error("Notification update error:", error);
            setError(t('saveError'));
        }
    };
const unreadCount = notifications.filter((item) => !item.is_read).length;

    return (
        <div className="employee-page" dir={isRtl ? "rtl" : "ltr"}>
            <div className="page-header">
                <div>
                    <h1>{t('notifications')}</h1>
                    <p>{t('myNotificationsSubtitle')}</p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={loadNotifications}
                    disabled={loading}
                >{t('refresh')}</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="employee-card">
                <div className="card-header">
                    <h2>{t('myMessages')}</h2>
                    <span>{unreadCount} خوانده‌نشده</span>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <p>{t('loadingData')}</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('noNotifications')}</p>
                    </div>
                ) : (
                    <div className="notification-list">
                        {notifications.map((notification) => (
                            <button
                                type="button"
                                key={notification.id}
                                className={`notification-item ${
                                    !notification.is_read ? "unread" : ""
                                }`}
                                onClick={() => markAsRead(notification)}
                            >
                                <div className="notification-icon">🔔</div>

                                <div className="notification-content">
                                    <p>
                                        {notification.message ||
                                            notification.title ||
                                            "-"}
                                    </p>

                                    <small>
                                        {formatDate(
                                            notification.created_at ||
                                            notification.created
                                        )}
                                    </small>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}