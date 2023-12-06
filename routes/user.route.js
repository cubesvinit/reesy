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
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "cover_pic", maxCount: 1 },
  ]),
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

router.post(
  "/add_review",
  [
    check("review_to").not().isEmpty().trim().escape(),
    check("booking_id").not().isEmpty().trim().escape(),
    check("saloon_atmosphere_star").not().isEmpty().trim().escape(),
    check("saloon_service_star").not().isEmpty().trim().escape(),
    check("saloon_cleanliness_star").not().isEmpty().trim().escape(),
    check("overall_star").not().isEmpty().trim().escape(),
    check("review_text").not().isEmpty().trim().escape(),
    check("is_reservation_when_you_arrived").not().isEmpty().trim().escape(),
    check("is_you_saw_on_reesy").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  usersController.add_review
);

router.post(
  "/add_support",
  [
    check("full_name").not().isEmpty().trim().escape(),
    check("email_id").not().isEmpty().trim().escape(),
    check("message_text").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  usersController.add_support
);

router.post(
  "/get_main_data",
  [
    check("user_id").not().isEmpty().trim().escape(),
    check("latitude").not().isEmpty().trim().escape(),
    check("longitude").not().isEmpty().trim().escape(),
    check("category_id").not().isEmpty().trim().escape(),
    check("page_no").not().isEmpty().trim().escape(),
  ],
  usersController.get_main_data
);

router.post(
  "/get_map_screen_data",
  [
    check("user_id").not().isEmpty().trim().escape(),
    check("latitude").not().isEmpty().trim().escape(),
    check("longitude").not().isEmpty().trim().escape(),
    check("category_id").not().isEmpty().trim().escape(),
  ],
  usersController.get_map_screen_data
);

router.post(
  "/recently_viewed_saloon_data",
  [
    check("user_id").not().isEmpty().trim().escape(),
    check("latitude").not().isEmpty().trim().escape(),
    check("longitude").not().isEmpty().trim().escape(),
    check("category_id").not().isEmpty().trim().escape(),
    check("page_no").not().isEmpty().trim().escape(),
  ],
  usersController.recently_viewed_saloon_data
);

router.post(
  "/like_unlike_saloon",
  [check("user_id").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.like_unlike_saloon
);

router.post(
  "/get_my_favourite_saloon",
  [check("page_no").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.get_my_favourite_saloon
);

router.post(
  "/get_saloon_details",
  [check("user_id").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.get_saloon_details
);

router.post(
  "/get_saloon_details",
  [check("user_id").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.get_saloon_details
);

router.post(
  "/get_booking_available_timeslot",
  [
    check("saloon_id").not().isEmpty().trim().escape(),
    check("member_id").not().isEmpty().trim().escape(),
    check("booking_date").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  usersController.get_booking_available_timeslot
);

router.post(
  "/add_booking",
  [
    check("booking_to").not().isEmpty().trim().escape(),
    check("booking_date").not().isEmpty().trim().escape(),
    check("amount").not().isEmpty().trim().escape(),
    check("taxes_fee").not().isEmpty().trim().escape(),
    check("reesy_point").not().isEmpty().trim().escape(),
    check("redeem_amount").not().isEmpty().trim().escape(),
    check("total_amount").not().isEmpty().trim().escape(),
    check("member_id").not().isEmpty().trim().escape(),
    check("time_slot").not().isEmpty().trim().escape(),
    check("service_id").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  usersController.add_booking
);

router.post(
  "/make_payment",
  [
    check("booking_id").not().isEmpty().trim().escape(),
    check("is_payment").not().isEmpty().trim().escape(),
    check("paymentintentid").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  usersController.make_payment
);

router.post(
  "/get_reservation",
  [authenticate],
  usersController.get_reservation
);

router.post(
  "/get_reservation_details",
  [check("booking_id").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.get_reservation_details
);

router.post(
  "/cancle_reservation",
  [check("booking_id").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.cancle_reservation
);

router.post(
  "/get_reesy_point_history",
  [check("page_no").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.get_reesy_point_history
);

router.post(
  "/list_my_review",
  [check("booking_id").not().isEmpty().trim().escape()],
  [authenticate],
  usersController.list_my_review
);

router.post(
  "/get_testing_timeslot",
  usersController.get_testing_timeslot
);

module.exports = router;
