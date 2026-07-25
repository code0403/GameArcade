import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import registerSockets from "./sockets/index.js";

dotenv.config();
await connectDB();

const app = express();
const corsOptions = { origin: process.env.FRONTEND_URL, credentials: true };

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.get("/", (req, res) => res.json({ message: "Game Arcade API" }));
app.get("/health", (req, res) => res.json({ status: "OK" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/groups", groupRoutes);

const server = http.createServer(app);
const io = new IOServer(server, { cors: corsOptions });
app.set("io", io);

registerSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
