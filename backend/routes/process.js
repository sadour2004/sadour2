import express from 'express';
import { getProcesses } from '../controllers/processController.js';
const router = express.Router();

router.get('/', getProcesses);

export default router; 