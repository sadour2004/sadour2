import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MachineCard from './MachineCard';

export default function MachinesList({ processId }) {
  const [machines, setMachines] = useState([]);

  const calculateStoppedTime = (history) => {
    let totalStoppedTime = 0;
    let stopStartTime = null;

    history.forEach((entry, index) => {
      if (entry.status === 'stop') {
        stopStartTime = new Date(entry.changed_at);
      } else if (entry.status === 'working' && stopStartTime) {
        const workingStartTime = new Date(entry.changed_at);
        totalStoppedTime += (workingStartTime - stopStartTime) / 1000; // Convert to seconds
        stopStartTime = null;
      }
    });

    return totalStoppedTime;
  };

  useEffect(() => {
    const serverIP = window.location.protocol + '//' + window.location.hostname;
    if (processId === 'stopped') {
      // Fetch all processes, then all machines for each process, and filter stopped
      axios.get(`${serverIP}:5000/api/processes`).then(res => {
        const processIds = res.data.map(p => p.id);
        Promise.all(processIds.map(id => axios.get(`${serverIP}:5000/api/machines?processId=${id}`)))
          .then(results => {
            const allMachines = results.flatMap(r => r.data);
            setMachines(allMachines.filter(m => m.status === 'stop'));
          });
      });
    } else {
      axios.get(`${serverIP}:5000/api/machines?processId=${processId}`)
        .then(res => setMachines(res.data));
    }
  }, [processId]);

  useEffect(() => {
    const serverIP = window.location.protocol + '//' + window.location.hostname;
    machines.forEach(machine => {
      axios.get(`${serverIP}:5000/api/machines/${machine.id}/status-history`)
        .then(res => {
          const stoppedTime = calculateStoppedTime(res.data);
          console.log(`Machine ${machine.name} stopped time: ${stoppedTime} seconds`);
          // Here you can update the UI to display the stopped time
        });
    });
  }, [machines]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 20 }}>
      {machines.map(machine => (
        <MachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  );
} 