const providerService = require("../services/provider.service.js");
const { validationResult } = require("express-validator");
const fs = require("fs");

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

exports.upload_profile_pic = (req, res) => {
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
