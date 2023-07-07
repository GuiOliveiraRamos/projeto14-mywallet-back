import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import Joi from "joi";
import { signin, signup } from "./controllers/user.controllers.js";

//CONFIGS

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

//DATABASE

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
  await mongoClient.connect();
  console.log("MongoDB connected");
} catch (err) {
  (err) => console.log(err.message);
}

export const db = mongoClient.db();

//SCHEMAS

export const schemaSignInUp = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

export const schemaSignIn = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
});

const schemaTransactions = Joi.object({
  value: Joi.number().positive().required(),
  description: Joi.string().required(),
});
//REQUESTS

app.post("/cadastro", signup);

app.post("/", signin);

app.post("/nova-transacao/:tipo", async (req, res) => {
  const { valor, descricao } = req.body;
  const { tipo } = req.params;
  const token = req.headers.authorization;

  try {
    const validation = schemaTransactions.validate({ valor, descricao });
    if (!validation) return res.sendStatus(422);
    const validateToken = await db
      .collection("sessions")
      .findOne({ token: token.replace("Bearer ", "") });
    if (!token || !validateToken) return res.sendStatus(401);
    await db
      .collection("transactions")
      .insertOne({ valor, descricao }, { _id: new ObjectId(tipo) });

    res.sendStatus(201);
  } catch (err) {
    console.log(err.message);
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
