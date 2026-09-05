import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";

export default function EmployeeLeaves() {

    // ============================================================
    // STATE
    // ============================================================

    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ============================================================
    // FORM
    // ============================================================

    const [form, setForm] = useState({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
    });


    // ============================================================
    // LOAD LEAVE REQUESTS
    // ============================================================

    const loadLeaves = async () => {

        try {

            const { data } = await api.get(
                "leave-requests/"
            );

            setLeaves(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Leaves error:",
                error
            );

            setError(
                "دریافت درخواست‌های مرخصی با مشکل مواجه شد."
            );

        } finally {

            setLoading(false);

        }
    };


    // ============================================================
    // LOAD LEAVE TYPES
    // ============================================================

    const loadLeaveTypes = async () => {

        try {

            const { data } = await api.get(
                "leave-types/"
            );

            setLeaveTypes(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Leave types error:",
                error
            );

            setError(
                "دریافت انواع مرخصی با مشکل مواجه شد."
            );

        }
    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadLeaves();
        loadLeaveTypes();

    }, []);


    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

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

        setForm({
            leave_type: "",
            start_date: "",
            end_date: "",
            reason: "",
        });

        setError("");

    };


    // ============================================================
    // CREATE LEAVE REQUEST
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);

        setError("");
        setSuccess("");


        try {

            await api.post(
                "leave-requests/",
                {
                    leave_type: form.leave_type,
                    start_date: form.start_date,
                    end_date: form.end_date,
                    reason: form.reason,
                }
            );


            setSuccess(
                "درخواست مرخصی با موفقیت ثبت شد."
            );


            setForm({
                leave_type: "",
                start_date: "",
                end_date: "",
                reason: "",
            });


            setShowForm(false);


            await loadLeaves();

        } catch (error) {

            console.error(
                "Create leave error:",
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
                    typeof backendError === "object"
                ) {

                    setError(
                        Object.entries(
                            backendError
                        )
                            .map(
                                ([key, value]) =>
                                    `${key}: ${Array.isArray(value)
                                        ? value.join(", ")
                                        : value}`
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
                    "ثبت درخواست مرخصی با مشکل مواجه شد."
                );

            }

        } finally {

            setSaving(false);

        }

    };


    // ============================================================
    // STATUS TEXT
    // ============================================================

    const getStatusText = (status) => {

        switch (status) {

            case "pending":
                return "در انتظار بررسی";

            case "approved":
                return "تأیید شده";

            case "rejected":
                return "رد شده";

            default:
                return status || "-";
        }
    };


    // ============================================================
    // STATUS CLASS
    // ============================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "pending":
                return "status-pending";

            case "approved":
                return "status-approved";

            case "rejected":
                return "status-rejected";

            default:
                return "";
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
                    مرخصی‌های من
                </h1>

                <p>
                    در حال دریافت اطلاعات...
                </p>

            </div>

        );

    }


    // ============================================================
    // UI
    // ============================================================

    return (

        <div
            className="employee-page"
            dir="rtl"
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="page-header">

                <div>

                    <h1>
                        مرخصی‌های من
                    </h1>

                    <p>
                        مدیریت درخواست‌های مرخصی
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={openForm}
                >

                    + درخواست مرخصی

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
                FORM
            ==================================================== */}

            {showForm && (

                <div className="employee-card">

                    <div className="card-header">

                        <h2>
                            ثبت درخواست مرخصی
                        </h2>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="employee-form"
                    >

                        <div className="form-grid">


                            {/* نوع مرخصی */}

                            <div className="form-group">

                                <label>
                                    نوع مرخصی
                                </label>

                                <select
                                    name="leave_type"
                                    value={form.leave_type}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        انتخاب نوع مرخصی
                                    </option>


                                    {leaveTypes.map(
                                        type => (

                                            <option
                                                key={type.id}
                                                value={type.id}
                                            >

                                                {type.name}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* تاریخ شروع */}

                            <div className="form-group">

                                <label>
                                    تاریخ شروع
                                </label>

                                <input
                                    type="date"
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* تاریخ پایان */}

                            <div className="form-group">

                                <label>
                                    تاریخ پایان
                                </label>

                                <input
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* دلیل */}

                            <div className="form-group full-width">

                                <label>
                                    دلیل مرخصی
                                </label>

                                <textarea
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="دلیل درخواست مرخصی را وارد کنید..."
                                />

                            </div>

                        </div>


                        {/* BUTTONS */}

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={saving}
                            >

                                {saving
                                    ? "در حال ثبت..."
                                    : "ثبت درخواست"
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
                LEAVE TABLE
            ==================================================== */}

            <div className="employee-card">

                <div className="card-header">

                    <h2>
                        درخواست‌های من
                    </h2>

                    <span>
                        {leaves.length} درخواست
                    </span>

                </div>


                {leaves.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            هنوز هیچ درخواست مرخصی ثبت نکرده‌اید.
                        </p>

                        <button
                            className="primary-btn"
                            onClick={openForm}
                        >

                            ثبت اولین درخواست

                        </button>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        نوع مرخصی
                                    </th>

                                    <th>
                                        شروع
                                    </th>

                                    <th>
                                        پایان
                                    </th>

                                    <th>
                                        دلیل
                                    </th>

                                    <th>
                                        وضعیت
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {leaves.map(
                                    leave => (

                                        <tr
                                            key={leave.id}
                                        >

                                            <td>

                                                {
                                                    leave.leave_type_name
                                                    || "-"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    leave.start_date
                                                    || "-"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    leave.end_date
                                                    || "-"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    leave.reason
                                                    || "-"
                                                }

                                            </td>


                                            <td>

                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        leave.status
                                                    )}`}
                                                >

                                                    {
                                                        getStatusText(
                                                            leave.status
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