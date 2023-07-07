import bcrypt from "bcrypt";
import { db } from "../app.js";
import { v4 as uuid } from "uuid";
import { schemaSignInUp, schemaSignIn } from "../app.js";

export async function signup(req, res) {
  const { name, email, password, confirmPassword } = req.body;

  try {
    const validation = schemaSignInUp.validate(
      { name, email, password, confirmPassword },
      { abortEarly: false }
    );
    if (validation.error) return res.status(422).send(validation.error);

    const alreadySigned = await db.collection("users").findOne({ email });
    if (alreadySigned) return res.sendStatus(409);

    const hash = bcrypt.hashSync(password, 10);

    await db.collection("users").insertOne({ name, email, password: hash });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
  }
}
export async function signin(req, res) {
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
}
