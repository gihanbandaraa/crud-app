require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

//Create User
app.post("/create-user", async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName) {
    return res
      .status(400)
      .json({ error: true, message: "Firstname is Required" });
  }
  if (!lastName) {
    return res
      .status(400)
      .json({ error: true, message: "Lastname is Required" });
  }
  if (!email) {
    return res
      .status(400)
      .json({ error: true, message: "Email name is Required" });
  }
  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({
      error: true,
      message: "User already Exit",
    });
  }
  const user = new User({
    firstName,
    lastName,
    email,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "User added Successful",
  });
});

app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;

  const isUser = await User.findOne({ _id: user._id });
  if (!isUser) {
    return res.sendStatus(401);
  }
  return res.json({
    user: {
      firstName: isUser.firstName,
      lastName: isUser.lastName,
      email: isUser.email,
      _id: isUser._id,
    },
    message: "",
  });
});

app.listen(8000);

module.exports = app;
