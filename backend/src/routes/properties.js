import { Router } from 'express';
import Property from '../models/Property.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const items = await Property.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const created = await Property.create(req.body);
  res.status(201).json(created);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;


