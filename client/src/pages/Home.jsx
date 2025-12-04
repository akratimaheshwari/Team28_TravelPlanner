import { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Users, ArrowRight, MapPin, 
  TrendingUp, Clock, Activity, ChevronLeft, ChevronRight, Globe 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Modal from '../components/Modal';

// --- Components ---

// 1. Hero Carousel Component
function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80",
      title: "Explore the Unknown",
      subtitle: "Plan your next great adventure with friends."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Memories that Last",
      subtitle: "Track expenses and share moments seamlessly."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80",
      title: "Summer Getaways",
      subtitle: "Discover top rated destinations for the season."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg group">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
            <p className="text-lg opacity-90">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      
      {/* Navigation Buttons */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-6 w-6" />
      </button>
      
      {/* Indicators */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-2 w-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`} 
          />
        ))}
      </div>
    </div>
  );
}

// 2. Stats Component
function UserStats({ trips }) {
  const upcomingCount = trips.filter(t => new Date(t.start_date) > new Date()).length;
  const pastCount = trips.filter(t => new Date(t.end_date) < new Date()).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Trips</p>
          <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-gray-900">{pastCount}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Memories</p>
          <p className="text-2xl font-bold text-gray-900">124</p> {/* Mock data */}
        </div>
      </div>
    </div>
  );
}

// 3. Activity Sidebar Component
function ActivityFeed() {
  // In a real app, fetch this from a 'notifications' or 'audit_log' table
  const activities = [
    { id: 1, user: "Sarah", action: "added a new expense", time: "2h ago", trip: "Tokyo Trip" },
    { id: 2, user: "Mike", action: "uploaded 5 photos", time: "4h ago", trip: "Bali 2024" },
    { id: 3, user: "You", action: "created a new trip", time: "1d ago", trip: "Paris" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center">
          <Activity className="h-4 w-4 mr-2 text-blue-500" />
          Recent Activity
        </h3>
        <span className="text-xs text-blue-600 cursor-pointer hover:underline">View All</span>
      </div>
      <div className="space-y-6">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
            <div>
              <p className="text-sm text-gray-800">
                <span className="font-medium">{item.user}</span> {item.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.trip} • {item.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center">
            <Users className="h-4 w-4 mr-2" /> Invite Friend
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function Home({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentUser, setCurrentTrip } = useApp();

  useEffect(() => {
    if (currentUser) {
        loadTrips();
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser?.name?.split(' ')[0] || 'Traveler'}! 👋</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your adventures.</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg" className="shadow-lg shadow-blue-200">
            <Plus className="h-5 w-5 mr-2" />
            New Trip
          </Button>
        </div>

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Stats Row */}
        <UserStats trips={trips} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Trip List (Takes up 2/3 space on large screens) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Trips</h2>
              <div className="flex gap-2">
                 <select className="text-sm border-none bg-transparent font-medium text-gray-500 focus:ring-0 cursor-pointer">
                    <option>All Trips</option>
                    <option>Upcoming</option>
                    <option>Past</option>
                 </select>
              </div>
            </div>

            {trips.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6">Create your first trip to start planning your next adventure.</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Start Planning
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onView={handleViewTrip} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar (Takes up 1/3 space) */}
          <div className="hidden lg:block">
            <ActivityFeed />
          </div>
        </div>

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
  const startDate = new Date(trip.start_date);
  const isUpcoming = startDate > new Date();
  
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full">
      <div
        className="h-48 bg-gray-200 relative"
        style={trip.cover_image ? { 
            backgroundImage: `url(${trip.cover_image})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        } : {}}
      >
        {!trip.cover_image && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
             <Calendar className="h-12 w-12 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {isUpcoming && (
           <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
             UPCOMING
           </span>
        )}
        
        <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold leading-tight mb-1">{trip.name}</h3>
            <div className="flex items-center text-sm opacity-90">
                <Calendar className="h-3 w-3 mr-1.5" />
                <span>{fmtDate(trip.start_date)} - {fmtDate(trip.end_date)}</span>
            </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{trip.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
          <div className="flex -space-x-2">
             {trip.members?.slice(0, 3).map((m, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600" title={m.name}>
                    {m.name?.charAt(0) || 'U'}
                </div>
             ))}
             {(trip.members?.length || 0) > 3 && (
                 <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                     +{trip.members.length - 3}
                 </div>
             )}
          </div>

          <button
            onClick={() => onView(trip)}
            className="group-hover:bg-blue-50 p-2 rounded-full transition-colors text-blue-600"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Keep your existing CreateTripModal exactly as it was, or append below:
function CreateTripModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    cover_image: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const { data: trip, error } = await supabase
          .from('trips')
          .insert([{
            ...formData,
            created_by: currentUser.user_id
          }])
          .select()
          .single();

        if (error) throw error;

        await supabase
          .from('trip_members')
          .insert([{
            trip_id: trip.id,
            user_id: currentUser.user_id,
            name: currentUser.name || currentUser.email,
            email: currentUser.email,
            role: 'admin',
            can_edit: true
          }]);

        onSuccess();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plan a New Adventure">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g. Eurotrip 2024"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows="3"
            placeholder="What's the plan?"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                />
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input
            type="url"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
            value={formData.cover_image}
            onChange={e => setFormData({...formData, cover_image: e.target.value})}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Trip'}
            </Button>
        </div>
      </form>
    </Modal>
  );
}