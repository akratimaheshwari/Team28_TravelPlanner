import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TripList from '../components/TripList';
import CreateTripModal from '../components/CreateTripModal';
import JoinTripModal from '../components/JoinTripModal';
import { Plus, LogOut, Map, Users, DollarSign, FileText, ChevronLeft, ChevronRight, UserCircle, Grid } from 'lucide-react';

const MapIcon = Map; // alias to avoid conflict

const heroSlides = [
  {
    title: 'Plan Together, Travel Better',
    description: 'Collaborate with friends to create the perfect itinerary',
    Icon: MapIcon,
    color: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
    image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    title: 'Split Expenses Fairly',
    description: 'Track and settle shared costs with intelligent debt simplification',
    Icon: DollarSign,
    color: 'linear-gradient(135deg,#10b981,#06b6d4)',
    image: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    title: 'Keep Everything Organized',
    description: 'Store tickets, bookings, and documents in one place',
    Icon: FileText,
    color: 'linear-gradient(135deg,#f97316,#f43f5e)',
    image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    title: 'Decide as a Group',
    description: 'Vote on hotels, activities, and make group decisions easy',
    Icon: Users,
    color: 'linear-gradient(135deg,#ec4899,#db2777)',
    image: 'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1920'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { signOut } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const handleTripCreated = () => { setShowCreateModal(false); setRefreshTrigger(prev => prev + 1); };
  const handleTripJoined = () => { setShowJoinModal(false); setRefreshTrigger(prev => prev + 1); };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(to right,#4f46e5,#4338ca)', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapIcon size={32} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>TravelSync</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#6d28d9,#4f46e5)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', color: 'white', cursor: 'pointer', transition: 'all 0.3s', fontWeight:'600' }}>
            <Grid size={20} /> Dashboard
          </button>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} title="Profile">
            <UserCircle size={28} />
          </button>
          <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight:'600' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </header>

      {/* Hero Carousel */}
      <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
        {heroSlides.map((slide, index) => {
          const Icon = slide.Icon;
          return (
            <div key={index} style={{
              position: 'absolute', inset: 0, transition: 'all 700ms ease-in-out',
              opacity: index === currentSlide ? 1 : 0,
              transform: index === currentSlide ? 'translateX(0)' : index < currentSlide ? 'translateX(-100%)' : 'translateX(100%)'
            }}>
              <div style={{ backgroundImage: `url(${slide.image})`, position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
              </div>
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', maxWidth: '768px', color: 'white' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', backgroundImage: slide.color }}>
                    <Icon size={40} />
                  </div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{slide.title}</h1>
                  <p style={{ fontSize: '1.25rem' }}>{slide.description}</p>
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '50%', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '50%', border: 'none', cursor: 'pointer' }}>
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Trip Section */}
      <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Your Trips</h2>
            <p style={{ color: '#4b5563' }}>Manage your adventures and expenses</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowJoinModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '2px solid #4f46e5', color: '#4f46e5', background: 'white', cursor: 'pointer', fontWeight:'600', transition:'all 0.3s', transform:'scale(1)', hover:{transform:'scale(1.05)'} }}>
              <Users size={20} /> Join Trip
            </button>
            <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', color: 'white', background: 'linear-gradient(135deg,#6d28d9,#4f46e5)', cursor: 'pointer', fontWeight:'600', transition:'all 0.3s', transform:'scale(1)' }}>
              <Plus size={20} /> Create Trip
            </button>
          </div>
        </div>
        <TripList key={refreshTrigger} />
      </div>

      {showCreateModal && <CreateTripModal onClose={() => setShowCreateModal(false)} onSuccess={handleTripCreated} />}
      {showJoinModal && <JoinTripModal onClose={() => setShowJoinModal(false)} onSuccess={handleTripJoined} />}

      {/* Footer */}
      <footer style={{ background: 'linear-gradient(to right,#4f46e5,#4338ca)', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} TravelSync. All rights reserved.</p>
        <p>Made with ❤️ for group travelers</p>
      </footer>
    </div>
  );
}
