import { Router } from "express";
import {
  newTransaction,
  renderTransactions,
} from "../controllers/transactions.controllers.js";

const transactionsRouter = Router();

transactionsRouter.post("/nova-transacao/:tipo", newTransaction);

transactionsRouter.get("/home", renderTransactions);

export default transactionsRouter;
