const providerController = require("../controllers/provider.controller.js");
const authenticate = require("../middleware/authenticate.js");
const { check, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/images" });

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
    check("street_address2").not().isEmpty().trim().escape(),
    check("city").not().isEmpty().trim().escape(),
    check("zipcode").not().isEmpty().trim().escape(),
    check("bussiness_lat").not().isEmpty().trim().escape(),
    check("bussiness_long").not().isEmpty().trim().escape(),
    check("benefit_id").not().isEmpty().trim().escape(),
    check("gender_id").not().isEmpty().trim().escape(),
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

module.exports = router;
