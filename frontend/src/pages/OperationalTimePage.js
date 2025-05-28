import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OperationalTimePage() {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const serverIP = window.location.protocol + '//' + window.location.hostname;
    axios.get(`${serverIP}:5000/api/processes`).then(res => {
      setProcesses(res.data);
    });
  }, []);

  const fetchMachinesForProcess = (processId) => {
    setLoading(true);
    const serverIP = window.location.protocol + '//' + window.location.hostname;
    axios.get(`${serverIP}:5000/api/machines?processId=${processId}`)
      .then(res => {
        const machines = res.data;
        Promise.all(
          machines.map(machine =>
            axios.get(`${serverIP}:5000/api/machines/${machine.id}/status-history`).then(res => ({
              ...machine,
              statusHistory: res.data
            }))
          )
        ).then(machinesWithHistory => {
          setMachines(machinesWithHistory);
          setLoading(false);
        });
      });
  };

  const calculateStoppedTime = (history) => {
    let totalStoppedMs = 0;
    let stopStartTime = null;
    // Get start of today in local time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      const entryDate = new Date(entry.changed_at);
      if (entryDate < today) continue;
      if (entry.status === 'stop' || entry.status === 'maintenance') {
        stopStartTime = entryDate;
      } else if (entry.status === 'working' && stopStartTime) {
        totalStoppedMs += (entryDate - stopStartTime);
        stopStartTime = null;
      }
    }
    const totalSeconds = totalStoppedMs / 1000;
    const totalMinutes = totalSeconds / 60;
    const totalHours = totalMinutes / 60;
    const hours = Math.floor(totalHours);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours} hr ${minutes} min ${seconds} sec`;
  };

  const handleProcessClick = (procId) => {
    setSelectedProcess(procId);
    fetchMachinesForProcess(procId);
  };

  return (
    <div className="responsive-container" style={{ minHeight: '100vh', background: '#f4f6fa', padding: 0 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
        <h2 style={{ marginBottom: 32, color: '#1976d2' }}>Stopped to Working Time for Machines</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          {processes.map(proc => (
            <button
              key={proc.id}
              onClick={() => handleProcessClick(proc.id)}
              style={{
                padding: '8px 18px',
                background: selectedProcess === proc.id ? '#1976d2' : '#eee',
                color: selectedProcess === proc.id ? '#fff' : '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                marginBottom: 4
              }}
            >
              {proc.name}
            </button>
          ))}
        </div>
        {loading && <div>Loading...</div>}
        {selectedProcess && !loading && (
          <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #0001' }}>
            <thead style={{ background: '#1976d2', color: '#fff' }}>
              <tr>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Machine Name</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Stopped Time</th>
              </tr>
            </thead>
            <tbody>
              {machines.map(machine => (
                <tr key={machine.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '10px 8px' }}>{machine.name}</td>
                  <td style={{ padding: '10px 8px', color: '#d32f2f', fontWeight: 500 }}>{calculateStoppedTime(machine.statusHistory)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 