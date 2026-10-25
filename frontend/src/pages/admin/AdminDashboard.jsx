import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";
import "./AdminDashboard.css";
import "./AdminPages.css";

export default function AdminDashboard() {
  const { t, isRtl, formatDate, formatTime, statusLabel } = useLanguage();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    employees: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  useEffect(() => {
    api
      .get("attendance/")
      .then(({ data }) => {
        const results = data.results || data;
        const list = Array.isArray(results) ? results : [];
        setAttendance(list);
        setStats({
          employees: list.length,
          present: list.filter((r) => r.status === "present").length,
          late: list.filter((r) => r.status === "late").length,
          absent: list.filter((r) => r.status === "absent").length,
        });
      })
      .catch((error) => {
        console.error("Attendance error:", error);
      });
  }, []);

  return (
    <main className="admin-page admin-dashboard" dir={isRtl ? "rtl" : "ltr"}>
      <div className="dashboard-header">
        <div>
          <h1>{t("adminDashboardTitle")}</h1>
          <p>{t("adminDashboardSubtitle")}</p>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <span>{t("kpiEmployees")}</span>
          <b>{stats.employees}</b>
        </div>
        <div className="kpi">
          <span>{t("kpiPresent")}</span>
          <b>{stats.present}</b>
        </div>
        <div className="kpi">
          <span>{t("kpiLate")}</span>
          <b>{stats.late}</b>
        </div>
        <div className="kpi">
          <span>{t("kpiAbsent")}</span>
          <b>{stats.absent}</b>
        </div>
      </div>

      <section className="dashboard-card">
        <div className="card-header">
          <h2>{t("recentAttendance")}</h2>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t("employee")}</th>
                <th>{t("date")}</th>
                <th>{t("checkIn")}</th>
                <th>{t("checkOut")}</th>
                <th>{t("workedHours")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    {t("noData")}
                  </td>
                </tr>
              ) : (
                attendance.map((row) => (
                  <tr key={row.id}>
                    <td>{row.employee_name || "—"}</td>
                    <td>{formatDate(row.date)}</td>
                    <td>{formatTime(row.check_in)}</td>
                    <td>{formatTime(row.check_out)}</td>
                    <td>{row.worked_hours ?? "—"}</td>
                    <td>
                      <span className={`status ${row.status}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
