import { useState, useEffect } from 'react';
import { Plus, MapPin, Clock, CheckCircle, Circle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Itinerary({ trip }) {
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentUser } = useApp();

  useEffect(() => {
    loadItinerary();
  }, [trip.id]);

  const loadItinerary = async () => {
    const { data } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('trip_id', trip.id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setItems(data);
  };

  const groupByDate = (items) => {
    const grouped = {};
    items.forEach(item => {
      const date = item.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    });
    return grouped;
  };

  const groupedItems = groupByDate(items);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trip Itinerary</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Activity
        </Button>
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No activities planned yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([date, dayItems]) => (
            <DaySection key={date} date={date} items={dayItems} onUpdate={loadItinerary} />
          ))}
        </div>
      )}

      <AddActivityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        trip={trip}
        onSuccess={() => {
          loadItinerary();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}

function DaySection({ date, items, onUpdate }) {
  const dateObj = new Date(date + 'T00:00:00');
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const toggleComplete = async (item) => {
    const newStatus = item.status === 'completed' ? 'approved' : 'completed';
    await supabase
      .from('itinerary_items')
      .update({ status: newStatus })
      .eq('id', item.id);
    onUpdate();
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          <div className="text-sm font-medium">{dayName}</div>
          <div className="text-xs">{dateStr}</div>
        </div>
      </div>

      <div className="space-y-3 ml-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <button
                  onClick={() => toggleComplete(item)}
                  className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {item.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>

                <div className="flex-1">
                  <h4 className={`font-semibold text-gray-900 ${item.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}

                  <div className="flex items-center space-x-4 mt-2">
                    {item.start_time && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.start_time} {item.end_time && `- ${item.end_time}`}
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {item.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(item.type)}`}>
                {item.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTypeBadge(type) {
  const badges = {
    accommodation: 'bg-purple-100 text-purple-800',
    activity: 'bg-blue-100 text-blue-800',
    transport: 'bg-green-100 text-green-800',
    food: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return badges[type] || badges.other;
}

function AddActivityModal({ isOpen, onClose, trip, onSuccess }) {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    start_time: '',
    end_time: '',
    type: 'activity'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await supabase
      .from('itinerary_items')
      .insert([{
        ...formData,
        trip_id: trip.id,
        added_by: currentUser.user_id,
        status: 'approved'
      }]);

    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Activity">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Visit Tokyo Tower"
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
            placeholder="Activity details"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Minato, Tokyo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={trip.start_date}
            max={trip.end_date}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="activity">Activity</option>
            <option value="accommodation">Accommodation</option>
            <option value="transport">Transport</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">
            Add Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
}
