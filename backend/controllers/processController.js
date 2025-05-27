import { getAllProcesses } from '../models/process.js';

export const getProcesses = async (req, res) => {
  const processes = await getAllProcesses();
  res.json(processes);
}; 