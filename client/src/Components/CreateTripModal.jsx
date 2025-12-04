import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
// Assuming trip creation function exists in a services file
// const createTrip = (data) => console.log('Creating trip:', data); 

export default function CreateTripModal({ onClose, onSuccess }) {
    const [tripName, setTripName] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!tripName || !destination || !startDate || !endDate) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call to create the trip
            await new Promise(resolve => setTimeout(resolve, 1500));
            // In a real app, this would return the new trip object
            console.log('Trip created:', { tripName, destination, startDate, endDate });
            onSuccess();
        } catch (err) {
            setError('Failed to create trip. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Create New Trip</h2>
                    <button onClick={onClose} className="modal-close-button"><X /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
                    
                    <input
                        type="text"
                        placeholder="Trip Name (e.g., European Backpacking)"
                        className="input-field"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Destination"
                        className="input-field"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        required
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="date"
                            placeholder="Start Date"
                            className="input-field"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                        <input
                            type="date"
                            placeholder="End Date"
                            className="input-field"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                        {loading ? (
                            <Loader2 className="button-icon" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <>
                                <Plus className="button-icon" />
                                <span>Create Trip</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}