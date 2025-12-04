import React, { useState } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
// Mock function to join a trip
// const joinTrip = (code) => console.log('Joining trip with code:', code); 

export default function JoinTripModal({ onClose, onSuccess }) {
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (joinCode.length !== 6) {
            setError('Join code must be 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call to join the trip
            await new Promise(resolve => setTimeout(resolve, 1500));
            // In a real app, this would check the code and add the user
            console.log('User joined trip with code:', joinCode);
            
            // Assume success after joining
            onSuccess();
        } catch (err) {
            setError('Invalid or expired join code. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Join Existing Trip</h2>
                    <button onClick={onClose} className="modal-close-button"><X /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

                    <input
                        type="text"
                        placeholder="Enter 6-digit Join Code"
                        className="input-field"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                        maxLength="6"
                        required
                        style={{ textTransform: 'uppercase' }}
                    />
                    
                    <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                        {loading ? (
                            <Loader2 className="button-icon" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <>
                                <Users className="button-icon" />
                                <span>Join Trip</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}