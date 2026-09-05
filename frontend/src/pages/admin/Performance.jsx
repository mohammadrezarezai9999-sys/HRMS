import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Performance() {

    // ============================================================
    // DATA
    // ============================================================

    const [reviews, setReviews] = useState([]);
    const [employees, setEmployees] = useState([]);

    // ============================================================
    // UI STATES
    // ============================================================

    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================================================
    // FORM
    // ============================================================

    const [form, setForm] = useState({
        employee: "",
        period: "",
        score: "",
        comments: "",
    });

    // ============================================================
    // LOAD PERFORMANCE REVIEWS
    // ============================================================

    const loadReviews = async () => {

        try {

            const { data } =
                await api.get("performance/");

            setReviews(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Performance error:",
                error
            );

            setError(
                "دریافت ارزیابی‌های عملکرد با مشکل مواجه شد."
            );
        }
    };

    // ============================================================
    // LOAD EMPLOYEES
    // ============================================================

    const loadEmployees = async () => {

        setLoadingEmployees(true);

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
                "دریافت لیست کارمندان با مشکل مواجه شد."
            );

        } finally {

            setLoadingEmployees(false);

        }
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadReviews();
        loadEmployees();

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
    // OPEN FORM
    // ============================================================

    const openForm = () => {

        setShowForm(true);

        setError("");
        setSuccess("");

    };

    // ============================================================
    // CLOSE FORM
    // ============================================================

    const closeForm = () => {

        setShowForm(false);

        setError("");

        setForm({
            employee: "",
            period: "",
            score: "",
            comments: "",
        });
    };

    // ============================================================
    // CREATE PERFORMANCE REVIEW
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");
        setSuccess("");

        // --------------------------------------------------------
        // FRONTEND VALIDATION
        // --------------------------------------------------------

        if (!form.employee) {

            setError(
                "لطفاً کارمند را انتخاب کنید."
            );

            setLoading(false);

            return;
        }

        if (!form.period.trim()) {

            setError(
                "لطفاً دوره ارزیابی را وارد کنید."
            );

            setLoading(false);

            return;
        }

        if (
            form.score === "" ||
            Number(form.score) < 0 ||
            Number(form.score) > 100
        ) {

            setError(
                "امتیاز باید بین ۰ تا ۱۰۰ باشد."
            );

            setLoading(false);

            return;
        }

        // --------------------------------------------------------
        // SEND TO BACKEND
        // --------------------------------------------------------

        try {

            await api.post(
                "performance/",
                {
                    employee: Number(form.employee),

                    period: form.period,

                    score: Number(form.score),

                    comments: form.comments,
                }
            );

            // ----------------------------------------------------
            // SUCCESS
            // ----------------------------------------------------

            setSuccess(
                "ارزیابی عملکرد با موفقیت ثبت شد."
            );

            // ----------------------------------------------------
            // RESET FORM
            // ----------------------------------------------------

            setForm({
                employee: "",
                period: "",
                score: "",
                comments: "",
            });

            setShowForm(false);

            // ----------------------------------------------------
            // RELOAD DATA
            // ----------------------------------------------------

            loadReviews();

        } catch (error) {

            console.error(
                "Create performance error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            if (error.response?.data) {

                const backendError =
                    error.response.data;

                if (
                    typeof backendError ===
                    "object"
                ) {

                    setError(
                        Object.entries(
                            backendError
                        )
                            .map(
                                ([field, message]) =>
                                    `${field}: ${Array.isArray(message)
                                        ? message.join(", ")
                                        : message
                                    }`
                            )
                            .join(" | ")
                    );

                } else {

                    setError(
                        String(backendError)
                    );
                }

            } else {

                setError(
                    "ثبت ارزیابی با مشکل مواجه شد."
                );
            }

        } finally {

            setLoading(false);

        }
    };

    // ============================================================
    // DELETE REVIEW
    // ============================================================

    const deleteReview = async (id) => {

        const confirmed =
            window.confirm(
                "آیا از حذف این ارزیابی مطمئن هستید؟"
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `performance/${id}/`
            );

            setSuccess(
                "ارزیابی با موفقیت حذف شد."
            );

            loadReviews();

        } catch (error) {

            console.error(
                "Delete performance error:",
                error
            );

            setError(
                "حذف ارزیابی با مشکل مواجه شد."
            );
        }
    };

    // ============================================================
    // SCORE LABEL
    // ============================================================

    const getScoreLabel = (score) => {

        const value = Number(score);

        if (value >= 90) {
            return "عالی";
        }

        if (value >= 75) {
            return "خوب";
        }

        if (value >= 60) {
            return "متوسط";
        }

        return "ضعیف";
    };

    // ============================================================
    // SCORE CLASS
    // ============================================================

    const getScoreClass = (score) => {

        const value = Number(score);

        if (value >= 90) {
            return "score-excellent";
        }

        if (value >= 75) {
            return "score-good";
        }

        if (value >= 60) {
            return "score-average";
        }

        return "score-poor";
    };

    // ============================================================
    // EMPLOYEE NAME
    // ============================================================

    const getEmployeeName = (employee) => {

        if (!employee) {
            return "-";
        }

        const firstName =
            employee.user?.first_name || "";

        const lastName =
            employee.user?.last_name || "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return (
            fullName ||
            employee.user?.username ||
            `کارمند #${employee.id}`
        );
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
                        ارزیابی عملکرد
                    </h1>

                    <p>
                        مدیریت و ثبت ارزیابی عملکرد کارمندان
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={openForm}
                >
                    + ارزیابی جدید
                </button>

            </div>


            {/* ====================================================
                SUCCESS MESSAGE
            ==================================================== */}

            {success && (

                <div className="success-message">

                    {success}

                </div>

            )}


            {/* ====================================================
                ERROR MESSAGE
            ==================================================== */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* ====================================================
                ADD PERFORMANCE FORM
            ==================================================== */}

            {showForm && (

                <div className="admin-card employee-form">

                    <div className="form-header">

                        <div>

                            <h2>
                                ثبت ارزیابی جدید
                            </h2>

                            <p>
                                اطلاعات ارزیابی عملکرد کارمند را وارد کنید.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">

                            {/* =================================================
                                EMPLOYEE
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    کارمند
                                </label>

                                <select
                                    name="employee"
                                    value={form.employee}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        انتخاب کارمند
                                    </option>

                                    {loadingEmployees ? (

                                        <option disabled>
                                            در حال دریافت کارمندان...
                                        </option>

                                    ) : (

                                        employees.map(
                                            employee => (

                                                <option
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {getEmployeeName(
                                                        employee
                                                    )}
                                                </option>

                                            )
                                        )
                                    )}

                                </select>

                            </div>


                            {/* =================================================
                                PERIOD
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    دوره ارزیابی
                                </label>

                                <input
                                    type="text"
                                    name="period"
                                    value={form.period}
                                    onChange={handleChange}
                                    placeholder="مثلاً 1405-نیمه اول"
                                    required
                                />

                            </div>


                            {/* =================================================
                                SCORE
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    امتیاز
                                </label>

                                <input
                                    type="number"
                                    name="score"
                                    value={form.score}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="0 تا 100"
                                    required
                                />

                                <small>
                                    امتیاز باید بین ۰ تا ۱۰۰ باشد.
                                </small>

                            </div>


                            {/* =================================================
                                COMMENTS
                            ================================================= */}

                            <div
                                className="form-group"
                                style={{
                                    gridColumn: "1 / -1"
                                }}
                            >

                                <label>
                                    توضیحات
                                </label>

                                <textarea
                                    name="comments"
                                    value={form.comments}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="توضیحات مربوط به عملکرد کارمند..."
                                />

                            </div>

                        </div>


                        {/* =================================================
                            FORM ACTIONS
                        ================================================= */}

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={loading}
                            >

                                {loading
                                    ? "در حال ذخیره..."
                                    : "ثبت ارزیابی"
                                }

                            </button>


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={closeForm}
                            >

                                انصراف

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ====================================================
                PERFORMANCE TABLE
            ==================================================== */}

            <div className="admin-card">

                <div className="card-header">

                    <div>

                        <h2>
                            ارزیابی‌های ثبت‌شده
                        </h2>

                        <p>
                            تعداد ارزیابی‌ها:
                            {" "}
                            <strong>
                                {reviews.length}
                            </strong>
                        </p>

                    </div>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    کارمند
                                </th>

                                <th>
                                    ارزیاب
                                </th>

                                <th>
                                    دوره
                                </th>

                                <th>
                                    امتیاز
                                </th>

                                <th>
                                    نتیجه
                                </th>

                                <th>
                                    توضیحات
                                </th>

                                <th>
                                    عملیات
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {reviews.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        style={{
                                            textAlign: "center",
                                            padding: "40px"
                                        }}
                                    >

                                        هنوز هیچ ارزیابی ثبت نشده است.

                                    </td>

                                </tr>

                            ) : (

                                reviews.map(
                                    review => (

                                        <tr
                                            key={review.id}
                                        >

                                            {/* EMPLOYEE */}

                                            <td>

                                                {review.employee_name ||
                                                    `کارمند #${review.employee}`
                                                }

                                            </td>


                                            {/* REVIEWER */}

                                            <td>

                                                {review.reviewer_name ||
                                                    `کاربر #${review.reviewer}`
                                                }

                                            </td>


                                            {/* PERIOD */}

                                            <td>

                                                {review.period || "-"}

                                            </td>


                                            {/* SCORE */}

                                            <td>

                                                <strong>
                                                    {review.score}
                                                </strong>

                                            </td>


                                            {/* SCORE LABEL */}

                                            <td>

                                                <span
                                                    className={
                                                        getScoreClass(
                                                            review.score
                                                        )
                                                    }
                                                >

                                                    {
                                                        getScoreLabel(
                                                            review.score
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* COMMENTS */}

                                            <td>

                                                {review.comments || "-"}

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <button
                                                    className="danger-btn"
                                                    onClick={() =>
                                                        deleteReview(
                                                            review.id
                                                        )
                                                    }
                                                >

                                                    حذف

                                                </button>

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