import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Positions() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


    const [positions, setPositions] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        title: "",
        department: "",
        base_salary: "",
    });


    const loadData = async () => {

        try {

            const [positionsRes, departmentsRes] =
                await Promise.all([
                    api.get("positions/"),
                    api.get("departments/")
                ]);

            setPositions(
                positionsRes.data.results ||
                positionsRes.data
            );

            setDepartments(
                departmentsRes.data.results ||
                departmentsRes.data
            );

        } catch (error) {

            console.error(error);

            setError(t('errorGeneric'));

        }
    };


    useEffect(() => {

        loadData();

    }, []);


    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    const openCreate = () => {

        setEditingId(null);

        setForm({
            title: "",
            department: "",
            base_salary: "",
        });

        setShowForm(true);
        setError("");
        setSuccess("");

    };


    const openEdit = (position) => {

        setEditingId(position.id);

        setForm({
            title: position.title || "",
            department: position.department || "",
            base_salary: position.base_salary || "",
        });

        setShowForm(true);

    };


    const closeForm = () => {

        setShowForm(false);

        setEditingId(null);

        setForm({
            title: "",
            department: "",
            base_salary: "",
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            const data = {
                title: form.title,
                department: Number(form.department),
                base_salary: form.base_salary,
            };

            if (editingId) {

                await api.patch(
                    `positions/${editingId}/`,
                    data
                );

                setSuccess(t('successGeneric'));

            } else {

                await api.post(
                    "positions/",
                    data
                );

                setSuccess(t('successGeneric'));

            }

            closeForm();

            await loadData();

        } catch (error) {

            console.error(error);

            setError(
                JSON.stringify(
                    error.response?.data ||
                    t('saveError')
                )
            );

        } finally {

            setLoading(false);

        }

    };


    const handleDelete = async (id) => {

        if (!window.confirm(
            t('confirmDelete')
        )) {
            return;
        }

        try {

            await api.delete(
                `positions/${id}/`
            );

            setSuccess(t('successGeneric'));

            await loadData();

        } catch (error) {

            console.error(error);

            setError(t('deleteError'));

        }

    };


    return (

        <div
            className="admin-page"
            dir={isRtl ? "rtl" : "ltr"}
        >

            <div className="page-header">

                <div>

                    <h1>{t('positions')}</h1>

                    <p>
                        {t('positionsSubtitle')}
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={openCreate}
                >{t('addPosition')}</button>

            </div>


            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {showForm && (

                <div className="admin-card">

                    <h2>
                        {editingId
                            ? t('editPosition')
                            : t('addPosition')
                        }
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            <div className="form-group">

                                <label>
                                    {t('positionTitle')}
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Software Developer"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>{t('department')}</label>

                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">{t('selectDepartment')}</option>

                                    {departments.map(
                                        department => (

                                            <option
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="form-group">

                                <label>
                                    {t('baseSalary')}
                                </label>

                                <input
                                    type="number"
                                    name="base_salary"
                                    value={form.base_salary}
                                    onChange={handleChange}
                                    placeholder="30000"
                                    required
                                />

                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                className="primary-btn"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? t('saving')
                                    : t('save')
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


            <div className="admin-card">

                <table>

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>{t('title')}</th>
                            <th>{t('department')}</th>
                            <th>{t('baseSalary')}</th>
                            <th>{t('actions')}</th>

                        </tr>

                    </thead>

                    <tbody>

                        {positions.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    style={{
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >
                                    {t('noPositions')}
                                </td>

                            </tr>

                        ) : (

                            positions.map(position => {

                                const department =
                                    departments.find(
                                        d =>
                                            d.id ===
                                            position.department
                                    );

                                return (

                                    <tr
                                        key={position.id}
                                    >

                                        <td>
                                            {position.id}
                                        </td>

                                        <td>
                                            {position.title}
                                        </td>

                                        <td>
                                            {
                                                department?.name ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            {position.base_salary}
                                        </td>

                                        <td>

                                            <button
                                                className="secondary-btn"
                                                onClick={() =>
                                                    openEdit(
                                                        position
                                                    )
                                                }
                                            >
                                                {t('edit')}
                                            </button>

                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        position.id
                                                    )
                                                }
                                            >
                                                {t('delete')}
                                            </button>

                                        </td>

                                    </tr>

                                );

                            })

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );
}