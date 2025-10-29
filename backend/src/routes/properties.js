import { Router } from 'express';
import Property from '../models/Property.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const {
    type,
    status,
    location,
    bedrooms,
    minPrice,
    maxPrice,
    completion,
    category,
    sort = 'createdAt',
    order = 'desc',
  } = req.query;

  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (location) query.location = new RegExp(String(location), 'i');
  if (category) query.category = category;
  if (completion) query.completion = completion;
  if (bedrooms) {
    if (String(bedrooms).endsWith('+')) {
      const min = Number(String(bedrooms).replace('+', '')) || 0;
      query.bedrooms = { $gte: min };
    } else {
      query.bedrooms = Number(bedrooms);
    }
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortBy = ['createdAt', 'price'].includes(String(sort)) ? String(sort) : 'createdAt';
  const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;

  const items = await Property.find(query).sort({ [sortBy]: sortOrder });
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


