import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Map, Loader2 } from 'lucide-react';

export default function Login({ onToggle }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    try {
      await signIn(email, password);
    } catch (err) {
      setError('Failed to sign in. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#e0f7fa' }}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <Map style={{ color: '#2563eb', width: '2rem', height: '2rem', margin: '0 auto' }} />
          <h1 className="modal-title" style={{ marginTop: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: '#6b7280' }}>Sign in to manage your trips</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
          
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="button-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <Loader2 style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <button onClick={onToggle} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
