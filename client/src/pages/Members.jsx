import { useState, useEffect } from 'react';
import { Plus, UserPlus, Mail, Shield, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Members({ trip }) {
  const [members, setMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [trip.id]);

  const loadMembers = async () => {
    const { data } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', trip.id)
      .order('joined_at', { ascending: true });

    if (data) setMembers(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trip Members</h2>
          <p className="text-gray-600 mt-1">{members.length} members in this trip</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    {member.name}
                    {member.role === 'admin' && (
                      <Shield className="h-4 w-4 ml-2 text-blue-600" />
                    )}
                  </h3>
                  {member.email && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {member.email}
                    </div>
                  )}
                  <div className="mt-2 space-y-1">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.role}
                    </span>
                    {member.can_edit && (
                      <span className="inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Can Edit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        trip={trip}
        onSuccess={() => {
          loadMembers();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}

function AddMemberModal({ isOpen, onClose, trip, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member',
    can_edit: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await supabase
      .from('trip_members')
      .insert([{
        trip_id: trip.id,
        user_id: userId,
        ...formData
      }]);

    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Member name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="member@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.can_edit}
              onChange={(e) => setFormData({ ...formData, can_edit: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Can edit itinerary</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
