import pool from './db.js';

export const getMachinesByProcess = async (processId) => {
  const res = await pool.query('SELECT * FROM machines WHERE process_id = $1', [processId]);
  return res.rows;
};

export const updateMachineStatus = async (machineId, status) => {
  const res = await pool.query('UPDATE machines SET status = $1 WHERE id = $2 RETURNING *', [status, machineId]);
  return res.rows[0];
}; 