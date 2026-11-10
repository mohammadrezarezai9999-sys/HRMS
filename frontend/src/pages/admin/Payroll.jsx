import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";
import {
  jalaliMonthYearToGregorian,
  payrollMonthNameOnly,
  payrollYearOnly,
  MONTH_NAMES_EN,
  MONTH_NAMES_FA,
} from "../../utils/date";

export default function Payroll() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();

  // Form month/year follow the active calendar; API always receives Gregorian.
  const uiMonthName = (m) =>
    lang === "en" ? MONTH_NAMES_EN[m] : MONTH_NAMES_FA[m];



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
        tax: "0",
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

            let month = Number(form.month);
            let year = Number(form.year);

            // Dari UI: convert Jalali month/year → Gregorian for the API
            if (lang === "fa") {
                const g = jalaliMonthYearToGregorian(year, month);
                year = g.year;
                month = g.month;
            }

            await api.post(
                "payroll/",
                {
                    employee: Number(form.employee),

                    month,

                    year,

                    base_salary: form.base_salary,

                    overtime_pay:
                        form.overtime_pay || "0",

                    bonus:
                        form.bonus || "0",

                    deduction:
                        form.deduction || "0",
                    tax:
                        form.tax || "0",
                }
            );


            setSuccess(t('successGeneric'));


            setForm({
                employee: "",
                month: "",
                year: "",
                base_salary: "",
                overtime_pay: "0",
                bonus: "0",
                deduction: "0",
                tax: "0",
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

                setError(t('saveError'));

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
                t('confirmDelete')
            );

        if (!confirmDelete) {
            return;
        }


        try {

            await api.delete(
                `payroll/${id}/`
            );


            setSuccess(t('successGeneric'));


            loadPayrolls();


        } catch (error) {

            console.error(
                "Delete payroll error:",
                error
            );

            setError(t('deleteError'));

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
            dir={isRtl ? "rtl" : "ltr"}
        >


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="page-header">

                <div>

                    <h1>{t('payroll')}</h1>

                    <p>
                        {t('payrollSubtitle')}
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
                        ? t('closeForm')
                        : t('addPayroll')
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
                        {t('addPayroll')}
                    </h2>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">


                            {/* EMPLOYEE */}

                            <div className="form-group">

                                <label>{t('employee')}</label>

                                <select
                                    name="employee"
                                    value={form.employee}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">{t('selectEmployee')}</option>

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

                                <label>{t('month')}</label>

                                <select
                                    name="month"
                                    value={form.month}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        {t('selectMonth')}
                                    </option>

                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                                        <option key={m} value={m}>
                                            {uiMonthName(m)}
                                        </option>
                                    ))}

                                </select>

                            </div>


                            {/* YEAR */}

                            <div className="form-group">

                                <label>{t('year')}</label>

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

                                <label>{t('baseSalary')}</label>

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

                                <label>{t('overtimeHours')}</label>

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

                                <label>{t('bonus')}</label>

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

                                <label>{t('deduction')}</label>

                                <input
                                    type="number"
                                    name="deduction"
                                    value={form.deduction}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />

                            </div>

                            <div className="form-group">

                                <label>{t('tax')}</label>

                                <input
                                    type="number"
                                    name="tax"
                                    value={form.tax}
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
                                    ? t('submitting')
                                    : t('addPayroll')
                                }

                            </button>


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >

                                {t('cancel')}
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

                            <th>{t('employee')}</th>

                            <th>{t('month')}</th>

                            <th>{t('year')}</th>

                            <th>{t('baseSalary')}</th>

                            <th>{t('overtimeHours')}</th>

                            <th>{t('bonus')}</th>

                            <th>{t('deduction')}</th>
                            <th>{t('tax')}</th>

                            <th>
                                {t('netSalary')}
                            </th>

                            <th>{t('actions')}</th>

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

                                    {t('noPayroll')}
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
                                            {payrollMonthNameOnly(payroll.year, payroll.month, lang)}
                                        </td>


                                        <td>
                                            {payrollYearOnly(payroll.year, payroll.month, lang)}
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
                                            {formatMoney(
                                                payroll.tax
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