import { Router } from 'express';
import Blog from '../storage/Blog.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all blogs (admin only, with filters)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (search) query.title = search;
    if (status) query.status = status;
    
    const blogs = await Blog.find(query);
    res.json({ blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get published blogs (public)
router.get('/published', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' });
    res.json({ blogs });
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Create blog (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, summary, content, image, author, status } = req.body;
    
    if (!title || !summary) {
      return res.status(400).json({ error: 'Title and summary are required' });
    }
    
    const blog = await Blog.create({
      title,
      summary,
      content: content || '',
      image: image || '',
      author: author || 'Admin',
      status: status || 'draft',
    });
    
    res.status(201).json({ blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// Update blog (admin only)
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, summary, content, image, author, status } = req.body;
    const update = {};
    
    if (title !== undefined) update.title = title;
    if (summary !== undefined) update.summary = summary;
    if (content !== undefined) update.content = content;
    if (image !== undefined) update.image = image;
    if (author !== undefined) update.author = author;
    if (status !== undefined) update.status = status;
    
    const blog = await Blog.findByIdAndUpdate(req.params.id, update);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json({ blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// Delete blog (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Get blog statistics (admin only)
router.get('/stats/summary', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allBlogs = await Blog.find({});
    const published = await Blog.find({ status: 'published' });
    const drafts = await Blog.find({ status: 'draft' });
    
    res.json({
      total: allBlogs.length,
      published: published.length,
      drafts: drafts.length,
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ error: 'Failed to fetch blog statistics' });
  }
});

export default router;

