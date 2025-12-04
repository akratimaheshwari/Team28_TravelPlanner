import { useState, useEffect } from 'react';
import { Plus, DollarSign, User, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { calculateSplit } from '../lib/expenseSplitter';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Expenses({ trip }) {
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadExpenses();
    loadMembers();
  }, [trip.id]);

  const loadExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select(`
        *,
        participants:expense_participants(*)
      `)
      .eq('trip_id', trip.id)
      .order('date', { ascending: false });

    if (data) setExpenses(data);
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', trip.id);

    if (data) setMembers(data);
  };

  const getMemberName = (userId) => {
    const member = members.find(m => m.user_id === userId);
    return member ? member.name : 'Unknown';
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{expense.title}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Paid by {getMemberName(expense.paid_by)}
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      {expense.category}
                    </div>
                    <div>
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  {expense.notes && (
                    <p className="text-sm text-gray-600 mt-2">{expense.notes}</p>
                  )}
                  {expense.participants && expense.participants.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium text-gray-700">Split between: </span>
                      {expense.participants.map((p, idx) => (
                        <span key={p.id} className="text-gray-600">
                          {getMemberName(p.user_id)} (${parseFloat(p.amount_owed).toFixed(2)})
                          {idx < expense.participants.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {expense.currency}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        trip={trip}
        members={members}
        onSuccess={() => {
          loadExpenses();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}

function AddExpenseModal({ isOpen, onClose, trip, members, onSuccess }) {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: 'USD',
    paid_by: currentUser?.user_id || '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (members.length > 0 && selectedMembers.length === 0) {
      setSelectedMembers(members.map(m => m.user_id));
    }
  }, [members]);

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([{
        ...formData,
        trip_id: trip.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return;
    }

    const participants = selectedMembers.map(userId => ({ user_id: userId }));
    const splits = calculateSplit(parseFloat(formData.amount), participants, 'equal');

    await supabase
      .from('expense_participants')
      .insert(
        splits.map(split => ({
          expense_id: expense.id,
          ...split
        }))
      );

    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expense Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Dinner at restaurant"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>
          <select
            value={formData.paid_by}
            onChange={(e) => setFormData({ ...formData, paid_by: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="food">Food</option>
            <option value="accommodation">Accommodation</option>
            <option value="transport">Transport</option>
            <option value="activity">Activity</option>
            <option value="other">Other</option>
          </select>
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
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Between
          </label>
          <div className="space-y-2">
            {members.map((member) => (
              <label key={member.user_id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.user_id)}
                  onChange={() => toggleMember(member.user_id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{member.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional details"
            rows="2"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">
            Add Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
