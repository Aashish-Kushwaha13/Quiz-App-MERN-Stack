import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Define Allowed Client URL
const CLIENT_URL = process.env.CLIENT_URL || "https://quiz-app-mern-stack-7yag.vercel.app";

// ✅ Use CORS Middleware Globally
app.use(cors({ 
  origin: CLIENT_URL, 
  credentials: true, 
  methods: "GET,POST,PUT,DELETE,OPTIONS" 
}));

app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ GraphQL Type Definitions & Resolvers
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

// ✅ Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
});

async function startServer() {
  await server.start();
  
  // ✅ Apply GraphQL Middleware with CORS
  server.applyMiddleware({ app, cors: { origin: CLIENT_URL, credentials: true } });

  // ✅ REST API Route to Save Quiz Results
  app.post("/submit-quiz", async (req, res) => {
    try {
      const { username, score, totalQuestions } = req.body;
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

  console.log("✅ Express Server Initialized");
}

startServer();

// ✅ Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
