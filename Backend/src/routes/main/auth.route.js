import { Router } from "express";

const userRouter = Router();

userRouter.post("/register", (req, res) => {});
userRouter.post("/login", (req, res) => {});
userRouter.post("/logout", (req, res) => {});
userRouter.get("/getme", (req, res) => {});

export default userRouter;
