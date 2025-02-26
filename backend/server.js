import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // FIX: Enables JSON parsing for REST routes

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// MongoDB Schema & Model
const quizSchema = new mongoose.Schema({
  username: String,
  score: Number,
  totalQuestions: Number,
});
const QuizResult = mongoose.model("QuizResult", quizSchema);

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

// Start Apollo Server (Async)
const startApolloServer = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(
      `🚀 Server running on http://localhost:${PORT}${server.graphqlPath}`
    )
  );
};

// Start the server
startApolloServer();

// REST API Route to Save Quiz Results
app.post("/submit-quiz", async (req, res) => {
  try {
    const { username, score, totalQuestions } = req.body;

    // Validate input
    if (!username || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = new QuizResult({ username, score, totalQuestions });
    await result.save();
    res.status(201).json({ message: "✅ Result saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "❌ Error saving result: " + error.message });
  }
});
