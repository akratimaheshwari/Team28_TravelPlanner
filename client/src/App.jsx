import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import TripDashboard from './pages/TripDashboard';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={setCurrentPage} />
      {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
      {currentPage === 'trip-dashboard' && <TripDashboard onNavigate={setCurrentPage} />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
