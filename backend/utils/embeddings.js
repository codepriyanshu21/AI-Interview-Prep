// Simple text embedding using TF-IDF like approach for cosine similarity
// In production, use proper embedding models like OpenAI embeddings or Sentence Transformers

export const generateEmbedding = (text) => {
  // Simple word frequency vector
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  const wordCount = {};

  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Convert to vector (top 100 words by frequency)
  const sortedWords = Object.keys(wordCount).sort((a, b) => wordCount[b] - wordCount[a]).slice(0, 100);
  const vector = sortedWords.map(word => wordCount[word] || 0);

  return vector;
};

export const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
};
