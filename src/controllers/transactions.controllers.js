import dayjs from "dayjs";
import { db } from "../database/database.connection.js";
import { schemaTransactions } from "../schemas/transactions.schemas.js";
import { ObjectId } from "mongodb";

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

export async function deleteTransaction(req, res) {
  const { id } = req.params;
  try {
    const result = await db
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.sendStatus(404);
    else {
      return res.sendStatus(204);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}
