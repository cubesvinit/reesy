const db = require("../config/db.config.js");
const providerService = require("../services/provider.service.js");
const userService = require("../services/user.service.js");
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

exports.upload_profile_pic = (req, result) => {
  var body = {};
  if (req.files != undefined && req.files.profile_pic) {
    var ext = req.files.profile_pic[0].originalname.split(".").pop();
    var ImageUrl_media = req.files.profile_pic[0].filename;
    var ImageUrl_with__ext = req.files.profile_pic[0].filename + "." + ext;
    fs.renameSync(
      "uploads/images/" + ImageUrl_media,
      "uploads/images/" + ImageUrl_with__ext
    );
    var Image = "uploads/images/" + ImageUrl_with__ext;
  }
  body.Status = 1;
  body.Message = "Profile pic uploaded successful";
  body.profile_pic = Image;
  return result(null, profile_pic);
};

exports.account_setup = (req, result) => {
  var body = {};
  var benefitId = req.body.benefit_id;
  var genderId = req.body.gender_id;
  DeleteKeys(req.body, ["benefit_id", "gender_id"]);
  req.body.is_account_setup = 1;
  userService.findByNumber(
    req.body.phone_number,
    req.body.country_code,
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (res) {
          body.Status = 0;
          body.Message = "An account already exists with your phonenumber";
          result(null, body);
          return;
        } else {
          db.query(
            "UPDATE tbl_users SET ? WHERE user_id = ?",
            [req.body, req.user.user_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                if (req.files != undefined && req.files.image) {
                  req.files["image"].forEach((image, index) => {
                    var ext = image.originalname.split(".").pop();
                    var ImageUrl_media = image.filename;
                    var ImageUrl_with__ext = image.filename + "." + ext;
                    fs.renameSync(
                      "uploads/images/" + ImageUrl_media,
                      "uploads/images/" + ImageUrl_with__ext
                    );
                    var Image = "uploads/images/" + ImageUrl_with__ext;
                    db.query(
                      "INSERT INTO tbl_workplace_image(user_id,image) VALUES(?,?)",
                      [req.user.user_id, Image],
                      (err, res2) => {
                        if (err) {
                          console.log("error", err);
                        } else {
                          if (req.files["image"].length - 1 == index) {
                            var obj = JSON.parse(req.body.bussiness_hour);
                            obj.forEach((e, i) => {
                              var b_data = {
                                user_id: req.user.user_id,
                                day: e.day,
                                start_time: e.start_time,
                                close_time: e.close_time,
                                is_closed: e.is_closed,
                              };
                              db.query(
                                "INSERT INTO tbl_bussiness_hour SET ?",
                                [b_data],
                                (err, res3) => {
                                  if (err) {
                                    console.log("error", err);
                                  } else {
                                    var breakdata = e.break;
                                    breakdata.forEach((e1, i1) => {
                                      var break_data = {
                                        user_id: req.user.user_id,
                                        hour_id: res3.insertId,
                                        break_start: e1.break_start,
                                        break_end: e.break_end,
                                      };
                                      db.query(
                                        "INSERT INTO tbl_bussiness_hour_break SET ?",
                                        [break_data],
                                        (err, res4) => {
                                          if (err) {
                                            console.log("error", err);
                                          } else {
                                            if (
                                              obj.length - 1 == i &&
                                              breakdata.length - 1 == i1
                                            ) {
                                              var obj1 = JSON.parse(
                                                req.body.service_data
                                              );
                                              obj1.forEach((e2, i2) => {
                                                var service_data = {
                                                  user_id: req.user.user_id,
                                                  service_name: e2.service_name,
                                                  category_id: e2.category_id,
                                                  service_duration:
                                                    e2.service_duration,
                                                  service_price:
                                                    e2.service_price,
                                                  color_id: e2.color_id,
                                                };
                                                db.query(
                                                  "INSERT INTO tbl_provider_service SET ?",
                                                  [service_data],
                                                  (err, res5) => {
                                                    if (err) {
                                                      console.log("error", err);
                                                    } else {
                                                      if (
                                                        obj1.length - 1 ==
                                                        i2
                                                      ) {
                                                        var gender =
                                                          genderId.length == 1
                                                            ? [genderId]
                                                            : genderId.split(
                                                                ","
                                                              );
                                                        gender.forEach(
                                                          (e3, i3) => {
                                                            var g_data = {
                                                              user_id:
                                                                req.user
                                                                  .user_id,
                                                              gender_id: e3,
                                                            };
                                                            db.query(
                                                              "INSERT INTO  tbl_provider_service_gender SET ?",
                                                              [g_data],
                                                              (err, res6) => {
                                                                if (err) {
                                                                  console.log(
                                                                    "error",
                                                                    err
                                                                  );
                                                                } else {
                                                                  if (
                                                                    gender.length -
                                                                      1 ==
                                                                    i3
                                                                  ) {
                                                                    var benefit =
                                                                      benefitId.length ==
                                                                      1
                                                                        ? [
                                                                            benefitId,
                                                                          ]
                                                                        : benefitId.split(
                                                                            ","
                                                                          );
                                                                    benefit.forEach(
                                                                      (
                                                                        e4,
                                                                        i4
                                                                      ) => {
                                                                        var benefit_data =
                                                                          {
                                                                            user_id:
                                                                              req
                                                                                .user
                                                                                .user_id,
                                                                            benefit_id:
                                                                              e4,
                                                                          };
                                                                        db.query(
                                                                          "INSERT INTO tbl_provider_service_benefit SET ?",
                                                                          [
                                                                            benefit_data,
                                                                          ],
                                                                          (
                                                                            err,
                                                                            res7
                                                                          ) => {
                                                                            if (
                                                                              err
                                                                            ) {
                                                                              console.log(
                                                                                "error",
                                                                                err
                                                                              );
                                                                            } else {
                                                                              if (
                                                                                benefit.length -
                                                                                  1 ==
                                                                                i4
                                                                              ) {
                                                                                var obj2 =
                                                                                  JSON.parse(
                                                                                    req
                                                                                      .body
                                                                                      .member
                                                                                  );
                                                                                obj2.forEach(
                                                                                  (
                                                                                    e5,
                                                                                    i5
                                                                                  ) => {
                                                                                    var member_data =
                                                                                      {
                                                                                        first_name:
                                                                                          e5.first_name,
                                                                                        last_name:
                                                                                          e5.last_name,
                                                                                        country_code:
                                                                                          e5.country_code,
                                                                                        iso_code:
                                                                                          e5.iso_code,
                                                                                        phone_number:
                                                                                          e5.phone_number,
                                                                                        email_id:
                                                                                          e5.email_id,
                                                                                        is_available:
                                                                                          e5.is_available,
                                                                                      };
                                                                                    db.query(
                                                                                      "INSERT INTO tbl_users SET ?",
                                                                                      [
                                                                                        member_data,
                                                                                      ],
                                                                                      (
                                                                                        err,
                                                                                        res8
                                                                                      ) => {
                                                                                        if (
                                                                                          err
                                                                                        ) {
                                                                                          console.log(
                                                                                            "error",
                                                                                            err
                                                                                          );
                                                                                        } else {
                                                                                          if (
                                                                                            obj2.length -
                                                                                              1 ==
                                                                                            i5
                                                                                          ) {
                                                                                            userService.findByUserId(
                                                                                              req
                                                                                                .user
                                                                                                .user_id,
                                                                                              (
                                                                                                err,
                                                                                                resdata
                                                                                              ) => {
                                                                                                if (
                                                                                                  err
                                                                                                ) {
                                                                                                  console.log(
                                                                                                    "error",
                                                                                                    err
                                                                                                  );
                                                                                                } else {
                                                                                                  body.Status = 1;
                                                                                                  body.Message =
                                                                                                    "Account setup successful";
                                                                                                  body.info =
                                                                                                    resdata[0];
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
                                                                                  }
                                                                                );
                                                                              }
                                                                            }
                                                                          }
                                                                        );
                                                                      }
                                                                    );
                                                                  }
                                                                }
                                                              }
                                                            );
                                                          }
                                                        );
                                                      }
                                                    }
                                                  }
                                                );
                                              });
                                            }
                                          }
                                        }
                                      );
                                    });
                                  }
                                }
                              );
                            });
                          }
                        }
                      }
                    );
                  });
                }
              }
            }
          );
        }
      }
    }
  );
};

exports.add_service = (req, result) => {
  var body = {};
  req.body.user_id = req.user.user_id;
  db.query("INSERT INTO tbl_provider_service SET ?", [req.body], (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Service added successful";
      result(null, body);
      return;
    }
  });
};

exports.list_service = (req, result) => {
  var body = {};
  var limit = 10;
  var page_no = req.body.page_no;
  var offset = limit * (page_no - 1);
  var WHERE = "";
  if (req.body.search_text) {
    WHERE = " t1.service_name LIKE '%" + req.body.search_text + "%'";
  }
  db.query(
    "SELECT t1.*,\n\
    (SELECT COUNT(*) FROM tbl_provider_service t1 WHERE t1.user_id = ? " +
      WHERE +
      ")as total_data\n\
     FROM tbl_provider_service t1 WHERE t1.user_id = ? " +
      WHERE +
      " ORDER BY t1.service_id DESC LIMIT " +
      limit +
      " OFFSET " +
      offset,
    [req.user.user_id, req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
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
          body.Status = 1;
          body.Message = "Service listed successful";
          body.total_page = Math.ceil(res[0].total_data / limit);
          body.info = res;
          result(null, body);
          return;
        }
      }
    }
  );
};

exports.edit_service = (req, result) => {
  var body = {};
  db.query(
    "UPDATE tbl_provider_service SET ? WHERE service_id = ?",
    [req.body, req.body.service_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT * FROM tbl_provider_service WHERE service_id = ?",
          [req.body.service_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              if (res1.length <= 0) {
                body.Status = 1;
                body.Message = "Service not found";
                body.info = {};
                result(null, body);
                return;
              } else {
                body.Status = 1;
                body.Message = "Service get successful";
                body.info = res[0];
                result(null, body);
                return;
              }
            }
          }
        );
      }
    }
  );
};

exports.delete_service = (req, result) => {
  var body = {};
  db.query(
    "DELETE FROM tbl_provider_service WHERE service_id = ?",
    [req.body.service_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        body.Status = 1;
        body.Message = "Service deleted successful";
        result(null, body);
        return;
      }
    }
  );
};
