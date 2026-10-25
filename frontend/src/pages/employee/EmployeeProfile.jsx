import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeeProfile() {
  const { t, isRtl, formatDate, formatTime, statusLabel, lang } = useLanguage();


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
                    setError(t('profileNotFound'));
                }

            } catch (error) {

                console.error(
                    "Profile error:",
                    error
                );

                setError(
                    error.response?.data?.detail ||
                    t('profileLoadError')
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
                dir={isRtl ? "rtl" : "ltr"}
            >
                <h1>{t('myProfile')}</h1>

                <p>{t('loadingData')}</p>
            </div>
        );

    }


    if (error) {

        return (
            <div
                className="admin-page"
                dir={isRtl ? "rtl" : "ltr"}
            >

                <h1>{t('myProfile')}</h1>

                <div className="error-message">
                    {error}
                </div>

            </div>
        );

    }


    return (

        <div
            className="admin-page"
            dir={isRtl ? "rtl" : "ltr"}
        >

            {/* HEADER */}

            <div className="page-header">

                <div>

                    <h1>{t('myProfile')}</h1>

                    <p>
                        {t('profileSubtitle')}
                    </p>

                </div>

            </div>


            {/* PROFILE */}

            <div className="admin-card">

                <h2>
                    {t('personalInfo')}
                </h2>

                <div className="form-grid">

                    <div className="form-group">

                        <label>{t('name')}</label>

                        <input
                            value={
                                profile?.user?.first_name || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>{t('lastName')}</label>

                        <input
                            value={
                                profile?.user?.last_name || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>{t('username')}</label>

                        <input
                            value={
                                profile?.user?.username || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>{t('email')}</label>

                        <input
                            value={
                                profile?.user?.email || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>{t('phone')}</label>

                        <input
                            value={
                                profile?.phone || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>{t('hireDate')}</label>

                        <input
                            value={
                                profile?.hire_date || ""
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>{t('department')}</label>

                        <input
                            value={
                                profile?.department_name || "-"
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>{t('position')}</label>

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

                        <label>{t('address')}</label>

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