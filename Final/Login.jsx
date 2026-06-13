import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🛒</span>
            <span style={styles.logoText}>
              <span style={styles.campusText}>Campus</span>
              <span style={styles.martText}>Mart</span>
            </span>
          </div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox} />
              Remember me
            </label>

            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    padding: '20px',
  },
  card: {
    maxWidth: '440px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    border: '1px solid #eef2f6',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '22px', fontWeight: 'bold' },
  campusText: { color: '#1a2c3e' },
  martText: { color: '#d97706' },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a2c3e',
  },
  subtitle: {
    fontSize: '14px',
    color: '#5a6e7c',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    outline: 'none',
  },
  eyeBtn: {
    marginTop: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#d97706',
    textAlign: 'right',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  checkboxLabel: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  checkbox: {
    width: '14px',
    height: '14px',
  },
  forgotLink: {
    color: '#d97706',
    textDecoration: 'none',
  },
  button: {
    backgroundColor: '#d97706',
    color: '#fff',
    padding: '12px',
    borderRadius: '30px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#ffe5e5',
    color: '#d11a2a',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '13px',
  },
  link: {
    color: '#d97706',
    textDecoration: 'none',
  },
};

export default Login;