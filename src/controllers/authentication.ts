import { Request, Response } from "express";
import users from "../model/authModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "key";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, password, email } = req.body;
    const user = await users.findOne({ email: email });
    if (user) {
      res.status(404).json({ message: "User already exists!" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new users({
        email,
        password: hashedPassword,
        name,
      });

      await newUser.save();
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ meta: { token: token }, user: user });
  } catch (error) {
    res.status(500).json({ message: "login failed" });
  }
};

module.exports = { register, login };
