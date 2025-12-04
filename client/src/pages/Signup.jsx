import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Loader2 } from 'lucide-react';

export default function SignUp({ onToggle }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    // Basic password validation
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    try {
      await signUp(email, password);
    } catch (err) {
      setError('Failed to create an account. Email might be in use.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#e0f7fa' }}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <Users style={{ color: '#2563eb', width: '2rem', height: '2rem', margin: '0 auto' }} />
          <h1 className="modal-title" style={{ marginTop: '0.5rem' }}>Create Account</h1>
          <p style={{ color: '#6b7280' }}>Start planning your group adventures</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }} role="alert">{error}</p>}
          
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email Address"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
          
          <button type="submit" className="button-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <Loader2 style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <button onClick={onToggle} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}