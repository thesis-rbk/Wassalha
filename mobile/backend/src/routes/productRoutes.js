const express = require("express");
const {
  checkIllegalItems,
  verifyProduct,
  confirmProduct,
  requestNewPhoto,
} = require("../controllers/productController");
const upload = require("../middleware/multerMiddleware");
const router = express.Router();

// New route for checking illegal items
router.post("/check-illegal", checkIllegalItems);
router.post("/verify-product", upload.single("file"), verifyProduct);
router.post("/confirm-product", confirmProduct);
router.post("/request-new-photo", requestNewPhoto);

module.exports = router;
