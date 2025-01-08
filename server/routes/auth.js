const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Directory for file uploads
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Save file with its original name
  },
});

const upload = multer({ storage });

// USER REGISTER
router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const profileImage = req.file;

    if (!profileImage) {
      return res.status(400).send("No file uploaded");
    }

    const profileImagePath = profileImage.path;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImagePath,
    });

    // Save the new user
    await newUser.save();
    res.status(200).json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed!", error: err.message });
  }
});

// USER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User doesn't exist!" });
    }

    // Compare the password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallbackSecret', // Fallback for missing JWT_SECRET
      { expiresIn: "1h" } // Token expiration time
    );

    // Remove the password before sending the response
    const { password: _, ...userData } = user.toObject();

    res.status(200).json({ token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
