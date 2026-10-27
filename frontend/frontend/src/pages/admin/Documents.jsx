import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Documents() {

    // ============================================================
    // DATA
    // ============================================================

    const [documents, setDocuments] = useState([]);
    const [employees, setEmployees] = useState([]);

    // ============================================================
    // UI
    // ============================================================

    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================================================
    // FORM
    // ============================================================

    const [form, setForm] = useState({
        employee: "",
        doc_type: "",
        file: null,
    });

    // ============================================================
    // LOAD DOCUMENTS
    // ============================================================

    const loadDocuments = async () => {

        try {

            const { data } =
                await api.get("documents/");

            setDocuments(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Documents error:",
                error
            );

            setError(
                "دریافت اسناد با مشکل مواجه شد."
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
                "دریافت لیست کارمندان با مشکل مواجه شد."
            );
        }
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        setLoadingData(true);

        Promise.all([
            loadDocuments(),
            loadEmployees(),
        ]).finally(() => {

            setLoadingData(false);

        });

    }, []);

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        const {
            name,
            value,
            files,
        } = e.target;

        if (name === "file") {

            setForm(prev => ({
                ...prev,
                file: files[0] || null,
            }));

            return;
        }

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
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
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setForm({
            employee: "",
            doc_type: "",
            file: null,
        });

    };

    // ============================================================
    // CLOSE FORM
    // ============================================================

    const closeForm = () => {

        setShowForm(false);

        setError("");

        resetForm();

    };

    // ============================================================
    // CREATE DOCUMENT
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");
        setSuccess("");

        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!form.employee) {

            setError(
                "لطفاً کارمند را انتخاب کنید."
            );

            setLoading(false);

            return;
        }

        if (!form.doc_type.trim()) {

            setError(
                "لطفاً نوع سند را وارد کنید."
            );

            setLoading(false);

            return;
        }

        if (!form.file) {

            setError(
                "لطفاً فایل سند را انتخاب کنید."
            );

            setLoading(false);

            return;
        }

        // --------------------------------------------------------
        // FORM DATA
        // --------------------------------------------------------

        const formData = new FormData();

        formData.append(
            "employee",
            form.employee
        );

        formData.append(
            "doc_type",
            form.doc_type
        );

        formData.append(
            "file",
            form.file
        );

        // --------------------------------------------------------
        // SEND
        // --------------------------------------------------------

        try {

            await api.post(
                "documents/",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            setSuccess(
                "سند با موفقیت ثبت شد."
            );

            resetForm();

            setShowForm(false);

            loadDocuments();

        } catch (error) {

            console.error(
                "Create document error:",
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
                        String(backendError)
                    );
                }

            } else {

                setError(
                    "ثبت سند با مشکل مواجه شد."
                );
            }

        } finally {

            setLoading(false);

        }
    };

    // ============================================================
    // DELETE DOCUMENT
    // ============================================================

    const deleteDocument = async (id) => {

        const confirmed =
            window.confirm(
                "آیا از حذف این سند مطمئن هستید؟"
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `documents/${id}/`
            );

            setSuccess(
                "سند با موفقیت حذف شد."
            );

            loadDocuments();

        } catch (error) {

            console.error(
                "Delete document error:",
                error
            );

            setError(
                "حذف سند با مشکل مواجه شد."
            );
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
                        اسناد کارمندان
                    </h1>

                    <p>
                        مدیریت مدارک و اسناد کارمندان
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
                        : "+ سند جدید"
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
                ADD DOCUMENT FORM
            ==================================================== */}

            {showForm && (

                <div className="admin-card employee-form">

                    <h2>
                        ثبت سند جدید
                    </h2>

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

                                    {employees.map(
                                        employee => (

                                            <option
                                                key={employee.id}
                                                value={employee.id}
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


                            {/* =================================================
                                DOCUMENT TYPE
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    نوع سند
                                </label>

                                <input
                                    type="text"
                                    name="doc_type"
                                    value={form.doc_type}
                                    onChange={handleChange}
                                    placeholder="مثلاً تذکره، قرارداد، سند تحصیلی"
                                    required
                                />

                            </div>


                            {/* =================================================
                                FILE
                            ================================================= */}

                            <div
                                className="form-group"
                                style={{
                                    gridColumn: "1 / -1"
                                }}
                            >

                                <label>
                                    فایل سند
                                </label>

                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleChange}
                                    required
                                />

                                {form.file && (

                                    <small>

                                        فایل انتخاب‌شده:
                                        {" "}
                                        {form.file.name}

                                    </small>

                                )}

                            </div>

                        </div>


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={loading}
                            >

                                {loading
                                    ? "در حال آپلود..."
                                    : "ثبت سند"
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
                DOCUMENTS TABLE
            ==================================================== */}

            <div className="admin-card">

                <div className="card-header">

                    <div>

                        <h2>
                            اسناد ثبت‌شده
                        </h2>

                        <p>
                            تعداد اسناد:
                            {" "}
                            <strong>
                                {documents.length}
                            </strong>
                        </p>

                    </div>

                </div>


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
                                    نوع سند
                                </th>

                                <th>
                                    فایل
                                </th>

                                <th>
                                    تاریخ آپلود
                                </th>

                                <th>
                                    عملیات
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {loadingData ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign: "center",
                                            padding: "40px"
                                        }}
                                    >

                                        در حال دریافت اطلاعات...

                                    </td>

                                </tr>

                            ) : documents.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign: "center",
                                            padding: "40px"
                                        }}
                                    >

                                        هنوز سندی ثبت نشده است.

                                    </td>

                                </tr>

                            ) : (

                                documents.map(
                                    document => (

                                        <tr
                                            key={document.id}
                                        >

                                            {/* ID */}

                                            <td>
                                                {document.id}
                                            </td>


                                            {/* EMPLOYEE */}

                                            <td>

                                                {
                                                    employees.find(
                                                        employee =>
                                                            employee.id ===
                                                            document.employee
                                                    )
                                                        ? getEmployeeName(
                                                            employees.find(
                                                                employee =>
                                                                    employee.id ===
                                                                    document.employee
                                                            )
                                                        )
                                                        : `کارمند #${document.employee}`
                                                }

                                            </td>


                                            {/* TYPE */}

                                            <td>

                                                {document.doc_type}

                                            </td>


                                            {/* FILE */}

                                            <td>

                                                {document.file ? (

                                                    <a
                                                        href={
                                                            document.file
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="primary-btn"
                                                    >

                                                        مشاهده فایل

                                                    </a>

                                                ) : (

                                                    "-"

                                                )}

                                            </td>


                                            {/* UPLOAD DATE */}

                                            <td>

                                                {document.uploaded_at
                                                    ? new Date(
                                                        document.uploaded_at
                                                    ).toLocaleString(
                                                        "fa-IR"
                                                    )
                                                    : "-"
                                                }

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <button
                                                    className="danger-btn"
                                                    onClick={() =>
                                                        deleteDocument(
                                                            document.id
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