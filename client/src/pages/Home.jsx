import React, { useState, useEffect } from 'react';
// Assuming these imports exist in your project structure
import { useAuth } from '../contexts/AuthContext';
import TripList from '../components/TripList';
import CreateTripModal from '../components/CreateTripModal';
import JoinTripModal from '../components/JoinTripModal';

// Icon placeholders (since we can't use lucide-react without dependency,
// I'll assume simple text or simple inline SVG/Unicode for production,
// but for this example, I'll use simple characters or text placeholders
// and descriptive class names.)

// If you insist on using lucide-react (as in your original code), you must have the dependency installed.
// Assuming the icons are available for structure:
import { Plus, LogOut, Map, Users, DollarSign, FileText, ChevronLeft, ChevronRight } from 'lucide-react';


const heroSlides = [
  {
    title: 'Plan Together, Travel Better',
    description: 'Collaborate with friends to create the perfect itinerary',
    Icon: Map,
    color: 'linear-gradient(to right, #3b82f6, #06b6d4)', // Blue to Cyan
    image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    title: 'Split Expenses Fairly',
    description: 'Track and settle shared costs with intelligent debt simplification',
    Icon: DollarSign,
    color: 'linear-gradient(to right, #10b981, #059669)', // Green to Emerald
    image: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    title: 'Keep Everything Organized',
    description: 'Store tickets, bookings, and documents in one place',
    Icon: FileText,
    color: 'linear-gradient(to right, #f97316, #ef4444)', // Orange to Red
    image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    title: 'Decide as a Group',
    description: 'Vote on hotels, activities, and make group decisions easy',
    Icon: Users,
    color: 'linear-gradient(to right, #ec4899, #f43f5e)', // Pink to Rose
    image: 'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1920'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { signOut } = useAuth();

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleTripCreated = () => {
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTripJoined = () => {
    setShowJoinModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="home-container">
      {/* --- Navigation Bar --- */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <Map className="logo-icon" />
            <span className="logo-text">TravelSync</span>
          </div>
          <button
            onClick={signOut}
            className="signout-button"
          >
            <LogOut className="signout-icon" />
            <span className="signout-text">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* --- Hero Carousel Section --- */}
      <div className="hero-carousel-wrapper">
        {heroSlides.map((slide, index) => {
          const Icon = slide.Icon;
          return (
            <div
              key={index}
              className={`hero-slide ${
                index === currentSlide
                  ? 'active'
                  : index < currentSlide
                  ? 'prev'
                  : 'next'
              }`}
            >
              {/* Background Image with overlay */}
              <div
                className="slide-background"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="slide-overlay" />
              </div>

              {/* Content */}
              <div className="slide-content">
                <div className="slide-text-box">
                  <div 
                    className="slide-icon-wrapper"
                    style={{ backgroundImage: slide.color }}
                  >
                    <Icon className="slide-icon" />
                  </div>
                  <h1 className="slide-title">{slide.title}</h1>
                  <p className="slide-description">{slide.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Carousel Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="carousel-nav-button left"
        >
          <ChevronLeft className="nav-icon" />
        </button>

        <button
          onClick={nextSlide}
          className="carousel-nav-button right"
        >
          <ChevronRight className="nav-icon" />
        </button>

        {/* Carousel Indicators */}
        <div className="carousel-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`indicator-dot ${index === currentSlide ? 'active-dot' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* --- Trip Management Section --- */}
      <div className="trip-manager-section">
        <div className="trip-manager-header">
          <div className="header-info">
            <h2 className="header-title">Your Trips</h2>
            <p className="header-subtitle">Manage your adventures and expenses</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowJoinModal(true)}
              className="button-secondary"
            >
              <Users className="button-icon" />
              <span>Join Trip</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="button-primary"
            >
              <Plus className="button-icon" />
              <span>Create Trip</span>
            </button>
          </div>
        </div>

        {/* The key prop forces TripList to re-render when a trip is created or joined */}
        <TripList key={refreshTrigger} />
      </div>

      {/* --- Modals --- */}
      {showCreateModal && (
        <CreateTripModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTripCreated}
        />
      )}

      {showJoinModal && (
        <JoinTripModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleTripJoined}
        />
      )}

    </div>
  );
}
