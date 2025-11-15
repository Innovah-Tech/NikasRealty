import { Router } from 'express';
import Request from '../storage/Request.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Stats endpoint - must be before the root route to avoid conflicts
router.get('/stats', async (req, res) => {
  try {
    const allRequests = await Request.find({});
    const total = allRequests.length;
    
    res.json({
      total,
    });
  } catch (error) {
    console.error('Error fetching request stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const requests = await Request.find({});
    // Sort by createdAt descending
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.post('/', async (req, res) => {
  try {
    const created = await Request.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Request not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Request not found' });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

export default router;

