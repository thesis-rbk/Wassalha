const express = require("express");
const router = express.Router();
const { getAllAdmins, getAdminById, createOrInviteAdmin, removeAdmin, updateAdminRole, promoteToAdmin } = require("../controllers/adminController");
const { authenticateUser } = require('../middleware/middleware');
const { roleCheck } = require('../middleware/adminMiddleware');

// Admin routes
router.get("/admins", authenticateUser, roleCheck(['ADMIN', 'SUPER_ADMIN']), getAllAdmins);
router.get("/admins/:id", authenticateUser, roleCheck(['ADMIN', 'SUPER_ADMIN']), getAdminById);
router.post("/admins", authenticateUser, roleCheck(['SUPER_ADMIN']), createOrInviteAdmin);
router.put("/admins/:id/remove", authenticateUser, roleCheck(['SUPER_ADMIN']), removeAdmin);
router.put("/admins/:id/role", authenticateUser, roleCheck(['SUPER_ADMIN']), updateAdminRole);
router.put("/promote-to-admin", authenticateUser, roleCheck(['SUPER_ADMIN']), promoteToAdmin);

module.exports = router; 