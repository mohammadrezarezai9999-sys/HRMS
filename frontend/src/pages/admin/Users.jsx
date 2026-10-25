import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Users() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


    // ============================================================
    // DATA
    // ============================================================

    const [users, setUsers] = useState([]);

    // ============================================================
    // UI
    // ============================================================

    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================================================
    // FORM
    // ============================================================

    const [form, setForm] = useState({
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        role: "EMPLOYEE",
    });

    // ============================================================
    // LOAD USERS
    // ============================================================

    const loadUsers = async () => {

        setLoadingUsers(true);
        setError("");

        try {

            const { data } =
                await api.get("users/");

            console.log(
                "USERS:",
                data
            );

            setUsers(
                data.results || data
            );

        } catch (error) {

            console.error(
                "USERS ERROR:",
                error
            );

            console.error(
                "BACKEND:",
                error.response?.data
            );

            setError(t('loadError'));

        } finally {

            setLoadingUsers(false);

        }
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadUsers();

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
            username: "",
            password: "",
            email: "",
            first_name: "",
            last_name: "",
            role: "EMPLOYEE",
        });

    };

    // ============================================================
    // CREATE USER
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {

            await api.post(
                "users/",
                form
            );

            setSuccess(t('successGeneric'));

            resetForm();

            setShowForm(false);

            loadUsers();

        } catch (error) {

            console.error(
                "CREATE USER ERROR:",
                error
            );

            console.error(
                "BACKEND:",
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

            setLoading(false);

        }

    };

    // ============================================================
    // TOGGLE ACTIVE
    // ============================================================

    const toggleActive = async (user) => {

        try {

            await api.patch(
                `users/${user.id}/`,
                {
                    is_active: !user.is_active,
                }
            );

            setSuccess(
                user.is_active
                    ? t('userDeactivated')
                    : t('userActivated')
            );

            loadUsers();

        } catch (error) {

            console.error(
                "TOGGLE USER ERROR:",
                error
            );

            setError(t('saveError'));

        }

    };

    // DELETE USER

    const deleteUser = async (user) => {

        const confirmed =
            window.confirm(
                `آیا از حذف کاربر "${user.username}" مطمئن هستید؟`
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `users/${user.id}/`
            );

            setSuccess(t('successGeneric'));

            loadUsers();

        } catch (error) {

            console.error(
                "DELETE USER ERROR:",
                error
            );

            setError(t('deleteError'));

        }

    };

    // ============================================================
    // ROLE LABEL
    // ============================================================

    const getRoleLabel = (role) => {

        if (role === "ADMIN") {
            return t('roleAdmin');
        }

        if (role === "EMPLOYEE") {
            return t('roleEmployee');
        }

        return role || "-";
    };

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

                    <h1>{t('users')}</h1>

                    <p>
                        {t('usersSubtitle')}
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
                        : t('addUser')
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
                ADD USER FORM
            ==================================================== */}

            {showForm && (

                <div className="admin-card employee-form">

                    <h2>
                        {t('addUser')}
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">

                            {/* USERNAME */}

                            <div className="form-group">

                                <label>{t('username')}</label>

                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="form-group">

                                <label>{t('password')}</label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    required
                                />

                                <small>
                                    {t('minPassword')}
                                </small>

                            </div>


                            {/* FIRST NAME */}

                            <div className="form-group">

                                <label>{t('name')}</label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* LAST NAME */}

                            <div className="form-group">

                                <label>{t('lastName')}</label>

                                <input
                                    type="text"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="form-group">

                                <label>{t('email')}</label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* ROLE */}

                            <div className="form-group">

                                <label>{t('role')}</label>

                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                >

                                    <option value="EMPLOYEE">{t('roleEmployee')}</option>

                                    <option value="ADMIN">{t('roleAdmin')}</option>

                                </select>

                            </div>

                        </div>


                        {/* FORM ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={loading}
                            >

                                {loading
                                    ? t('saving')
                                    : t('addUser')
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
                        {t('totalUsers')}
                    </span>

                    <b>
                        {users.length}
                    </b>

                </div>


                <div className="kpi">

                    <span>
                        {t('admins')}
                    </span>

                    <b>
                        {
                            users.filter(
                                user =>
                                    user.role === "ADMIN"
                            ).length
                        }
                    </b>

                </div>


                <div className="kpi">

                    <span>{t('employees')}</span>

                    <b>
                        {
                            users.filter(
                                user =>
                                    user.role === "EMPLOYEE"
                            ).length
                        }
                    </b>

                </div>


                <div className="kpi">

                    <span>
                        {t('activeUsers')}
                    </span>

                    <b>
                        {
                            users.filter(
                                user =>
                                    user.is_active
                            ).length
                        }
                    </b>

                </div>

            </div>


            {/* ====================================================
                USERS TABLE
            ==================================================== */}

            <div className="admin-card">

                <div className="card-header">

                    <div>

                        <h2>
                            {t('systemUsers')}
                        </h2>

                        <p>
                            {t('usersCount')}
                            {" "}
                            <strong>
                                {users.length}
                            </strong>
                        </p>

                    </div>

                    <button
                        className="secondary-btn"
                        onClick={loadUsers}
                        disabled={loadingUsers}
                    >

                        {loadingUsers
                            ? t('loadingData')
                            : t('refresh')
                        }

                    </button>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    {t('id')}
                                </th>

                                <th>{t('username')}</th>

                                <th>{t('name')}</th>

                                <th>{t('lastName')}</th>

                                <th>{t('email')}</th>

                                <th>{t('role')}</th>

                                <th>{t('status')}</th>

                                <th>{t('actions')}</th>

                            </tr>

                        </thead>


                        <tbody>

                            {loadingUsers ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        style={{
                                            textAlign: "center",
                                            padding: "40px"
                                        }}
                                    >

                                        {t('loadingData')}
                                    </td>

                                </tr>

                            ) : users.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        style={{
                                            textAlign: "center",
                                            padding: "40px"
                                        }}
                                    >

                                        {t('noUsers')}
                                    </td>

                                </tr>

                            ) : (

                                users.map(user => (

                                    <tr
                                        key={user.id}
                                    >

                                        <td>
                                            {user.id}
                                        </td>

                                        <td>
                                            {user.username}
                                        </td>

                                        <td>
                                            {user.first_name || "-"}
                                        </td>

                                        <td>
                                            {user.last_name || "-"}
                                        </td>

                                        <td>
                                            {user.email || "-"}
                                        </td>

                                        <td>

                                            <span
                                                className="status-badge"
                                            >
                                                {
                                                    getRoleLabel(
                                                        user.role
                                                    )
                                                }
                                            </span>

                                        </td>

                                        <td>

                                            {user.is_active ? (

                                                <span
                                                    className="status-badge"
                                                >{t('active')}</span>

                                            ) : (

                                                <span
                                                    className="status-badge pending"
                                                >{t('inactive')}</span>

                                            )}

                                        </td>

                                        <td>

                                            <div
                                                className="table-actions"
                                            >

                                                <button
                                                    className={
                                                        user.is_active
                                                            ? "secondary-btn"
                                                            : "primary-btn"
                                                    }
                                                    onClick={() =>
                                                        toggleActive(
                                                            user
                                                        )
                                                    }
                                                >

                                                    {user.is_active
                                                        ? t('deactivate')
                                                        : t('activate')
                                                    }

                                                </button>


                                                <button
                                                    className="danger-btn"
                                                    onClick={() =>
                                                        deleteUser(
                                                            user
                                                        )
                                                    }
                                                >

                                                    {t('delete')}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}