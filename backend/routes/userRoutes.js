const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();
const userController = require("../controllers/userController");
const { registerSchema, loginSchema } = require("../validators/auth-validator");
const validate = require("../middleware/authMiddleware");

// Register a new user
router.post(
  "/register",
  validate(registerSchema),
  userController.registerController
);

// Login user
router.post("/login", validate(loginSchema), userController.loginController);

// Get user details (authenticated route)
router.get("/me", authenticate, userController.meController);


module.exports = router;
