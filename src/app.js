import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import Joi from "joi";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient
  .connect()
  .then(() => {
    db = mongoClient.db();
    console.log("rodando");
  })
  .catch((err) => console.log(err.message));

const schemaSignInUp = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.any().required().min(3),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
});

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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
