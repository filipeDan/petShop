const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware"); // Import protect middleware if needed for auth routes

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

// @desc    Register a new user (Optional - might only need login based on prompt)
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body; // Role might be restricted

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role: role || "user", // Default to 'user' if not provided or restrict based on logic
    });

    // Respond with user info and token (excluding password)
    if (user) {
      // Fetch the created user again to exclude the password field correctly
      const createdUser = await User.findById(user._id).select("-password");
      res.status(201).json({
        _id: createdUser._id,
        email: createdUser.email,
        role: createdUser.role,
        token: generateToken(createdUser._id),
      });
    } else {
      res.status(400).json({ message: "Dados de usuário inválidos" });
    }
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ message: "Erro do servidor ao registrar usuário", error: error.message });
  }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: "Por favor, forneça email e senha" });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select("+password");

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Respond with user info and token (excluding password)
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Email ou senha inválidos" });
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro do servidor ao fazer login", error: error.message });
  }
});

// @desc    Get user profile (Example protected route)
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  // req.user is attached by the protect middleware
  if (req.user) {
    res.json({
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ message: "Usuário não encontrado" });
  }
});

module.exports = router;

