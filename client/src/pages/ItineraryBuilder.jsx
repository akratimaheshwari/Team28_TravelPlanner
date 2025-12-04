import { useEffect, useState } from 'react';
import API from '../services/api';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"], // avoid polling issues
});


export default function ItineraryBuilder() {
const { id } = useParams();
const [items, setItems] = useState([]);
const [title, setTitle] = useState('');


useEffect(() => {
socket.emit('joinTrip', id);
API.get(`/itinerary/trip/${id}`).then(res => setItems(res.data.items));


socket.on('itineraryUpdated', data => {
if (data.action === 'add') setItems(prev => [...prev, data.item]);
if (data.action === 'delete') setItems(prev => prev.filter(i => i._id !== data.id));
});


return () => socket.emit('leaveTrip', id);
}, [id]);


const add = async () => {
await API.post(`/itinerary/${id}`, { title });
setTitle('');
};


return (
<div className="min-h-screen bg-gray-100 p-6">
<div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
<h2 className="text-2xl font-bold mb-4">Trip Itinerary</h2>


<div className="flex mb-4 gap-2">
<input className="flex-1 p-3 border rounded" placeholder="Add new activity..." value={title} onChange={e => setTitle(e.target.value)} />
<button onClick={add} className="bg-blue-600 text-white px-4 rounded">Add</button>
</div>


<ul className="space-y-2">
{items.map(i => (
<li key={i._id} className="p-3 bg-gray-50 rounded border">{i.title}</li>
))}
</ul>
</div>
</div>
);
}