import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Departments() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        manager: "",
    });


    // =========================================================
    // LOAD DEPARTMENTS
    // =========================================================

    const loadDepartments = async () => {

        try {

            const { data } = await api.get("departments/");

            setDepartments(
                data.results || data
            );

        } catch (error) {

            console.error(
                "Departments error:",
                error
            );

            setError(t('loadError'));
        }
    };


    // =========================================================
    // LOAD EMPLOYEES
    // =========================================================

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
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadDepartments();
        loadEmployees();

    }, []);


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {

        setForm({
            name: "",
            description: "",
            manager: "",
        });

        setEditingId(null);

        setShowForm(false);

    };


    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");
        setSuccess("");


        try {

            const data = {
                name: form.name,
                description: form.description,
                manager: form.manager
                    ? Number(form.manager)
                    : null,
            };


            // UPDATE

            if (editingId) {

                await api.put(
                    `departments/${editingId}/`,
                    data
                );

                setSuccess(t('successGeneric'));

            }

            // CREATE

            else {

                await api.post(
                    "departments/",
                    data
                );

                setSuccess(t('successGeneric'));

            }


            resetForm();

            await loadDepartments();

        } catch (error) {

            console.error(
                "Department save error:",
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


    // =========================================================
    // EDIT
    // =========================================================

    const handleEdit = (department) => {

        setForm({

            name: department.name || "",

            description:
                department.description || "",

            manager:
                department.manager
                    ? String(department.manager)
                    : "",

        });

        setEditingId(department.id);

        setShowForm(true);

        setError("");
        setSuccess("");

    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            t('confirmDelete')
        );

        if (!confirmed) {
            return;
        }


        try {

            setError("");
            setSuccess("");

            await api.delete(
                `departments/${id}/`
            );

            setSuccess(t('successGeneric'));

            await loadDepartments();

        } catch (error) {

            console.error(
                "Delete department error:",
                error
            );

            setError(t('deleteError'));

        }

    };


    // =========================================================
    // GET MANAGER NAME
    // =========================================================

    const getManagerName = (managerId) => {

        if (!managerId) {
            return "-";
        }

        const manager = employees.find(
            employee => employee.id === managerId
        );

        if (!manager) {
            return "-";
        }

        return (
            `${manager.user?.first_name || ""} ${
                manager.user?.last_name || ""
            }`.trim()
            || manager.user?.username
            || "-"
        );

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="admin-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1>{t('departments')}</h1>

                    <p>
                        {t('departmentsSubtitle')}
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={() => {

                        if (showForm) {

                            resetForm();

                        } else {

                            setShowForm(true);

                            setEditingId(null);

                            setError("");
                            setSuccess("");

                        }

                    }}
                >

                    {showForm
                        ? t('closeForm')
                        : t('addDepartment')
                    }

                </button>

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

                <div className="success-message">

                    {success}

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            {showForm && (

                <div className="admin-card employee-form">

                    <h2>

                        {editingId
                            ? t('editDepartment')
                            : t('addDepartment')
                        }

                    </h2>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">


                            {/* NAME */}

                            <div className="form-group">

                                <label>
                                    {t('departmentName')}
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder={t('placeholderDepartment')}
                                    required
                                />

                            </div>


                            {/* MANAGER */}

                            <div className="form-group">

                                <label>
                                    {t('departmentManager')}
                                </label>

                                <select
                                    name="manager"
                                    value={form.manager}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        {t('noManager')}
                                    </option>


                                    {employees.map(employee => (

                                        <option
                                            key={employee.id}
                                            value={employee.id}
                                        >

                                            {employee.user?.first_name}{" "}
                                            {employee.user?.last_name}

                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* DESCRIPTION */}

                            <div
                                className="form-group"
                                style={{
                                    gridColumn: "1 / -1"
                                }}
                            >

                                <label>{t('description')}</label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder={t('placeholderDeptDesc')}
                                />

                            </div>

                        </div>


                        {/* FORM BUTTONS */}

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
                                        : t('addDepartment')
                                }

                            </button>


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={resetForm}
                            >{t('cancel')}</button>

                        </div>

                    </form>

                </div>

            )}


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="admin-card">

                <table>

                    <thead>

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                {t('departmentName')}
                            </th>

                            <th>{t('description')}</th>

                            <th>{t('manager')}</th>

                            <th>{t('actions')}</th>

                        </tr>

                    </thead>


                    <tbody>

                        {departments.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    style={{
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >

                                    {t('noDepartments')}
                                </td>

                            </tr>

                        ) : (

                            departments.map(
                                department => (

                                    <tr
                                        key={department.id}
                                    >

                                        <td>
                                            {department.id}
                                        </td>


                                        <td>
                                            {department.name}
                                        </td>


                                        <td>
                                            {
                                                department.description
                                                || "-"
                                            }
                                        </td>


                                        <td>
                                            {
                                                getManagerName(
                                                    department.manager
                                                )
                                            }
                                        </td>


                                        <td>

                                            <button
                                                className="secondary-btn"
                                                onClick={() =>
                                                    handleEdit(
                                                        department
                                                    )
                                                }
                                            >
                                                {t('edit')}
                                            </button>


                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        department.id
                                                    )
                                                }
                                                style={{
                                                    marginRight: "8px"
                                                }}
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