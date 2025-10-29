import { Router } from 'express';
import Service from '../models/Service.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const items = await Service.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const created = await Service.create(req.body);
  res.status(201).json(created);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;


