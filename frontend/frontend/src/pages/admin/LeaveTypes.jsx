import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function LeaveTypes() {

    // ============================================================
    // STATE
    // ============================================================

    const [leaveTypes, setLeaveTypes] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ============================================================
    // FORM
    // ============================================================

    const [form, setForm] = useState({

        name: "",

        max_days_per_year: "",

    });


    // ============================================================
    // GET LEAVE TYPES
    // ============================================================

    const loadLeaveTypes = async () => {

        try {

            const { data } =
                await api.get("leave-types/");

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

        loadLeaveTypes();

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

            [name]: value

        }));

    };


    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setForm({

            name: "",

            max_days_per_year: "",

        });

        setEditingId(null);

    };


    // ============================================================
    // OPEN ADD FORM
    // ============================================================

    const openAddForm = () => {

        resetForm();

        setError("");

        setSuccess("");

        setShowForm(true);

    };


    // ============================================================
    // EDIT
    // ============================================================

    const handleEdit = (leaveType) => {

        setEditingId(
            leaveType.id
        );

        setForm({

            name:
                leaveType.name || "",

            max_days_per_year:
                leaveType.max_days_per_year ?? "",

        });

        setError("");

        setSuccess("");

        setShowForm(true);

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };


    // ============================================================
    // CLOSE FORM
    // ============================================================

    const closeForm = () => {

        resetForm();

        setShowForm(false);

        setError("");

    };


    // ============================================================
    // CREATE / UPDATE
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        setSuccess("");


        try {

            const data = {

                name: form.name,

                max_days_per_year:
                    Number(
                        form.max_days_per_year
                    ),

            };


            // ====================================================
            // UPDATE
            // ====================================================

            if (editingId) {

                await api.patch(

                    `leave-types/${editingId}/`,

                    data

                );

                setSuccess(
                    "نوع مرخصی با موفقیت ویرایش شد."
                );

            }


            // ====================================================
            // CREATE
            // ====================================================

            else {

                await api.post(

                    "leave-types/",

                    data

                );

                setSuccess(
                    "نوع مرخصی با موفقیت ایجاد شد."
                );

            }


            resetForm();

            setShowForm(false);

            await loadLeaveTypes();


        } catch (error) {

            console.error(
                "Leave type save error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );


            if (
                error.response &&
                error.response.data
            ) {

                setError(
                    JSON.stringify(
                        error.response.data
                    )
                );

            } else {

                setError(
                    "ذخیره نوع مرخصی با مشکل مواجه شد."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "آیا از حذف این نوع مرخصی مطمئن هستید؟"
            );


        if (!confirmed) {

            return;

        }


        try {

            await api.delete(
                `leave-types/${id}/`
            );

            setSuccess(
                "نوع مرخصی با موفقیت حذف شد."
            );

            await loadLeaveTypes();


        } catch (error) {

            console.error(
                "Delete leave type error:",
                error
            );


            /*
             * اگر LeaveRequest به این LeaveType
             * متصل باشد، Django به دلیل PROTECT
             * اجازه حذف نمی‌دهد.
             */

            if (
                error.response?.data
            ) {

                setError(
                    JSON.stringify(
                        error.response.data
                    )
                );

            } else {

                setError(
                    "حذف نوع مرخصی با مشکل مواجه شد."
                );

            }

        }

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
                        انواع مرخصی
                    </h1>

                    <p>
                        مدیریت انواع مرخصی کارمندان
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={openAddForm}
                >

                    + نوع مرخصی جدید

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

                <div className="admin-card">

                    <h2>

                        {editingId
                            ? "ویرایش نوع مرخصی"
                            : "افزودن نوع مرخصی"
                        }

                    </h2>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">


                            {/* NAME */}

                            <div className="form-group">

                                <label>
                                    نام مرخصی
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="مثلاً مرخصی سالانه"
                                    required
                                />

                            </div>


                            {/* MAX DAYS */}

                            <div className="form-group">

                                <label>
                                    حداکثر روز در سال
                                </label>

                                <input
                                    type="number"
                                    name="max_days_per_year"
                                    value={
                                        form.max_days_per_year
                                    }
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />

                                <small>
                                    تعداد روز مجاز برای این نوع مرخصی در سال
                                </small>

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

                                    : editingId

                                        ? "ذخیره تغییرات"

                                        : "ثبت نوع مرخصی"

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
                TABLE
            ==================================================== */}

            <div className="admin-card">

                <table>

                    <thead>

                        <tr>

                            <th>
                                #
                            </th>

                            <th>
                                نام مرخصی
                            </th>

                            <th>
                                حداکثر روز در سال
                            </th>

                            <th>
                                عملیات
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {leaveTypes.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="4"
                                    style={{
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >

                                    هنوز نوع مرخصی ثبت نشده است.

                                </td>

                            </tr>

                        ) : (

                            leaveTypes.map(
                                leaveType => (

                                    <tr
                                        key={
                                            leaveType.id
                                        }
                                    >

                                        <td>
                                            {
                                                leaveType.id
                                            }
                                        </td>


                                        <td>
                                            {
                                                leaveType.name
                                            }
                                        </td>


                                        <td>

                                            {
                                                leaveType.max_days_per_year
                                            }

                                            {" روز"}

                                        </td>


                                        <td>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px"
                                                }}
                                            >

                                                <button
                                                    className="secondary-btn"
                                                    onClick={() =>
                                                        handleEdit(
                                                            leaveType
                                                        )
                                                    }
                                                >

                                                    ویرایش

                                                </button>


                                                <button
                                                    className="danger-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            leaveType.id
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

    );

}