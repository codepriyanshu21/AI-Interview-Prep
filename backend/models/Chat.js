import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      min: 1,
      max: 10,
    },
    feedback: String,
    citations: [{
      type: String, // chunk text snippet
    }],
  }],
}, {
  timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
