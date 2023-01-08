const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc Register a new user
// @route POST /api/users/register
// @acces Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    res.status(400);
    throw new Error("please add all fields");
  }

  // check if user exists
  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400);
    throw new Error("Username already exists");
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords must be the same");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create user
  const user = await User.create({
    username,
    password: hashedPassword,
  });

  if (user) {
    res.status(200).json({
      id: user._id,
      username: user.username,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Authenticate a new user
// @route POST /api/users/login
// @acces Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // check for username
  const user = await User.findOne({ username });

  // check password
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      id: user._id,
      username: user.username,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc get user Data
// @route GET /api/users/me
// @acces Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Genereate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
