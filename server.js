import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));
  
  // Mongoose Schema & Model
  const quizSchema = new mongoose.Schema({
    username: String,
    score: Number,
    totalQuestions: Number,
  });
  console.log("✅ CLIENT_URL from .env:", process.env.CLIENT_URL);
const QuizResult = mongoose.model('QuizResult', quizSchema);

// GraphQL Type Definitions
const typeDefs = `
  type QuizResult {
    id: ID!
    username: String!
    score: Int!
    totalQuestions: Int!
  }

  type Query {
    getResults: [QuizResult]
  }

  type Mutation {
    saveResult(username: String!, score: Int!, totalQuestions: Int!): QuizResult
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    getResults: async () => await QuizResult.find().sort({ score: -1 }),
  },
  Mutation: {
    saveResult: async (_, { username, score, totalQuestions }) => {
      const result = new QuizResult({ username, score, totalQuestions });
      await result.save();
      return result;
    },
  },
};

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true, // Enables CSRF prevention
});

await server.start();
server.applyMiddleware({ app, cors: false }); // Disable Apollo's internal CORS handling

// REST API Route to Save Quiz Results
app.post('/submit-quiz', async (req, res) => {
  try {
    const { username, score, totalQuestions } = req.body;

    // Validate input
    if (!username || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = new QuizResult({ username, score, totalQuestions });
    await result.save();
    res.status(201).json({ message: '✅ Result saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: '❌ Error saving result: ' + error.message });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
