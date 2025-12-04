import React from 'react';
import { Map, UserCircle, LogOut, Grid } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { signOut } = useAuth();
  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl">
        <Map size={28} /> TravelSync
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1 rounded hover:scale-105 transition">
          <Grid size={18} /> Dashboard
        </Link>
        <Link to="/profile"><UserCircle size={28} /></Link>
        <button onClick={signOut} className="flex items-center gap-1 bg-red-500 px-3 py-1 rounded hover:scale-105 transition">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </header>
  );
}