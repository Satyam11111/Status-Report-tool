const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Submit a new report
router.post("/submit", authenticate, reportController.reportSubmitController);

// Retrieve all reports for admin
router.get(
  "/all",
  authenticate,
  authorize(["admin"]),
  reportController.allReportController
);
router.get(
  "/user/:userId",
  authenticate,
  authorize(["admin"]),
  reportController.getReports
);

// Get all reports of the authenticated user
router.get("/my-reports", authenticate, reportController.myReportsController);

// fetching the scrum team names
router.get(
  "/scrum-teams-for-admin/",
  authenticate,
  reportController.getScrumTeams
);

//fetching users under the scrum team name
router.get(
  "/users-in-scrumteam/:scrum",
  authenticate,
  authorize(["admin"]),
  reportController.getEmpInScrumTeams
);
router.get(
  "/reports-for-user/:userId",
  authenticate,
  authorize(["admin"]),
  reportController.getReportsForUser
);

router.get(
  "/latest-reports",
  authenticate,
  authorize(["admin"]),
  reportController.getLatestReportsForTeam
);

router.post("/deleteReport", reportController.deleteReport);
router.put("/update-report", reportController.updateReport);
router.get("/form-data/:id", reportController.getFormData);
module.exports = router;
