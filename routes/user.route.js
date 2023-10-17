const usersController = require("../controllers/user.controller.js");
const authenticate = require("../middleware/authenticate.js");
const { check, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/images" });

router.post(
  "/sign_up",
  [
    check("user_role").not().isEmpty().trim().escape(),
    check("first_name").not().isEmpty().trim().escape(),
    check("last_name").not().isEmpty().trim().escape(),
    check("email_id").not().isEmpty().trim().escape(),
    check("password").not().isEmpty().trim().escape(),
    check("latitude").not().isEmpty().trim().escape(),
    check("longitude").not().isEmpty().trim().escape(),
    check("device_id").not().isEmpty().trim().escape(),
    check("device_type").not().isEmpty().trim().escape(),
    check("device_token").not().isEmpty().trim().escape(),
  ],
  usersController.sign_up
);

router.post(
  "/login",
  [
    check("user_role").not().isEmpty().trim().escape(),
    check("email_id").not().isEmpty().trim().escape(),
    check("password").not().isEmpty().trim().escape(),
    check("device_type").not().isEmpty().trim().escape(),
    check("device_id").not().isEmpty().trim().escape(),
    check("device_token").not().isEmpty().trim().escape(),
  ],
  usersController.login
);

router.post(
  "/verification_for_email",
  [
    check("email_id").not().isEmpty().trim().escape(),
    check("temp_pass").not().isEmpty().trim().escape(),
    check("is_login").not().isEmpty().trim().escape(),
  ],
  usersController.verification_for_email
);

router.post(
  "/login_by_thirdparty",
  [
    check("user_role").not().isEmpty().trim().escape(),
    check("login_type").not().isEmpty().trim().escape(),
    check("thirdparty_id").not().isEmpty().trim().escape(),
    check("device_id").not().isEmpty().trim().escape(),
    check("device_type").not().isEmpty().trim().escape(),
    check("device_token").not().isEmpty().trim().escape(),
  ],
  usersController.login_by_thirdparty
);

router.post(
  "/forgot_password",
  [
    check("email_id").not().isEmpty().trim().escape(),
    check("user_role").not().isEmpty().trim().escape(),
  ],
  usersController.forgot_password
);

router.post(
  "/reset_password",
  [
    check("email_id").not().isEmpty().trim().escape(),
    check("new_pass").not().isEmpty().trim().escape(),
  ],
  usersController.reset_password
);

router.post(
  "/change_password",
  [
    check("password").not().isEmpty().trim().escape(),
    check("new_pass").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  usersController.change_password
);

router.post(
  "/edit_profile",
  upload.fields([{ name: "profile_pic", maxCount: 1 }]),
  [authenticate],
  usersController.edit_profile
);

router.post(
  "/list_notification",
  [check("page_no").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.list_notification
);

router.post(
  "/log_out",
  [check("device_id").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.logout
);

router.post(
  "/delete_user_account",
  [authenticate],
  usersController.delete_user_account
);

module.exports = router;
