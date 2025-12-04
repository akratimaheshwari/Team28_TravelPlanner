import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';


ReactDOM.createRoot(document.getElementById('root')).render(
<AuthProvider>
<TripProvider>
<App />
</TripProvider>
</AuthProvider>
);