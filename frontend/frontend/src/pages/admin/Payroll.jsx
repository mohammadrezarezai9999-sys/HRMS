import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Payroll() {

    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        employee: "",
        month: "",
        year: "",
        base_salary: "",
        overtime_pay: "0",
        bonus: "0",
        deduction: "0",
    });


    // ============================================================
    // LOAD PAYROLL
    // ============================================================

    const loadPayrolls = async () => {

        try {

            const { data } = await api.get("payroll/");

            setPayrolls(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Payroll error:",
                error
            );

            setError(
                "دریافت اطلاعات حقوق با مشکل مواجه شد."
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
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadPayrolls();
        loadEmployees();

    }, []);


    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    // ============================================================
    // CREATE PAYROLL
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");
        setSuccess("");


        try {

            await api.post(
                "payroll/",
                {
                    employee: Number(form.employee),

                    month: Number(form.month),

                    year: Number(form.year),

                    base_salary: form.base_salary,

                    overtime_pay:
                        form.overtime_pay || "0",

                    bonus:
                        form.bonus || "0",

                    deduction:
                        form.deduction || "0",
                }
            );


            setSuccess(
                "حقوق کارمند با موفقیت ثبت شد."
            );


            setForm({
                employee: "",
                month: "",
                year: "",
                base_salary: "",
                overtime_pay: "0",
                bonus: "0",
                deduction: "0",
            });


            setShowForm(false);

            loadPayrolls();


        } catch (error) {

            console.error(
                "Create payroll error:",
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
                    "ثبت حقوق با مشکل مواجه شد."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // DELETE PAYROLL
    // ============================================================

    const deletePayroll = async (id) => {

        const confirmDelete =
            window.confirm(
                "آیا از حذف این رکورد حقوق مطمئن هستید؟"
            );

        if (!confirmDelete) {
            return;
        }


        try {

            await api.delete(
                `payroll/${id}/`
            );


            setSuccess(
                "رکورد حقوق حذف شد."
            );


            loadPayrolls();


        } catch (error) {

            console.error(
                "Delete payroll error:",
                error
            );

            setError(
                "حذف رکورد حقوق با مشکل مواجه شد."
            );

        }

    };


    // ============================================================
    // FORMAT MONEY
    // ============================================================

    const formatMoney = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "0";
        }

        return Number(value).toLocaleString();
    };


    // ============================================================
    // EMPLOYEE NAME
    // ============================================================

    const getEmployeeName = (employeeId) => {

        const employee =
            employees.find(
                emp => emp.id === employeeId
            );

        if (!employee) {
            return employeeId;
        }


        return (
            `${employee.user?.first_name || ""} ${
                employee.user?.last_name || ""
            }`.trim()
            || employee.user?.username
            || employeeId
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
                        حقوق و دستمزد
                    </h1>

                    <p>
                        مدیریت حقوق ماهانه کارمندان
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
                        : "+ ثبت حقوق جدید"
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
                ADD PAYROLL FORM
            ==================================================== */}

            {showForm && (

                <div className="admin-card">

                    <h2>
                        ثبت حقوق کارمند
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

                                                {
                                                    employee.user?.first_name
                                                }{" "}

                                                {
                                                    employee.user?.last_name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* MONTH */}

                            <div className="form-group">

                                <label>
                                    ماه
                                </label>

                                <select
                                    name="month"
                                    value={form.month}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        انتخاب ماه
                                    </option>

                                    <option value="1">
                                        حمل / فروردین
                                    </option>

                                    <option value="2">
                                        ثور / اردیبهشت
                                    </option>

                                    <option value="3">
                                        جوزا / خرداد
                                    </option>

                                    <option value="4">
                                        سرطان / تیر
                                    </option>

                                    <option value="5">
                                        اسد / مرداد
                                    </option>

                                    <option value="6">
                                        سنبله / شهریور
                                    </option>

                                    <option value="7">
                                        میزان / مهر
                                    </option>

                                    <option value="8">
                                        عقرب / آبان
                                    </option>

                                    <option value="9">
                                        قوس / آذر
                                    </option>

                                    <option value="10">
                                        جدی / دی
                                    </option>

                                    <option value="11">
                                        دلو / بهمن
                                    </option>

                                    <option value="12">
                                        حوت / اسفند
                                    </option>

                                </select>

                            </div>


                            {/* YEAR */}

                            <div className="form-group">

                                <label>
                                    سال
                                </label>

                                <input
                                    type="number"
                                    name="year"
                                    value={form.year}
                                    onChange={handleChange}
                                    placeholder="2026"
                                    required
                                />

                            </div>


                            {/* BASE SALARY */}

                            <div className="form-group">

                                <label>
                                    حقوق پایه
                                </label>

                                <input
                                    type="number"
                                    name="base_salary"
                                    value={form.base_salary}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />

                            </div>


                            {/* OVERTIME */}

                            <div className="form-group">

                                <label>
                                    اضافه‌کاری
                                </label>

                                <input
                                    type="number"
                                    name="overtime_pay"
                                    value={form.overtime_pay}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />

                            </div>


                            {/* BONUS */}

                            <div className="form-group">

                                <label>
                                    پاداش
                                </label>

                                <input
                                    type="number"
                                    name="bonus"
                                    value={form.bonus}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />

                            </div>


                            {/* DEDUCTION */}

                            <div className="form-group">

                                <label>
                                    کسورات
                                </label>

                                <input
                                    type="number"
                                    name="deduction"
                                    value={form.deduction}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
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
                                    ? "در حال ثبت..."
                                    : "ثبت حقوق"
                                }

                            </button>


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >

                                انصراف

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ====================================================
                PAYROLL TABLE
            ==================================================== */}

            <div className="admin-card">

                <table>

                    <thead>

                        <tr>

                            <th>
                                کارمند
                            </th>

                            <th>
                                ماه
                            </th>

                            <th>
                                سال
                            </th>

                            <th>
                                حقوق پایه
                            </th>

                            <th>
                                اضافه‌کاری
                            </th>

                            <th>
                                پاداش
                            </th>

                            <th>
                                کسورات
                            </th>

                            <th>
                                حقوق خالص
                            </th>

                            <th>
                                عملیات
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {payrolls.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="9"
                                    style={{
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >

                                    هنوز رکورد حقوقی ثبت نشده است.

                                </td>

                            </tr>

                        ) : (

                            payrolls.map(
                                payroll => (

                                    <tr
                                        key={payroll.id}
                                    >

                                        <td>

                                            {
                                                getEmployeeName(
                                                    payroll.employee
                                                )
                                            }

                                        </td>


                                        <td>
                                            {payroll.month}
                                        </td>


                                        <td>
                                            {payroll.year}
                                        </td>


                                        <td>
                                            {formatMoney(
                                                payroll.base_salary
                                            )}
                                        </td>


                                        <td>
                                            {formatMoney(
                                                payroll.overtime_pay
                                            )}
                                        </td>


                                        <td>
                                            {formatMoney(
                                                payroll.bonus
                                            )}
                                        </td>


                                        <td>
                                            {formatMoney(
                                                payroll.deduction
                                            )}
                                        </td>


                                        <td>
                                            <strong>
                                                {formatMoney(
                                                    payroll.net_salary
                                                )}
                                            </strong>
                                        </td>


                                        <td>

                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    deletePayroll(
                                                        payroll.id
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