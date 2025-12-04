import React, { useState, useEffect, useContext, createContext } from 'react';
import { Plane, Mail, Lock, User, AlertCircle, CheckCircle, LogOut } from 'lucide-react';

// --- JWT and Storage Constants ---
const USER_TOKEN_KEY = 'atlas_jwt_token';

// Helper function to decode a mock JWT payload (for demonstration only)
const decodeMockJwt = (token) => {
  if (!token) return null;
  // In a real app, you would verify the token signature on the server.
  // Here we just decode the mock payload part for client-side state.
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      uid: payload.userId,
      email: payload.email,
      displayName: payload.fullName || 'User',
      token,
      // Add other necessary profile data from the token
    };
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
};


// --- Auth Context Implementation ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN_KEY);
    if (token) {
      const decodedUser = decodeMockJwt(token);
      setUser(decodedUser);
    }
    setAuthReady(true);
  }, []);

  // MOCK API: Generates a simple mock JWT for demonstration
  const mockJwtResponse = (userId, email, fullName) => {
    // Header: {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    // Payload: {userId, email, fullName, iat, exp}
    const payload = btoa(JSON.stringify({
      userId, 
      email, 
      fullName,
      iat: Date.now(),
      exp: Date.now() + (3600 * 1000) // 1 hour expiry
    }));
    // Signature: MOCKED
    const signature = 'MOCKED_SIGNATURE';
    return `${header}.${payload}.${signature}`;
  };

  // -----------------------------------------------------------
  // ATLAS / JWT SPECIFIC FUNCTIONS
  // -----------------------------------------------------------

  const signUp = async (email, password, fullName) => {
    // In a real application, replace this mock with a fetch call:
    // const response = await fetch('/api/signup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ fullName, email, password }),
    // });
    
    // MOCKING NETWORK DELAY AND RESPONSE
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (email.includes('fail')) {
       return { error: { message: 'This email is already registered.' } };
    }
    
    const mockToken = mockJwtResponse(crypto.randomUUID(), email, fullName);
    
    // Store token and set user state
    localStorage.setItem(USER_TOKEN_KEY, mockToken);
    const decodedUser = decodeMockJwt(mockToken);
    setUser(decodedUser);

    return { user: decodedUser };
  };

  const signIn = async (email, password) => {
    // In a real application, replace this mock with a fetch call:
    // const response = await fetch('/api/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // });

    // MOCKING NETWORK DELAY AND RESPONSE
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (email !== 'test@atlas.com' || password !== 'password') {
       return { error: { message: 'Invalid email or password.' } };
    }
    
    const mockToken = mockJwtResponse('user-12345', email, 'Atlas Test User');

    // Store token and set user state
    localStorage.setItem(USER_TOKEN_KEY, mockToken);
    const decodedUser = decodeMockJwt(mockToken);
    setUser(decodedUser);

    return { user: decodedUser };
  };

  const logout = async () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    setUser(null);
  }

  const value = {
    user,
    authReady,
    signUp,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  return useContext(AuthContext);
};


// --- Auth Pages (Signup and Login) ---

// Signup Component
const Signup = ({ onToggleMode }) => {
  const { signUp, authReady } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!authReady) {
      setError('Authentication services are not yet ready. Please wait a moment.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp(email, password, fullName);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Optional: Clear form after successful signup (User is now auto-logged in)
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen flex font-['Inter']">
      {/* Left Marketing Section (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12">
          <Plane className="w-20 h-20 mb-6 animate-pulse" strokeWidth={1.5} />
          <h1 className="text-5xl font-bold mb-4 text-center">Start Your Journey</h1>
          <p className="text-xl text-center text-white/90 max-w-md">
            (Using MongoDB Atlas/JWT Auth) Create an account and unlock the power of collaborative travel planning.
          </p>
          <div className="mt-12 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Collaborative Itineraries</h3>
                <p className="text-white/80 text-sm">Plan your trip together in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Smart Expense Splitting</h3>
                <p className="text-white/80 text-sm">Track and split costs effortlessly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Document Storage</h3>
                <p className="text-white/80 text-sm">Keep all bookings in one place</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-8 lg:hidden">
              <Plane className="w-12 h-12 text-teal-500 mr-3" strokeWidth={1.5} />
              <h1 className="text-3xl font-bold text-gray-800">Travel Planner</h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Join us and start planning your next adventure</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-600 font-medium">Account created successfully! Redirecting...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="John Doe"
                    disabled={loading || success}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Try 'fail@fail.com' to see error)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="you@example.com"
                    disabled={loading || success}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="••••••••"
                    disabled={loading || success}
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="••••••••"
                    disabled={loading || success}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !authReady || success}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={onToggleMode}
                  className="text-teal-600 font-semibold hover:text-teal-700 transition"
                  disabled={loading || success}
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

// Login Component
const Login = ({ onToggleMode }) => {
  const { signIn, authReady } = useAuth();
  const [email, setEmail] = useState('test@atlas.com'); // Prefill for easy testing
  const [password, setPassword] = useState('password'); // Prefill for easy testing
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!authReady) {
      setError('Authentication services are not yet ready. Please wait a moment.');
      return;
    }

    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      // Successful sign in handled by AuthProvider, redirecting to dashboard
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex font-['Inter']">
      {/* Left Marketing Section (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-cyan-500 to-indigo-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12">
          <Plane className="w-20 h-20 mb-6 animate-pulse" strokeWidth={1.5} />
          <h1 className="text-5xl font-bold mb-4 text-center">Welcome Back</h1>
          <p className="text-xl text-center text-white/90 max-w-md">
            (Using MongoDB Atlas/JWT Auth) Sign in to continue planning and collaborating on your dream trips.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
              <p className="text-gray-600">Enter your credentials to access your dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Use 'test@atlas.com')
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password (Use 'password')
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !authReady}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onToggleMode}
                  className="text-teal-600 font-semibold hover:text-teal-700 transition"
                  disabled={loading}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Forgot password? <a href="#" className="text-teal-600 hover:text-teal-700">Click here</a>
          </p>
        </div>
      </div>
    </div>
  );
}


// --- Main Application Component ---
const AppContent = () => {
  const { user, authReady, logout } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'login' ? 'signup' : 'login');
  };

  if (!authReady) {
    // Basic loading state while JWT state is initializing from localStorage
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="p-8 bg-white rounded-xl shadow-lg flex items-center space-x-3 text-teal-600 font-medium">
          <svg className="animate-spin h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Initializing authentication...</span>
        </div>
      </div>
    );
  }

  if (user) {
    // Authenticated User Dashboard View
    const profileName = user.displayName || 'Traveler';

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-['Inter']">
        <div className="w-full max-w-lg p-10 bg-white rounded-2xl shadow-2xl border-t-4 border-teal-500 text-center">
          <Plane className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {profileName}!</h1>
          <p className="text-lg text-gray-600 mb-6">You are successfully authenticated via JWT.</p>
          
          <div className="space-y-3 p-4 bg-teal-50 rounded-xl border border-teal-200 mb-8 text-left">
            <p className="text-sm text-teal-800 font-semibold">User Details (Decoded from JWT)</p>
            <p className="text-sm text-teal-700 break-all">
                <span className="font-semibold">User ID:</span> {user.uid}
            </p>
            <p className="text-sm text-teal-700">
                <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-sm text-teal-700 break-all">
                <span className="font-semibold">JWT Token (stored locally):</span> {localStorage.getItem(USER_TOKEN_KEY).substring(0, 40) + '...'}
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-200 shadow-lg shadow-red-500/30"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Auth Forms View (Login/Signup)
  return mode === 'login' ? (
    <Login onToggleMode={toggleMode} />
  ) : (
    <Signup onToggleMode={toggleMode} />
  );
};

// Top-level App component to wrap with AuthProvider
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;