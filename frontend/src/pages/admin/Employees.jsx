import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";
import { isWebAuthnAvailable, registerFingerprint } from "../../utils/webauthn";

export default function Employees() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ============================================================
    // FORM
    // ============================================================

    const emptyForm = {

        username: "",
        password: "",

        first_name: "",
        last_name: "",
        email: "",

        department: "",
        position: "",

        hire_date: "",
        phone: "",
        address: "",
    };


    const [form, setForm] = useState(emptyForm);


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
                t('employeesLoadError')
            );
        }
    };


    // ============================================================
    // LOAD DEPARTMENTS
    // ============================================================

    const loadDepartments = async () => {

        try {

            const { data } =
                await api.get("departments/");

            setDepartments(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Departments error:",
                error
            );

        }
    };


    // ============================================================
    // LOAD POSITIONS
    // ============================================================

    const loadPositions = async () => {

        try {

            const { data } =
                await api.get("positions/");

            setPositions(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Positions error:",
                error
            );

        }
    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadEmployees();
        loadDepartments();
        loadPositions();

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
    // OPEN ADD FORM
    // ============================================================

    const openAddForm = () => {

        setForm(emptyForm);

        setEditingId(null);

        setShowForm(true);

        setError("");
        setSuccess("");

    };


    // ============================================================
    // OPEN EDIT FORM
    // ============================================================

    const openEditForm = (employee) => {

        setEditingId(employee.id);

        setShowForm(true);

        setError("");
        setSuccess("");


        setForm({

            username:
                employee.user?.username || "",

            password: "",

            first_name:
                employee.user?.first_name || "",

            last_name:
                employee.user?.last_name || "",

            email:
                employee.user?.email || "",

            department:
                employee.department || "",

            position:
                employee.position || "",

            hire_date:
                employee.hire_date || "",

            phone:
                employee.phone || "",

            address:
                employee.address || "",

        });

    };


    // ============================================================
    // CLOSE FORM
    // ============================================================

    const closeForm = () => {

        setShowForm(false);

        setEditingId(null);

        setForm(emptyForm);

        setError("");

    };


    // ============================================================
    // CREATE EMPLOYEE
    // ============================================================

    const createEmployee = async () => {

        const response = await api.post(
            "users/",
            {

                username: form.username,

                password: form.password,

                email: form.email,

                first_name: form.first_name,

                last_name: form.last_name,

                role: "EMPLOYEE",

            }
        );


        /*
         * UserCreateSerializer
         * به صورت خودکار EmployeeProfile
         * ایجاد می‌کند.
         */


        const newUser = response.data;


        /*
         * بعد از ساخت User باید EmployeeProfile
         * مربوط به آن را پیدا کنیم.
         */

        const employeesResponse =
            await api.get("employees/");

        const allEmployees =
            employeesResponse.data.results ||
            employeesResponse.data;


        const newEmployee =
            allEmployees.find(
                employee =>
                    employee.user?.id === newUser.id
            );


        if (!newEmployee) {

            throw new Error(
                t('profileCreateError')
            );

        }


        /*
         * حالا اطلاعات EmployeeProfile
         * را ذخیره می‌کنیم.
         */

        await api.patch(
            `employees/${newEmployee.id}/`,
            {

                department:
                    form.department || null,

                position:
                    form.position || null,

                hire_date:
                    form.hire_date || null,

                phone:
                    form.phone,

                address:
                    form.address,

            }
        );

        return { userId: newUser.id, employeeId: newEmployee.id, username: newUser.username };

    };


    // ============================================================
    // UPDATE EMPLOYEE
    // ============================================================

    const updateEmployee = async () => {

        /*
         * اطلاعات EmployeeProfile
         */

        await api.patch(

            `employees/${editingId}/`,

            {

                department:
                    form.department || null,

                position:
                    form.position || null,

                hire_date:
                    form.hire_date || null,

                phone:
                    form.phone,

                address:
                    form.address,

            }

        );


        /*
         * نکته:
         *
         * first_name
         * last_name
         * email
         *
         * متعلق به User هستند.
         *
         * بنابراین در این مرحله EmployeeProfile
         * را تغییر دادیم.
         */

        const employee =
            employees.find(
                item =>
                    item.id === editingId
            );


        if (employee?.user?.id) {

            await api.patch(

                `users/${employee.user.id}/`,

                {

                    first_name:
                        form.first_name,

                    last_name:
                        form.last_name,

                    email:
                        form.email,

                }

            );

        }

    };


    // ============================================================
    // SUBMIT
    // ============================================================

    const enrollEmployeeFingerprint = async (userId) => {
        if (!userId) return;
        if (!isWebAuthnAvailable()) {
            setError(t('fingerprintNotSupported'));
            return;
        }
        try {
            setLoading(true);
            setError("");
            await registerFingerprint(api, {
                targetUserId: userId,
                attachment: "any",
                deviceName: "HR enrollment",
            });
            setSuccess(t('fingerprintEnrolledForEmployee'));
        } catch (err) {
            setError(err?.response?.data?.detail || err.message || t('fingerprintFail'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");
        setSuccess("");


        try {

            if (editingId) {

                await updateEmployee();

                setSuccess(t('successGeneric'));

            } else {

                const created = await createEmployee();

                setSuccess(t('successGeneric'));

                // Enroll fingerprint while employee is present (same PC/phone/USB sensor)
                if (created?.userId && isWebAuthnAvailable()) {
                    const enroll = window.confirm(t('enrollFingerprintNow'));
                    if (enroll) {
                        try {
                            await registerFingerprint(api, {
                                targetUserId: created.userId,
                                attachment: "any",
                                deviceName: "Enrollment at HR desk",
                            });
                            setSuccess(t('fingerprintEnrolledForEmployee'));
                        } catch (fpErr) {
                            console.error(fpErr);
                            setError(
                                (fpErr?.response?.data?.detail || fpErr.message || "") +
                                " — " + t('fingerprintEnrollLater')
                            );
                        }
                    }
                }

            }


            await loadEmployees();


            /*
             * فرم را می‌بندیم
             */

            setShowForm(false);

            setEditingId(null);

            setForm(emptyForm);

        } catch (error) {

            console.error(
                "Employee save error:",
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
                    error.message ||
                    t('errorGeneric')
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // DELETE
    // ============================================================

    const deleteEmployee = async (employee) => {

        const name =
            `${employee.user?.first_name || ""} ${employee.user?.last_name || ""}`;


        const confirmed =
            window.confirm(
                `آیا مطمئن هستید که می‌خواهید ${name} را حذف کنید؟`
            );


        if (!confirmed) {

            return;

        }


        try {

            /*
             * حذف User باعث حذف EmployeeProfile
             * نیز می‌شود چون OneToOneField
             * روی CASCADE است.
             */

            await api.delete(
                `users/${employee.user.id}/`
            );


            setSuccess(
                t('successGeneric')
            );


            loadEmployees();

        } catch (error) {

            console.error(
                "Delete employee error:",
                error
            );

            setError(t('deleteError'));

        }

    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className="admin-page"
            style={{
                direction: "rtl"
            }}
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="page-header">

                <div>

                    <h1>{t('employees')}</h1>

                    <p>
                        {t('employeesSubtitle')}
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={openAddForm}
                >{t('addEmployee')}</button>

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
                            ? t('editEmployee')
                            : t('addEmployee')
                        }

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
                                    disabled={!!editingId}
                                />

                            </div>


                            {/* PASSWORD */}

                            {!editingId && (

                                <div className="form-group">

                                    <label>{t('password')}</label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        minLength="8"
                                        required
                                    />

                                    <small>
                                        {t('minPassword')}
                                    </small>

                                </div>

                            )}


                            {/* FIRST NAME */}

                            <div className="form-group">

                                <label>{t('name')}</label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    required
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
                                    required
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


                            {/* PHONE */}

                            <div className="form-group">

                                <label>{t('phone')}</label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* DEPARTMENT */}

                            <div className="form-group">

                                <label>{t('department')}</label>

                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                >

                                    <option value="">{t('selectDepartment')}</option>


                                    {departments.map(
                                        department => (

                                            <option
                                                key={
                                                    department.id
                                                }
                                                value={
                                                    department.id
                                                }
                                            >

                                                {
                                                    department.name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* POSITION */}

                            <div className="form-group">

                                <label>{t('position')}</label>

                                <select
                                    name="position"
                                    value={form.position}
                                    onChange={handleChange}
                                >

                                    <option value="">{t('selectPosition')}</option>


                                    {positions.map(
                                        position => (

                                            <option
                                                key={
                                                    position.id
                                                }
                                                value={
                                                    position.id
                                                }
                                            >

                                                {
                                                    position.title
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* HIRE DATE */}

                            <div className="form-group">

                                <label>{t('hireDate')}</label>

                                <input
                                    type="date"
                                    name="hire_date"
                                    value={form.hire_date}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* ADDRESS */}

                            <div className="form-group">

                                <label>{t('address')}</label>

                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        {/* ACTIONS */}

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
                                        : t('addEmployee')
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

                            <th>{t('name')}</th>

                            <th>{t('email')}</th>

                            <th>{t('department')}</th>

                            <th>{t('position')}</th>

                            <th>{t('hireDate')}</th>

                            <th>{t('phone')}</th>

                            <th>{t('actions')}</th>

                        </tr>

                    </thead>


                    <tbody>

                        {employees.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    style={{
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >

                                    {t('noEmployees')}
                                </td>

                            </tr>

                        ) : (

                            employees.map(
                                employee => (

                                    <tr
                                        key={
                                            employee.id
                                        }
                                    >

                                        {/* NAME */}

                                        <td>

                                            {
                                                employee.user?.first_name
                                            }

                                            {" "}

                                            {
                                                employee.user?.last_name
                                            }

                                        </td>


                                        {/* EMAIL */}

                                        <td>

                                            {
                                                employee.user?.email
                                                || "-"
                                            }

                                        </td>


                                        {/* DEPARTMENT */}

                                        <td>

                                            {
                                                employee.department_name
                                                || "-"
                                            }

                                        </td>


                                        {/* POSITION */}

                                        <td>

                                            {
                                                employee.position_title
                                                || "-"
                                            }

                                        </td>


                                        {/* HIRE DATE */}

                                        <td>

                                            {
                                                employee.hire_date
                                                || "-"
                                            }

                                        </td>


                                        {/* PHONE */}

                                        <td>

                                            {
                                                employee.phone
                                                || "-"
                                            }

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <button
                                                className="secondary-btn"
                                                onClick={() =>
                                                    openEditForm(
                                                        employee
                                                    )
                                                }
                                            >

                                                {t('edit')}
                                            </button>


                                            <button
                                                className="secondary-btn"
                                                type="button"
                                                onClick={() =>
                                                    enrollEmployeeFingerprint(
                                                        employee.user?.id
                                                    )
                                                }
                                                title={t('registerFingerprintBtn')}
                                            >
                                                {t('registerFingerprintBtn')}
                                            </button>

                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    deleteEmployee(
                                                        employee
                                                    )
                                                }
                                            >

                                                {t('delete')}
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
    );
}