import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Employees() {

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
                "دریافت اطلاعات کارمندان با مشکل مواجه شد."
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
                "پروفایل کارمند ساخته نشد."
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

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");
        setSuccess("");


        try {

            if (editingId) {

                await updateEmployee();

                setSuccess(
                    "اطلاعات کارمند با موفقیت بروزرسانی شد."
                );

            } else {

                await createEmployee();

                setSuccess(
                    "کارمند با موفقیت اضافه شد."
                );

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
                    "عملیات با مشکل مواجه شد."
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
                "کارمند با موفقیت حذف شد."
            );


            loadEmployees();

        } catch (error) {

            console.error(
                "Delete employee error:",
                error
            );

            setError(
                "حذف کارمند با مشکل مواجه شد."
            );

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

                    <h1>
                        کارمندان
                    </h1>

                    <p>
                        مدیریت اطلاعات کارمندان شرکت
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={openAddForm}
                >

                    + کارمند جدید

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
                            ? "ویرایش اطلاعات کارمند"
                            : "افزودن کارمند جدید"
                        }

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
                                    disabled={!!editingId}
                                />

                            </div>


                            {/* PASSWORD */}

                            {!editingId && (

                                <div className="form-group">

                                    <label>
                                        رمز عبور
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        minLength="8"
                                        required
                                    />

                                    <small>
                                        حداقل ۸ کاراکتر
                                    </small>

                                </div>

                            )}


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
                                    required
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
                                    required
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


                            {/* PHONE */}

                            <div className="form-group">

                                <label>
                                    شماره تماس
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* DEPARTMENT */}

                            <div className="form-group">

                                <label>
                                    دپارتمان
                                </label>

                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        انتخاب دپارتمان
                                    </option>


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

                                <label>
                                    سمت
                                </label>

                                <select
                                    name="position"
                                    value={form.position}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        انتخاب سمت
                                    </option>


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

                                <label>
                                    تاریخ استخدام
                                </label>

                                <input
                                    type="date"
                                    name="hire_date"
                                    value={form.hire_date}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* ADDRESS */}

                            <div className="form-group">

                                <label>
                                    آدرس
                                </label>

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
                                    ? "در حال ذخیره..."
                                    : editingId
                                        ? "ذخیره تغییرات"
                                        : "ثبت کارمند"
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
                                نام
                            </th>

                            <th>
                                ایمیل
                            </th>

                            <th>
                                دپارتمان
                            </th>

                            <th>
                                سمت
                            </th>

                            <th>
                                تاریخ استخدام
                            </th>

                            <th>
                                شماره تماس
                            </th>

                            <th>
                                عملیات
                            </th>

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

                                    هنوز کارمندی ثبت نشده است.

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

                                                ویرایش

                                            </button>


                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    deleteEmployee(
                                                        employee
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
    );
}