import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import { Loader2 } from 'lucide-react';
// Import the CSS file
import './index.css'; 

function AppContent() {
  const [showLogin, setShowLogin] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#e0f7fa' }}> 
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" style={{ width: '3rem', height: '3rem', color: '#2563eb', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <SignUp onToggle={() => setShowLogin(true)} />
    );
  }

  return <Home />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;