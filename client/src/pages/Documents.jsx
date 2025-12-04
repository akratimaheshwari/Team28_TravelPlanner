import { useState, useEffect } from 'react';
import { Plus, FileText, Download, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Documents({ trip }) {
  const [documents, setDocuments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [trip.id]);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false });

    if (data) setDocuments(data);
  };

  const groupByCategory = (docs) => {
    const grouped = {
      ticket: [],
      booking: [],
      id: [],
      other: []
    };
    docs.forEach(doc => {
      grouped[doc.category].push(doc);
    });
    return grouped;
  };

  const groupedDocs = groupByCategory(documents);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-600 mt-1">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} stored
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocs).map(([category, docs]) => {
            if (docs.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                  {category === 'id' ? 'ID Documents' : `${category}s`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docs.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddDocumentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        trip={trip}
        onSuccess={() => {
          loadDocuments();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}

function DocumentCard({ document }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="bg-blue-100 rounded-lg p-2">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{document.name}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {document.file_type || 'Document'}
            </p>
            {document.linked_date && (
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {new Date(document.linked_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <a
          href={document.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700"
        >
          <Download className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}

function AddDocumentModal({ isOpen, onClose, trip, onSuccess }) {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    file_url: '',
    file_type: '',
    category: 'other',
    linked_date: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await supabase
      .from('documents')
      .insert([{
        ...formData,
        trip_id: trip.id,
        uploaded_by: currentUser.user_id
      }]);

    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Document">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Flight Ticket - Tokyo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File URL
          </label>
          <input
            type="url"
            value={formData.file_url}
            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/document.pdf"
            required
          />
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
            <option value="ticket">Ticket</option>
            <option value="booking">Booking</option>
            <option value="id">ID Document</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Type
          </label>
          <input
            type="text"
            value={formData.file_type}
            onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., PDF, Image"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Linked Date (Optional)
          </label>
          <input
            type="date"
            value={formData.linked_date}
            onChange={(e) => setFormData({ ...formData, linked_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={trip.start_date}
            max={trip.end_date}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">
            Add Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
