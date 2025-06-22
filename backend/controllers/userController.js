const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerController = async (req, res) => {
  const { name, email, password, role, scrumTeam } = req.body;

  try {
    const u = await User.findOne({ email });
    if (!u) {
      //able to create account
      const user = new User({ name, email, password, role, scrumTeam });
      await user.save();

      const token = jwt.sign(
        { userId: user._id, role: user.role, scrumTeam: user.scrumTeam },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ user, token, status: 201 });
    } else {
      res.status(400).json({
        message: "Email is already used!",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: 500,
      message: "Error in registering user",
      error: error.message,
    });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, scrumTeam: user.scrumTeam },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({ token, status: 200, role: user.role });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const meController = async (req, res) => {
  try {
    console.log("In controller", req.user);
    const user = await User.findById(req.user.userId);
    res.json(user);
  } catch (error) {
    res.status(500).send("Error fetching user details");
  }
};

const getUsersInScrumTeam = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== "admin" || !admin.scrumTeam) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // Find all users within the admin's scrum team
    const users = await User.find({
      scrumTeam: admin.scrumTeam,
      role: "employee",
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = {
  registerController,
  loginController,
  meController,
  getUsersInScrumTeam,
};
