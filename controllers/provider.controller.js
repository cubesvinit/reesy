const providerService = require("../services/provider.service.js");
const { validationResult } = require("express-validator");
const fs = require("fs");

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

exports.list_category = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_category(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_benefit = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_benefit(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_service_gender = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_service_gender(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_service_color = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_service_color(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_amenities = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_amenities(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_avtar = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_avtar(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.upload_profile_pic = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.upload_profile_pic(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.account_setup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.account_setup(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_service = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.add_service(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_service = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_service(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_service = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_service(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.delete_service = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.delete_service(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_workplace_image = (req, res) => {
  const errors = validationResult(req);
  var err = errors.array();
  var validateobj = {
    msg: "Invalid value",
    param: "image",
    location: "body",
  };
  if (req.files == undefined || isEmpty(req.files)) {
    if (req.files == undefined) {
      err.push(validateobj);
    } else if (req.files.image == undefined) {
      err.push(validateobj);
    } else if (req.files.image != undefined) {
      fs.unlinkSync(req.files.image);
    }
    return res.status(422).json({ errors: err });
  }
  providerService.add_workplace_image(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_workplace_image = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_workplace_image(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.delete_workplace_image = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.delete_workplace_image(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_bussiness_hour = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_bussiness_hour(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_daywise_bussiness_hour = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_daywise_bussiness_hour(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.delete_break = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.delete_break(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_staff_member = (req, res) => {
  const errors = validationResult(req);
  var err = errors.array();
  var validateobj = {
    msg: "Invalid value",
    param: "profile_pic",
    location: "body",
  };
  if (!errors.isEmpty() || req.files == undefined || isEmpty(req.files)) {
    if (!errors.isEmpty() && req.files == undefined) {
      err.push(validateobj);
    } else if (errors.isEmpty() && req.files.profile_pic == undefined) {
      err.push(validateobj);
    } else if (!errors.isEmpty() && req.files.profile_pic != undefined) {
      fs.unlinkSync(req.files.profile_pic);
    }
    return res.status(422).json({ errors: err });
  }
  providerService.add_staff_member(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_staff_member = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_staff_member(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_staff_member = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_staff_member(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.delete_staff_member = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.delete_staff_member(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_provider_amenities = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.add_provider_amenities(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_provider_amenities = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_provider_amenities(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_review = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_review(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_time_reservation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.add_time_reservation(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_time_reservation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_time_reservation(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.delete_time_reservation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.delete_time_reservation(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_message_blast = (req, res) => {
  const errors = validationResult(req);
  var err = errors.array();
  var validateobj = {
    msg: "Invalid value",
    param: "image",
    location: "body",
  };
  if (!errors.isEmpty() || req.files == undefined || isEmpty(req.files)) {
    if (!errors.isEmpty() && req.files == undefined) {
      err.push(validateobj);
    } else if (errors.isEmpty() && req.files.image == undefined) {
      err.push(validateobj);
    } else if (!errors.isEmpty() && req.files.image != undefined) {
      fs.unlinkSync(req.files.image);
    }
    return res.status(422).json({ errors: err });
  }
  providerService.add_message_blast(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_message_blast = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_message_blast(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_promote_plan = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_promote_plan(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_promotion = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_promotion(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.promote_saloon = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.promote_saloon(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_announcement = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.add_announcement(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_announcement = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_announcement(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.delete_announcement = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.delete_announcement(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_flash_sale_promotion = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.add_flash_sale_promotion(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_flash_sale_promotion = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_flash_sale_promotion(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.delete_promotion = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.delete_promotion(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_last_minute_discount = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.add_last_minute_discount(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_last_minute_discount = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_last_minute_discount(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.get_happy_hour = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.get_happy_hour(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_daywise_happy_hour = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_daywise_happy_hour(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_client = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.add_client(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_client = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_client(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_upcoming_birthday_client = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_upcoming_birthday_client(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_provider_benefit = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_provider_benefit(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.create_checkout = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.create_checkout(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.get_staff_member = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.get_staff_member(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.get_opening_calender = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.get_opening_calender(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.add_workshift = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.add_workshift(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_workshift = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.edit_workshift(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_all_member_workshift = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_all_member_workshift(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_member_workshift = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_member_workshift(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_reason = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.list_reason(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.get_time_slot = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  providerService.get_time_slot(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};
