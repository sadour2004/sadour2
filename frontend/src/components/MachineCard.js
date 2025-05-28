import React, { useState } from 'react';
import axios from 'axios';

const statusColors = {
  working: 'green',
  maintenance: 'blue',
  stop: 'red'
};

export default function MachineCard({ machine }) {
  const [status, setStatus] = useState(machine.status);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    const serverIP = window.location.protocol + '//' + window.location.hostname;
    await axios.put(`${serverIP}:5000/api/machines/${machine.id}/status`, { status: newStatus });
  };

  return (
    <div className="machine-card" style={{
      border: `2px solid ${statusColors[status]}`,
      borderRadius: 12,
      padding: 20,
      minWidth: 200,
      background: '#fff',
      boxShadow: '0 2px 8px #0001',
      marginBottom: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'box-shadow 0.2s',
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#1976d2', fontWeight: 700 }}>{machine.name}</h4>
      <select value={status} onChange={handleChange} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 15, marginBottom: 10 }}>
        <option value="working">Working</option>
        <option value="maintenance">Under maintenance</option>
        <option value="stop">Stop</option>
      </select>
      <div style={{ color: statusColors[status], marginTop: 8, fontWeight: 600, fontSize: 15 }}>
        {status === 'working' && 'En fonctionnement'}
        {status === 'maintenance' && 'Under maintenance'}
        {status === 'stop' && 'Arrêtée'}
      </div>
    </div>
  );
} 