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
    <div style={{
      border: `2px solid ${statusColors[status]}`,
      borderRadius: 8,
      padding: 16,
      minWidth: 180,
      background: '#fff'
    }}>
      <h4>{machine.name}</h4>
      <select value={status} onChange={handleChange}>
        <option value="working">Working</option>
        <option value="maintenance">Under maintenance</option>
        <option value="stop">Stop</option>
      </select>
      <div style={{ color: statusColors[status], marginTop: 8 }}>
        {status === 'working' && 'En fonctionnement'}
        {status === 'maintenance' && 'Under maintenance'}
        {status === 'stop' && 'Arrêtée'}
      </div>
    </div>
  );
} 