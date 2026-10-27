import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminPages.css";

export default function Positions() {

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

            setError(
                "دریافت اطلاعات با مشکل مواجه شد."
            );

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

                setSuccess(
                    "سمت با موفقیت ویرایش شد."
                );

            } else {

                await api.post(
                    "positions/",
                    data
                );

                setSuccess(
                    "سمت با موفقیت ایجاد شد."
                );

            }

            closeForm();

            await loadData();

        } catch (error) {

            console.error(error);

            setError(
                JSON.stringify(
                    error.response?.data ||
                    "خطا در ذخیره سمت"
                )
            );

        } finally {

            setLoading(false);

        }

    };


    const handleDelete = async (id) => {

        if (!window.confirm(
            "آیا از حذف این سمت مطمئن هستید؟"
        )) {
            return;
        }

        try {

            await api.delete(
                `positions/${id}/`
            );

            setSuccess(
                "سمت حذف شد."
            );

            await loadData();

        } catch (error) {

            console.error(error);

            setError(
                "حذف سمت با مشکل مواجه شد."
            );

        }

    };


    return (

        <div
            className="admin-page"
            dir="rtl"
        >

            <div className="page-header">

                <div>

                    <h1>سمت‌ها</h1>

                    <p>
                        مدیریت سمت‌های سازمان
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={openCreate}
                >
                    + سمت جدید
                </button>

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
                            ? "ویرایش سمت"
                            : "ایجاد سمت جدید"
                        }
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            <div className="form-group">

                                <label>
                                    عنوان سمت
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

                                <label>
                                    دپارتمان
                                </label>

                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        انتخاب دپارتمان
                                    </option>

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
                                    معاش پایه
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
                                    ? "در حال ذخیره..."
                                    : "ذخیره"
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


            <div className="admin-card">

                <table>

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>عنوان</th>
                            <th>دپارتمان</th>
                            <th>معاش پایه</th>
                            <th>عملیات</th>

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
                                    هنوز سمتی ایجاد نشده است.
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
                                                ویرایش
                                            </button>

                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        position.id
                                                    )
                                                }
                                            >
                                                حذف
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