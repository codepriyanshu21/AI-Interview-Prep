import express from 'express';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import cloudinary from '../config/cloudinary.js';
import Document from '../models/Document.js';
import { generateEmbedding } from '../utils/embeddings.js';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body; // 'resume' or 'jd'
    if (!['resume', 'jd'].includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Extract text from uploaded PDF using pdf-parse
    // pdf-parse accepts a Buffer and returns { text, info, metadata, version }
    let text = '';
    try {
      const data = await pdfParse(req.file.buffer);
      text = data.text || '';
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      return res.status(400).json({ message: 'Failed to parse PDF' });
    }

    // Chunk text (~500 words)
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += 500) {
      const chunkText = words.slice(i, i + 500).join(' ');
      const embedding = generateEmbedding(chunkText);
      chunks.push({ text: chunkText, embedding });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'documents' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Save to DB
    const document = await Document.create({
      userId: req.user._id,
      type,
      filename: req.file.originalname,
      url: result.secure_url,
      chunks,
    });

    res.status(201).json({
      id: document._id,
      type: document.type,
      filename: document.filename,
      url: document.url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user documents
// @route   GET /api/documents/list
// @access  Private
router.get('/list', protect, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select('type filename url createdAt')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from Cloudinary
    const publicId = document.url.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`documents/${publicId}`, { resource_type: 'raw' });

    // Delete from DB
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;