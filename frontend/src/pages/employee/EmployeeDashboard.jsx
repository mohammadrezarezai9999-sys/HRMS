import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";
import {
  isWebAuthnAvailable,
  registerFingerprint,
  authenticateFingerprint,
  fingerprintStatus,
} from "../../utils/webauthn";
import "./EmployeePages.css";

/**
 * Employee dashboard:
 * - Manual click → API check-in / check-out
 * - Fingerprint → real platform WebAuthn (Windows Hello / Touch ID / phone),
 *   then same attendance API
 */
export default function EmployeeDashboard() {
  const { t, isRtl, formatDate, formatTime, statusLabel } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [method, setMethod] = useState("manual");
  const [fpSupported, setFpSupported] = useState(false);
  const [fpRegistered, setFpRegistered] = useState(false);
  const [fpBusy, setFpBusy] = useState(false);

  const loadProfile = async () => {
    try {
      const { data } = await api.get("employees/");
      const employees = data.results || data;
      if (employees.length > 0) setProfile(employees[0]);
    } catch (err) {
      console.error("PROFILE ERROR:", err);
      setError(t("profileLoadError"));
    }
  };

  const loadAttendance = async () => {
    try {
      const { data } = await api.get("attendance/");
      const records = data.results || data;
      setAttendance(records.length > 0 ? records[0] : null);
    } catch (err) {
      console.error("ATTENDANCE ERROR:", err);
    }
  };

  const refreshFpStatus = async () => {
    if (!isWebAuthnAvailable()) {
      setFpSupported(false);
      return;
    }
    setFpSupported(true);
    const st = await fingerprintStatus(api);
    setFpRegistered(!!st.registered);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadAttendance(), refreshFpStatus()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doCheckIn = async () => {
    try {
      setLoadingAttendance(true);
      setError("");
      setSuccess("");
      const { data } = await api.post("attendance/check-in/");
      setAttendance(data);
      setSuccess(t("checkInSuccess"));
    } catch (err) {
      const backendError = err.response?.data;
      setError(backendError?.detail || t("checkInError"));
      if (backendError?.attendance) setAttendance(backendError.attendance);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const doCheckOut = async () => {
    try {
      setLoadingAttendance(true);
      setError("");
      setSuccess("");
      const { data } = await api.post("attendance/check-out/");
      setAttendance(data);
      setSuccess(t("checkOutSuccess"));
    } catch (err) {
      const backendError = err.response?.data;
      setError(backendError?.detail || t("checkOutError"));
      if (backendError?.attendance) setAttendance(backendError.attendance);
    } finally {
      setLoadingAttendance(false);
    }
  };

  /** Real sensor: verify WebAuthn, then attendance API */
  const withFingerprint = async (action) => {
    if (!fpSupported) {
      setError(t("fingerprintNotSupported"));
      return;
    }
    try {
      setFpBusy(true);
      setError("");
      setSuccess("");

      if (!fpRegistered) {
        await registerFingerprint(api);
        setFpRegistered(true);
        setSuccess(t("fingerprintRegistered"));
      }

      await authenticateFingerprint(api);
      setSuccess(t("fingerprintSuccess"));

      if (action === "in") await doCheckIn();
      else await doCheckOut();
    } catch (err) {
      console.error("WebAuthn error:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        t("fingerprintFail");
      // User cancelled browser prompt
      if (
        err?.name === "NotAllowedError" ||
        String(msg).toLowerCase().includes("cancel")
      ) {
        setError(t("fingerprintCancelled"));
      } else {
        setError(String(msg));
      }
    } finally {
      setFpBusy(false);
    }
  };

  const handleCheckIn = () => {
    if (method === "fingerprint") withFingerprint("in");
    else doCheckIn();
  };

  const handleCheckOut = () => {
    if (method === "fingerprint") withFingerprint("out");
    else doCheckOut();
  };

  const handleRegisterOnly = async () => {
    if (!fpSupported) {
      setError(t("fingerprintNotSupported"));
      return;
    }
    try {
      setFpBusy(true);
      setError("");
      await registerFingerprint(api);
      setFpRegistered(true);
      setSuccess(t("fingerprintRegistered"));
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || t("fingerprintFail"));
    } finally {
      setFpBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="employee-page employee-dashboard" dir={isRtl ? "rtl" : "ltr"}>
        <h1>{t("employeeDashboardTitle")}</h1>
        <p>{t("loadingData")}</p>
      </div>
    );
  }

  const busy = loadingAttendance || fpBusy;
  const canCheckIn = !busy && !attendance?.check_in;
  const canCheckOut = !busy && !!attendance?.check_in && !attendance?.check_out;

  return (
    <div className="employee-page employee-dashboard" dir={isRtl ? "rtl" : "ltr"}>
      <div className="dashboard-header">
        <div>
          <h1>{t("employeeDashboardTitle")}</h1>
          <p>
            {t("welcome")}{" "}
            <strong>
              {profile?.user?.first_name || profile?.user?.username || ""}
            </strong>
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="status-card">
        <h2>{t("employeeInfo")}</h2>
        <div className="employee-info-grid">
          <div className="info-item">
            <span>{t("firstName")}</span>
            <strong>{profile?.user?.first_name || "—"}</strong>
          </div>
          <div className="info-item">
            <span>{t("lastName")}</span>
            <strong>{profile?.user?.last_name || "—"}</strong>
          </div>
          <div className="info-item">
            <span>{t("username")}</span>
            <strong>{profile?.user?.username || "—"}</strong>
          </div>
          <div className="info-item">
            <span>{t("email")}</span>
            <strong>{profile?.user?.email || "—"}</strong>
          </div>
          <div className="info-item">
            <span>{t("phone")}</span>
            <strong>{profile?.phone || "—"}</strong>
          </div>
          <div className="info-item">
            <span>{t("department")}</span>
            <strong>
              {profile?.department_name || profile?.department || "—"}
            </strong>
          </div>
          <div className="info-item">
            <span>{t("position")}</span>
            <strong>
              {profile?.position_title || profile?.position || "—"}
            </strong>
          </div>
          <div className="info-item">
            <span>{t("hireDate")}</span>
            <strong>{formatDate(profile?.hire_date)}</strong>
          </div>
        </div>
      </div>

      <div className="status-card" style={{ marginTop: 24 }}>
        <h2>{t("todayAttendance")}</h2>
        {attendance ? (
          <div className="employee-info-grid">
            <div className="info-item">
              <span>{t("date")}</span>
              <strong>{formatDate(attendance.date)}</strong>
            </div>
            <div className="info-item">
              <span>{t("checkIn")}</span>
              <strong>{formatTime(attendance.check_in)}</strong>
            </div>
            <div className="info-item">
              <span>{t("checkOut")}</span>
              <strong>{formatTime(attendance.check_out)}</strong>
            </div>
            <div className="info-item">
              <span>{t("workedHours")}</span>
              <strong>{attendance.worked_hours ?? "—"}</strong>
            </div>
            <div className="info-item">
              <span>{t("status")}</span>
              <strong>{statusLabel(attendance.status)}</strong>
            </div>
          </div>
        ) : (
          <p>{t("noAttendanceToday")}</p>
        )}

        <div className="attendance-method-box">
          <p className="method-label">{t("selectMethod")}</p>
          <div className="method-options">
            <button
              type="button"
              className={`method-btn ${method === "manual" ? "active" : ""}`}
              onClick={() => setMethod("manual")}
            >
              🖱️ {t("methodManual")}
            </button>
            <button
              type="button"
              className={`method-btn ${method === "fingerprint" ? "active" : ""}`}
              onClick={() => setMethod("fingerprint")}
              disabled={!fpSupported}
              title={!fpSupported ? t("fingerprintNotSupported") : undefined}
            >
              🔏 {t("methodFingerprint")}
            </button>
          </div>

          {method === "fingerprint" && (
            <div className="method-note">
              {!fpSupported && <p>{t("fingerprintNotSupported")}</p>}
              {fpSupported && !fpRegistered && (
                <p>
                  {t("fingerprintRegisterHint")}{" "}
                  <button
                    type="button"
                    className="linkish"
                    onClick={handleRegisterOnly}
                    disabled={fpBusy}
                  >
                    {t("registerFingerprint")}
                  </button>
                </p>
              )}
              {fpSupported && fpRegistered && (
                <p>{t("fingerprintReady")}</p>
              )}
              <p>{t("fingerprintSecureNote")}</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button type="button" onClick={handleCheckIn} disabled={!canCheckIn}>
            {busy ? t("loading") : t("checkInBtn")}
          </button>
          <button type="button" onClick={handleCheckOut} disabled={!canCheckOut}>
            {busy ? t("loading") : t("checkOutBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
