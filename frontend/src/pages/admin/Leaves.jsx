import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Leaves() {

    // ============================================================
    // STATE
    // ============================================================

    const [leaves, setLeaves] = useState([]);

    const [employees, setEmployees] = useState([]);

    const [leaveTypes, setLeaveTypes] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [selectedLeave, setSelectedLeave] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ============================================================
    // FORM
    // ============================================================

    const [form, setForm] = useState({

        employee: "",

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

            const { data } =
                await api.get("leave-requests/");

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

        }

    };


    // ============================================================
    // LOAD LEAVE TYPES
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

        }

    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadLeaves();

        loadEmployees();

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

            employee: "",

            leave_type: "",

            start_date: "",

            end_date: "",

            reason: "",

        });

    };


    // ============================================================
    // OPEN FORM
    // ============================================================

    const openForm = () => {

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
    // GET EMPLOYEE NAME
    // ============================================================

    const getEmployeeName = (employeeId) => {

        const employee = employees.find(
            item => item.id === employeeId
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
    // GET EMPLOYEE DEPARTMENT
    // ============================================================

    const getEmployeeDepartment = (employeeId) => {

        const employee = employees.find(
            item => item.id === employeeId
        );

        return (
            employee?.department_name || "-"
        );

    };


    // ============================================================
    // GET LEAVE TYPE
    // ============================================================

    const getLeaveTypeName = (leave) => {

        if (leave.leave_type_name) {

            return leave.leave_type_name;

        }


        const type = leaveTypes.find(
            item =>
                item.id === leave.leave_type
        );


        return type?.name || "-";

    };


    // ============================================================
    // GET STATUS TEXT
    // ============================================================

    const getStatusText = (status) => {

        switch (status) {

            case "pending":

                return "در انتظار بررسی";

            case "approved":

                return "تایید شده";

            case "rejected":

                return "رد شده";

            default:

                return status;

        }

    };


    // ============================================================
    // CALCULATE DAYS
    // ============================================================

    const calculateDays = (
        startDate,
        endDate
    ) => {

        if (
            !startDate ||
            !endDate
        ) {

            return "-";

        }


        const start =
            new Date(startDate);

        const end =
            new Date(endDate);


        const difference =
            end - start;


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            ) + 1;


        return days > 0
            ? days
            : 0;

    };


    // ============================================================
    // CREATE LEAVE REQUEST
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        setSuccess("");


        try {

            await api.post(
                "leave-requests/",
                {

                    employee:
                        form.employee,

                    leave_type:
                        form.leave_type,

                    start_date:
                        form.start_date,

                    end_date:
                        form.end_date,

                    reason:
                        form.reason,

                }
            );


            setSuccess(
                "درخواست مرخصی با موفقیت ثبت شد."
            );


            resetForm();

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
                    "ثبت درخواست مرخصی با مشکل مواجه شد."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // APPROVE
    // ============================================================

    const approve = async (id) => {

        const confirmed =
            window.confirm(
                "آیا می‌خواهید این درخواست مرخصی را تایید کنید؟"
            );


        if (!confirmed) {

            return;

        }


        try {

            setError("");

            setSuccess("");


            await api.post(
                `leave-requests/${id}/approve/`
            );


            setSuccess(
                "درخواست مرخصی تایید شد."
            );


            await loadLeaves();


        } catch (error) {

            console.error(
                "Approve error:",
                error
            );


            setError(
                "تایید درخواست با مشکل مواجه شد."
            );

        }

    };


    // ============================================================
    // REJECT
    // ============================================================

    const reject = async (id) => {

        const confirmed =
            window.confirm(
                "آیا می‌خواهید این درخواست مرخصی را رد کنید؟"
            );


        if (!confirmed) {

            return;

        }


        try {

            setError("");

            setSuccess("");


            await api.post(
                `leave-requests/${id}/reject/`
            );


            setSuccess(
                "درخواست مرخصی رد شد."
            );


            await loadLeaves();


        } catch (error) {

            console.error(
                "Reject error:",
                error
            );


            setError(
                "رد درخواست با مشکل مواجه شد."
            );

        }

    };


    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "آیا از حذف این درخواست مطمئن هستید؟"
            );


        if (!confirmed) {

            return;

        }


        try {

            setError("");

            setSuccess("");


            await api.delete(
                `leave-requests/${id}/`
            );


            setSuccess(
                "درخواست مرخصی حذف شد."
            );


            await loadLeaves();


        } catch (error) {

            console.error(
                "Delete leave error:",
                error
            );


            setError(
                "حذف درخواست با مشکل مواجه شد."
            );

        }

    };


    // ============================================================
    // VIEW DETAILS
    // ============================================================

    const viewDetails = (leave) => {

        setSelectedLeave(leave);

    };


    // ============================================================
    // CLOSE DETAILS
    // ============================================================

    const closeDetails = () => {

        setSelectedLeave(null);

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
                        درخواست‌های مرخصی
                    </h1>

                    <p>
                        مدیریت درخواست‌های مرخصی کارمندان
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
                ADD FORM
            ==================================================== */}

            {showForm && (

                <div className="admin-card">

                    <h2>
                        ثبت درخواست مرخصی
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
                                    value={
                                        form.employee
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        انتخاب کارمند
                                    </option>


                                    {employees.map(
                                        employee => (

                                            <option
                                                key={
                                                    employee.id
                                                }
                                                value={
                                                    employee.id
                                                }
                                            >

                                                {
                                                    getEmployeeName(
                                                        employee.id
                                                    )
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* LEAVE TYPE */}

                            <div className="form-group">

                                <label>
                                    نوع مرخصی
                                </label>

                                <select
                                    name="leave_type"
                                    value={
                                        form.leave_type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        انتخاب نوع مرخصی
                                    </option>


                                    {leaveTypes.map(
                                        type => (

                                            <option
                                                key={
                                                    type.id
                                                }
                                                value={
                                                    type.id
                                                }
                                            >

                                                {
                                                    type.name
                                                }

                                                {" - "}

                                                {
                                                    type.max_days_per_year
                                                }

                                                {" روز"}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* START */}

                            <div className="form-group">

                                <label>
                                    تاریخ شروع
                                </label>

                                <input
                                    type="date"
                                    name="start_date"
                                    value={
                                        form.start_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* END */}

                            <div className="form-group">

                                <label>
                                    تاریخ پایان
                                </label>

                                <input
                                    type="date"
                                    name="end_date"
                                    value={
                                        form.end_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min={
                                        form.start_date
                                    }
                                    required
                                />

                            </div>


                            {/* REASON */}

                            <div
                                className="form-group"
                                style={{
                                    gridColumn:
                                        "1 / -1"
                                }}
                            >

                                <label>
                                    دلیل مرخصی
                                </label>

                                <textarea
                                    name="reason"
                                    value={
                                        form.reason
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="دلیل درخواست مرخصی..."
                                />

                            </div>


                        </div>


                        {/* ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={
                                    loading
                                }
                            >

                                {loading
                                    ? "در حال ثبت..."
                                    : "ثبت درخواست"
                                }

                            </button>


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={
                                    closeForm
                                }
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
                                کارمند
                            </th>

                            <th>
                                دپارتمان
                            </th>

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
                                تعداد روز
                            </th>

                            <th>
                                دلیل
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

                        {leaves.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="10"
                                    style={{
                                        textAlign:
                                            "center",
                                        padding:
                                            "30px"
                                    }}
                                >

                                    هیچ درخواست مرخصی ثبت نشده است.

                                </td>

                            </tr>

                        ) : (

                            leaves.map(
                                leave => (

                                    <tr
                                        key={
                                            leave.id
                                        }
                                    >


                                        {/* ID */}

                                        <td>
                                            {
                                                leave.id
                                            }
                                        </td>


                                        {/* EMPLOYEE */}

                                        <td>

                                            {
                                                getEmployeeName(
                                                    leave.employee
                                                )
                                            }

                                        </td>


                                        {/* DEPARTMENT */}

                                        <td>

                                            {
                                                getEmployeeDepartment(
                                                    leave.employee
                                                )
                                            }

                                        </td>


                                        {/* TYPE */}

                                        <td>

                                            {
                                                getLeaveTypeName(
                                                    leave
                                                )
                                            }

                                        </td>


                                        {/* START */}

                                        <td>

                                            {
                                                leave.start_date
                                            }

                                        </td>


                                        {/* END */}

                                        <td>

                                            {
                                                leave.end_date
                                            }

                                        </td>


                                        {/* DAYS */}

                                        <td>

                                            {
                                                calculateDays(
                                                    leave.start_date,
                                                    leave.end_date
                                                )
                                            }

                                            {" روز"}

                                        </td>


                                        {/* REASON */}

                                        <td>

                                            {leave.reason
                                                ? (
                                                    leave.reason.length >
                                                    30

                                                        ? `${leave.reason.slice(
                                                            0,
                                                            30
                                                        )}...`

                                                        : leave.reason
                                                )

                                                : "-"
                                            }

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    `leave-status ${leave.status}`
                                                }
                                            >

                                                {
                                                    getStatusText(
                                                        leave.status
                                                    )
                                                }

                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "6px",
                                                    flexWrap:
                                                        "wrap"
                                                }}
                                            >

                                                <button
                                                    className="secondary-btn"
                                                    onClick={() =>
                                                        viewDetails(
                                                            leave
                                                        )
                                                    }
                                                >

                                                    جزئیات

                                                </button>


                                                {leave.status ===
                                                    "pending" && (

                                                    <>

                                                        <button
                                                            className="primary-btn"
                                                            onClick={() =>
                                                                approve(
                                                                    leave.id
                                                                )
                                                            }
                                                        >

                                                            تایید

                                                        </button>


                                                        <button
                                                            className="danger-btn"
                                                            onClick={() =>
                                                                reject(
                                                                    leave.id
                                                                )
                                                            }
                                                        >

                                                            رد

                                                        </button>

                                                    </>

                                                )}


                                                <button
                                                    className="danger-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            leave.id
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


            {/* ====================================================
                DETAILS MODAL
            ==================================================== */}

            {selectedLeave && (

                <div
                    className="modal-overlay"
                    onClick={closeDetails}
                >

                    <div
                        className="admin-card modal-card"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="page-header">

                            <div>

                                <h2>
                                    جزئیات درخواست مرخصی
                                </h2>

                            </div>


                            <button
                                className="secondary-btn"
                                onClick={
                                    closeDetails
                                }
                            >

                                بستن

                            </button>

                        </div>


                        <div className="details-grid">


                            <div>

                                <strong>
                                    کارمند:
                                </strong>

                                <span>
                                    {
                                        getEmployeeName(
                                            selectedLeave.employee
                                        )
                                    }
                                </span>

                            </div>


                            <div>

                                <strong>
                                    دپارتمان:
                                </strong>

                                <span>
                                    {
                                        getEmployeeDepartment(
                                            selectedLeave.employee
                                        )
                                    }
                                </span>

                            </div>


                            <div>

                                <strong>
                                    نوع مرخصی:
                                </strong>

                                <span>
                                    {
                                        getLeaveTypeName(
                                            selectedLeave
                                        )
                                    }
                                </span>

                            </div>


                            <div>

                                <strong>
                                    وضعیت:
                                </strong>

                                <span>
                                    {
                                        getStatusText(
                                            selectedLeave.status
                                        )
                                    }
                                </span>

                            </div>


                            <div>

                                <strong>
                                    تاریخ شروع:
                                </strong>

                                <span>
                                    {
                                        selectedLeave.start_date
                                    }
                                </span>

                            </div>


                            <div>

                                <strong>
                                    تاریخ پایان:
                                </strong>

                                <span>
                                    {
                                        selectedLeave.end_date
                                    }
                                </span>

                            </div>


                            <div>

                                <strong>
                                    تعداد روز:
                                </strong>

                                <span>
                                    {
                                        calculateDays(
                                            selectedLeave.start_date,
                                            selectedLeave.end_date
                                        )
                                    }

                                    {" روز"}

                                </span>

                            </div>


                            <div>

                                <strong>
                                    بررسی‌کننده:
                                </strong>

                                <span>
                                    {
                                        selectedLeave.reviewed_by ||
                                        "-"
                                    }
                                </span>

                            </div>


                            <div
                                style={{
                                    gridColumn:
                                        "1 / -1"
                                }}
                            >

                                <strong>
                                    دلیل:
                                </strong>

                                <p>
                                    {
                                        selectedLeave.reason ||
                                        "دلیلی ثبت نشده است."
                                    }
                                </p>

                            </div>


                        </div>


                        {/* MODAL ACTIONS */}

                        {selectedLeave.status ===
                            "pending" && (

                            <div
                                className="form-actions"
                            >

                                <button
                                    className="primary-btn"
                                    onClick={async () => {

                                        await approve(
                                            selectedLeave.id
                                        );

                                        closeDetails();

                                    }}
                                >

                                    تایید درخواست

                                </button>


                                <button
                                    className="danger-btn"
                                    onClick={async () => {

                                        await reject(
                                            selectedLeave.id
                                        );

                                        closeDetails();

                                    }}
                                >

                                    رد درخواست

                                </button>

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}