import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import Joi from "joi";

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
  .catch((err) => console.log(err.message));

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

//REQUESTS

app.post("/cadastro", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    const validation = schemaSignInUp.validate(
      { name, email, password, confirmPassword },
      { abortEarly: false }
    );
    if (validation.error) {
      return res.status(422).send(validation.error);
    }
    const alreadySigned = await db.collection("users").findOne({ email });
    if (alreadySigned) {
      return res.sendStatus(409);
    }

    res.sendStatus(201);
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const validation = schemaSignIn.validate({ email, password });
    if (validation.error) {
      return res.status(422).send(validation.error);
    }
    const validateEmail = await db.collection("users").findOne({ email });
    if (!validateEmail) {
      return res.sendStatus(404);
    }
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/nova-transacao/:tipo", async (req, res) => {});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
