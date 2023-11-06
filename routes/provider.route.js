const providerController = require("../controllers/provider.controller.js");
const authenticate = require("../middleware/authenticate.js");
const { check, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/images" });

router.post("/list_category", providerController.list_category);
router.post("/list_benefit", providerController.list_benefit);
router.post("/list_service_gender", providerController.list_service_gender);
router.post("/list_service_color", providerController.list_service_color);
router.post("/list_amenities", providerController.list_amenities);
router.post("/list_avtar", providerController.list_avtar);

router.post(
  "/upload_profile_pic",
  upload.fields([{ name: "profile_pic", maxCount: 1 }]),
  [authenticate],
  providerController.upload_profile_pic
);

router.post(
  "/account_setup",
  upload.fields([{ name: "image", maxCount: 10 }]),
  [
    check("bussiness_name").not().isEmpty().trim().escape(),
    check("country_code").not().isEmpty().trim().escape(),
    check("iso_code").not().isEmpty().trim().escape(),
    check("phone_number").not().isEmpty().trim().escape(),
    check("street_address1").not().isEmpty().trim().escape(),
    check("city").not().isEmpty().trim().escape(),
    check("zipcode").not().isEmpty().trim().escape(),
    check("bussiness_lat").not().isEmpty().trim().escape(),
    check("bussiness_long").not().isEmpty().trim().escape(),
    check("benefit_id").not().isEmpty().trim().escape(),
    check("gender_id").not().isEmpty().trim().escape(),
    check("membership_protection").not().isEmpty().trim().escape(),
    check("agreement_protection").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.account_setup
);

router.post(
  "/add_service",
  [
    check("service_name").not().isEmpty().trim().escape(),
    check("category_id").not().isEmpty().trim().escape(),
    check("service_duration").not().isEmpty().trim().escape(),
    check("service_price").not().isEmpty().trim().escape(),
    check("color_id").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_service
);

router.post(
  "/list_service",
  [check("page_no").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.list_service
);

router.post(
  "/edit_service",
  [check("service_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.edit_service
);

router.post(
  "/delete_service",
  [check("service_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.delete_service
);

router.post(
  "/add_workplace_image",
  upload.fields([{ name: "image", maxCount: 10 }]),
  [authenticate],
  providerController.add_workplace_image
);

router.post(
  "/list_workplace_image",
  [authenticate],
  providerController.list_workplace_image
);

router.post(
  "/delete_workplace_image",
  [check("image_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.delete_workplace_image
);

router.post(
  "/edit_bussiness_hour",
  [authenticate],
  providerController.edit_bussiness_hour
);

router.post(
  "/edit_daywise_bussiness_hour",
  [authenticate],
  providerController.edit_daywise_bussiness_hour
);

router.post(
  "/delete_break",
  [check("break_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.delete_break
);

router.post(
  "/add_staff_member",
  upload.fields([{ name: "profile_pic", maxCount: 1 }]),
  [
    check("first_name").not().isEmpty().trim().escape(),
    check("last_name").not().isEmpty().trim().escape(),
    check("country_code").not().isEmpty().trim().escape(),
    check("iso_code").not().isEmpty().trim().escape(),
    check("phone_number").not().isEmpty().trim().escape(),
    check("email_id").not().isEmpty().trim().escape(),
    check("is_available").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_staff_member
);

router.post(
  "/edit_staff_member",
  upload.fields([{ name: "profile_pic", maxCount: 1 }]),
  [check("user_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.edit_staff_member
);

router.post(
  "/list_staff_member",
  [authenticate],
  providerController.list_staff_member
);

router.post(
  "/delete_staff_member",
  upload.fields([{ name: "profile_pic", maxCount: 1 }]),
  [check("user_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.delete_staff_member
);

router.post(
  "/add_provider_amenities",
  [check("amenity_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.add_provider_amenities
);

router.post(
  "/edit_provider_amenities",
  [authenticate],
  providerController.edit_provider_amenities
);

router.post(
  "/list_review",
  [check("page_no").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.list_review
);

router.post(
  "/add_time_reservation",
  [
    check("reservation_date").not().isEmpty().trim().escape(),
    check("start_time").not().isEmpty().trim().escape(),
    check("end_time").not().isEmpty().trim().escape(),
    check("member_id").not().isEmpty().trim().escape(),
    check("reason_text").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_time_reservation
);

router.post(
  "/edit_time_reservation",
  [check("reservation_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.edit_time_reservation
);

router.post(
  "/delete_time_reservation",
  [check("reservation_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.delete_time_reservation
);

router.post(
  "/add_message_blast",
  upload.fields([{ name: "image", maxCount: 1 }]),
  [
    check("is_active").not().isEmpty().trim().escape(),
    check("regular_message_text").not().isEmpty().trim().escape(),
    check("push_message_text").not().isEmpty().trim().escape(),
    check("message_title").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_message_blast
);

router.post(
  "/edit_message_blast",
  upload.fields([{ name: "image", maxCount: 1 }]),
  [authenticate],
  providerController.edit_message_blast
);

router.post("/list_promote_plan", providerController.list_promote_plan);

router.post("/list_promotion", providerController.list_promotion);

router.post(
  "/promote_saloon",
  [
    check("plan_id").not().isEmpty().trim().escape(),
    check("start_date").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.promote_saloon
);

router.post(
  "/add_announcement",
  [
    check("start_date").not().isEmpty().trim().escape(),
    check("end_date").not().isEmpty().trim().escape(),
    check("message_text").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_announcement
);

router.post(
  "/edit_announcement",
  [authenticate],
  providerController.edit_announcement
);

router.post(
  "/delete_announcement",
  [authenticate],
  providerController.delete_announcement
);

router.post(
  "/add_flash_sale_promotion",
  [
    check("discount").not().isEmpty().trim().escape(),
    check("time_period").not().isEmpty().trim().escape(),
    check("service_id").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_flash_sale_promotion
);

router.post(
  "/edit_flash_sale_promotion",
  [authenticate],
  providerController.edit_flash_sale_promotion
);

router.post(
  "/delete_promotion",
  [check("promotion_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.delete_promotion
);

router.post(
  "/add_last_minute_discount",
  [
    check("discount").not().isEmpty().trim().escape(),
    check("booking_window_hour").not().isEmpty().trim().escape(),
    check("service_id").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_last_minute_discount
);

router.post(
  "/edit_last_minute_discount",
  [authenticate],
  providerController.edit_last_minute_discount
);

router.post(
  "/get_happy_hour",
  [authenticate],
  providerController.get_happy_hour
);

router.post(
  "/edit_daywise_happy_hour",
  [check("promotion_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.edit_daywise_happy_hour
);

router.post(
  "/add_client",
  [
    check("first_name").not().isEmpty().trim().escape(),
    check("last_name").not().isEmpty().trim().escape(),
    check("email_id").not().isEmpty().trim().escape(),
    check("country_code").not().isEmpty().trim().escape(),
    check("iso_code").not().isEmpty().trim().escape(),
    check("phone_number").not().isEmpty().trim().escape(),
    check("date_of_birth").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_client
);

router.post(
  "/list_client",
  [check("page_no").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.list_client
);

router.post(
  "/list_upcoming_birthday_client",
  [check("page_no").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.list_upcoming_birthday_client
);

router.post(
  "/get_birthday_client_profile",
  [check("page_no").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.list_upcoming_birthday_client
);

router.post(
  "/edit_provider_benefit",
  [authenticate],
  providerController.edit_provider_benefit
);

router.post(
  "/create_checkout",
  [
    check("client_id").not().isEmpty().trim().escape(),
    check("amount").not().isEmpty().trim().escape(),
    check("service_id").not().isEmpty().trim().escape(),
    check("discount").not().isEmpty().trim().escape(),
    check("total_amount").not().isEmpty().trim().escape(),
    check("payment_method").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.create_checkout
);

router.post(
  "/get_staff_member",
  [check("user_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.get_staff_member
);

router.post(
  "/get_opening_calender",
  [check("calender_date").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.get_opening_calender
);

router.post(
  "/add_workshift",
  [
    check("calender_date").not().isEmpty().trim().escape(),
    check("member_id").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.add_workshift
);

router.post(
  "/edit_workshift",
  [
    check("calender_date").not().isEmpty().trim().escape(),
    check("member_id").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.edit_workshift
);

router.post(
  "/list_all_member_workshift",
  [check("calender_date").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.list_all_member_workshift
);

router.post(
  "/list_member_workshift",
  [check("member_id").not().isEmpty().trim().escape()],
  [authenticate],
  providerController.list_member_workshift
);

router.post(
  "/list_reason",
  providerController.list_reason
);

router.post(
  "/get_time_slot",
  [
    check("member_id").not().isEmpty().trim().escape(),
    check("booking_date").not().isEmpty().trim().escape(),
  ],
  [authenticate],
  providerController.get_time_slot
);

module.exports = router;
