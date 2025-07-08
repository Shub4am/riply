import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../config/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "../config/jwt";
import { v4 as uuidv4 } from "uuid";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // check if user exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser.length > 0) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  await db.insert(users).values({
    id: userId,
    name,
    email,
    passwordHash: hashed,
  });

  const token = signToken({ id: userId, email });
  res.status(201).json({ token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length === 0) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const user = existing[0];
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = signToken({ id: user.id, email });

  res.status(200).json({ token });
};
