import dotenv from "dotenv";

if (!process.env.VERCEL) {
  dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`,
  });
}