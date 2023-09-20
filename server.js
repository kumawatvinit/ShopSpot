import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
// HTTP request logger middleware for node.js
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import productRoutes from "./routes/productRoute.js";
import path from "path";
import { fileURLToPath } from "url";

// nodemon
// - Speedy development of node.js
// - Auto restart server on detecting any change

// To avoid cross origin error
// 8080, 3000 origin error might occur
import cors from "cors";

dotenv.config({ path: "./.env" });

// connect to database
connectDB();

// __dirname is not available in ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// rest object
const app = express();

// middlewares
app.use(cors());
// using default json parser provided by express, instead of body-parser
app.use(express.json());
app.use(morgan("dev"));
// serving the frontend
app.use(express.static(path.join(__dirname, "./client/build")));

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// rest api
app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.get("/", (req, res) => {
  res.status(200).send("<h3>Welcome to Home page</h3>");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server listening on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan
      .white
  );
});
