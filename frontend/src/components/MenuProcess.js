import React from 'react';

export default function MenuProcess({ processes, onSelect }) {
  return (
    <div style={{ minWidth: 200, borderRight: '1px solid #ccc', padding: 20 }}>
      <h3>Processus</h3>
      {processes.map(proc => (
        <div key={proc.id} style={{ margin: 10, cursor: 'pointer' }} onClick={() => onSelect(proc)}>
          {proc.name}
        </div>
      ))}
    </div>
  );
} 