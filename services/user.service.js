const db = require("../config/db.config.js");
const usersService = require("../services/user.service.js");
const md5 = require("md5");
const sendPush = require("../services/push.service.js");
const fs = require("fs");
const moment = require("moment");
const each = require("async-each-series");
const async = require("async");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const hee = require("he");

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function DeleteKeys(myObj, array) {
  for (let index = 0; index < array.length; index++) {
    delete myObj[array[index]];
  }
  return myObj;
}

function makeotp(length) {
  var result = "";
  var characters = "123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.findExits = (baseTable, baseIArr, result) => {
  db.query(
    "SELECT * FROM " + baseTable + " WHERE " + baseIArr + " limit 1 ",
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.length > 0) {
        result(null, true);
      } else {
        result(null, false);
      }
    }
  );
};

exports.findByUserId = (user_id, result) => {
  db.query(
    "select * from tbl_token t1 join tbl_users t2 on t1.user_id = t2.user_id where t1.user_id = ? ",
    [user_id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        res[0].isData = 1;
        result(null, res[0]);
        return;
      }
      result(null, { isData: 0 });
    }
  );
};

exports.findByNumber = (phone_number, country_code, result) => {
  db.query(
    "select * from tbl_users where phone_number = ? AND country_code = ? AND user_role != 3",
    [phone_number, country_code],
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        result(null, res[0]);
      }
    }
  );
};

exports.findByMail = (email_id, result) => {
  db.query(
    "select * from tbl_users where email_id = ? AND user_role != 3",
    [email_id],
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        result(null, res[0]);
      }
    }
  );
};

exports.checkEmailOtp = (user_id, email_otp, result) => {
  db.query(
    "update tbl_users set is_email_verified = 1, temp_pass = null where user_id = ? and temp_pass = ?",
    [user_id, email_otp],
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        result(null, res.changedRows);
      }
    }
  );
};

exports.manage_token = (token_data, result) => {
  var baseIArr =
    '`device_id` = "' +
    token_data.device_id +
    '" and `user_id` = "' +
    token_data.user_id +
    '"';
  usersService.findExits("tbl_token", baseIArr, (err, data) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    } else {
      if (data) {
        db.query(
          "UPDATE tbl_token SET device_token = ? WHERE device_id = ? and user_id = ?",
          [token_data.device_token, token_data.device_id, token_data.user_id],
          (err, res) => {
            if (err) {
              console.log("error: ", err);
              result(err, null);
              return;
            } else {
              db.query(
                "select * from tbl_token t1 join tbl_users t2 on t1.user_id = t2.user_id where t1.user_id = ? ",
                [token_data.user_id],
                (err, res5) => {
                  if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                  } else {
                    result(null, res5);
                    return;
                  }
                }
              );
            }
          }
        );
      } else {
        db.query("INSERT INTO tbl_token SET ?", [token_data], (err, res2) => {
          if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
          } else {
            db.query(
              "select * from tbl_token t1 join tbl_users t2 on t1.user_id = t2.user_id where t1.user_id = ? ",
              [token_data.user_id],
              (err, res5) => {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                  return;
                } else {
                  result(null, res5);
                  return;
                }
              }
            );
          }
        });
      }
    }
  });
};

exports.send_notification = (other_id, text, type) => {
  var Data = {
    title: "Reesy",
    text: text,
    notification_type: type,
  };
  pishInfo = {
    notification: {
      title: "Reesy",
      body: text,
      text: text,
      msg: text,
      sound: "default",
    },
    data: Data,
    ios_badgeType: "Increase",
    ios_badgeCount: 1,
  };
  sendPush.SendPushNotification(other_id, pishInfo);
};

exports.sign_up = (req, result) => {
  var body = {};
  usersService.findByMail(req.body.email_id, (err, res2) => {
    if (err) {
      console.log(err);
    } else {
      if (res2) {
        body.Status = 0;
        body.Message = "An account already exists with your email";
        result(null, body);
        return;
      } else {
        if (req.body.user_role == "user") {
          usersService.findByNumber(
            req.body.phone_number,
            req.body.country_code,
            (err, res3) => {
              if (err) {
                console.log(err);
              } else {
                if (res3) {
                  body.Status = 0;
                  body.Message =
                    "An account already exists with your phonenumber";
                  result(null, body);
                  return;
                }
              }
            }
          );
        }
        var temp_pass = makeotp(4);
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "cubes.dev14@gmail.com",
            pass: "fwirjdjbvaufppqc",
          },
        });

        var mailOptions = {
          from: "cubes.dev14@gmail.com",
          to: req.body.email_id,
          subject: "Email Verification For Reesy App",
          text: "Your One Time Password For Reesy Is " + temp_pass,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            body.Status = 0;
            body.info = error;
            body.Message = "Email id is not Valid";
            result(null, body);
          } else {
            var user_data = {
              temp_pass: temp_pass,
              user_role: req.body.user_role,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              email_id: req.body.email_id,
              password: md5(req.body.password),
              latitude: req.body.latitude,
              longitude: req.body.longitude,
            };
            if (req.body.date_of_birth) {
              user_data.date_of_birth = hee.decode(req.body.date_of_birth);
            }
            if (req.body.country_code) {
              user_data.country_code = req.body.country_code;
            }
            if (req.body.iso_code) {
              user_data.iso_code = req.body.iso_code;
            }
            if (req.body.phone_number) {
              user_data.phone_number = req.body.phone_number;
            }
            db.query("INSERT INTO tbl_users SET ?", user_data, (err, res) => {
              if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
              } else {
                var token_data = {
                  device_token: req.body.device_token,
                  device_type: req.body.device_type,
                  device_id: req.body.device_id,
                  user_id: res.insertId,
                };
                const sign = {
                  sub: res.insertId, // Identifies the subject of the JWT.
                };
                usersService.manage_token(token_data, (err, res2) => {
                  if (err) {
                    res.send(err);
                  } else {
                    body.Status = 1;
                    body.Message = "OTP sent to your verified email";
                    body.temp_pass = temp_pass;
                    result(null, body);
                    return;
                  }
                });
              }
            });
          }
        });
      }
    }
  });
};

exports.login = (req, result) => {
  var body = {};
  var user_role = req.body.user_role;
  var email_id = req.body.email_id;
  var password = md5(req.body.password);
  db.query(
    "SELECT * FROM tbl_users WHERE email_id = ? AND password = ? AND user_role = ?",
    [email_id, password, user_role],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        if (res.length == 0) {
          body.Status = 0;
          body.Message = "Email and password does not match our records.";
          result(null, body);
          return;
        } else {
          var data = res[0];
          if (data.is_block == 1) {
            body.Status = 0;
            body.Message =
              "An account blocked with your Email. Please contact to admin.";
            result(null, body);
            return;
          } else if (data.is_delete == 1) {
            body.Status = 0;
            body.Message =
              "An account deleted with your Email. Please contact to admin.";
            result(null, body);
            return;
          } else {
            var token_data = {
              device_token: req.body.device_token,
              device_type: req.body.device_type,
              device_id: req.body.device_id,
              user_id: data.user_id,
            };

            const sign = {
              sub: data.user_id,
            };
            if (data.is_email_verified == 1) {
              usersService.manage_token(token_data, (err, data2) => {
                if (err) {
                  result(err, null);
                  return;
                } else {
                  body.Status = 1;
                  body.Message = "Login successful";
                  body.UserToken = jwt.sign(sign, "dont_be_oversmart");
                  body.info = data2[0];
                  result(null, body);
                  return;
                }
              });
            } else {
              usersService.findByMail(req.body.email_id, (err, res) => {
                if (res) {
                  var temp_pass = makeotp(4);
                  var transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                      user: "cubes.dev14@gmail.com",
                      pass: "fwirjdjbvaufppqc",
                    },
                  });

                  var mailOptions = {
                    from: "cubes.dev14@gmail.com",
                    to: req.body.email_id,
                    subject: "Email Verification For Reesy App",
                    text:
                      "Your One Time Password For Reesy App Is " + temp_pass,
                  };

                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      body.Status = 0;
                      body.Message = "Email id is not Valid";
                      body.info = error;
                      result(null, body);
                      return;
                    } else {
                      db.query(
                        "UPDATE tbl_users SET temp_pass = ? WHERE email_id = ?",
                        [temp_pass, email_id],
                        (err, res) => {
                          if (err) {
                            body.Status = 0;
                            body.Message = "Invalid credential";
                            result(null, body);
                            return;
                          } else {
                            body.Status = 2;
                            body.Message = "Please verify your Email first";
                            result(null, body);
                            return;
                          }
                        }
                      );
                    }
                  });
                } else {
                  body.Status = 0;
                  body.Message = "Email id Does not match over records";
                  result(null, body);
                  return;
                }
              });
            }
          }
        }
      }
    }
  );
};

exports.verification_for_email = (req, result) => {
  var body = {};
  usersService.findByMail(req.body.email_id, (err, res1) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    } else {
      if (res1 != null) {
        var user_id = res1.user_id;
        var temp_pass = req.body.temp_pass;
        usersService.checkEmailOtp(user_id, temp_pass, (err, res2) => {
          if (res2 == 1) {
            usersService.findByUserId(user_id, (err, res3) => {
              if (res3 != undefined) {
                const sign = {
                  sub: user_id,
                };
                body.Status = 1;
                body.Message =
                  req.body.is_login == 0
                    ? "Registration successful"
                    : req.body.is_login == 1
                    ? "Login successful"
                    : "Email verification successfully done";

                if (
                  (req.body.is_login == 0 || req.body.is_login == 1) &&
                  res1.user_role == "user"
                ) {
                  body.info = res3;
                  body.UserToken = jwt.sign(sign, "dont_be_oversmart");
                } else if (
                  (req.body.is_login == 0 || req.body.is_login == 1) &&
                  res1.user_role == "provider"
                ) {
                  body.UserToken = jwt.sign(sign, "dont_be_oversmart");
                  body.first_name = res3.first_name;
                  body.last_name = res3.last_name;
                } else {
                  body.UserToken = jwt.sign(sign, "dont_be_oversmart");
                }
                return result(null, body);
              }
            });
          } else {
            body.Status = 0;
            body.Message = "Wrong email OTP";
            body.info = {};
            result(null, body);
            return;
          }
        });
      } else {
        body.Status = 0;
        body.Message = "Email id Does not match over records";
        result(null, body);
        return;
      }
    }
  });
};

exports.login_by_thirdparty = (req, result) => {
  var user_data = {};
  const sign = {};
  var body = {};
  function signupdata(userdata, tokendata) {
    db.query("INSERT INTO tbl_users SET ?", [userdata], (err, res3) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        tokendata.user_id = res3.insertId;
        sign.sub = res3.insertId;
        usersService.manage_token(tokendata, (err, res4) => {
          if (err) {
            console.log("error", err);
            result(err, null);
            return;
          } else {
            body.Status = 1;
            body.Message = "Registration successful";
            body.info = res4[0];
            body.UserToken = jwt.sign(sign, "dont_be_oversmart");
            result(null, body);
            return;
          }
        });
      }
    });
  }
  var email_id = req.body.email_id ? req.body.email_id : "";
  db.query(
    "Select * from tbl_users where (thirdparty_id = ? OR email_id = ?)",
    [req.body.thirdparty_id, email_id],
    (err, data) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      } else {
        var token_data = {
          device_token: req.body.device_token,
          device_type: req.body.device_type,
          device_id: req.body.device_id,
        };
        user_data.thirdparty_id = req.body.thirdparty_id;
        user_data.is_email_verified = 1;
        if (req.body.first_name) {
          user_data.first_name = req.body.first_name;
        }
        if (req.body.date_of_birth) {
          user_data.date_of_birth = hee.decode(req.body.date_of_birth);
        }
        if (req.body.last_name) {
          user_data.last_name = req.body.last_name;
        }
        if (req.body.email_id) {
          user_data.email_id = req.body.email_id;
        }
        if (req.body.login_type) {
          user_data.login_type = req.body.login_type;
        }
        if (req.body.user_role) {
          user_data.user_role = req.body.user_role;
        }
        if (req.body.latitude) {
          user_data.latitude = req.body.latitude;
        }
        if (req.body.longitude) {
          user_data.longitude = req.body.longitude;
        }
        if (req.body.country_code) {
          user_data.country_code = req.body.country_code;
        }
        if (req.body.iso_code) {
          user_data.iso_code = req.body.iso_code;
        }
        if (req.body.phone_number) {
          user_data.phone_number = req.body.phone_number;
        }
        if (data.length <= 0) {
          console.log("sign up");
          if (req.body.user_role == "user") {
            usersService.findByNumber(
              req.body.phone_number,
              req.body.country_code,
              (err, res3) => {
                if (err) {
                  console.log(err);
                } else {
                  if (res3) {
                    body.Status = 0;
                    body.Message =
                      "An account already exists with your phonenumber";
                    result(null, body);
                    return;
                  } else {
                    signupdata(user_data, token_data);
                  }
                }
              }
            );
          } else {
            signupdata(user_data, token_data);
          }
        } else {
          console.log("data",data);
          if (data[0].is_block == 1) {
            body.Status = 0;
            body.Message =
              "An account blocked with your email. Please contact to admin.";
            result(null, body);
            return;
          } else if (data[0].is_delete == 1) {
            body.Status = 0;
            body.Message =
              "An account deleted with your email. Please contact to admin.";
            result(null, body);
            return;
          } else if (data[0].login_type != req.body.login_type) {
            body.Status = 0;
            body.Message = "You are login with another login method";
            result(null, body);
            return;
          } else if (
            req.body.email_id &&
            data[0].email_id != null &&
            data[0].email_id != req.body.email_id
          ) {
            body.Status = 0;
            body.Message = "Please entre valid email";
            result(null, body);
            return;
          } else if (
            data[0].email_id == req.body.email_id &&
              data[0].user_role != req.body.user_role
          ) {
            body.Status = 0;
            body.Message = "An account already exists with your email_id";
            result(null, body);
            return;
          } else {
            db.query(
              "UPDATE tbl_users SET ? WHERE user_id = ?",
              [user_data, data[0].user_id],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                  result(err, null);
                  return;
                } else {
                  token_data.user_id = data[0].user_id;
                  sign.sub = data[0].user_id;
                  usersService.manage_token(token_data, (err, res2) => {
                    if (err) {
                      console.log("error", err);
                      result(err, null);
                      return;
                    } else {
                      body.Status = 1;
                      body.Message = "Login successful";
                      body.info = res2[0];
                      body.UserToken = jwt.sign(sign, "dont_be_oversmart");
                      result(null, body);
                      return;
                    }
                  });
                }
              }
            );
          }
        }
      }
    }
  );
};

exports.forgot_password = (req, result) => {
  var body = {};
  usersService.findByMail(req.body.email_id, (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      if (res) {
        if (res.user_role != req.body.user_role || res.login_type != 0) {
          body.Status = 0;
          body.Message = "You cannot forgot password for this Email";
          result(null, body);
          return;
        } else {
          var temp_pass = makeotp(4);
          var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "cubes.dev14@gmail.com",
              pass: "fwirjdjbvaufppqc",
            },
          });

          var mailOptions = {
            from: "cubes.dev14@gmail.com",
            to: req.body.email_id,
            subject: "Forgot Password For Reesy App",
            text: "Your One Time Password For Reesy Is " + temp_pass,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              body.Status = 0;
              body.Message = "Email id is not Valid";
              body.info = error;
              result(null, body);
              return;
            } else {
              db.query(
                "UPDATE tbl_users SET temp_pass = ? WHERE email_id = ?",
                [temp_pass, req.body.email_id],
                (err, res) => {
                  if (err) {
                    body.Status = 0;
                    body.Message = "Invalid credential";
                    result(null, body);
                    return;
                  } else {
                    body.Status = 1;
                    body.Message = "OTP sent your verified email";
                    body.temp_pass = temp_pass;
                    result(null, body);
                    return;
                  }
                }
              );
            }
          });
        }
      } else {
        body.Status = 0;
        body.Message = "Email id Does not match over records";
        result(null, body);
        return;
      }
    }
  });
};

exports.reset_password = (req, result) => {
  var body = {};
  usersService.findByMail(req.body.email_id, (err, res) => {
    if (res) {
      var new_pass = md5(req.body.new_pass);
      db.query(
        "UPDATE tbl_users SET password = ? WHERE email_id = ?",
        [new_pass, req.body.email_id],
        (err, res1) => {
          if (err) {
            console.log("error", err);
            result(err, null);
            return;
          } else {
            body.Status = 1;
            body.Message = "Reset password successful";
            result(null, body);
            return;
          }
        }
      );
    } else {
      body.Status = 0;
      body.Message = "Please Entre valid Email";
      result(null, body);
      return;
    }
  });
};

exports.change_password = (req, result) => {
  var body = {};
  var CurrrentPassword = md5(req.body.password);
  if (CurrrentPassword == req.user.password) {
    db.query(
      "UPDATE tbl_users SET password = ? WHERE user_id = ?",
      [md5(req.body.new_pass), req.user.user_id],
      (err, res1) => {
        if (err) {
          result(err, null);
          return;
        } else {
          body.Status = 1;
          body.Message = "Password changed successfully";
          result(null, body);
          return;
        }
      }
    );
  } else {
    body.Status = 0;
    body.Message = "Current password is wrong";
    result(null, body);
    return;
  }
};

exports.edit_profile = (req, result) => {
  var body = {};
  var update_data = {};
  usersService.findByNumber(
    req.body.phone_number,
    req.body.country_code,
    (err, res1) => {
      if (err) {
        result(err, null);
        return;
      } else {
        var phone = res1 ? res1.phone_number : req.user.phone_number;
        if (req.body.phone_number && phone != req.user.phone_number) {
          body.Status = 0;
          body.Message = "An account already exists with your Phone Number.";
          return result(null, body);
        } else {
          update_data.user_id = req.body.user_id
            ? req.body.user_id
            : req.user.user_id;
          if (req.body.first_name) {
            update_data.first_name = req.body.first_name;
          }
          if (req.body.last_name) {
            update_data.last_name = req.body.last_name;
          }
          if (req.body.country_code) {
            update_data.country_code = req.body.country_code;
          }
          if (req.body.iso_code) {
            update_data.iso_code = req.body.iso_code;
          }
          if (req.body.phone_number) {
            update_data.phone_number = req.body.phone_number;
          }
          if (req.body.date_of_birth) {
            update_data.date_of_birth = hee.decode(req.body.date_of_birth);
          }
          if (req.body.latitude) {
            update_data.latitude = req.body.latitude;
          }
          if (req.body.longitude) {
            update_data.longitude = req.body.longitude;
          }
          if (req.body.is_notification) {
            update_data.is_notification = req.body.is_notification;
          }
          if (req.body.is_location) {
            update_data.is_location = req.body.is_location;
          }
          if (req.body.bussiness_name) {
            update_data.bussiness_name = req.body.bussiness_name;
          }
          if (req.body.street_address1) {
            update_data.street_address1 = req.body.street_address1;
          }
          if (req.body.city) {
            update_data.city = req.body.city;
          }
          if (req.body.zipcode) {
            update_data.zipcode = req.body.zipcode;
          }
          if (req.body.bussiness_lat) {
            update_data.bussiness_lat = req.body.bussiness_lat;
          }
          if (req.body.bussiness_long) {
            update_data.bussiness_long = req.body.bussiness_long;
          }
          if (req.body.membership_protection) {
            update_data.membership_protection = req.body.membership_protection;
          }
          if (req.body.agreement_protection) {
            update_data.agreement_protection = req.body.agreement_protection;
          }
          if (req.body.avtar) {
            try {
              fs.unlinkSync(req.user.profile_pic);
            } catch (e) {
              console.log("Profile pic not found");
            }
            update_data.profile_pic = req.body.avtar;
          }
          if (req.files != undefined && req.files.profile_pic) {
            try {
              fs.unlinkSync(req.user.profile_pic);
            } catch (e) {
              console.log("Profile pic not found");
            }
            var ext = req.files.profile_pic[0].originalname.split(".").pop();
            ImageUrl_media = req.files.profile_pic[0].filename;
            ImageUrl_with__ext = req.files.profile_pic[0].filename + "." + ext;

            fs.renameSync(
              "uploads/images/" + ImageUrl_media,
              "uploads/images/" + ImageUrl_with__ext
            );
            var new_path = "uploads/images/" + ImageUrl_with__ext;
            update_data.profile_pic = new_path;
          }
          db.query(
            "UPDATE tbl_users SET ? WHERE user_id = ?",
            [update_data, update_data.user_id],
            (err, res) => {
              if (err) {
                result(err, null);
                return;
              } else {
                db.query(
                  "SELECT t1.* FROM tbl_users t1 WHERE t1.user_id = ?",
                  [update_data.user_id],
                  (err, res1) => {
                    if (err) {
                      result(err, null);
                      return;
                    } else {
                      if (res1.length <= 0) {
                        body.Status = 0;
                        body.Message = "User Not Found";
                        return result(null, body);
                      } else {
                        res1[0]["privacy_policy_url"] =
                          "https://www.google.com/";
                        res1[0]["terms_condition_url"] =
                          "https://www.google.com/";
                        body.Status = 1;
                        body.Message = "User profile edited successfully";
                        body.info = res1[0];
                        return result(null, body);
                      }
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
};

exports.list_notification = (req, result) => {
  var body = {};
  var limit = 15;
  var page_no = req.body.page_no;
  var offset = limit * (page_no - 1);
  db.query(
    "SELECT t1.*,t2.user_id,t2.first_name,t2.last_name,t2.profile_pic,\n\
    (SELECT COUNT(*) FROM tbl_notification t1 WHERE t1.notification_to = ?)as total_data\n\
     FROM tbl_notification t1 \n\
      JOIN tbl_users t2 ON t1.notification_by = t2.user_id\n\
       WHERE t1.notification_to = ? ORDER BY t1.notification_id DESC LIMIT " +
      limit +
      " OFFSET " +
      offset,
    [req.user.user_id, req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      } else {
        if (res.length <= 0) {
          body.Status = 1;
          body.Message = "No data found";
          body.total_page = 0;
          body.info = res;
          result(null, body);
          return;
        } else {
          db.query(
            "UPDATE tbl_notification SET notification_status = 1 WHERE notification_to = ?",
            [req.user.user_id],
            (err, res1) => {
              if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
              } else {
                body.Status = 1;
                body.Message = "Notification listed successful";
                body.total_page = Math.ceil(res[0].total_data / limit);
                body.info = res;
                result(null, body);
                return;
              }
            }
          );
        }
      }
    }
  );
};

exports.logout = (req, result) => {
  var body = {};
  usersService.findByUserId(req.user.user_id, (err, authData) => {
    if (err) {
      res.send(err);
    } else {
      if (authData.isData) {
        db.query(
          "DELETE FROM tbl_token WHERE device_id = ? AND user_id = ?",
          [req.body.device_id, req.user.user_id],
          (err, res) => {
            if (err) {
              result(err, null);
              return;
            } else {
              body.Status = 1;
              body.Message = "Logout successfully";
              result(null, body);
              return;
            }
          }
        );
      } else {
        body.Status = 0;
        body.Message = "Unauthorised User";
        return result(null, body);
      }
    }
  });
};

exports.delete_user_account = async (req, result) => {
  var body = {};
  var user = req.user.user_id;
  function returnfunction() {
    body.Status = 1;
    body.Message = "Account Deleted Success";
    return result(null, body);
  }

  async function deletedata() {
    //delete user
    try {
      fs.unlinkSync(req.user.profile_pic);
    } catch (e) {
      console.log("No Profile_pic found");
    }
    db.query("DELETE FROM tbl_users WHERE user_id = ?", [user], (err, res1) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      }
    });

    //delete tokens
    db.query("DELETE FROM tbl_token WHERE user_id = ?", [user], (err, res1) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      }
    });
  }
  await deletedata();
  returnfunction();
};

exports.add_review = (req, result) => {
  var body = {};
  var reviewData = {
    review_by: req.user.user_id,
    review_to: req.body.review_to,
    booking_id: req.body.booking_id,
    saloon_atmosphere_star: req.body.saloon_atmosphere_star,
    saloon_service_star: req.body.saloon_service_star,
    saloon_cleanliness_star: req.body.saloon_cleanliness_star,
    overall_star: req.body.overall_star,
    review_text: hee.decode(req.body.review_text),
  };

  db.query(
    "SELECT * FROM tbl_review WHERE review_by = ? AND review_to = ? AND booking_id = ?",
    [reviewData.review_by, reviewData.review_to, reviewData.booking_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        if (res.length <= 0) {
          db.query(
            "INSERT INTO tbl_review SET ?",
            [reviewData],
            (err, res1) => {
              if (err) {
                console.log("error", err);
                result(err, null);
                return;
              } else {
                var MSG =
                  req.user.first_name +
                  " " +
                  req.user.last_name +
                  " have been write a review.";
                var noti_type = 2;
                usersService.send_notification(
                  reviewData.review_to,
                  MSG,
                  noti_type
                );
                var notification_data = {
                  notification_by: req.user.user_id,
                  notification_to: reviewData.review_to,
                  notification_text: MSG,
                  notification_type: noti_type,
                };
                db.query(
                  "INSERT INTO tbl_notification SET ?",
                  [notification_data],
                  (err, resp) => {
                    if (err) {
                      console.log("error", err);
                      result(err, null);
                      return;
                    } else {
                      body.Status = 1;
                      body.Message = "Review added successful";
                      result(null, body);
                      return;
                    }
                  }
                );
              }
            }
          );
        } else {
          body.Status = 1;
          body.Message = "You have already added a review for this booking";
          result(null, body);
          return;
        }
      }
    }
  );
};

exports.add_support = (req, result) => {
  var body = {};
  req.body.user_id = req.user.user_id;
  req.body.message_text = hee.decode(req.body.message_text);
  db.query("INSERT INTO tbl_support SET ?", [req.body], (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Support added successful";
      result(null, body);
      return;
    }
  });
};

exports.get_main_data = (req, result) => {
  var body = {};
  var limit = 10;
  var page_no = req.body.page_no;
  var offset = (page_no - 1) * limit;
  var curernt_date = moment().format("YYYY-MM-DD");
  var search = "";
  if (req.body.search_text) {
    search = " AND t1.bussiness_name LIKE '%" + req.body.search_text + "%'";
  }
  var WHERE = "";
  if (req.body.category_id != 0) {
    WHERE = " AND is_category = 1";
  }
  if (req.body.benefit_id) {
    WHERE += " AND is_benefit = 1";
  } else {
    req.body.benefit_id = 0;
  }
  if (req.body.gender_id) {
    WHERE += " AND is_gender = 1";
  } else {
    req.body.gender_id = 0;
  }
  if (req.body.high_rated) {
    WHERE += " AND star_count >= 4";
  }
  var ORDER = " DESC";
  if (req.body.sort == 0) {
    ORDER = " ASC";
  }
  db.query(
    "SELECT t1.user_id,t1.bussiness_name,t1.street_address1,\n\
    t1.city,t1.zipcode,t1.bussiness_lat,t1.bussiness_long,\n\
    t1.membership_protection,t1.agreement_protection,IFNULL(t3.is_closed,0)as is_closed,\n\
    ROUND(IFNULL((SELECT AVG(t4.overall_star) FROM tbl_review t4 WHERE t1.user_id = t4.review_to),0),1)as star_count,\n\
    (SELECT COUNT(t5.category_id) FROM tbl_provider_service t5 WHERE t5.user_id = t1.user_id AND t5.category_id = " +
      req.body.category_id +
      ")as is_category,\n\
    (SELECT COUNT(t6.benefit_id) FROM tbl_provider_service_benefit t6 WHERE t6.user_id = t1.user_id AND t6.benefit_id IN ('" +
      req.body.benefit_id +
      "'))as is_benefit,\n\
    (SELECT COUNT(t7.gender_id) FROM tbl_provider_service_gender t7 WHERE t7.user_id = t1.user_id AND t7.gender_id IN ('" +
      req.body.gender_id +
      "'))as is_gender,\n\
    (SELECT IF(COUNT(t8.like_id) != 0,1,0) FROM tbl_like_saloon t8 WHERE t8.like_to = t1.user_id AND t8.like_by = " +
      req.body.user_id +
      ")as is_like_by_me,\n\
   (SELECT (t2.image) FROM tbl_workplace_image t2 WHERE t1.user_id = t2.user_id ORDER BY t2.image_id ASC LIMIT 1)as work_image,\n\
   format(111.111 *\n\
    DEGREES(ACOS(LEAST(1.0, COS(RADIANS(t1.bussiness_lat))\n\
         * COS(RADIANS(?))\n\
         * COS(RADIANS(t1.bussiness_long - ?))\n\
         + SIN(RADIANS(t1.bussiness_lat))\n\
         * SIN(RADIANS(?))))), 2) AS new_distance\n\
   FROM tbl_users t1\n\
   LEFT JOIN tbl_bussiness_hour t3 ON t3.day = DAYNAME('" +
      curernt_date +
      "') AND t3.user_id = t1.user_id\n\
    WHERE t1.user_role = 'provider' AND t1.is_account_setup = 1  " +
      search +
      " HAVING new_distance <= 5000000 " +
      WHERE +
      " ORDER BY t1.user_id " +
      ORDER +
      " LIMIT " +
      limit +
      " OFFSET " +
      offset,
    [req.body.latitude, req.body.longitude, req.body.latitude],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (res.length <= 0) {
          body.Status = 1;
          body.Message = "No data found";
          body.total_page = 0;
          body.info = [];
          result(null, body);
          return;
        } else {
          var resp = [];
          for (var i = 1; i < res.length; i++) {
            DeleteKeys(res[i], ["is_category", "is_benefit", "is_gender"]);
            resp.push(res[i]);
          }
          db.query(
            "SELECT t1.user_id,t1.bussiness_name,t1.street_address1,\n\
            t1.city,t1.zipcode,t1.bussiness_lat,t1.bussiness_long,\n\
            t1.membership_protection,t1.agreement_protection,IFNULL(t3.is_closed,0)as is_closed,\n\
            ROUND(IFNULL((SELECT AVG(t4.overall_star) FROM tbl_review t4 WHERE t1.user_id = t4.review_to),0),1)as star_count,\n\
            (SELECT COUNT(t5.category_id) FROM tbl_provider_service t5 WHERE t5.user_id = t1.user_id AND t5.category_id = " +
              req.body.category_id +
              ")as is_category,\n\
            (SELECT COUNT(t6.benefit_id) FROM tbl_provider_service_benefit t6 WHERE t6.user_id = t1.user_id AND t6.benefit_id IN ('" +
              req.body.benefit_id +
              "'))as is_benefit,\n\
            (SELECT COUNT(t7.gender_id) FROM tbl_provider_service_gender t7 WHERE t7.user_id = t1.user_id AND t7.gender_id IN ('" +
              req.body.gender_id +
              "'))as is_gender,\n\
            (SELECT IF(COUNT(t8.like_id) != 0,1,0) FROM tbl_like_saloon t8 WHERE t8.like_to = t1.user_id AND t8.like_by = " +
              req.body.user_id +
              ")as is_like_by_me,\n\
           (SELECT (t2.image) FROM tbl_workplace_image t2 WHERE t1.user_id = t2.user_id ORDER BY t2.image_id ASC LIMIT 1)as work_image,\n\
           format(111.111 *\n\
            DEGREES(ACOS(LEAST(1.0, COS(RADIANS(t1.bussiness_lat))\n\
                 * COS(RADIANS(?))\n\
                 * COS(RADIANS(t1.bussiness_long - ?))\n\
                 + SIN(RADIANS(t1.bussiness_lat))\n\
                 * SIN(RADIANS(?))))), 2) AS new_distance\n\
           FROM tbl_users t1\n\
           LEFT JOIN tbl_bussiness_hour t3 ON t3.day = DAYNAME('" +
              curernt_date +
              "') AND t3.user_id = t1.user_id\n\
            WHERE t1.user_role = 'provider' AND t1.is_account_setup = 1 " +
              search +
              "  HAVING new_distance <= 5000000 " +
              WHERE +
              " ORDER BY t1.user_id " +
              ORDER,
            [req.body.latitude, req.body.longitude, req.body.latitude],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                body.Status = 1;
                body.Message = "Main data get successful";
                body.total_page = Math.ceil(res1.length / limit);
                body.info = resp;
                result(null, body);
                return;
              }
            }
          );
        }
      }
    }
  );
};

exports.recently_viewed_saloon_data = (req, result) => {
  var body = {};
  var limit = 10;
  var page_no = req.body.page_no;
  var offset = (page_no - 1) * limit;
  var curernt_date = moment().format("YYYY-MM-DD");
  var search = "";
  if (req.body.search_text) {
    search = " AND t2.bussiness_name LIKE '%" + req.body.search_text + "%'";
  }
  var WHERE = "";
  if (req.body.category_id != 0) {
    WHERE = " AND is_category = 1";
  }
  if (req.body.benefit_id) {
    WHERE += " AND is_benefit = 1";
  } else {
    req.body.benefit_id = 0;
  }
  if (req.body.gender_id) {
    WHERE += " AND is_gender = 1";
  } else {
    req.body.gender_id = 0;
  }
  if (req.body.high_rated) {
    WHERE += " AND star_count >= 4";
  }
  var ORDER = " DESC";
  if (req.body.sort == 0) {
    ORDER = " ASC";
  }
  db.query(
    "SELECT t1.*,\n\
    t2.bussiness_name,t2.street_address1,t2.city,t2.zipcode,t2.bussiness_lat,t2.bussiness_long,\n\
    t2.membership_protection,t2.agreement_protection,IFNULL(t3.is_closed,0)as is_closed,\n\
    (SELECT (t4.image) FROM tbl_workplace_image t4 WHERE t1.view_to = t4.user_id ORDER BY t4.image_id ASC LIMIT 1)as work_image,\n\
    ROUND(IFNULL((SELECT AVG(t5.overall_star) FROM tbl_review t5 WHERE t1.view_to = t5.review_to),0),1)as star_count,\n\
    (SELECT COUNT(t6.category_id) FROM tbl_provider_service t6 WHERE t6.user_id = t1.view_to AND t6.category_id = " +
      req.body.category_id +
      ")as is_category,\n\
      (SELECT COUNT(t7.benefit_id) FROM tbl_provider_service_benefit t7 WHERE t7.user_id = t1.view_to AND t7.benefit_id IN ('" +
      req.body.benefit_id +
      "'))as is_benefit,\n\
      (SELECT COUNT(t8.gender_id) FROM tbl_provider_service_gender t8 WHERE t8.user_id = t1.view_to AND t8.gender_id IN ('" +
      req.body.gender_id +
      "'))as is_gender,\n\
      (SELECT IF(COUNT(t9.like_id) != 0,1,0) FROM tbl_like_saloon t9 WHERE t9.like_to = t1.view_to AND t9.like_by = " +
      req.body.user_id +
      ")as is_like_by_me,\n\
    format(111.111 *\n\
      DEGREES(ACOS(LEAST(1.0, COS(RADIANS(t2.bussiness_lat))\n\
           * COS(RADIANS(?))\n\
           * COS(RADIANS(t2.bussiness_long - ?))\n\
           + SIN(RADIANS(t2.bussiness_lat))\n\
           * SIN(RADIANS(?))))), 2) AS new_distance\n\
     FROM tbl_most_viewed_saloon t1\n\
      JOIN tbl_users t2 ON t1.view_to = t2.user_id\n\
      JOIN tbl_bussiness_hour t3 ON t3.day = DAYNAME('" +
      curernt_date +
      "') AND t3.user_id = t1.view_to\n\
      WHERE t1.view_by = ? " +
      search +
      " HAVING new_distance <= 500000" +
      WHERE +
      " ORDER BY t1.view_id " +
      ORDER +
      " LIMIT " +
      limit +
      " OFFSET " +
      offset,
    [
      req.body.latitude,
      req.body.longitude,
      req.body.latitude,
      req.body.user_id,
    ],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (res.length <= 0) {
          body.Status = 1;
          body.Message = "No data found";
          body.total_page = 0;
          body.info = [];
          result(null, body);
          return;
        } else {
          db.query(
            "SELECT t1.*,\n\
            t2.bussiness_name,t2.street_address1,t2.city,t2.zipcode,t2.bussiness_lat,t2.bussiness_long,\n\
            t2.membership_protection,t2.agreement_protection,IFNULL(t3.is_closed,0)as is_closed,\n\
            (SELECT (t4.image) FROM tbl_workplace_image t4 WHERE t1.view_to = t4.user_id ORDER BY t4.image_id ASC LIMIT 1)as work_image,\n\
            ROUND(IFNULL((SELECT AVG(t5.overall_star) FROM tbl_review t5 WHERE t1.view_to = t5.review_to),0),1)as star_count,\n\
            (SELECT COUNT(t6.category_id) FROM tbl_provider_service t6 WHERE t6.user_id = t1.view_to AND t6.category_id = " +
              req.body.category_id +
              ")as is_category,\n\
              (SELECT COUNT(t7.benefit_id) FROM tbl_provider_service_benefit t7 WHERE t7.user_id = t1.view_to AND t7.benefit_id IN ('" +
              req.body.benefit_id +
              "'))as is_benefit,\n\
              (SELECT COUNT(t8.gender_id) FROM tbl_provider_service_gender t8 WHERE t8.user_id = t1.view_to AND t8.gender_id IN ('" +
              req.body.gender_id +
              "'))as is_gender,\n\
              (SELECT IF(COUNT(t9.like_id) != 0,1,0) FROM tbl_like_saloon t9 WHERE t9.like_to = t1.view_to AND t9.like_by = " +
              req.body.user_id +
              ")as is_like_by_me,\n\
            format(111.111 *\n\
              DEGREES(ACOS(LEAST(1.0, COS(RADIANS(t2.bussiness_lat))\n\
                   * COS(RADIANS(?))\n\
                   * COS(RADIANS(t2.bussiness_long - ?))\n\
                   + SIN(RADIANS(t2.bussiness_lat))\n\
                   * SIN(RADIANS(?))))), 2) AS new_distance\n\
             FROM tbl_most_viewed_saloon t1\n\
              JOIN tbl_users t2 ON t1.view_to = t2.user_id\n\
              JOIN tbl_bussiness_hour t3 ON t3.day = DAYNAME('" +
              curernt_date +
              "') AND t3.user_id = t1.view_to\n\
              WHERE t1.view_by = ? " +
              search +
              " HAVING new_distance <= 500000" +
              WHERE +
              " ORDER BY t1.view_id " +
              ORDER,
            [
              req.body.latitude,
              req.body.longitude,
              req.body.latitude,
              req.body.user_id,
            ],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                body.Status = 1;
                body.Message = "Main data get successful";
                body.total_page = Math.ceil(res1.length / limit);
                body.info = res;
                result(null, body);
                return;
              }
            }
          );
        }
      }
    }
  );
};

exports.like_unlike_saloon = (req, result) => {
  var body = {};
  var data = {};
  data.like_by = req.user.user_id;
  data.like_to = req.body.user_id;
  var curernt_date = moment().format("YYYY-MM-DD");
  function getSalooData(type) {
    var word = type == 1 ? " Liked " : " Disliked ";
    db.query(
      "SELECT t1.user_id,t1.bussiness_name,t1.street_address1,\n\
  t1.city,t1.zipcode,t1.bussiness_lat,t1.bussiness_long,\n\
  t1.membership_protection,t1.agreement_protection,IFNULL(t3.is_closed,0)as is_closed,\n\
  ROUND(IFNULL((SELECT AVG(t4.overall_star) FROM tbl_review t4 WHERE t1.user_id = t4.review_to),0),1)as star_count,\n\
  (SELECT IF(COUNT(t5.like_id) != 0,1,0) FROM tbl_like_saloon t5 WHERE t5.like_to = t1.user_id AND t5.like_by = " +
        data.like_by +
        ")as is_like_by_me,\n\
 (SELECT (t2.image) FROM tbl_workplace_image t2 WHERE t1.user_id = t2.user_id ORDER BY t2.image_id ASC LIMIT 1)as work_image,\n\
 format(111.111 *\n\
  DEGREES(ACOS(LEAST(1.0, COS(RADIANS(t1.bussiness_lat))\n\
       * COS(RADIANS(?))\n\
       * COS(RADIANS(t1.bussiness_long - ?))\n\
       + SIN(RADIANS(t1.bussiness_lat))\n\
       * SIN(RADIANS(?))))), 2) AS new_distance\n\
 FROM tbl_users t1\n\
 LEFT JOIN tbl_bussiness_hour t3 ON t3.day = DAYNAME('" +
        curernt_date +
        "') AND t3.user_id = t1.user_id\n\
  WHERE t1.user_id = ?",
      [data.like_to],
      (err, resp) => {
        if (err) {
          console.log("error", err);
        } else {
          body.Status = 1;
          body.Message = "Saloon " + word + " successful";
          result(null, body);
          return;
        }
      }
    );
  }
  db.query(
    "SELECT like_id FROM tbl_like_saloon WHERE like_by = ? AND like_to = ?",
    [data.like_by, data.like_to],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        var like_id = res.length <= 0 ? false : res[0].like_id;
        if (!like_id) {
          db.query("INSERT INTO tbl_like_saloon SET ?", [data], (err, res1) => {
            if (err) {
              console.log("error", err);
            } else {
              getSalooData(1);
            }
          });
        } else {
          db.query(
            "DELETE FROM tbl_like_saloon WHERE like_id = ?",
            [like_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                getSalooData(2);
              }
            }
          );
        }
      }
    }
  );
};

exports.get_my_favourite_saloon = (req, result) => {
  var body = {};
  var limit = 10;
  var page_no = req.body.page_no;
  var offset = (page_no - 1) * limit;
  var curernt_date = moment().format("YYYY-MM-DD");
  db.query(
    "SELECT t1.*,(SELECT COUNT(*) FROM tbl_like_saloon t1 WHERE t1.like_by = ?)as total_data,\n\
  t2.bussiness_name,t2.street_address1,t2.city,t2.zipcode,t2.bussiness_lat,t2.bussiness_long,\n\
  t2.membership_protection,t2.agreement_protection,t3.is_closed,\n\
  (SELECT (t4.image) FROM tbl_workplace_image t4 WHERE t1.like_to = t4.user_id ORDER BY t4.image_id ASC LIMIT 1)as work_image,\n\
  ROUND(IFNULL((SELECT AVG(t5.overall_star) FROM tbl_review t5 WHERE t1.like_to = t5.review_to),0),1)as star_count\n\
   FROM tbl_like_saloon t1\n\
    JOIN tbl_users t2 ON t1.like_to = t2.user_id\n\
    JOIN tbl_bussiness_hour t3 ON t3.day = DAYNAME('" +
      curernt_date +
      "') AND t3.user_id = t1.like_to\n\
    WHERE t1.like_by = ? ORDER BY t1.like_id DESC LIMIT " +
      limit +
      " OFFSET " +
      offset,
    [req.user.user_id, req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (res.length <= 0) {
          body.Status = 1;
          body.Message = "No data found";
          body.total_page = 0;
          body.info = [];
          result(null, body);
          return;
        } else {
          body.Status = 1;
          body.Message = "My favourite saloon get successful";
          body.total_page = Math.ceil(res[0].total_data / limit);
          body.info = res;
          result(null, body);
          return;
        }
      }
    }
  );
};

exports.get_saloon_details = async (req, result) => {
  var body = {};
  function mostviewdata() {
    db.query(
      "SELECT * FROM tbl_most_viewed_saloon WHERE view_by = ? AND view_to = ?",
      [req.user.user_id, req.body.user_id],
      (err, resp) => {
        if (err) {
          console.log("error", err);
        } else {
          if (resp.length <= 0) {
            db.query(
              "INSERT INTO tbl_most_viewed_saloon(view_by,view_to)VALUES(?,?)",
              [req.user.user_id, req.body.user_id],
              (err, resp1) => {
                if (err) {
                  console.log("error", err);
                }
              }
            );
          } else {
            db.query(
              "DELETE FROM tbl_most_viewed_saloon WHERE view_id = ?",
              [resp[0].view_id],
              (err, resp1) => {
                if (err) {
                  console.log("error", err);
                } else {
                  db.query(
                    "INSERT INTO tbl_most_viewed_saloon(view_by,view_to)VALUES(?,?)",
                    [req.user.user_id, req.body.user_id],
                    (err, resp2) => {
                      if (err) {
                        console.log("error", err);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  }

  db.query(
    "SELECT t1.user_id,t1.bussiness_name,t1.street_address1,\n\
  t1.city,t1.zipcode,bussiness_lat,t1.bussiness_long,\n\
  (SELECT IF(COUNT(t2.like_id) != 0,1,0) FROM tbl_like_saloon t2 WHERE t2.like_to = t1.user_id AND t2.like_by = ?)as is_like_by_me\n\
   FROM tbl_users t1 WHERE t1.user_id = ? AND t1.user_role = 'provider'",
    [req.user.user_id, req.body.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (res.length <= 0) {
          body.Status = 1;
          body.Message = "No saloon found";
          body.info = {};
          result(null, body);
          return;
        } else {
          db.query(
            "SELECT * FROM tbl_workplace_image WHERE user_id = ?",
            [req.body.user_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                db.query(
                  "SELECT ROUND(IFNULL(AVG(t1.overall_star),0),1)as overall_star,\n\
                  (SELECT COUNT(*) FROM tbl_review t1 WHERE t1.review_to = ?)as review_count\n\
                   FROM tbl_review t1 WHERE t1.review_to = ?",
                  [req.body.user_id, req.body.user_id],
                  (err, res2) => {
                    if (err) {
                      console.log("error", err);
                    } else {
                      db.query(
                        "SELECT t1.review_by,t2.profile_pic\n\
                        FROM tbl_review t1\n\
                        LEFT JOIN tbl_users t2 ON t1.review_by = t2.user_id\n\
                        WHERE t1.review_to = ?",
                        [req.body.user_id],
                        (err, res3) => {
                          if (err) {
                            console.log("error", err);
                          } else {
                            db.query(
                              "SELECT * FROM tbl_provider_service WHERE user_id = ?",
                              [req.body.user_id],
                              (err, res4) => {
                                if (err) {
                                  console.log("error", err);
                                } else {
                                  db.query(
                                    "SELECT t1.*,IFNULL(t2.amenity_id,0)as is_select\n\
                                   FROM tbl_amenities t1\n\
                                   LEFT JOIN tbl_provider_amenities t2 ON t1.amenity_id = t2.amenity_id AND t2.user_id = ?",
                                    [req.body.user_id],
                                    (err, res5) => {
                                      if (err) {
                                        console.log("error", err);
                                      } else {
                                        db.query(
                                          "SELECT * FROM tbl_bussiness_hour WHERE user_id = ?",
                                          [req.body.user_id],
                                          (err, res6) => {
                                            if (err) {
                                              console.log("error", err);
                                            } else {
                                              res6.forEach((e, i) => {
                                                db.query(
                                                  "SELECT * FROM tbl_bussiness_hour_break WHERE hour_id = ?",
                                                  [e.hour_id],
                                                  (err, res7) => {
                                                    if (err) {
                                                      console.log("error", err);
                                                    } else {
                                                      res6[i]["break"] = res7;
                                                      if (
                                                        res6.length - 1 ==
                                                        i
                                                      ) {
                                                        db.query(
                                                          "SELECT user_id,first_name,last_name,profile_pic FROM tbl_users WHERE added_by = ?",
                                                          [req.body.user_id],
                                                          (err, res8) => {
                                                            if (err) {
                                                              console.log(
                                                                "error",
                                                                err
                                                              );
                                                            } else {
                                                              mostviewdata();
                                                              res[0][
                                                                "workplace_image"
                                                              ] = res1;
                                                              res[0][
                                                                "review_details"
                                                              ] =
                                                                res2.concat(
                                                                  res3
                                                                );
                                                              res[0][
                                                                "price_list"
                                                              ] = res4;
                                                              res[0][
                                                                "details"
                                                              ] = res5;
                                                              res[0][
                                                                "schedule"
                                                              ] = res6;
                                                              res[0]["team"] =
                                                                res8;
                                                              body.Status = 1;
                                                              body.Message =
                                                                "Saloon details get successful";
                                                              body.info =
                                                                res[0];
                                                              result(
                                                                null,
                                                                body
                                                              );
                                                              return;
                                                            }
                                                          }
                                                        );
                                                      }
                                                    }
                                                  }
                                                );
                                              });
                                            }
                                          }
                                        );
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
};
