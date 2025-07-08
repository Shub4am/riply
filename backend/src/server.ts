import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

dotenv.config();
const app = express();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.status(200).send("Riply API running");
});

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
