import { getMachinesByProcess, updateMachineStatus } from '../models/machine.js';

export const getMachines = async (req, res) => {
  const { processId } = req.query;
  if (!processId) return res.status(400).json({ message: 'processId requis' });
  const machines = await getMachinesByProcess(processId);
  res.json(machines);
};

export const setMachineStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['working', 'maintenance', 'stop'].includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }
  const machine = await updateMachineStatus(id, status);
  res.json(machine);
}; 