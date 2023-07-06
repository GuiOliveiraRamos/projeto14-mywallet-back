import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

//CONFIGS

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

//DATABASE

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient
  .connect()
  .then(() => {
    db = mongoClient.db();
    console.log("rodando");
  })
  .catch((err) => console.log("err.message", err.message));

//SCHEMAS

const schemaSignInUp = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

const schemaSignIn = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
});

const schemaTransactions = Joi.object({
  value: Joi.number().positive().required(),
  description: Joi.string().required(),
});
//REQUESTS

app.post("/cadastro", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    const validation = schemaSignInUp.validate(
      { name, email, password, confirmPassword },
      { abortEarly: false }
    );
    if (validation.error) return res.status(422).send(validation.error);

    const alreadySigned = await db.collection("users").findOne({ email });
    if (alreadySigned) return res.sendStatus(409);

    const hash = bcrypt.hash(password, 10);

    await db.collection("users").insertOne({ name, email, password: hash });
    res.sendStatus(201);
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const validation = schemaSignIn.validate({ email, password });
    if (validation.error) return res.status(422).send(validation.error);

    const validateEmail = await db.collection("users").findOne({ email });
    if (!validateEmail) return res.sendStatus(404);

    const validatePassword = bcrypt.compareSync(
      password,
      validateEmail.password.toString()
    );

    if (!validatePassword) return res.sendStatus(401);

    const token = uuid();
    await db
      .collection("sessions")
      .insertOne({ validateEmailId: validateEmail._id, token });
    res.status(200).send(token);
  } catch (err) {
    console.log(err);
  }
});

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
      .insertOne({ tipo, validateToken: validateToken.validateEmailId });
    res.sendStatus(201);
  } catch (err) {
    console.log(err.message);
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
