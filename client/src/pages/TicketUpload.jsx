import { useState } from 'react';
import API from '../services/api';
import { useParams } from 'react-router-dom';


export default function TicketUpload() {
const { id } = useParams();
const [file, setFile] = useState(null);


const upload = async () => {
const form = new FormData();
form.append('file', file);
await API.post(`/uploads/ticket/${id}`, form);
alert('Uploaded');
};


return (
<div style={{ padding:40 }}>
<h2>Upload Ticket</h2>
<input type="file" onChange={e=>setFile(e.target.files[0])} />
<button onClick={upload}>Upload</button>
</div>
);
}