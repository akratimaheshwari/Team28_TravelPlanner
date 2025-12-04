import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import TripOverview from './pages/TripOverview';
import ExpenseManager from './pages/ExpenseManager';
import ItineraryBuilder from './pages/ItineraryBuilder';
import SettlementSummary from './pages/Summary';
import TicketUpload from './pages/TicketUpload';
import ProtectedRoute from './components/ProtectedRoute';


export default function App() {
return (
<BrowserRouter>
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />


<Route
path="/"
element={<Dashboard />}
/>


<Route
path="/trip/create"
element={<ProtectedRoute><CreateTrip /></ProtectedRoute>}
/>


<Route
path="/trip/:id"
element={<ProtectedRoute><TripOverview /></ProtectedRoute>}
/>


<Route
path="/trip/:id/expenses"
element={<ProtectedRoute><ExpenseManager /></ProtectedRoute>}
/>


<Route
path="/trip/:id/itinerary"
element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>}
/>


<Route
path="/trip/:id/summary"
element={<ProtectedRoute><SettlementSummary /></ProtectedRoute>}
/>


<Route
path="/trip/:id/tickets"
element={<ProtectedRoute><TicketUpload /></ProtectedRoute>}
/>
</Routes>
</BrowserRouter>
);
}