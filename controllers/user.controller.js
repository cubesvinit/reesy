const usersService = require("../services/user.service.js");
const { validationResult } = require("express-validator");
const fs = require("fs");

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

exports.sign_up = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.sign_up(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.login(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.verification_for_email = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.verification_for_email(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.login_by_thirdparty = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.login_by_thirdparty(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.forgot_password = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.forgot_password(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.reset_password = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.reset_password(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.change_password = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.change_password(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.edit_profile = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.edit_profile(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.list_notification = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.list_notification(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.logout = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.logout(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};

exports.delete_user_account = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  usersService.delete_user_account(req, (err, data) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
};
