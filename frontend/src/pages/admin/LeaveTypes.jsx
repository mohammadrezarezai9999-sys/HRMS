import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function LeaveTypes() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


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
                t('loadError')
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
                    t('successGeneric')
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
                    t('successGeneric')
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
                    t('saveError')
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
                t('confirmDelete')
            );


        if (!confirmed) {

            return;

        }


        try {

            await api.delete(
                `leave-types/${id}/`
            );

            setSuccess(
                t('successGeneric')
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

                setError(t('deleteError'));

            }

        }

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

                    <h1>{t('leaveTypes')}</h1>

                    <p>
                        {t('leaveTypesSubtitle')}
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={openAddForm}
                >

                    {t('addLeaveType')}
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
                            ? t('editLeaveType')
                            : t('addLeaveType')
                        }

                    </h2>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">


                            {/* NAME */}

                            <div className="form-group">

                                <label>
                                    {t('leaveTypeName')}
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder={t('leaveTypePlaceholder')}
                                    required
                                />

                            </div>


                            {/* MAX DAYS */}

                            <div className="form-group">

                                <label>{t('maxDays')}</label>

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
                                    {t('maxDaysHint')}
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

                                    ? t('saving')

                                    : editingId

                                        ? t('saveChanges')

                                        : t('addLeaveType')

                                }

                            </button>


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={closeForm}
                            >{t('cancel')}</button>

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
                                {t('leaveTypeName')}
                            </th>

                            <th>{t('maxDays')}</th>

                            <th>{t('actions')}</th>

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

                                    {t('noLeaveTypes')}
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

                                            {t('daysUnit')}

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

                                                    {t('edit')}
                                                </button>


                                                <button
                                                    className="danger-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            leaveType.id
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

    );

}