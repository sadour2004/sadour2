import React, { useState, useEffect } from 'react';
import MenuProcess from '../components/MenuProcess';
import MachinesList from '../components/MachinesList';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const navigate = useNavigate();

  // Helper: detect mobile
  const isMobile = window.innerWidth <= 600;

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
    <div className="responsive-container" style={{ minHeight: '100vh', background: '#f4f6fa', padding: 0 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
        <h2 style={{ marginBottom: 32, color: '#1976d2' }}>Dashboard</h2>
        {isMobile && selectedProcess && (
          <button style={{ marginBottom: 24, padding: '8px 18px', background: '#eee', color: '#1976d2', border: '1px solid #1976d2', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', alignSelf: 'flex-start' }} onClick={() => setSelectedProcess(null)}>
            Back to Process List
          </button>
        )}
        <div className="dashboard-flex" style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {(!isMobile || !selectedProcess) && (
            <div style={{ flex: 1, minWidth: 220, width: '100%' }}>
              <MenuProcess processes={processes} onSelect={setSelectedProcess} />
            </div>
          )}
          <div style={{ flex: 3, width: '100%' }}>
            {selectedProcess && <MachinesList processId={selectedProcess.id} />}
          </div>
        </div>
      </div>
    </div>
  );
} 