import dayjs from "dayjs";
import { db } from "../database/database.connection.js";
import { schemaTransactions } from "../schemas/transactions.schemas.js";

export async function newTransaction(req, res) {
  const { valor, descricao } = req.body;
  const { tipo } = req.params;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  const date = dayjs().format("DD/MM");

  try {
    const validation = schemaTransactions.validate({
      valor,
      descricao,
    });
    console.log(validation);
    if (validation.error) return res.sendStatus(422);

    if (!token) return res.sendStatus(401);

    await db
      .collection("transactions")
      .insertOne({ valor, descricao, tipo, date });

    res.sendStatus(201);
  } catch (err) {
    console.log(err.message);
  }
}

export async function renderTransactions(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  try {
    if (!token) return res.sendStatus(401);
    const transactions = await db.collection("transactions").find().toArray();
    res.send(transactions);
  } catch (err) {
    console.log(err);
  }
}
