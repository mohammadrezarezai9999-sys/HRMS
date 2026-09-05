import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function EmployeeProfile() {

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const { data } =
                    await api.get("employees/");

                const employees =
                    data.results || data;

                if (employees.length > 0) {
                    setProfile(employees[0]);
                } else {
                    setError("اطلاعات پروفایل پیدا نشد.");
                }

            } catch (error) {

                console.error(
                    "Profile error:",
                    error
                );

                setError(
                    error.response?.data?.detail ||
                    "دریافت اطلاعات پروفایل با مشکل مواجه شد."
                );

            } finally {

                setLoading(false);

            }
        };

        loadProfile();

    }, []);


    if (loading) {

        return (
            <div
                className="admin-page"
                dir="rtl"
            >
                <h1>پروفایل من</h1>

                <p>
                    در حال دریافت اطلاعات...
                </p>
            </div>
        );

    }


    if (error) {

        return (
            <div
                className="admin-page"
                dir="rtl"
            >

                <h1>پروفایل من</h1>

                <div className="error-message">
                    {error}
                </div>

            </div>
        );

    }


    return (

        <div
            className="admin-page"
            dir="rtl"
        >

            {/* HEADER */}

            <div className="page-header">

                <div>

                    <h1>
                        پروفایل من
                    </h1>

                    <p>
                        اطلاعات شخصی و کاری شما
                    </p>

                </div>

            </div>


            {/* PROFILE */}

            <div className="admin-card">

                <h2>
                    اطلاعات شخصی
                </h2>

                <div className="form-grid">

                    <div className="form-group">

                        <label>
                            نام
                        </label>

                        <input
                            value={
                                profile?.user?.first_name || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            نام خانوادگی
                        </label>

                        <input
                            value={
                                profile?.user?.last_name || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            نام کاربری
                        </label>

                        <input
                            value={
                                profile?.user?.username || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            ایمیل
                        </label>

                        <input
                            value={
                                profile?.user?.email || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            شماره تماس
                        </label>

                        <input
                            value={
                                profile?.phone || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            تاریخ استخدام
                        </label>

                        <input
                            value={
                                profile?.hire_date || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            دپارتمان
                        </label>

                        <input
                            value={
                                profile?.department_name || "-"
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            سمت
                        </label>

                        <input
                            value={
                                profile?.position_title || "-"
                            }
                            disabled
                        />

                    </div>


                    <div
                        className="form-group"
                        style={{
                            gridColumn: "1 / -1"
                        }}
                    >

                        <label>
                            آدرس
                        </label>

                        <input
                            value={
                                profile?.address || ""
                            }
                            disabled
                        />

                    </div>

                </div>

            </div>

        </div>

    );
}