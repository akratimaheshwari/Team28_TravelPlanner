import { useState } from 'react';
import { Calendar, DollarSign, Users, FileText, BarChart3, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Itinerary from './Itinerary';
import Expenses from './Expenses';
import Members from './Members';
import Documents from './Documents';
import Settlement from './Settlement';

export default function TripDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('itinerary');
  const { currentTrip } = useApp();

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No trip selected</p>
          <button
            onClick={() => onNavigate('home')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(currentTrip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = new Date(currentTrip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'settlement', label: 'Settlement', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="h-64 bg-gradient-to-br from-blue-500 to-blue-700 relative"
        style={currentTrip.cover_image ? {
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.7), rgba(29, 78, 216, 0.7)), url(${currentTrip.cover_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Trips
          </button>

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{currentTrip.name}</h1>
            <p className="text-blue-100 text-lg">{startDate} - {endDate}</p>
            {currentTrip.description && (
              <p className="text-blue-50 mt-2">{currentTrip.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'itinerary' && <Itinerary trip={currentTrip} />}
            {activeTab === 'expenses' && <Expenses trip={currentTrip} />}
            {activeTab === 'settlement' && <Settlement trip={currentTrip} />}
            {activeTab === 'members' && <Members trip={currentTrip} />}
            {activeTab === 'documents' && <Documents trip={currentTrip} />}
          </div>
        </div>
      </div>
    </div>
  );
}
