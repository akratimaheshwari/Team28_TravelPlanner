import React, { useState, useEffect } from 'react';
import { Loader2, Map } from 'lucide-react';
// Mock data for demonstration
const mockTrips = [
    { id: 't1', title: 'European Backpacking', dates: 'Aug 1 - Aug 30', members: 4, cover: 'https://images.pexels.com/photos/10543983/pexels-photo-10543983.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 't2', title: 'Thailand Beach Getaway', dates: 'Dec 10 - Dec 20', members: 2, cover: 'https://images.pexels.com/photos/128562/pexels-photo-128562.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 't3', title: 'Ski Trip Colorado', dates: 'Jan 5 - Jan 12', members: 6, cover: 'https://images.pexels.com/photos/131723/pexels-photo-131723.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

export default function TripList() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching trips from the database (using refreshTrigger from Home.jsx)
        setLoading(true);
        setTimeout(() => {
            setTrips(mockTrips);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ padding: '4rem', color: '#2563eb' }}>
                <Loader2 style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite' }} />
                <span style={{ marginLeft: '1rem' }}>Loading your trips...</span>
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="text-center" style={{ padding: '4rem', color: '#6b7280', border: '2px dashed #d1d5db', borderRadius: '0.5rem' }}>
                <Map style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem' }} />
                <p>You are not currently part of any trips. Create one or join with a code!</p>
            </div>
        );
    }

    return (
        <div className="trip-grid">
            {trips.map(trip => (
                <div key={trip.id} className="trip-card">
                    <img src={trip.cover} alt={`Cover for ${trip.title}`} className="card-image" />
                    <div className="card-content">
                        <h3 className="card-title">{trip.title}</h3>
                        <p className="card-details">{trip.dates}</p>
                        <p className="card-details">{trip.members} Members</p>
                    </div>
                </div>
            ))}
        </div>
    );
}