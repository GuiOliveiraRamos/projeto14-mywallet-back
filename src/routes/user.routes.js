import { Router } from "express";
import { signin, signup } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.post("/cadastro", signup);

userRouter.post("/", signin);

export default userRouter;
