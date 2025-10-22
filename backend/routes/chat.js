import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/Chat.js';
import Document from '../models/Document.js';
import { retrieveRelevantChunks } from '../utils/rag.js';
import protect from '../middleware/auth.js';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

// @desc    Start chat session with initial questions
// @route   POST /api/chat/start
// @access  Private
router.post('/start', protect, async (req, res) => {
  try {
    // Check if user has both resume and JD uploaded
    const resume = await Document.findOne({ userId: req.user._id, type: 'resume' });
    const jd = await Document.findOne({ userId: req.user._id, type: 'jd' });

    if (!resume || !jd) {
      return res.status(400).json({ message: 'Both resume and job description must be uploaded' });
    }

    // Generate initial questions from JD
    const jdText = jd.chunks.map(chunk => chunk.text).join(' ');
    const prompt = `Generate 3 concise interview questions based on this JD only. Do NOT include rationale: ${jdText}`;

    const result = await model.generateContent(prompt);
    const questions = result.response.text().split('\n').filter(q => q.trim()).slice(0, 4);

    // Create chat session
    const chat = await Chat.create({
      userId: req.user._id,
      messages: questions.map(q => ({ role: 'assistant', content: q })),
    });

    res.json({
      chatId: chat._id,
      messages: chat.messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Send message and get AI response
// @route   POST /api/chat/query
// @access  Private
router.post('/query', protect, async (req, res) => {
  try {
    const { message, chatId } = req.body;

    // Get chat session
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });

    // Retrieve relevant chunks
    const relevantChunks = await retrieveRelevantChunks(req.user._id, message);

    // Generate AI response with RAG
    const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
    const lastQuestion = chat.messages[chat.messages.length - 2]?.content || 'General question';

    const prompt = `
Evaluate this interview response using the provided context.

Question: ${lastQuestion}
Response: ${message}
Context (from resume and job description):
${context}

Provide:
1. A score from 1-10
2. Brief feedback (max 100 words)
3. Any relevant citations from the context

Format your response as:
Score: X/10
Feedback: [your feedback]
Citations: [relevant snippets, if any]
`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // Parse AI response
    const lines = aiResponse.split('\n');
    const scoreMatch = aiResponse.match(/Score:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
    const feedbackMatch = aiResponse.match(/Feedback:\s*(.+?)(?=Citations:|$)/s);
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : aiResponse;
    const citationsMatch = aiResponse.match(/Citations:\s*(.+)/s);
    const citations = citationsMatch ? citationsMatch[1].split('\n').filter(c => c.trim()) : [];

    // Add AI response to chat
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      score,
      feedback,
      citations,
    });

    await chat.save();

    res.json({
      message: aiResponse,
      score,
      feedback,
      citations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;