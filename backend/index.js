import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Utilisateur de démo
const users = [{ username: 'admin', password: 'test1234' }];

// Processus
const processes = [
  { id: 1, name: 'Casting' },
  { id: 2, name: 'Sprue cutting' },
  { id: 3, name: 'Heat treatment' },
  { id: 4, name: 'Machining' },
  { id: 5, name: 'Design cutting' },
  { id: 6, name: 'Flow forming' }
];

// Machines de démo
const machines = [
  // Casting: LPDC 1 à 36
  ...Array.from({ length: 36 }, (_, i) => ({ id: i + 1, name: `LPDC ${i + 1}`, process_id: 1, status: 'working' })),
  // Sprue cutting: 01 à 06
  ...Array.from({ length: 6 }, (_, i) => ({ id: 36 + i + 1, name: `Sprue cutting ${String(i + 1).padStart(2, '0')}`, process_id: 2, status: 'working' })),
  // Heat treatment: 01 à 04
  ...Array.from({ length: 4 }, (_, i) => ({ id: 42 + i + 1, name: `Heat treatment ${String(i + 1).padStart(2, '0')}`, process_id: 3, status: 'working' })),
  // Machining: 01 à 26
  ...Array.from({ length: 26 }, (_, i) => ({ id: 46 + i + 1, name: `Machining ${String(i + 1).padStart(2, '0')}`, process_id: 4, status: 'working' })),
  // Design cutting: 00 à 17
  ...Array.from({ length: 18 }, (_, i) => ({ id: 72 + i + 1, name: `Design cutting ${String(i).padStart(2, '0')}`, process_id: 5, status: 'working' })),
  // Flow forming: 01 à 04
  ...Array.from({ length: 4 }, (_, i) => ({ id: 90 + i + 1, name: `Flow forming ${String(i + 1).padStart(2, '0')}`, process_id: 6, status: 'working' })),
];

// Authentification simple
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Identifiants invalides' });
  res.json({ token: 'fake-jwt-token' });
});

// Liste des process
app.get('/api/processes', (req, res) => {
  res.json(processes);
});

// Liste des machines d'un process
app.get('/api/machines', (req, res) => {
  const { processId } = req.query;
  const filtered = machines.filter(m => m.process_id == processId);
  res.json(filtered);
});

// Changer le statut d'une machine
app.put('/api/machines/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const machine = machines.find(m => m.id == id);
  if (!machine) return res.status(404).json({ message: 'Machine non trouvée' });
  machine.status = status;
  res.json(machine);
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
}); 