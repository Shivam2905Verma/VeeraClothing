import express from "express";
import cors from "cors";
import morgan from "morgan";
import productRouter from "./routes/main/product.route.js";
import productDashboardRouter from "./routes/dashboard/product.route.js";
import categoriesDashboardRouter from "./routes/dashboard/categories.route.js";
import authDashboardRouter from "./routes/dashboard/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Server is running...");
});

app.use("/api/main/product", productRouter);

app.use("/api/dashboard/product", productDashboardRouter);
app.use("/api/dashboard/categories", categoriesDashboardRouter);
app.use("/api/dashboard/auth", authDashboardRouter);

export default app;
