import { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';


export default function CreateTrip() {
const nav = useNavigate();
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');


const create = async () => {
const { data } = await API.post('/trips', { title, description });
nav(`/trip/${data.trip._id}`);
};


return (
<div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
<div className="bg-white shadow-lg p-8 rounded w-full max-w-lg">
<h2 className="text-2xl font-bold mb-4">Create New Trip</h2>


<input className="w-full p-3 border rounded mb-3" placeholder="Trip Title" value={title} onChange={e => setTitle(e.target.value)} />
<textarea className="w-full p-3 border rounded mb-5" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />


<button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Create</button>
</div>
</div>
);
}