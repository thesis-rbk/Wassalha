const express = require("express");
const router = express.Router();
const processController = require("../controllers/processController");
const { authenticateUser } = require("../middleware/middleware");

// Protected routes - all require authentication
router.get("/", authenticateUser, processController.getAllProcessDetails);
router.get("/:orderId", authenticateUser, processController.getProcessDetails);
router.patch(
  "/:orderId/status",
  authenticateUser,
  processController.updateProcessStatus
);
router.get(
  "/:orderId/events",
  authenticateUser,
  processController.getProcessEvents
);
router.delete("/:orderId", authenticateUser, processController.cancelProcess);

// Add logging middleware
router.use((req, res, next) => {
  console.log(" Process route accessed:", {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    profile: req.user?.profile?.id,
  });
  next();
});

module.exports = router;
