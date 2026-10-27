import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Users() {

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

            setError(
                "دریافت کاربران با مشکل مواجه شد."
            );

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

            setSuccess(
                "کاربر با موفقیت ایجاد شد."
            );

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

                setError(
                    "ایجاد کاربر با مشکل مواجه شد."
                );

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
                    ? "کاربر غیرفعال شد."
                    : "کاربر فعال شد."
            );

            loadUsers();

        } catch (error) {

            console.error(
                "TOGGLE USER ERROR:",
                error
            );

            setError(
                "تغییر وضعیت کاربر با مشکل مواجه شد."
            );

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

            setSuccess(
                "کاربر با موفقیت حذف شد."
            );

            loadUsers();

        } catch (error) {

            console.error(
                "DELETE USER ERROR:",
                error
            );

            setError(
                "حذف کاربر با مشکل مواجه شد."
            );

        }

    };

    // ============================================================
    // ROLE LABEL
    // ============================================================

    const getRoleLabel = (role) => {

        if (role === "ADMIN") {
            return "مدیر";
        }

        if (role === "EMPLOYEE") {
            return "کارمند";
        }

        return role || "-";
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
                        مدیریت کاربران
                    </h1>

                    <p>
                        مدیریت حساب‌های کاربری سیستم
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
                        : "+ کاربر جدید"
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
                        ایجاد کاربر جدید
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">

                            {/* USERNAME */}

                            <div className="form-group">

                                <label>
                                    نام کاربری
                                </label>

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

                                <label>
                                    رمز عبور
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    required
                                />

                                <small>
                                    حداقل ۸ کاراکتر
                                </small>

                            </div>


                            {/* FIRST NAME */}

                            <div className="form-group">

                                <label>
                                    نام
                                </label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* LAST NAME */}

                            <div className="form-group">

                                <label>
                                    نام خانوادگی
                                </label>

                                <input
                                    type="text"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="form-group">

                                <label>
                                    ایمیل
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* ROLE */}

                            <div className="form-group">

                                <label>
                                    نقش
                                </label>

                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                >

                                    <option value="EMPLOYEE">
                                        کارمند
                                    </option>

                                    <option value="ADMIN">
                                        مدیر
                                    </option>

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
                                    ? "در حال ذخیره..."
                                    : "ایجاد کاربر"
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
                        کل کاربران
                    </span>

                    <b>
                        {users.length}
                    </b>

                </div>


                <div className="kpi">

                    <span>
                        مدیران
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

                    <span>
                        کارمندان
                    </span>

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
                        کاربران فعال
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
                            کاربران سیستم
                        </h2>

                        <p>
                            تعداد کاربران:
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
                            ? "در حال دریافت..."
                            : "↻ بروزرسانی"
                        }

                    </button>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    شناسه
                                </th>

                                <th>
                                    نام کاربری
                                </th>

                                <th>
                                    نام
                                </th>

                                <th>
                                    نام خانوادگی
                                </th>

                                <th>
                                    ایمیل
                                </th>

                                <th>
                                    نقش
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

                            {loadingUsers ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        style={{
                                            textAlign: "center",
                                            padding: "40px"
                                        }}
                                    >

                                        در حال دریافت کاربران...

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

                                        کاربری وجود ندارد.

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
                                                >
                                                    فعال
                                                </span>

                                            ) : (

                                                <span
                                                    className="status-badge pending"
                                                >
                                                    غیرفعال
                                                </span>

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
                                                        ? "غیرفعال کردن"
                                                        : "فعال کردن"
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

                                                    حذف

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