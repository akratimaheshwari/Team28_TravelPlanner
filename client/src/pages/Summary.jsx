import { useEffect, useState } from 'react';
import API from '../services/api';
import { useParams } from 'react-router-dom';


export default function Summary() {
const { id } = useParams();
const [data, setData] = useState(null);


useEffect(() => {
API.get(`/expenses/${id}/summary`).then(res => setData(res.data));
}, [id]);


if (!data) return <p className="p-6">Loading...</p>;


return (
<div className="min-h-screen bg-gray-100 p-6">
<div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
<h2 className="text-2xl font-bold mb-6">Settlement Summary</h2>


<h3 className="text-xl font-semibold mb-2">Balances</h3>
<ul className="mb-6 space-y-1">
{data.balances.map(b => (
<li key={b.userId} className="flex justify-between p-2 bg-gray-50 rounded">
<span>{b.name}</span>
<span className="font-bold">₹{b.amount}</span>
</li>
))}
</ul>


<h3 className="text-xl font-semibold mb-2">Who Owes Whom?</h3>
<ul className="space-y-1">
{data.settlements.map((s, i) => (
<li key={i} className="p-2 bg-green-50 border rounded">
<b>{s.fromName}</b> → <b>{s.toName}</b>: ₹{s.amount}
</li>
))}
</ul>
</div>
</div>
);
}