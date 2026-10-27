import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'hrms_lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'fa' ? saved : 'fa';
  });

  const setLang = useCallback((next) => {
    const value = next === 'en' ? 'en' : 'fa';
    setLangState(value);
    localStorage.setItem(STORAGE_KEY, value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === 'fa' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.fa[key] ?? key,
    [lang]
  );

  const toggleLang = useCallback(() => {
    setLang(lang === 'fa' ? 'en' : 'fa');
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRtl: lang === 'fa' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
