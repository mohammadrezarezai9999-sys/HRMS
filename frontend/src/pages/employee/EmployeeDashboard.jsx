// src/pages/employee/EmployeeDashboard.jsx

import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EmployeePages.css";
export default function EmployeeDashboard() {

    // ============================================================
    // STATE
    // ============================================================

    const [profile, setProfile] = useState(null);

    const [attendance, setAttendance] = useState(null);

    const [loading, setLoading] = useState(true);

    const [loadingAttendance, setLoadingAttendance] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ============================================================
    // LOAD PROFILE
    // ============================================================

    const loadProfile = async () => {

        try {

            const { data } = await api.get(
                "employees/"
            );

            const employees =
                data.results || data;

            if (employees.length > 0) {

                setProfile(
                    employees[0]
                );

            }

        } catch (error) {

            console.error(
                "PROFILE ERROR:",
                error
            );

            setError(
                "دریافت اطلاعات کارمند با مشکل مواجه شد."
            );

        }

    };


    // ============================================================
    // LOAD TODAY ATTENDANCE
    // ============================================================

    const loadAttendance = async () => {

        try {

            const { data } = await api.get(
                "attendance/"
            );

            const records =
                data.results || data;

            /*
             * Backend برای Employee فقط
             * رکوردهای خودش را برمی‌گرداند.
             *
             * چون Model بر اساس -date مرتب شده،
             * اولین رکورد جدیدترین رکورد است.
             */

            if (records.length > 0) {

                setAttendance(
                    records[0]
                );

            } else {

                setAttendance(null);

            }

        } catch (error) {

            console.error(
                "ATTENDANCE ERROR:",
                error
            );

        }

    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);

            await Promise.all([
                loadProfile(),
                loadAttendance(),
            ]);

            setLoading(false);

        };

        loadData();

    }, []);


    // ============================================================
    // CHECK IN
    // ============================================================

    const checkIn = async () => {

        try {

            setLoadingAttendance(true);

            setError("");

            setSuccess("");

            const { data } =
                await api.post(
                    "attendance/check-in/"
                );

            setAttendance(data);

            setSuccess(
                "ورود شما با موفقیت ثبت شد."
            );

        } catch (error) {

            console.error(
                "CHECK-IN ERROR:",
                error
            );

            const backendError =
                error.response?.data;

            setError(
                backendError?.detail ||
                "ثبت ورود با مشکل مواجه شد."
            );

            /*
             * اگر Backend رکورد Attendance
             * را همراه خطا فرستاده باشد.
             */

            if (
                backendError?.attendance
            ) {

                setAttendance(
                    backendError.attendance
                );

            }

        } finally {

            setLoadingAttendance(false);

        }

    };


    // ============================================================
    // CHECK OUT
    // ============================================================

    const checkOut = async () => {

        try {

            setLoadingAttendance(true);

            setError("");

            setSuccess("");

            const { data } =
                await api.post(
                    "attendance/check-out/"
                );

            setAttendance(data);

            setSuccess(
                "خروج شما با موفقیت ثبت شد."
            );

        } catch (error) {

            console.error(
                "CHECK-OUT ERROR:",
                error
            );

            const backendError =
                error.response?.data;

            setError(
                backendError?.detail ||
                "ثبت خروج با مشکل مواجه شد."
            );

            if (
                backendError?.attendance
            ) {

                setAttendance(
                    backendError.attendance
                );

            }

        } finally {

            setLoadingAttendance(false);

        }

    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="employee-page employee-dashboard" dir="rtl" >

                <h1>
                    داشبورد کارمند
                </h1>

                <p>
                    در حال دریافت اطلاعات...
                </p>

            </div>

        );

    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className="employee-page employee-dashboard"
            dir="rtl"
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        داشبورد کارمند
                    </h1>

                    <p>

                        خوش آمدید{" "}

                        <strong>
                            {
                                profile?.user?.first_name
                                || profile?.user?.username
                                || ""
                            }
                        </strong>

                    </p>

                </div>

            </div>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* ====================================================
                SUCCESS
            ==================================================== */}

            {success && (

                <div className="success-message">

                    {success}

                </div>

            )}


            {/* ====================================================
                EMPLOYEE INFORMATION
            ==================================================== */}

            <div className="status-card">

                <h2>
                    اطلاعات کارمند
                </h2>


                <div className="employee-info-grid">


                    {/* NAME */}

                    <div className="info-item">

                        <span>
                            نام
                        </span>

                        <strong>

                            {
                                profile?.user?.first_name
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* LAST NAME */}

                    <div className="info-item">

                        <span>
                            نام خانوادگی
                        </span>

                        <strong>

                            {
                                profile?.user?.last_name
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* USERNAME */}

                    <div className="info-item">

                        <span>
                            نام کاربری
                        </span>

                        <strong>

                            {
                                profile?.user?.username
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* EMAIL */}

                    <div className="info-item">

                        <span>
                            ایمیل
                        </span>

                        <strong>

                            {
                                profile?.user?.email
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* PHONE */}

                    <div className="info-item">

                        <span>
                            شماره تماس
                        </span>

                        <strong>

                            {
                                profile?.phone
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* DEPARTMENT */}

                    <div className="info-item">

                        <span>
                            دپارتمان
                        </span>

                        <strong>

                            {
                                profile?.department_name
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* POSITION */}

                    <div className="info-item">

                        <span>
                            سمت
                        </span>

                        <strong>

                            {
                                profile?.position_title
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* HIRE DATE */}

                    <div className="info-item">

                        <span>
                            تاریخ استخدام
                        </span>

                        <strong>

                            {
                                profile?.hire_date
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* ADDRESS */}

                    <div className="info-item">

                        <span>
                            آدرس
                        </span>

                        <strong>

                            {
                                profile?.address
                                || "-"
                            }

                        </strong>

                    </div>

                </div>

            </div>


            {/* ====================================================
                ATTENDANCE
            ==================================================== */}

            <div className="status-card">

                <h2>
                    حضور و غیاب امروز
                </h2>


                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div className="actions">


                    {/* CHECK IN */}

                    <button
                        onClick={checkIn}
                        disabled={
                            loadingAttendance ||
                            !!attendance?.check_in
                        }
                    >

                        {loadingAttendance

                            ? "در حال ثبت..."

                            : attendance?.check_in

                                ? "✓ ورود ثبت شده"

                                : "ثبت ورود"

                        }

                    </button>


                    {/* CHECK OUT */}

                    <button
                        onClick={checkOut}
                        className="secondary"
                        disabled={
                            loadingAttendance ||
                            !attendance?.check_in ||
                            !!attendance?.check_out
                        }
                    >

                        {attendance?.check_out

                            ? "✓ خروج ثبت شده"

                            : "ثبت خروج"

                        }

                    </button>

                </div>


                {/* =================================================
                    ATTENDANCE DATA
                ================================================= */}

                <div className="attendance-info">


                    {/* STATUS */}

                    <div>

                        <span>
                            وضعیت
                        </span>

                        <strong>

                            {
                                attendance?.status === "present"

                                    ? "حاضر"

                                    : attendance?.status === "late"

                                        ? "با تأخیر"

                                        : attendance?.status === "absent"

                                            ? "غایب"

                                            : "-"
                            }

                        </strong>

                    </div>


                    {/* DATE */}

                    <div>

                        <span>
                            تاریخ
                        </span>

                        <strong>

                            {
                                attendance?.date
                                || "-"
                            }

                        </strong>

                    </div>


                    {/* CHECK IN */}

                    <div>

                        <span>
                            ورود
                        </span>

                        <strong>

                            {
                                attendance?.check_in
                                    ? attendance.check_in.slice(
                                        11,
                                        16
                                    )
                                    : "-"
                            }

                        </strong>

                    </div>


                    {/* CHECK OUT */}

                    <div>

                        <span>
                            خروج
                        </span>

                        <strong>

                            {
                                attendance?.check_out
                                    ? attendance.check_out.slice(
                                        11,
                                        16
                                    )
                                    : "-"
                            }

                        </strong>

                    </div>


                    {/* WORKED HOURS */}

                    <div>

                        <span>
                            ساعت کار
                        </span>

                        <strong>

                            {
                                attendance?.worked_hours
                                ?? "0"
                            }

                            {" ساعت"}

                        </strong>

                    </div>


                    {/* OVERTIME */}

                    <div>

                        <span>
                            اضافه کاری
                        </span>

                        <strong>

                            {
                                attendance?.overtime_hours
                                ?? "0"
                            }

                            {" ساعت"}

                        </strong>

                    </div>

                </div>

            </div>

        </div>

    );

}