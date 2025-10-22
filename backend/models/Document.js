import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['resume', 'jd'], // job description
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true, // Cloudinary URL
  },
  chunks: [{
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  }],
}, {
  timestamps: true,
});

const Document = mongoose.model('Document', documentSchema);

export default Document;