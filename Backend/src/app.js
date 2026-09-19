import express from "express";
import cors from "cors";
import morgan from "morgan";
import productRouter from "./routes/main/product.route.js";
import cartRouter from "./routes/main/cart.route.js";
import userRouter from "./routes/main/auth.route.js";
import categoriesRouter from "./routes/main/categories.route.js";
import checkoutRouter from "./routes/main/checkout.route.js";
import productDashboardRouter from "./routes/dashboard/product.route.js";
import categoriesDashboardRouter from "./routes/dashboard/categories.route.js";
import authDashboardRouter from "./routes/dashboard/auth.route.js";
import measurementDashboardroute from "./routes/dashboard/measurement.route.js";
import cookieParser from "cookie-parser";
import addressRouter from "./routes/main/address.route.js";
import measurementRouter from "./routes/main/measurement.route.js";
import spotlightRouter from "./routes/main/spotlight.route.js";
import spotlightDashboardRouter from "./routes/dashboard/spotlight.route.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Server is running...");
});

app.use("/api/main/product", productRouter);
app.use("/api/main/cart", cartRouter);
app.use("/api/main/auth", userRouter);
app.use("/api/main/categories", categoriesRouter);
app.use("/api/main/checkout", checkoutRouter);
app.use("/api/main/address", addressRouter);
app.use("/api/main/measurement", measurementRouter);
app.use("/api/main/spotlight", spotlightRouter);

app.use("/api/dashboard/product", productDashboardRouter);
app.use("/api/dashboard/categories", categoriesDashboardRouter);
app.use("/api/dashboard/auth", authDashboardRouter);
app.use("/api/dashboard/measurement", measurementDashboardroute);
app.use("/api/dashboard/spotlight", spotlightDashboardRouter);

export default app;
