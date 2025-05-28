import pool from './db.js';

export const getMachinesByProcess = async (processId) => {
  const res = await pool.query('SELECT * FROM machines WHERE process_id = $1', [processId]);
  return res.rows;
};

export const updateMachineStatus = async (machineId, status) => {
  const res = await pool.query('UPDATE machines SET status = $1 WHERE id = $2 RETURNING *', [status, machineId]);
  return res.rows[0];
};

export const logMachineStatusChange = async (machineId, status) => {
  const res = await pool.query('INSERT INTO machine_status_history (machine_id, status, changed_at) VALUES ($1, $2, NOW()) RETURNING *', [machineId, status]);
  return res.rows[0];
}; 