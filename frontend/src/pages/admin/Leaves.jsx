import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Leaves() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


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
                t('loadError')
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

                return t('pending');

            case "approved":

                return t('approved');

            case "rejected":

                return t('rejected');

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
                t('successGeneric')
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

                setError(t('saveError'));

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
            window.confirm(t('confirmApproveLeave'));


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
                t('successGeneric')
            );


            await loadLeaves();


        } catch (error) {

            console.error(
                "Approve error:",
                error
            );


            setError(t('saveError'));

        }

    };


    // ============================================================
    // REJECT
    // ============================================================

    const reject = async (id) => {

        const confirmed =
            window.confirm(t('confirmRejectLeave'));


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
                t('successGeneric')
            );


            await loadLeaves();


        } catch (error) {

            console.error(
                "Reject error:",
                error
            );


            setError(
                t('saveError')
            );

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

            setError("");

            setSuccess("");


            await api.delete(
                `leave-requests/${id}/`
            );


            setSuccess(
                t('successGeneric')
            );


            await loadLeaves();


        } catch (error) {

            console.error(
                "Delete leave error:",
                error
            );


            setError(t('deleteError'));

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
            dir={isRtl ? "rtl" : "ltr"}
        >


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="page-header">

                <div>

                    <h1>
                        {t('leaves')}
                    </h1>

                    <p>
                        {t('leavesSubtitle')}
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={openForm}
                >

                    {t('addLeave')}
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

                    <h2>{t('addLeave')}</h2>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">


                            {/* EMPLOYEE */}

                            <div className="form-group">

                                <label>{t('employee')}</label>

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

                                    <option value="">{t('selectEmployee')}</option>


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

                                <label>{t('leaveType')}</label>

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
                                        {t('selectLeaveType')}
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

                                                {t('daysUnit')}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* START */}

                            <div className="form-group">

                                <label>{t('startDate')}</label>

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

                                <label>{t('endDate')}</label>

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
                                    {t('leaveReason')}
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
                                    placeholder={t('leaveReasonPlaceholder')}
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
                                    ? t('submitting')
                                    : t('addLeave')
                                }

                            </button>


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={
                                    closeForm
                                }
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

                            <th>{t('employee')}</th>

                            <th>{t('department')}</th>

                            <th>{t('leaveType')}</th>

                            <th>
                                {t('startDate')}
                            </th>

                            <th>
                                {t('endDate')}
                            </th>

                            <th>
                                {t('daysCount')}
                            </th>

                            <th>{t('reason')}</th>

                            <th>{t('status')}</th>

                            <th>{t('actions')}</th>

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

                                    {t('noLeaves')}
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

                                            {t('daysUnit')}

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

                                                    {t('details')}
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

                                                            {t('approve')}
                                                        </button>


                                                        <button
                                                            className="danger-btn"
                                                            onClick={() =>
                                                                reject(
                                                                    leave.id
                                                                )
                                                            }
                                                        >

                                                            {t('reject')}
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
                                    {t('leaveDetails')}
                                </h2>

                            </div>


                            <button
                                className="secondary-btn"
                                onClick={
                                    closeDetails
                                }
                            >{t('close')}</button>

                        </div>


                        <div className="details-grid">


                            <div>

                                <strong>
                                    {t('employeeLabel')}
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
                                    {t('departmentLabel')}
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
                                    {t('leaveTypeLabel')}
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
                                    {t('statusLabelColon')}
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
                                    {t('startDateLabel')}
                                </strong>

                                <span>
                                    {
                                        selectedLeave.start_date
                                    }
                                </span>

                            </div>


                            <div>

                                <strong>
                                    {t('endDateLabel')}
                                </strong>

                                <span>
                                    {
                                        selectedLeave.end_date
                                    }
                                </span>

                            </div>


                            <div>

                                <strong>
                                    {t('daysCountLabel')}
                                </strong>

                                <span>
                                    {
                                        calculateDays(
                                            selectedLeave.start_date,
                                            selectedLeave.end_date
                                        )
                                    }

                                    {t('daysUnit')}

                                </span>

                            </div>


                            <div>

                                <strong>
                                    {t('reviewerLabel')}
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
                                    {t('reasonLabel')}
                                </strong>

                                <p>
                                    {
                                        selectedLeave.reason ||
                                        t('noReason')
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

                                    {t('approveRequest')}
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

                                    {t('rejectRequest')}
                                </button>

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}