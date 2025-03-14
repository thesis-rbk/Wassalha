const express = require("express");
const router = express.Router();
const processController = require("../controllers/processController");

// Process routes
router.get("/", processController.getAllProcessDetails);
router.get("/:orderId", processController.getProcessDetails);
router.patch("/:orderId/status", processController.updateProcessStatus);
router.get("/:orderId/events", processController.getProcessEvents);
router.delete("/:orderId", processController.cancelProcess);

module.exports = router;
