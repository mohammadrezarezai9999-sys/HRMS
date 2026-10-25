import "./Login.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const userData = await login(username, password);
      if (userData?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/employee', { replace: true });
      }
    } catch {
      setError(t('loginError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{t('loginTitle')}</h1>
        <input
          placeholder={t('username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? t('loading') : t('login')}
        </button>
      </form>
    </div>
  );
}
