import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';

/**
 * Language toggle placed in the top-right (LTR) / top-left (RTL) corner.
 * Switches the entire UI between Persian (FA) and English (EN).
 */
export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="lang-switcher" role="group" aria-label={t('language')}>
      <button
        type="button"
        className={`lang-btn ${lang === 'fa' ? 'active' : ''}`}
        onClick={() => setLang('fa')}
        title="دری (فارسی)"
        aria-pressed={lang === 'fa'}
      >
        FA
      </button>
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        title="English"
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
}
