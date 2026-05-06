import { Router } from 'express';
import { login, logout, getMe, getUsers } from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);

export default router;
