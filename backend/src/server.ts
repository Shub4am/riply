import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.ts";
import challengeRoutes from "./routes/challengeRoutes.ts";
import job from "./config/cron.ts";

dotenv.config();
const app = express();

job.start();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);

app.get("/", (_, res) => {
  res.status(200).send("Riply API running");
});

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
