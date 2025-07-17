import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../config/db.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { signToken } from "../config/jwt.ts";
import { v4 as uuidv4 } from "uuid";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password should be at least 6 characters long" });
      return;
    }

    if (name.length < 3) {
      res
        .status(400)
        .json({ message: "Username should be at least 3 characters long" });
      return;
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      res.status(400).json({ error: "User already exists" });
      return;
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
    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length === 0) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const user = existing[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ id: user.id, email });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
