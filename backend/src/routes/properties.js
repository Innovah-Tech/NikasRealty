import { Router } from 'express';
import Property from '../storage/Property.js';
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
  if (location) query.location = String(location);
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

  let items = await Property.find(query);
  
  // Sort results
  const sortBy = ['createdAt', 'price'].includes(String(sort)) ? String(sort) : 'createdAt';
  const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
  
  items.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal < bVal) return -1 * sortOrder;
    if (aVal > bVal) return 1 * sortOrder;
    return 0;
  });

  res.json(items);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const created = await Property.create(req.body);
  res.status(201).json(created);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Property not found' });
  res.json(updated);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const deleted = await Property.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Property not found' });
  res.status(204).end();
});

export default router;


