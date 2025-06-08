const express = require("express");
const router = express.Router();

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadProfile } = require("../middlewares/uploadMiddleware");
const adminController = require("../controllers/adminController");

// Apply both auth and admin checks
// router.use(authMiddleware, isAdmin);

router.post("/login", adminController.loginAdminUser);

// Admin-only operations
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id",uploadProfile.single("image"), adminController.updateUser
); // Using uploadProfile for profile image
router.delete("/users/:id", adminController.deleteUser);

//// from user routes
// router.get("/get/all/otps", userController.getAllOtps);
// router.get("/", userController.getAllUsers);
// router.delete("/:id", authMiddleware, userController.deleteUser);
// router.get("/:id", authMiddleware, userController.getUserById);

module.exports = router;
