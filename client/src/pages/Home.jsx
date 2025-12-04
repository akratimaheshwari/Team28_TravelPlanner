import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Home({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentUser, setCurrentTrip } = useApp();

  useEffect(() => {
    loadTrips();
  }, [currentUser]);

  const loadTrips = async () => {
    const { data: memberData } = await supabase
      .from('trip_members')
      .select('trip_id')
      .eq('user_id', currentUser.user_id);

    if (memberData && memberData.length > 0) {
      const tripIds = memberData.map(m => m.trip_id);
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .in('id', tripIds)
        .order('created_at', { ascending: false });

      if (tripsData) {
        const tripsWithMembers = await Promise.all(
          tripsData.map(async (trip) => {
            const { data: members } = await supabase
              .from('trip_members')
              .select('*')
              .eq('trip_id', trip.id);
            return { ...trip, members: members || [] };
          })
        );
        setTrips(tripsWithMembers);
      }
    }
  };

  const handleViewTrip = (trip) => {
    setCurrentTrip(trip);
    onNavigate('trip-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-600 mt-2">Plan, collaborate, and track expenses together</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Trip
          </Button>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-6">Create your first trip to get started</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Trip
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onView={handleViewTrip} />
            ))}
          </div>
        )}

        <CreateTripModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadTrips();
            setShowCreateModal(false);
          }}
        />
      </div>
    </div>
  );
}

function TripCard({ trip, onView }) {
  const startDate = new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div
        className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
        style={trip.cover_image ? { backgroundImage: `url(${trip.cover_image})`, backgroundSize: 'cover' } : {}}
      >
        {!trip.cover_image && (
          <Calendar className="h-12 w-12 text-white opacity-50" />
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{trip.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{trip.description}</p>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{startDate} - {endDate}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{trip.members?.length || 0} members</span>
          </div>

          <button
            onClick={() => onView(trip)}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateTripModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    cover_image: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: trip, error } = await supabase
      .from('trips')
      .insert([{
        ...formData,
        created_by: currentUser.user_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating trip:', error);
      return;
    }

    await supabase
      .from('trip_members')
      .insert([{
        trip_id: trip.id,
        user_id: currentUser.user_id,
        name: currentUser.name,
        email: currentUser.email,
        role: 'admin',
        can_edit: true
      }]);

    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Trip">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trip Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Tokyo Adventure 2024"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of your trip"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image URL (optional)
          </label>
          <input
            type="url"
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">
            Create Trip
          </Button>
        </div>
      </form>
    </Modal>
  );
}
