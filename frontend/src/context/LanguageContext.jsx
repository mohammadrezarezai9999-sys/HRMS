import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import translations from "../i18n/translations";
import { formatDate as formatDateUtil, formatTime as formatTimeUtil } from "../utils/date";

const LanguageContext = createContext(null);
const STORAGE_KEY = "hrms_lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "fa" ? saved : "fa";
  });

  const setLang = useCallback((next) => {
    const value = next === "en" ? "en" : "fa";
    setLangState(value);
    localStorage.setItem(STORAGE_KEY, value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "fa" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.fa[key] ?? key,
    [lang]
  );

  const formatDate = useCallback(
    (value, options) => formatDateUtil(value, lang, options),
    [lang]
  );

  const formatTime = useCallback((value) => formatTimeUtil(value), []);

  const statusLabel = useCallback(
    (status) => {
      if (!status) return "—";
      const key = String(status).toLowerCase().replace(/-/g, "");
      const map = {
        present: "present",
        late: "late",
        absent: "absent",
        pending: "pending",
        approved: "approved",
        rejected: "rejected",
        active: "active",
        inactive: "inactive",
        expired: "expired",
        "full-time": "fullTime",
        fulltime: "fullTime",
        "part-time": "partTime",
        parttime: "partTime",
        contractor: "contractor",
        admin: "roleAdmin",
        employee: "roleEmployee",
      };
      const tKey = map[String(status).toLowerCase()] || map[key];
      return tKey ? t(tKey) : status;
    },
    [t]
  );

  const toggleLang = useCallback(() => {
    setLang(lang === "fa" ? "en" : "fa");
  }, [lang, setLang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
      isRtl: lang === "fa",
      formatDate,
      formatTime,
      statusLabel,
    }),
    [lang, setLang, toggleLang, t, formatDate, formatTime, statusLabel]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
