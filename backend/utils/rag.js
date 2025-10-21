import Document from '../models/Document.js';
import { generateEmbedding, cosineSimilarity } from './embeddings.js';

export const retrieveRelevantChunks = async (userId, query, topK = 2) => {
  const queryEmbedding = generateEmbedding(query);

  // Get all documents for user
  const documents = await Document.find({ userId });

  const allChunks = [];
  documents.forEach(doc => {
    doc.chunks.forEach((chunk, index) => {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      allChunks.push({
        text: chunk.text,
        similarity,
        docType: doc.type,
        docId: doc._id,
        chunkIndex: index,
      });
    });
  });

  // Sort by similarity and return top K
  return allChunks
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};
