import { Router } from 'express';
import { getStats } from '../controllers/dashboard';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, getStats);

export default router;
