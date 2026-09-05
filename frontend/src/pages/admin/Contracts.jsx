import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Contracts() {

    // ============================================================
    // STATE
    // ============================================================

    const [contracts, setContracts] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ============================================================
    // FORM
    // ============================================================

    const [form, setForm] = useState({

        employee: "",
        start_date: "",
        end_date: "",
        contract_type: "full-time",
        salary: "",
        status: "active",
        file: null,

    });


    // ============================================================
    // LOAD CONTRACTS
    // ============================================================

    const loadContracts = async () => {

        try {

            const { data } = await api.get("contracts/");

            setContracts(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Contracts error:",
                error
            );

            setError(
                "دریافت قراردادها با مشکل مواجه شد."
            );

        }

    };


    // ============================================================
    // LOAD EMPLOYEES
    // ============================================================

    const loadEmployees = async () => {

        try {

            const { data } = await api.get("employees/");

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

        loadContracts();
        loadEmployees();

    }, []);


    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({

            ...prev,

            [name]: value

        }));

    };


    // ============================================================
    // FILE CHANGE
    // ============================================================

    const handleFileChange = (e) => {

        setForm(prev => ({

            ...prev,

            file: e.target.files[0] || null

        }));

    };


    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setForm({

            employee: "",
            start_date: "",
            end_date: "",
            contract_type: "full-time",
            salary: "",
            status: "active",
            file: null,

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
    // CLOSE FORM
    // ============================================================

    const closeForm = () => {

        resetForm();

        setShowForm(false);

        setError("");

    };


    // ============================================================
    // EDIT CONTRACT
    // ============================================================

    const handleEdit = (contract) => {

        setEditingId(contract.id);

        setForm({

            employee: contract.employee || "",
            start_date: contract.start_date || "",
            end_date: contract.end_date || "",
            contract_type:
                contract.contract_type || "full-time",
            salary: contract.salary || "",
            status:
                contract.status || "active",
            file: null,

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
    // CREATE / UPDATE
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        setSuccess("");


        try {

            /*
             * چون ممکن است فایل قرارداد وجود داشته باشد،
             * از FormData استفاده می‌کنیم.
             */

            const formData = new FormData();

            formData.append(
                "employee",
                form.employee
            );

            formData.append(
                "start_date",
                form.start_date
            );

            if (form.end_date) {

                formData.append(
                    "end_date",
                    form.end_date
                );

            }

            formData.append(
                "contract_type",
                form.contract_type
            );

            formData.append(
                "salary",
                form.salary
            );

            formData.append(
                "status",
                form.status
            );

            if (form.file) {

                formData.append(
                    "file",
                    form.file
                );

            }


            // ====================================================
            // UPDATE
            // ====================================================

            if (editingId) {

                await api.patch(
                    `contracts/${editingId}/`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

                setSuccess(
                    "قرارداد با موفقیت ویرایش شد."
                );

            }

            // ====================================================
            // CREATE
            // ====================================================

            else {

                await api.post(
                    "contracts/",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

                setSuccess(
                    "قرارداد با موفقیت ایجاد شد."
                );

            }


            resetForm();

            setShowForm(false);

            await loadContracts();


        } catch (error) {

            console.error(
                "Contract save error:",
                error
            );

            console.error(
                "Backend:",
                error.response?.data
            );


            if (error.response?.data) {

                setError(
                    JSON.stringify(
                        error.response.data
                    )
                );

            } else {

                setError(
                    "ذخیره قرارداد با مشکل مواجه شد."
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

        const confirmed = window.confirm(
            "آیا از حذف این قرارداد مطمئن هستید؟"
        );

        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `contracts/${id}/`
            );

            setSuccess(
                "قرارداد با موفقیت حذف شد."
            );

            await loadContracts();

        } catch (error) {

            console.error(
                "Delete contract error:",
                error
            );

            setError(
                "حذف قرارداد با مشکل مواجه شد."
            );

        }

    };


    // ============================================================
    // EMPLOYEE NAME
    // ============================================================

    const getEmployeeName = (employeeId) => {

        const employee = employees.find(
            emp => emp.id === employeeId
        );

        if (!employee) {

            return `کارمند #${employeeId}`;

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
            `کارمند #${employeeId}`
        );

    };


    // ============================================================
    // CONTRACT TYPE
    // ============================================================

    const getContractType = (type) => {

        const types = {

            "full-time": "تمام وقت",

            "part-time": "نیمه وقت",

            "contractor": "قراردادی",

        };

        return types[type] || type;

    };


    // ============================================================
    // STATUS
    // ============================================================

    const getStatus = (status) => {

        if (status === "active") {
            return "فعال";
        }

        if (status === "expired") {
            return "منقضی";
        }

        return status;

    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="admin-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="page-header">

                <div>

                    <h1>
                        قراردادهای کارمندان
                    </h1>

                    <p>
                        مدیریت قراردادهای کاری کارمندان
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={openAddForm}
                >

                    + قرارداد جدید

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

                <div className="admin-card employee-form">

                    <h2>

                        {editingId
                            ? "ویرایش قرارداد"
                            : "افزودن قرارداد جدید"
                        }

                    </h2>


                    <form
                        onSubmit={handleSubmit}
                    >


                        <div className="form-grid">


                            {/* EMPLOYEE */}

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

                                                {getEmployeeName(
                                                    employee.id
                                                )}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* START DATE */}

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


                            {/* END DATE */}

                            <div className="form-group">

                                <label>
                                    تاریخ پایان
                                </label>

                                <input
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                />

                                <small>
                                    برای قرارداد بدون تاریخ پایان خالی بگذارید.
                                </small>

                            </div>


                            {/* CONTRACT TYPE */}

                            <div className="form-group">

                                <label>
                                    نوع قرارداد
                                </label>

                                <select
                                    name="contract_type"
                                    value={form.contract_type}
                                    onChange={handleChange}
                                >

                                    <option value="full-time">
                                        تمام وقت
                                    </option>

                                    <option value="part-time">
                                        نیمه وقت
                                    </option>

                                    <option value="contractor">
                                        قراردادی
                                    </option>

                                </select>

                            </div>


                            {/* SALARY */}

                            <div className="form-group">

                                <label>
                                    حقوق
                                </label>

                                <input
                                    type="number"
                                    name="salary"
                                    value={form.salary}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />

                            </div>


                            {/* STATUS */}

                            <div className="form-group">

                                <label>
                                    وضعیت قرارداد
                                </label>

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >

                                    <option value="active">
                                        فعال
                                    </option>

                                    <option value="expired">
                                        منقضی
                                    </option>

                                </select>

                            </div>


                            {/* FILE */}

                            <div className="form-group">

                                <label>
                                    فایل قرارداد
                                </label>

                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                />

                                <small>
                                    فایل PDF یا سند قرارداد
                                </small>

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
                                    : editingId
                                        ? "ذخیره تغییرات"
                                        : "ثبت قرارداد"
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
                CONTRACT TABLE
            ==================================================== */}

            <div className="admin-card">

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
                                نوع قرارداد
                            </th>

                            <th>
                                شروع
                            </th>

                            <th>
                                پایان
                            </th>

                            <th>
                                حقوق
                            </th>

                            <th>
                                وضعیت
                            </th>

                            <th>
                                فایل
                            </th>

                            <th>
                                عملیات
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {contracts.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="9"
                                    style={{
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >

                                    هنوز قراردادی ثبت نشده است.

                                </td>

                            </tr>

                        ) : (

                            contracts.map(contract => (

                                <tr
                                    key={contract.id}
                                >

                                    {/* ID */}

                                    <td>
                                        {contract.id}
                                    </td>


                                    {/* EMPLOYEE */}

                                    <td>

                                        {getEmployeeName(
                                            contract.employee
                                        )}

                                    </td>


                                    {/* TYPE */}

                                    <td>

                                        {getContractType(
                                            contract.contract_type
                                        )}

                                    </td>


                                    {/* START */}

                                    <td>

                                        {contract.start_date || "-"}

                                    </td>


                                    {/* END */}

                                    <td>

                                        {contract.end_date || "بدون پایان"}

                                    </td>


                                    {/* SALARY */}

                                    <td>

                                        {contract.salary
                                            ? `${Number(
                                                contract.salary
                                            ).toLocaleString()}`
                                            : "-"
                                        }

                                    </td>


                                    {/* STATUS */}

                                    <td>

                                        <span
                                            className={
                                                contract.status === "active"
                                                    ? "status-active"
                                                    : "status-expired"
                                            }
                                        >

                                            {getStatus(
                                                contract.status
                                            )}

                                        </span>

                                    </td>


                                    {/* FILE */}

                                    <td>

                                        {contract.file ? (

                                            <a
                                                href={contract.file}
                                                target="_blank"
                                                rel="noreferrer"
                                            >

                                                مشاهده فایل

                                            </a>

                                        ) : (

                                            "-"

                                        )}

                                    </td>


                                    {/* ACTIONS */}

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
                                                        contract
                                                    )
                                                }
                                            >

                                                ویرایش

                                            </button>


                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        contract.id
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

    );

}