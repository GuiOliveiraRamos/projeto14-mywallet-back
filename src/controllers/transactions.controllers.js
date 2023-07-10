import dayjs from "dayjs";
import { db } from "../database/database.connection.js";
import { schemaTransactions } from "../schemas/transactions.schemas.js";

export async function newTransaction(req, res) {
  const { valor, descricao } = req.body;
  const { tipo } = req.params;

  const date = dayjs().format("DD/MM");

  try {
    const validation = schemaTransactions.validate({
      valor,
      descricao,
    });
    console.log(validation);
    if (validation.error) return res.sendStatus(422);

    await db
      .collection("transactions")
      .insertOne({ valor, descricao, tipo, date });

    res.sendStatus(201);
  } catch (err) {
    console.log(err.message);
  }
}

export async function renderTransactions(req, res) {
  try {
    const transactions = await db.collection("transactions").find().toArray();
    res.send(transactions);
  } catch (err) {
    console.log(err);
  }
}
