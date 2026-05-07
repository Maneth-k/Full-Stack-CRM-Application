import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db";
import User from "./models/User";

import authRoutes from "./routes/auth";
import leadRoutes from "./routes/leads";
import dashboardRoutes from "./routes/dashboard";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.get("/", (req, res) => {
  res.send("CRM backend is LIVE!!!");
})
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "dummy2@example.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        email: "dummy2@example.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user seeded");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  await seedAdmin();
  console.log(`Server running on port ${PORT}`);
});
export default app;