import express from 'express';
import { getMachines, setMachineStatus } from '../controllers/machineController.js';
const router = express.Router();

router.get('/', getMachines);
router.put('/:id/status', setMachineStatus);

export default router; 