import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MachineCard from './MachineCard';

export default function MachinesList({ processId }) {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    const serverIP = window.location.protocol + '//' + window.location.hostname;
    axios.get(`${serverIP}:5000/api/machines?processId=${processId}`)
      .then(res => setMachines(res.data));
  }, [processId]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 20 }}>
      {machines.map(machine => (
        <MachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  );
} 