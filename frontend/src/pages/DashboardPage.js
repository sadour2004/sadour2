import React, { useState, useEffect } from 'react';
import MenuProcess from '../components/MenuProcess';
import MachinesList from '../components/MachinesList';
import axios from 'axios';

export default function DashboardPage() {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const serverIP = window.location.protocol + '//' + window.location.hostname;
    if (!token) {
      window.location.href = '/login';
    } else {
      axios.get(`${serverIP}:5000/api/processes`).then(res => setProcesses(res.data));
    }
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <MenuProcess processes={processes} onSelect={setSelectedProcess} />
      {selectedProcess && <MachinesList processId={selectedProcess.id} />}
    </div>
  );
} 