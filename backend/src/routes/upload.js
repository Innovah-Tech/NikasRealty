import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  const fileUrl = `/uploads/${path.basename(req.file.path)}`;
  res.status(201).json({ url: fileUrl });
});

export default router;


