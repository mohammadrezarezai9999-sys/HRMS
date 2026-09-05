
import { useEffect, useState } from "react";
import api from "../../api/axios";

import AdminSidebar from "../../components/admin/AdminSidebar";

import "./AdminDashboard.css";
import "./AdminPages.css";

export default function AdminDashboard() {

    const [attendance, setAttendance] = useState([]);

    const [stats, setStats] = useState({
        employees: 0,
        present: 0,
        late: 0,
        absent: 0,
    });


    useEffect(() => {

        api.get("attendance/")
            .then(({ data }) => {

                const results =
                    data.results || data;

                setAttendance(results);

                setStats({

                    employees: results.length,

                    present:
                        results.filter(
                            (r) =>
                                r.status === "present"
                        ).length,

                    late:
                        results.filter(
                            (r) =>
                                r.status === "late"
                        ).length,

                    absent:
                        results.filter(
                            (r) =>
                                r.status === "absent"
                        ).length,

                });

            })

            .catch((error) => {

                console.error(
                    "Attendance error:",
                    error
                );

            });

    }, []);


    return (

        <div>

            {/* Sidebar */}

            <AdminSidebar />


            {/* Main Content */}

            <main className="admin-page admin-dashboard" dir="rtl">

                <div className="dashboard-header">

                    <div>

                        <h1>
                            داشبورد مدیریت
                        </h1>

                        <p>
                            نمای کلی سیستم منابع انسانی
                        </p>

                    </div>

                </div>


                {/* KPI */}

                <div className="kpi-row">

                    <div className="kpi">

                        <span>
                            تعداد کارمندان
                        </span>

                        <b>
                            {stats.employees}
                        </b>

                    </div>


                    <div className="kpi">

                        <span>
                            حاضر امروز
                        </span>

                        <b>
                            {stats.present}
                        </b>

                    </div>


                    <div className="kpi">

                        <span>
                            تأخیر
                        </span>

                        <b>
                            {stats.late}
                        </b>

                    </div>


                    <div className="kpi">

                        <span>
                            غایب
                        </span>

                        <b>
                            {stats.absent}
                        </b>

                    </div>

                </div>


                {/* Attendance */}

                <section className="dashboard-card">

                    <div className="card-header">

                        <h2>
                            حضور و غیاب اخیر
                        </h2>

                    </div>


                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        کارمند
                                    </th>

                                    <th>
                                        تاریخ
                                    </th>

                                    <th>
                                        ورود
                                    </th>

                                    <th>
                                        خروج
                                    </th>

                                    <th>
                                        ساعت کار
                                    </th>

                                    <th>
                                        وضعیت
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {attendance.map(
                                    (row) => (

                                        <tr
                                            key={row.id}
                                        >

                                            <td>
                                                {
                                                    row.employee_name ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.date
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.check_in
                                                        ?.slice(
                                                            11,
                                                            16
                                                        ) ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.check_out
                                                        ?.slice(
                                                            11,
                                                            16
                                                        ) ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.worked_hours
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={`status ${row.status}`}
                                                >
                                                    {
                                                        row.status
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    );
}
