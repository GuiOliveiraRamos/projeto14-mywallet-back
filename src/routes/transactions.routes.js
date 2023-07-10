import { Router } from "express";
import {
  deleteTransaction,
  newTransaction,
  renderTransactions,
} from "../controllers/transactions.controllers.js";
import { validateAuth } from "../middlewares/validateAuth.js";

const transactionsRouter = Router();

transactionsRouter.post("/nova-transacao/:tipo", validateAuth, newTransaction);

transactionsRouter.get("/home", validateAuth, renderTransactions);

transactionsRouter.delete("/home/:id", validateAuth, deleteTransaction);

export default transactionsRouter;
