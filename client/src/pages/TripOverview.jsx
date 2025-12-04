import { useEffect, useState } from 'react';
import API from '../services/api';
import { useParams, Link } from 'react-router-dom';


export default function TripOverview() {
const { id } = useParams();
const [trip, setTrip] = useState(null);


useEffect(() => {
API.get(`/trips/${id}`).then(res => setTrip(res.data.trip));
}, [id]);


if (!trip) return <p className="p-6">Loading...</p>;


return (
<div className="min-h-screen bg-gray-100 p-6">
<div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
<h2 className="text-3xl font-bold mb-2">{trip.title}</h2>
<p className="text-gray-600 mb-6">{trip.description}</p>


<div className="space-y-3">
<Link to={`/trip/${id}/itinerary`} className="block bg-blue-600 text-white p-3 rounded">🗓️ Itinerary</Link>
<Link to={`/trip/${id}/expenses`} className="block bg-green-600 text-white p-3 rounded">💰 Expenses</Link>
<Link to={`/trip/${id}/summary`} className="block bg-purple-600 text-white p-3 rounded">⚖ Settlement Summary</Link>
<Link to={`/trip/${id}/tickets`} className="block bg-orange-500 text-white p-3 rounded">🎟 Upload Tickets</Link>
</div>
</div>
</div>
);
}