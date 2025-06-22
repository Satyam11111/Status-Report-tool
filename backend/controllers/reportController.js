const Report = require("../models/Report");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const reportSubmitController = async (req, res) => {
  const {
    scrumTeam,
    art,
    productOwner,
    scrumMaster,
    currentSprint,
    taskTitle,
    area,
    workSummary,
    taskStatus,
    leaves,
  } = req.body;
  const userId = req.user.userId;

  try {
    const newReport = new Report({
      user: userId,
      scrumTeam,
      art,
      productOwner,
      scrumMaster,
      currentSprint,
      taskTitle,
      area,
      workSummary,
      taskStatus,
      leaves,
    });

    await newReport.save();
    //saving report id to user array
    const usr = await User.findById(userId);
    usr.reports.push(newReport._id);
    await usr.save();

    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit report" });
  }
};

const allReportController = async (req, res) => {
  try {
    const admin = req.user;
    // Find all users from the admin's scrum team
    const reports = await User.find({
      scrumTeam: admin.scrumTeam,
      role: "employee",
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const getReports = async (req, res) => {
  try {
    // Find the admin user
    const admin = await User.findById(req.user.userId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "admin" || !admin.scrumTeam) {
      return res.status(403).json({ message: "Access Denied" });
    }
    console.log("admin:---", admin);
    // Find all users within the admin's scrum team
    const users = await User.find({ scrumTeam: admin.scrumTeam }); //O(n^2)

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found in your scrum team" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsers:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

//controller to fetch the scrum teams of admin
// const getScrumTeams = async (req, res) => {
//   try {
//     // Find the admin user
//     const admin = await User.findById(req.user.userId);
//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     if (!admin.scrumTeam) {//admin.role !== "admin" || --> removed for emp also
//       return res.status(403).json({ message: "Access Denied" });
//     }

//     req.user=admin;
//     res.status(200).json(admin.scrumTeam);
//   } catch (error) {
//     console.log("Error in getAdminScrumTeam:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

//controller to fetch the user InScrumTeams

// Controller to fetch the scrum teams of admin

const getScrumTeams = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization; // Assuming the format is '<token>'
    if (token == undefined) {
      token = req.headers["authorization"];
    }
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Decode the token to get the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is your secret key
    const userId = decodedToken.userId;

    // Find the admin user
    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has scrum teams
    if (!admin.scrumTeam) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // Set the user in the request object
    req.user = admin;

    // Respond with the user's scrum teams
    res.status(200).json(admin.scrumTeam);
  } catch (error) {
    console.log("Error in getScrumTeams:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const getEmpInScrumTeams = async (req, res) => {
  try {
    // Fetch scrum team name from the URL parameters
    const scrumTeamName = req.params.scrum.trim();
    console.log("scrum team", scrumTeamName);
    // Find the admin user
    const admin = await User.findById(req.user.userId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if the user is an admin and has access to the scrum team
    if (admin.role !== "admin" || !admin.scrumTeam.includes(scrumTeamName)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // Find all users within the specified scrum team
    const users = await User.find({
      scrumTeam: scrumTeamName,
      role: "employee",
    });

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found in the specified scrum team" });
    }
    console.log("users", users);
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getEmpInScrumTeams:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// fetching reports based on emp id
const getReportsForUser = async (req, res) => {
  try {
    // Get the user ID from the URL parameters
    const userId = req.params.userId;
    let scrumTeam = req.headers.scrumteam;
    console.log("scrumTeam", scrumTeam);
    // Find the user to ensure they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch reports for the specified user, sorted by creation date
    const reports = await Report.find({
      user: userId,
      scrumTeam: scrumTeam,
    });

    if (!reports || reports.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for this user" });
    }

    // Return the reports in the response
    res.status(200).json(reports);
  } catch (error) {
    console.log("Error in getReportsForUser:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

//latest report generator for admin- main task
const getLatestReportsForTeam = async (req, res) => {
  try {
    // Get the admin user ID from the request (assuming it's available in req.user or req.params)
    const adminId = req.user.userId;
    // console.log(req.user);
    // Fetch the admin's data from the database to get their scrum teams
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get the scrum teams array from the admin's data
    const scrumTeamArray = admin.scrumTeam; // Assuming 'scrumTeams' is an array in the admin document

    if (!scrumTeamArray || scrumTeamArray.length === 0) {
      return res
        .status(400)
        .json({ message: "Admin does not have any scrum teams" });
    }

    // Find all users who have the role of "employee" and belong to any of the admin's scrum teams
    const employees = await User.find({
      role: "employee",
      scrumTeam: { $in: scrumTeamArray },
    });

    // Extract employee IDs to use in the report query
    const employeeIds = employees.map((employee) => employee._id);

    if (employeeIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No employees found in the specified scrum teams" });
    }

    // Fetch the most recent report for each employee using aggregation
    const reports = await Report.aggregate([
      {
        $match: {
          user: { $in: employeeIds }, // Filter reports by employee IDs
          scrumTeam: { $in: scrumTeamArray }, // Ensure they are in the same scrum teams
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort reports by creation date in descending order (latest first)
      },
      {
        $group: {
          _id: "$scrumTeam", // Group by the user field
          latestReport: { $first: "$$ROOT" }, // Get the first document in each group (the latest report)
        },
      },
      {
        $replaceRoot: { newRoot: "$latestReport" }, // Replace the root with the latest report document
      },
    ]);

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        message:
          "No reports found for the employees in the specified scrum teams",
      });
    }

    // Return the latest reports in the response
    res.status(200).json(reports);
  } catch (error) {
    console.log("Error in getLatestReportsForTeam:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const myReportsController = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.userId });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

const deleteReport = async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await Report.deleteOne({ _id: userId }); // Await the delete operation
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .send({ status: "Error", message: "Report not found" });
    }
    res.send({ status: "Ok", message: "Report deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "Error",
      message: "An error occurred while deleting the report",
    });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id, ...updatedReport } = req.body; // Extract userId and updated report data from body

    const report = await Report.findByIdAndUpdate(id, updatedReport, {
      new: true,
    });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error updating report" });
  }
};

const getFormData = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found!" });
    }
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving report" });
  }
};

module.exports = {
  reportSubmitController,
  allReportController,
  getReports,
  myReportsController,
  getScrumTeams,
  getEmpInScrumTeams,
  getReportsForUser,
  getLatestReportsForTeam,
  deleteReport,
  updateReport,
  getFormData,
};
