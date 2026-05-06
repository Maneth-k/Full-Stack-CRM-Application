import { Router } from 'express';
import { getLeads, createLead, updateLead, getLeadById, deleteLead } from '../controllers/lead';
import { getNotes, createNote } from '../controllers/note';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.route('/:id/notes')
  .get(getNotes)
  .post(createNote);

export default router;
