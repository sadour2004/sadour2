import pool from './db.js';

export const getAllProcesses = async () => {
  const res = await pool.query('SELECT * FROM processes');
  return res.rows;
}; 