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

exports.list_category = (req, result) => {
  var body = {};
  var WHERE = "";
  if (req.body.search_text) {
    WHERE = " WHERE t1.category_name LIKE '%" + req.body.search_text + "%'";
  }
  db.query("SELECT t1.* FROM tbl_category t1 " + WHERE, (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Category listed successful";
      body.info = res;
      result(null, body);
      return;
    }
  });
};

exports.list_benefit = (req, result) => {
  var body = {};
  db.query("SELECT t1.* FROM tbl_benefit t1", (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Benefit listed successful";
      body.info = res;
      result(null, body);
      return;
    }
  });
};

exports.list_service_gender = (req, result) => {
  var body = {};
  db.query("SELECT t1.* FROM tbl_service_gender t1", (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Service gender listed successful";
      body.info = res;
      result(null, body);
      return;
    }
  });
};

exports.list_service_color = (req, result) => {
  var body = {};
  db.query("SELECT t1.* FROM tbl_service_color t1", (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Service color listed successful";
      body.info = res;
      result(null, body);
      return;
    }
  });
};

exports.list_amenities = (req, result) => {
  var body = {};
  db.query("SELECT t1.* FROM tbl_amenities t1", (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "amenities listed successful";
      body.info = res;
      result(null, body);
      return;
    }
  });
};

exports.list_avtar = (req, result) => {
  var body = {};
  db.query("SELECT t1.* FROM tbl_avtar t1", (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Avtar listed successful";
      body.info = res;
      result(null, body);
      return;
    }
  });
};

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
  return result(null, body);
};

exports.account_setup = (req, result) => {
  var body = {};
  var benefitId = req.body.benefit_id;
  var genderId = req.body.gender_id;
  var b_hour = req.body.bussiness_hour;
  var s_data = req.body.service_data;
  var m_data = req.body.member_data;
  DeleteKeys(req.body, [
    "benefit_id",
    "gender_id",
    "bussiness_hour",
    "service_data",
    "member_data",
  ]);
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
                            var obj = JSON.parse(b_hour);
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
                                    var breakdata =
                                      e.break.length <= 0 ? [0] : e.break;
                                    breakdata.forEach((e1, i1) => {
                                      if (e1 != 0) {
                                        var break_data = {
                                          user_id: req.user.user_id,
                                          hour_id: res3.insertId,
                                          break_start: e1.break_start,
                                          break_end: e1.break_end,
                                        };
                                        db.query(
                                          "INSERT INTO tbl_bussiness_hour_break SET ?",
                                          [break_data],
                                          (err, res4) => {
                                            if (err) {
                                              console.log("error", err);
                                            } else {
                                              console.log(
                                                "obj",
                                                obj.length - 1,
                                                i
                                              );
                                              console.log(
                                                "breakdata",
                                                breakdata.length - 1,
                                                i1
                                              );
                                            }
                                          }
                                        );
                                      }
                                      if (
                                        obj.length - 1 == i &&
                                        breakdata.length - 1 == i1
                                      ) {
                                        var obj1 = JSON.parse(s_data);
                                        obj1.forEach((e2, i2) => {
                                          var service_data = {
                                            user_id: req.user.user_id,
                                            service_name: e2.service_name,
                                            category_id: e2.category_id,
                                            service_duration:
                                              e2.service_duration,
                                            service_price: e2.service_price,
                                            color_id: e2.color_id,
                                          };
                                          db.query(
                                            "INSERT INTO tbl_provider_service SET ?",
                                            [service_data],
                                            (err, res5) => {
                                              if (err) {
                                                console.log("error", err);
                                              } else {
                                                if (obj1.length - 1 == i2) {
                                                  var gender =
                                                    genderId.length == 1
                                                      ? [genderId]
                                                      : genderId.split(",");
                                                  gender.forEach((e3, i3) => {
                                                    var g_data = {
                                                      user_id: req.user.user_id,
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
                                                            gender.length - 1 ==
                                                            i3
                                                          ) {
                                                            var benefit =
                                                              benefitId.length ==
                                                              1
                                                                ? [benefitId]
                                                                : benefitId.split(
                                                                    ","
                                                                  );
                                                            benefit.forEach(
                                                              (e4, i4) => {
                                                                var benefit_data =
                                                                  {
                                                                    user_id:
                                                                      req.user
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
                                                                    if (err) {
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
                                                                        if (
                                                                          m_data
                                                                        ) {
                                                                          var obj2 =
                                                                            JSON.parse(
                                                                              m_data
                                                                            );
                                                                          obj2.forEach(
                                                                            (
                                                                              e5,
                                                                              i5
                                                                            ) => {
                                                                              var member_data =
                                                                                {
                                                                                  added_by:
                                                                                    req
                                                                                      .user
                                                                                      .user_id,
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
                                                                                  profile_pic:
                                                                                    e5.profile_pic,
                                                                                  user_role:
                                                                                    "member",
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
                                                                                    obj.forEach(
                                                                                      (
                                                                                        e,
                                                                                        i
                                                                                      ) => {
                                                                                        var b_data =
                                                                                          {
                                                                                            user_id:
                                                                                              req
                                                                                                .user
                                                                                                .user_id,
                                                                                            member_id:
                                                                                              res8.insertId,
                                                                                            day: e.day,
                                                                                            start_time:
                                                                                              e.start_time,
                                                                                            end_time:
                                                                                              e.close_time,
                                                                                            is_closed:
                                                                                              e.is_closed,
                                                                                          };
                                                                                        db.query(
                                                                                          "INSERT INTO tbl_member_workshift SET ?",
                                                                                          [
                                                                                            b_data,
                                                                                          ],
                                                                                          (
                                                                                            err,
                                                                                            res9
                                                                                          ) => {
                                                                                            if (
                                                                                              err
                                                                                            ) {
                                                                                              console.log(
                                                                                                "error",
                                                                                                err
                                                                                              );
                                                                                            } else {
                                                                                              var breakdata =
                                                                                                e
                                                                                                  .break
                                                                                                  .length <=
                                                                                                0
                                                                                                  ? [
                                                                                                      0,
                                                                                                    ]
                                                                                                  : e.break;
                                                                                              breakdata.forEach(
                                                                                                (
                                                                                                  e1,
                                                                                                  i1
                                                                                                ) => {
                                                                                                  if (
                                                                                                    e1 !=
                                                                                                    0
                                                                                                  ) {
                                                                                                    var break_data =
                                                                                                      {
                                                                                                        user_id:
                                                                                                          req
                                                                                                            .user
                                                                                                            .user_id,
                                                                                                        workshift_id:
                                                                                                          res9.insertId,
                                                                                                        break_start:
                                                                                                          e1.break_start,
                                                                                                        break_end:
                                                                                                          e1.break_end,
                                                                                                      };
                                                                                                    db.query(
                                                                                                      "INSERT INTO tbl_member_workshift_break SET ?",
                                                                                                      [
                                                                                                        break_data,
                                                                                                      ],
                                                                                                      (
                                                                                                        err,
                                                                                                        res10
                                                                                                      ) => {
                                                                                                        if (
                                                                                                          err
                                                                                                        ) {
                                                                                                          console.log(
                                                                                                            "error",
                                                                                                            err
                                                                                                          );
                                                                                                        }
                                                                                                      }
                                                                                                    );
                                                                                                  }
                                                                                                  if (
                                                                                                    obj2.length -
                                                                                                      1 ==
                                                                                                      i5 &&
                                                                                                    obj.length -
                                                                                                      1 ==
                                                                                                      i &&
                                                                                                    breakdata.length -
                                                                                                      1 ==
                                                                                                      i1
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
                                                                                                            resdata;
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
                                                                                              );
                                                                                            }
                                                                                          }
                                                                                        );
                                                                                      }
                                                                                    );
                                                                                  }
                                                                                }
                                                                              );
                                                                            }
                                                                          );
                                                                        } else {
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
                                                                                  resdata;
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
    WHERE = " AND t1.service_name LIKE '%" + req.body.search_text + "%'";
  }
  db.query(
    "SELECT t1.*,t2.color_code,\n\
    (SELECT COUNT(*) FROM tbl_provider_service t1 WHERE t1.user_id = ? " +
      WHERE +
      ")as total_data\n\
     FROM tbl_provider_service t1\n\
     JOIN tbl_service_color t2 ON t1.color_id = t2.color_id\n\
      WHERE t1.user_id = ? " +
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
          "SELECT t1.*,t2.category_name,t3.color_code\n\
           FROM tbl_provider_service t1\n\
           JOIN tbl_category t2 ON t1.category_id = t2.category_id\n\
           JOIN tbl_service_color t3 ON t1.color_id = t3.color_id\n\
            WHERE t1.service_id = ?",
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
                body.info = res1[0];
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

exports.add_workplace_image = (req, result) => {
  var body = {};
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
            body.Status = 1;
            body.Message = "Image uploaded successfully";
            result(null, body);
            return;
          }
        }
      }
    );
  });
};

exports.list_workplace_image = (req, result) => {
  var body = {};
  db.query(
    "SELECT * FROM tbl_workplace_image WHERE user_id = ?",
    [req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        body.Status = 1;
        body.Message = "Image get successful";
        body.info = res;
        result(null, body);
        return;
      }
    }
  );
};

exports.delete_workplace_image = (req, result) => {
  var body = {};
  db.query(
    "SELECT image FROM tbl_workplace_image WHERE image_id = ?",
    [req.body.image_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        if (res.length <= 0) {
          body.Status = 1;
          body.Message = "No image found";
          result(null, body);
          return;
        } else {
          var filepath = res[0].image;
          if (filepath != null) {
            try {
              fs.unlinkSync(filepath);
            } catch (e) {
              console.log("No image found");
            }
          }
          db.query(
            "DELETE FROM tbl_workplace_image WHERE image_id = ?",
            [req.body.image_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
                result(err, null);
                return;
              } else {
                body.Status = 1;
                body.Message = "Image deleted successful";
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

exports.edit_bussiness_hour = (req, result) => {
  console.log("edit_bussiness_hour api called", req.body);
  var body = {};
  function getbussinesshour() {
    db.query(
      "SELECT * FROM tbl_bussiness_hour WHERE user_id = ?",
      [req.user.user_id],
      (err, res) => {
        if (err) {
          console.log("error", err);
          result(err, null);
          return;
        } else {
          res.forEach((e2, i2) => {
            db.query(
              "SELECT * FROM tbl_bussiness_hour_break WHERE hour_id = ?",
              [e2.hour_id],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                  result(err, null);
                  return;
                } else {
                  res[i2]["break"] = res1;
                  if (res.length - 1 == i2) {
                    body.Status = 1;
                    body.Message = "Bussiness hour get successful";
                    body.info = res;
                    result(null, body);
                    return;
                  }
                }
              }
            );
          });
        }
      }
    );
  }

  if (req.body.bussiness_hour) {
    var obj = JSON.parse(req.body.bussiness_hour);
    console.log("obj", obj);
    obj.forEach((e, i) => {
      var b_data = {
        user_id: req.user.user_id,
        day: e.day,
        start_time: e.start_time,
        close_time: e.close_time,
        is_closed: e.is_closed,
      };
      db.query(
        "UPDATE tbl_bussiness_hour SET ? WHERE hour_id = ?",
        [b_data, e.hour_id],
        (err, res3) => {
          if (err) {
            console.log("error", err);
          } else {
            var breakdata = e.break.length <= 0 ? [0] : e.break;
            breakdata.forEach((e1, i1) => {
              if (e1 != 0) {
                var break_data = {
                  user_id: req.user.user_id,
                  hour_id: e.hour_id,
                  break_start: e1.break_start,
                  break_end: e1.break_end,
                };
                if (e1.break_id == 0) {
                  console.log("insert", e1.break_id);
                  db.query(
                    "INSERT INTO tbl_bussiness_hour_break SET ?",
                    [break_data],
                    (err, res4) => {
                      if (err) {
                        console.log("error", err);
                      } else {
                      }
                    }
                  );
                } else {
                  db.query(
                    "UPDATE tbl_bussiness_hour_break SET ? WHERE break_id = ?",
                    [break_data, e1.break_id],
                    (err, res4) => {
                      if (err) {
                        console.log("error", err);
                      }
                    }
                  );
                }
              }
              if (obj.length - 1 == i && breakdata.length - 1 == i1) {
                getbussinesshour();
              }
            });
          }
        }
      );
    });
  } else {
    getbussinesshour();
  }
};

exports.edit_daywise_bussiness_hour = (req, result) => {
  var body = {};
  var obj = JSON.parse(req.body.bussiness_hour);
  var b_data = {
    hour_id: obj.hour_id,
    user_id: req.user.user_id,
    day: obj.day,
    start_time: obj.start_time,
    close_time: obj.close_time,
    is_closed: obj.is_closed,
  };
  db.query(
    "UPDATE tbl_bussiness_hour SET ? WHERE hour_id = ?",
    [b_data, b_data.hour_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        var breakdata = obj.break.length <= 0 ? [0] : obj.break;
        breakdata.forEach((e, i) => {
          if (e1 != 0) {
            var break_data = {
              user_id: req.user.user_id,
              hour_id: e.hour_id,
              break_start: e.break_start,
              break_end: e.break_end,
            };
            if (e.break_id == 0) {
              db.query(
                "INSERT INTO tbl_bussiness_hour_break SET ?",
                [break_data],
                (err, res4) => {
                  if (err) {
                    console.log("error", err);
                  } else {
                  }
                }
              );
            } else {
              db.query(
                "UPDATE tbl_bussiness_hour_break SET ? WHERE break_id = ?",
                [break_data, e1.break_id],
                (err, res4) => {
                  if (err) {
                    console.log("error", err);
                  }
                }
              );
            }
          }
          if (breakdata.length - 1 == i) {
            body.Status = 1;
            body.Message = "Bussiness hour edited successfully";
            result(null, body);
            return;
          }
        });
      }
    }
  );
};

exports.delete_break = (req, result) => {
  var body = {};
  db.query(
    "DELETE FROM tbl_bussiness_hour_break WHERE break_id = ?",
    [req.body.break_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        body.Status = 1;
        body.Message = "Break deleted successful";
        result(null, body);
        return;
      }
    }
  );
};

exports.add_staff_member = (req, result) => {
  var body = {};
  if (req.files != undefined && req.files.profile_pic) {
    var ext = req.files.profile_pic[0].originalname.split(".").pop();
    var ImageUrl_media = req.files.profile_pic[0].filename;
    var ImageUrl_with__ext = req.files.profile_pic[0].filename + "." + ext;
    fs.renameSync(
      "uploads/images/" + ImageUrl_media,
      "uploads/images/" + ImageUrl_with__ext
    );
    req.body.profile_pic = "uploads/images/" + ImageUrl_with__ext;
  }
  req.body.added_by = req.user.user_id;
  req.body.user_role = "member";
  db.query("INSERT INTO tbl_users SET ?", [req.body], (err, res) => {
    if (err) {
      console.log("error", err);
    } else {
      db.query(
        "SELECT * FROM tbl_bussiness_hour WHERE user_id = ?",
        [req.user.user_id],
        (err, res1) => {
          if (err) {
            console.log("error", err);
          } else {
            res1.forEach((e2, i2) => {
              db.query(
                "SELECT * FROM tbl_bussiness_hour_break WHERE hour_id = ?",
                [e2.hour_id],
                (err, res2) => {
                  if (err) {
                    console.log("error", err);
                  } else {
                    var workshift_data = {
                      user_id: req.user.user_id,
                      member_id: res.insertId,
                      day: e2.day,
                      start_time: e2.start_time,
                      end_time: e2.close_time,
                      is_closed: e2.is_closed,
                    };
                    db.query(
                      "INSERT INTO tbl_member_workshift SET ?",
                      [workshift_data],
                      (err, res3) => {
                        if (err) {
                          console.log("error", err);
                        } else {
                          var breakdata = res2.length <= 0 ? [0] : res2;
                          breakdata.forEach((e3, i3) => {
                            if (e3 != 0) {
                              var break_data = {
                                user_id: req.user.user_id,
                                workshift_id: res3.insertId,
                                break_start: e3.break_start,
                                break_end: e3.break_end,
                              };
                              db.query(
                                "INSERT INTO tbl_member_workshift_break SET ?",
                                [break_data],
                                (err, res4) => {
                                  if (err) {
                                    console.log("error", err);
                                  }
                                }
                              );
                            }
                            if (
                              breakdata.length - 1 == i3 &&
                              res1.length - 1 == i2
                            ) {
                              body.Status = 1;
                              body.Message = "Member added successful";
                              result(null, body);
                              return;
                            }
                          });
                        }
                      }
                    );
                  }
                }
              );
            });
          }
        }
      );
    }
  });
};

exports.edit_staff_member = (req, result) => {
  var body = {};
  if (req.files != undefined && req.files.profile_pic) {
    var ext = req.files.profile_pic[0].originalname.split(".").pop();
    var ImageUrl_media = req.files.profile_pic[0].filename;
    var ImageUrl_with__ext = req.files.profile_pic[0].filename + "." + ext;
    fs.renameSync(
      "uploads/images/" + ImageUrl_media,
      "uploads/images/" + ImageUrl_with__ext
    );
    req.body.profile_pic = "uploads/images/" + ImageUrl_with__ext;
  }

  db.query(
    "UPDATE tbl_users SET ? WHERE user_id = ?",
    [req.body, req.body.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT t1.user_id,t1.first_name,t1.last_name,t1.country_code,\n\
          t1.iso_code,t1.phone_number,t1.profile_pic,t1.email_id,t1.is_available\n\
           FROM tbl_users t1 WHERE t1.user_id = ?",
          [req.body.user_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              body.Status = 1;
              body.Message = "Member edited successful";
              body.info = res1[0];
              result(null, body);
              return;
            }
          }
        );
      }
    }
  );
};

exports.list_staff_member = (req, result) => {
  var body = {};
  var WHERE = "";
  if (req.body.search_text) {
    WHERE =
      " AND (t1.first_name LIKE '%" +
      req.body.search_text +
      "%' OR t1.last_name LIKE '%" +
      req.body.search_text +
      "%')";
  }
  db.query(
    "SELECT t1.user_id,t1.user_role,t1.first_name,t1.last_name,t1.country_code,\n\
  t1.iso_code,t1.phone_number,t1.profile_pic,t1.email_id,t1.is_available,t1.bussiness_name\n\
FROM tbl_users t1 WHERE t1.user_id = ?",
    [req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT t1.user_id,t1.added_by,t1.user_role,t1.first_name,t1.last_name,t1.country_code,\n\
          t1.iso_code,t1.phone_number,t1.profile_pic,t1.email_id,t1.is_available\n\
        FROM tbl_users t1 WHERE t1.added_by = ? " + WHERE,
          [req.user.user_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              var resp = [...res, ...res1];
              body.Status = 1;
              body.Message = "List of staff members fetched successful";
              body.info = resp;
              result(null, body);
              return;
            }
          }
        );
      }
    }
  );
};

exports.delete_staff_member = (req, result) => {
  var body = {};
  db.query(
    "SELECT profile_pic FROM tbl_users WHERE user_id = ?",
    [req.body.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        var filepath = res[0].profile_pic;
        if (filepath != null) {
          try {
            fs.unlinkSync(filepath);
          } catch (e) {
            console.log("No profile pic found");
          }
        }
        db.query(
          "DELETE FROM tbl_users WHERE user_id = ?",
          [req.body.user_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              body.Status = 1;
              body.Message = "Member deleted successful";
              result(null, body);
              return;
            }
          }
        );
      }
    }
  );
};

exports.add_provider_amenities = (req, result) => {
  console.log("add_provider_amenities api called", req.body);
  var body = {};
  var amenityId =
    req.body.amenity_id.length == 1
      ? [req.body.amenity_id]
      : req.body.amenity_id.split(",");
  amenityId.forEach((e, i) => {
    db.query(
      "INSERT INTO tbl_provider_amenities(user_id,amenity_id)VALUES(?,?)",
      [req.user.user_id, e],
      (err, res) => {
        if (err) {
          console.log("error", err);
          result(err, null);
          return;
        } else {
          body.Status = 1;
          body.Message = "Amenities added successful";
          result(null, body);
          return;
        }
      }
    );
  });
};

exports.edit_provider_amenities = (req, result) => {
  console.log("edit_provider_amenities api called", req.body);
  var body = {};
  function getamenities() {
    db.query(
      "SELECT t1.*,\n\
    (SELECT COUNT(*) FROM tbl_provider_amenities t2 WHERE t1.amenity_id = t2.amenity_id AND t2.user_id = ?)as is_select\n\
     FROM tbl_amenities t1",
      [req.user.user_id],
      (err, resp) => {
        if (err) {
          console.log("error", err);
          result(err, null);
          return;
        } else {
          body.Status = 1;
          body.Message = "Amenities edited successful";
          body.info = resp;
          result(null, body);
          return;
        }
      }
    );
  }

  if (req.body.amenity_id) {
    db.query(
      "DELETE FROM tbl_provider_amenities WHERE user_id = ?",
      [req.user.user_id],
      (err, res) => {
        if (err) {
          console.log("error", err);
          result(err, null);
          return;
        } else {
          var amenityId =
            req.body.amenity_id.length == 1
              ? [req.body.amenity_id]
              : req.body.amenity_id.split(",");
          amenityId.forEach((e, i) => {
            db.query(
              "INSERT INTO tbl_provider_amenities(user_id,amenity_id)VALUES(?,?)",
              [req.user.user_id, e],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                  result(err, null);
                  return;
                } else {
                  if (amenityId.length - 1 == i) {
                    getamenities();
                  }
                }
              }
            );
          });
        }
      }
    );
  } else {
    getamenities();
  }
};

exports.list_review = (req, result) => {
  var body = {};
  const limit = 10;
  const page_no = req.body.page_no;
  const offset = (page_no - 1) * limit;
  var user_id = req.body.user_id ? req.body.user_id : req.user.user_id;
  db.query(
    "SELECT COUNT(*)as review_count,\n\
  IFNULL((SELECT AVG(t2.overall_star) FROM tbl_review t2 WHERE t1.review_to = t2.review_to),0)as overall_star,\n\
  IFNULL((SELECT COUNT(*) FROM tbl_review t3 WHERE t1.review_to = t3.review_to AND t3.overall_star = 1),0)as 1_star_count,\n\
  IFNULL((SELECT COUNT(*) FROM tbl_review t4 WHERE t1.review_to = t4.review_to AND t4.overall_star = 2),0)as 2_star_count,\n\
  IFNULL((SELECT COUNT(*) FROM tbl_review t5 WHERE t1.review_to = t5.review_to AND t5.overall_star = 3),0)as 3_star_count,\n\
  IFNULL((SELECT COUNT(*) FROM tbl_review t6 WHERE t1.review_to = t6.review_to AND t6.overall_star = 4),0)as 4_star_count,\n\
  IFNULL((SELECT COUNT(*) FROM tbl_review t7 WHERE t1.review_to = t7.review_to AND t7.overall_star = 5),0)as 5_star_count,\n\
  IFNULL((SELECT AVG(t8.saloon_atmosphere_star) FROM tbl_review t8 WHERE t1.review_to = t8.review_to),0)as saloon_atmosphere_star,\n\
  IFNULL((SELECT AVG(t9.saloon_service_star) FROM tbl_review t9 WHERE t1.review_to = t9.review_to),0)as saloon_service_star,\n\
  IFNULL((SELECT AVG(t10.saloon_cleanliness_star) FROM tbl_review t10 WHERE t1.review_to = t10.review_to),0)as saloon_cleanliness_star\n\
  FROM tbl_review t1 WHERE t1.review_to = ?",
    [user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT t1.*,t2.first_name,t2.last_name,t2.profile_pic,\n\
          (SELECT COUNT(*) FROM tbl_review t1 WHERE t1.review_to = ?)as total_data\n\
           FROM tbl_review t1 \n\
      LEFT JOIN tbl_users t2 ON t1.review_by = t2.user_id \n\
      WHERE t1.review_to = ? ORDER BY t1.review_id DESC LIMIT " +
            limit +
            " OFFSET " +
            offset,
          [user_id, user_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              res[0]["review_data"] = res1;
              body.Status = 1;
              body.Message = "Review listed successfully";
              body.total_page =
                res1.length <= 0 ? 0 : Math.ceil(res1[0].total_data / limit);
              body.info = res[0];
              result(null, body);
              return;
            }
          }
        );
      }
    }
  );
};

exports.add_time_reservation = (req, result) => {
  var body = {};
  req.body.added_by = req.user.user_id;
  req.body.reason_text = hee.decode(req.body.reason_text);
  db.query("INSERT INTO tbl_time_reservation SET ?", [req.body], (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Time Reservation added Successful";
      result(null, body);
      return;
    }
  });
};

exports.edit_time_reservation = (req, result) => {
  var body = {};
  if (req.body.reason_text) {
    req.body.reason_text = hee.decode(req.body.reason_text);
  }
  db.query(
    "UPDATE tbl_time_reservation SET ? WHERE reservation_id = ?",
    [req.body, req.body.reservation_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT * FROM tbl_time_reservation WHERE reservation_id = ?",
          [req.body.reservation_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              body.Status = 1;
              body.Message = "Reservation get successful";
              body.info = res1[0];
              result(null, body);
              return;
            }
          }
        );
      }
    }
  );
};

exports.delete_time_reservation = (req, result) => {
  var body = {};
  db.query(
    "DELETE FROM tbl_time_reservation WHERE reservation_id = ?",
    [req.body.reservation_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        body.Status = 1;
        body.Message = "Time Reservation deleted Successful";
        result(null, body);
        return;
      }
    }
  );
};

exports.add_message_blast = (req, result) => {
  var body = {};
  db.query(
    "SELECT * FROM tbl_message_blast WHERE user_id = ?",
    [req.user.user_id],
    (err, resp) => {
      if (err) {
        console.log("error", err);
      } else {
        if (resp.length <= 0) {
          if (req.files != undefined && req.files.image) {
            var ext = req.files.image[0].originalname.split(".").pop();
            var ImageUrl_media = req.files.image[0].filename;
            var ImageUrl_with__ext = req.files.image[0].filename + "." + ext;
            fs.renameSync(
              "uploads/images/" + ImageUrl_media,
              "uploads/images/" + ImageUrl_with__ext
            );
            req.body.image = "uploads/images/" + ImageUrl_with__ext;
          }
          req.body.user_id = req.user.user_id;
          req.body.regular_message_text = hee.decode(
            req.body.regular_message_text
          );
          req.body.push_message_text = hee.decode(req.body.push_message_text);
          db.query(
            "INSERT INTO tbl_message_blast SET ?",
            [req.body],
            (err, res) => {
              if (err) {
                console.log("error", err);
              } else {
                body.Status = 1;
                body.Message = "Blast message added Successful";
                result(null, body);
                return;
              }
            }
          );
        } else {
          body.Status = 0;
          body.Message = "You have already added a Blast message";
          result(null, body);
          return;
        }
      }
    }
  );
};

exports.edit_message_blast = (req, result) => {
  var body = {};
  if (req.files != undefined && req.files.image) {
    var ext = req.files.image[0].originalname.split(".").pop();
    var ImageUrl_media = req.files.image[0].filename;
    var ImageUrl_with__ext = req.files.image[0].filename + "." + ext;
    fs.renameSync(
      "uploads/images/" + ImageUrl_media,
      "uploads/images/" + ImageUrl_with__ext
    );
    req.body.image = "uploads/images/" + ImageUrl_with__ext;
  }
  req.body.user_id = req.user.user_id;
  db.query(
    "UPDATE tbl_message_blast SET ? WHERE user_id = ?",
    [req.body, req.body.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT * FROM tbl_message_blast WHERE user_id = ?",
          [req.body.user_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              if (res1.length <= 0) {
                body.Status = 1;
                body.Message = "No data found";
                body.is_added = 0;
                body.info = {};
                result(null, body);
                return;
              } else {
                body.Status = 1;
                body.Message = "Blast message edited Successful";
                body.info = res1[0];
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

exports.list_promote_plan = (req, result) => {
  var body = {};
  db.query(
    "SELECT * FROM tbl_promote_plan ORDER BY plan_id ASC",
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        body.Status = 1;
        body.Message = "Promote plan listed Successful";
        body.info = res;
        result(null, body);
        return;
      }
    }
  );
};

exports.list_promotion = (req, result) => {
  var body = {};
  var currentDate = moment().format("YYYY-MM-DD");
  db.query(
    "SELECT t1.type_id,t1.promotion_type,t1.promotion_description,\n\
  t3.promotion_id,t3.user_id,t3.discount,t3.time_period,t3.booking_window_hour,t3.start_time,t3.end_time,t3.day,t3.created_at,\n\
  (SELECT COUNT(*) FROM tbl_booking t2 WHERE t1.type_id = t2.type_id AND t2.booking_status = 2 AND t2.booking_to = ?)as total_appoinment,\n\
  IFNULL((SELECT SUM(t2.total_amount) FROM tbl_booking t2 WHERE t1.type_id = t2.type_id AND t2.booking_status = 2 AND t2.booking_to = ?),0)as total_profit\n\
  FROM tbl_promotion_type t1\n\
  LEFT JOIN tbl_promotion t3 ON t3.user_id = ? AND IF(t1.type_id = t3.type_id AND t3.type_id = 3,t3.day = DAYNAME('" +
      currentDate +
      "'),t1.type_id = t3.type_id) GROUP BY t1.type_id",
    [req.user.user_id, req.user.user_id, req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        body.Status = 1;
        body.Message = "Promotions Listed successfully.";
        body.info = res;
        result(null, body);
        return;
      }
    }
  );
};

exports.promote_saloon = (req, result) => {
  var body = {};
  req.body.user_id = req.user.user_id;
  db.query(
    "SELECT * FROM tbl_promote_saloon WHERE user_id = ? ORDER BY promote_id DESC LIMIT 1",
    [req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (req.body.plan_id == 1) {
          req.body.end_date = moment(req.body.start_date)
            .add(6, "days")
            .format("YYYY-MM-DD");
        } else if (req.body.plan_id == 2) {
          req.body.end_date = moment(req.body.start_date)
            .add(1, "M")
            .format("YYYY-MM-DD");
        } else {
          req.body.end_date = moment(req.body.start_date)
            .add(6, "M")
            .format("YYYY-MM-DD");
        }
        if (res.length <= 0) {
          db.query(
            "INSERT INTO tbl_promote_saloon SET ?",
            [req.body],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                body.Status = 1;
                body.Message = "Saloon promoted successful";
                result(null, body);
                return;
              }
            }
          );
        } else {
          if (
            moment(res[0].end_date).format("YYYY-MM-DD") < req.body.start_date
          ) {
            db.query(
              "INSERT INTO tbl_promote_saloon SET ?",
              [req.body],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                } else {
                  body.Status = 1;
                  body.Message = "Saloon promoted successful";
                  result(null, body);
                  return;
                }
              }
            );
          } else {
            body.Status = 0;
            body.Message = "Your Promote Plan is already active";
            result(null, body);
            return;
          }
        }
      }
    }
  );
};

exports.add_announcement = (req, result) => {
  var body = {};
  req.body.user_id = req.user.user_id;
  req.body.message_text = hee.decode(req.body.message_text);
  db.query(
    "SELECT * FROM tbl_announcement WHERE user_id = ?",
    [req.body.user_id],
    (err, resp) => {
      if (err) {
        console.log("error", err);
      } else {
        if (resp.length <= 0) {
          db.query(
            "INSERT INTO tbl_announcement SET ?",
            [req.body],
            (err, res) => {
              if (err) {
                console.log("error", err);
              } else {
                body.Status = 1;
                body.Message = "Announcement added Successful";
                result(null, body);
                return;
              }
            }
          );
        } else {
          body.Status = 0;
          body.Message = "You have already added Announcement";
          result(null, body);
          return;
        }
      }
    }
  );
};

exports.edit_announcement = (req, result) => {
  var body = {};
  req.body.user_id = req.user.user_id;
  db.query(
    "UPDATE tbl_announcement SET ? WHERE user_id = ?",
    [req.body, req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT * FROM tbl_announcement WHERE user_id = ?",
          [req.user.user_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              if (res1.length <= 0) {
                body.Status = 1;
                body.Message = "No data found";
                body.is_added = 0;
                body.info = {};
                result(null, body);
                return;
              } else {
                body.Status = 1;
                body.Message = "Announcement edited Successful";
                body.info = res1[0];
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

exports.delete_announcement = (req, result) => {
  var body = {};
  db.query(
    "DELETE FROM tbl_announcement WHERE user_id = ?",
    [req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        body.Status = 1;
        body.Message = "Announcement deleted Successful";
        result(null, body);
        return;
      }
    }
  );
};

exports.add_flash_sale_promotion = (req, result) => {
  var body = {};
  var serviceId = req.body.service_id;
  req.body.user_id = req.user.user_id;
  req.body.type_id = 1;
  DeleteKeys(req.body, ["service_id"]);
  db.query(
    "SELECT * FROM tbl_promotion WHERE user_id = ? AND type_id = 1",
    [req.body.user_id],
    (err, resp) => {
      if (err) {
        console.log("error", err);
      } else {
        if (resp.length <= 0) {
          db.query(
            "INSERT INTO tbl_promotion SET ?",
            [req.body],
            (err, res) => {
              if (err) {
                console.log("error", err);
              } else {
                s_id =
                  serviceId.length == 1 ? [serviceId] : serviceId.split(",");
                s_id.forEach((e, i) => {
                  db.query(
                    "INSERT INTO tbl_service_promotion(promotion_id,type_id,service_id,user_id)VALUES(?,?,?,?)",
                    [res.insertId, req.body.type_id, e, req.body.user_id],
                    (err, res1) => {
                      if (err) {
                        console.log("error", err);
                      } else {
                        if (s_id.length - 1 == i) {
                          body.Status = 1;
                          body.Message =
                            "Flash Sale Promotion Added Successful";
                          result(null, body);
                          return;
                        }
                      }
                    }
                  );
                });
              }
            }
          );
        } else {
          body.Status = 0;
          body.Message = "You have already added Flash Sale Promotion";
          result(null, body);
          return;
        }
      }
    }
  );
};

exports.edit_flash_sale_promotion = (req, result) => {
  var body = {};
  function getdata() {
    db.query(
      "SELECT * FROM tbl_promotion WHERE user_id = ? AND type_id = 1",
      [req.user.user_id],
      (err, res4) => {
        if (err) {
          console.log("error", err);
        } else {
          if (res4.length <= 0) {
            body.Status = 1;
            body.Message = "No data found";
            body.is_added = 0;
            body.info = {};
            result(null, body);
            return;
          } else {
            db.query(
              "SELECT t1.*,t2.service_name,t2.service_price,t2.service_duration\n\
               FROM tbl_service_promotion t1 \n\
               LEFT JOIN tbl_provider_service t2 ON t1.service_id = t2.service_id\n\
               WHERE t1.user_id = ? AND t1.type_id = 1",
              [req.user.user_id],
              (err, res5) => {
                if (err) {
                  console.log("error", err);
                } else {
                  res4[0]["service"] = res5;
                  body.Status = 1;
                  body.Message = "flash sale promotion edited Successful";
                  body.info = res4[0];
                  result(null, body);
                  return;
                }
              }
            );
          }
        }
      }
    );
  }

  req.body.user_id = req.user.user_id;
  var serviceId = req.body.service_id;
  DeleteKeys(req.body, ["service_id"]);
  db.query(
    "UPDATE tbl_promotion SET ? WHERE user_id = ?",
    [req.body, req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (serviceId) {
          db.query(
            "DELETE FROM tbl_service_promotion WHERE user_id = ? AND type_id = 1",
            [req.user.user_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                db.query(
                  "SELECT promotion_id FROM tbl_promotion WHERE user_id = ? AND type_id = 1",
                  [req.user.user_id],
                  (err, res2) => {
                    if (err) {
                      console.log("error", err);
                    } else {
                      s_id =
                        serviceId.length == 1
                          ? [serviceId]
                          : serviceId.split(",");
                      s_id.forEach((e, i) => {
                        db.query(
                          "INSERT INTO tbl_service_promotion(promotion_id,type_id,service_id,user_id)VALUES(?,1,?,?)",
                          [res2[0].promotion_id, e, req.user.user_id],
                          (err, res3) => {
                            if (err) {
                              console.log("error", err);
                            } else {
                              if (s_id.length - 1 == i) {
                                getdata();
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
        } else {
          getdata();
        }
      }
    }
  );
};

exports.delete_promotion = (req, result) => {
  var body = {};
  db.query(
    "DELETE FROM tbl_promotion WHERE promotion_id = ?",
    [req.body.promotion_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        db.query(
          "DELETE FROM tbl_service_promotion WHERE promotion_id",
          [req.body.promotion_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
            } else {
              body.Status = 1;
              body.Message = "Promotion deleted successful";
              result(null, body);
              return;
            }
          }
        );
      }
    }
  );
};

exports.add_last_minute_discount = (req, result) => {
  var body = {};
  var serviceId = req.body.service_id;
  req.body.user_id = req.user.user_id;
  req.body.type_id = 2;
  DeleteKeys(req.body, ["service_id"]);
  db.query(
    "SELECT * FROM tbl_promotion WHERE user_id = ? AND type_id = 2",
    [req.body.user_id],
    (err, resp) => {
      if (err) {
        console.log("error", err);
      } else {
        if (resp.length <= 0) {
          db.query(
            "INSERT INTO tbl_promotion SET ?",
            [req.body],
            (err, res) => {
              if (err) {
                console.log("error", err);
              } else {
                s_id =
                  serviceId.length == 1 ? [serviceId] : serviceId.split(",");
                s_id.forEach((e, i) => {
                  db.query(
                    "INSERT INTO tbl_service_promotion(promotion_id,type_id,service_id,user_id)VALUES(?,?,?,?)",
                    [res.insertId, req.body.type_id, e, req.body.user_id],
                    (err, res1) => {
                      if (err) {
                        console.log("error", err);
                      } else {
                        if (s_id.length - 1 == i) {
                          body.Status = 1;
                          body.Message =
                            "Last minute discount Added Successful";
                          result(null, body);
                          return;
                        }
                      }
                    }
                  );
                });
              }
            }
          );
        } else {
          body.Status = 0;
          body.Message = "You have already added Last minute discount";
          result(null, body);
          return;
        }
      }
    }
  );
};

exports.edit_last_minute_discount = (req, result) => {
  var body = {};
  function getdata() {
    db.query(
      "SELECT * FROM tbl_promotion WHERE user_id = ? AND type_id = 2",
      [req.body.user_id],
      (err, res4) => {
        if (err) {
          console.log("error", err);
        } else {
          if (res4.length <= 0) {
            body.Status = 1;
            body.Message = "No data found";
            body.is_added = 0;
            body.info = {};
            result(null, body);
            return;
          } else {
            db.query(
              "SELECT t1.*,t2.service_name,t2.service_price,t2.service_duration\n\
               FROM tbl_service_promotion t1 \n\
               LEFT JOIN tbl_provider_service t2 ON t1.service_id = t2.service_id\n\
               WHERE t1.user_id = ? AND t1.type_id = 2",
              [req.body.user_id],
              (err, res5) => {
                if (err) {
                  console.log("error", err);
                } else {
                  res4[0]["service"] = res5;
                  body.Status = 1;
                  body.Message = "Last minute discount edited Successful";
                  body.info = res4[0];
                  result(null, body);
                  return;
                }
              }
            );
          }
        }
      }
    );
  }

  req.body.user_id = req.user.user_id;
  var serviceId = req.body.service_id;
  DeleteKeys(req.body, ["service_id"]);
  db.query(
    "UPDATE tbl_promotion SET ? WHERE user_id = ?",
    [req.body, req.body.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (serviceId) {
          db.query(
            "DELETE FROM tbl_service_promotion WHERE user_id = ? AND type_id = 2",
            [req.body.user_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                db.query(
                  "SELECT promotion_id FROM tbl_promotion WHERE user_id = ? AND type_id = 2",
                  [req.body.user_id],
                  (err, res2) => {
                    if (err) {
                      console.log("error", err);
                    } else {
                      s_id =
                        serviceId.length == 1
                          ? [serviceId]
                          : serviceId.split(",");
                      s_id.forEach((e, i) => {
                        db.query(
                          "INSERT INTO tbl_service_promotion(promotion_id,type_id,service_id,user_id)VALUES(?,2,?,?)",
                          [res2[0].promotion_id, e, req.body.user_id],
                          (err, res3) => {
                            if (err) {
                              console.log("error", err);
                            } else {
                              if (s_id.length - 1 == i) {
                                getdata();
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
        } else {
          getdata();
        }
      }
    }
  );
};

exports.get_happy_hour = (req, result) => {
  var body = {};
  function getdata() {
    db.query(
      "SELECT day,promotion_id,user_id,type_id,discount,start_time,end_time FROM tbl_promotion WHERE user_id = ? AND type_id = 3",
      [req.user.user_id],
      (err, resp) => {
        if (err) {
          console.log("error", err);
        } else {
          body.Status = 1;
          body.Message = "Happy hour get successful";
          body.info = resp;
          result(null, body);
          return;
        }
      }
    );
  }

  db.query(
    "SELECT * FROM tbl_promotion WHERE user_id = ? AND type_id = 3",
    [req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (res.length <= 0) {
          var happyHour = [
            {
              day: "Monday",
            },
            {
              day: "Tuesday",
            },
            {
              day: "Wednesday",
            },
            {
              day: "Thursday",
            },
            {
              day: "Friday",
            },
            {
              day: "Saturday",
            },
            {
              day: "Sunday",
            },
          ];
          happyHour.forEach((e, i) => {
            db.query(
              "INSERT INTO tbl_promotion(user_id,type_id,day) VALUES (?,3,?)",
              [req.user.user_id, e.day],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                } else {
                  if (happyHour.length - 1 == i) {
                    getdata();
                  }
                }
              }
            );
          });
        } else {
          getdata();
        }
      }
    }
  );
};

exports.edit_daywise_happy_hour = (req, result) => {
  var body = {};
  function getdata() {
    db.query(
      "SELECT day,promotion_id,user_id,type_id,discount,start_time,end_time FROM tbl_promotion WHERE promotion_id = ?",
      [req.body.promotion_id],
      (err, res4) => {
        if (err) {
          console.log("error", err);
        } else {
          if (res4.length <= 0) {
            body.Status = 1;
            body.Message = "No data found";
            body.is_added = 0;
            body.info = {};
            result(null, body);
            return;
          } else {
            db.query(
              "SELECT t1.*,t2.service_name,t2.service_price,t2.service_duration\n\
               FROM tbl_service_promotion t1 \n\
               LEFT JOIN tbl_provider_service t2 ON t1.service_id = t2.service_id\n\
               WHERE t1.promotion_id = ?",
              [req.body.promotion_id],
              (err, res5) => {
                if (err) {
                  console.log("error", err);
                } else {
                  res4[0]["service"] = res5;
                  body.Status = 1;
                  body.Message = "Happy Hour edited Successful";
                  body.info = res4[0];
                  result(null, body);
                  return;
                }
              }
            );
          }
        }
      }
    );
  }

  req.body.user_id = req.user.user_id;
  var serviceId = req.body.service_id;
  DeleteKeys(req.body, ["service_id"]);
  db.query(
    "UPDATE tbl_promotion SET ? WHERE promotion_id = ?",
    [req.body, req.body.promotion_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        if (serviceId) {
          db.query(
            "DELETE FROM tbl_service_promotion WHERE promotion_id = ?",
            [req.body.promotion_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                s_id =
                  serviceId.length == 1 ? [serviceId] : serviceId.split(",");
                s_id.forEach((e, i) => {
                  db.query(
                    "INSERT INTO tbl_service_promotion(promotion_id,type_id,service_id,user_id)VALUES(?,3,?,?)",
                    [req.body.promotion_id, e, req.body.user_id],
                    (err, res3) => {
                      if (err) {
                        console.log("error", err);
                      } else {
                        if (s_id.length - 1 == i) {
                          getdata();
                        }
                      }
                    }
                  );
                });
              }
            }
          );
        } else {
          getdata();
        }
      }
    }
  );
};

exports.add_client = (req, result) => {
  var body = {};
  req.body.user_id = req.user.user_id;
  db.query("INSERT INTO tbl_client SET ?", [req.body], (err, res) => {
    if (err) {
      console.log("error", err);
    } else {
      body.Status = 1;
      body.Message = "Client added successfully";
      result(null, body);
      return;
    }
  });
};

exports.list_client = (req, result) => {
  var body = {};
  const limit = 10;
  const page_no = req.body.page_no;
  const offset = (page_no - 1) * limit;
  var WHERE = "";
  if (req.body.search_text) {
    WHERE =
      " WHERE (t1.first_name LIKE '%" +
      req.body.search_text +
      "%' OR t1.last_name LIKE '%" +
      req.body.search_text +
      "%')";
  }
  db.query(
    "SELECT t1.*,\n\
    (SELECT COUNT(*) FROM tbl_client t1 " +
      WHERE +
      ")as total_data\n\
     FROM tbl_client t1 " +
      WHERE +
      " ORDER BY t1.first_name ASC LIMIT " +
      limit +
      " OFFSET " +
      offset,
    (err, res) => {
      if (err) {
        console.log("error", err);
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
          body.Message = "Client get successful";
          body.total_page = Math.ceil(res[0].total_data / limit);
          body.info = res;
          result(null, body);
          return;
        }
      }
    }
  );
};

exports.list_upcoming_birthday_client = (req, result) => {
  var body = {};
  const limit = 10;
  const page_no = req.body.page_no;
  const offset = (page_no - 1) * limit;
  var WHERE = "";
  if (req.body.search_text) {
    WHERE =
      " AND (first_name LIKE '%" +
      req.body.search_text +
      "%' OR last_name LIKE '%" +
      req.body.search_text +
      "%')";
  }
  db.query(
    "SELECT * FROM tbl_client WHERE DATE_FORMAT(date_of_birth,'%m-%d') BETWEEN ? AND '12-31' " +
      WHERE +
      " ORDER BY date_of_birth ASC LIMIT " +
      limit +
      " OFFSET " +
      offset,
    [moment().format("MM-DD")],
    (err, res) => {
      if (err) {
        console.log("error", err);
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
            "SELECT * FROM tbl_client WHERE DATE_FORMAT(date_of_birth,'%m-%d') BETWEEN ? AND '12-31' " +
              WHERE +
              " ORDER BY date_of_birth ASC",
            [moment().format("MM-DD")],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                body.Status = 1;
                body.Message = "Upcoming birthday get successful";
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

exports.edit_provider_benefit = async (req, result) => {
  var body = {};
  if (req.body.gender_id) {
    db.query(
      "DELETE FROM tbl_provider_service_gender WHERE user_id = ?",
      [req.user.user_id],
      (err, res) => {
        if (err) {
          console.log("error", err);
          result(err, null);
          return;
        } else {
          var genderId =
            req.body.gender_id.length == 1
              ? [req.body.gender_id]
              : req.body.gender_id.split(",");
          console.log("genderId", genderId);
          genderId.forEach(async (e, i) => {
            await db.query(
              "INSERT INTO tbl_provider_service_gender(user_id,gender_id)VALUES(?,?)",
              [req.user.user_id, e],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                }
              }
            );
          });
        }
      }
    );
  }

  if (req.body.benefit_id) {
    console.log("benefit");
    db.query(
      "DELETE FROM tbl_provider_service_benefit WHERE user_id = ?",
      [req.user.user_id],
      (err, res) => {
        if (err) {
          console.log("error", err);
        } else {
          var benefitId =
            req.body.benefit_id.length == 1
              ? [req.body.benefit_id]
              : req.body.benefit_id.split(",");
          console.log("benefitId", benefitId);
          benefitId.forEach((e, i) => {
            db.query(
              "INSERT INTO tbl_provider_service_benefit(user_id,benefit_id)VALUES(?,?)",
              [req.user.user_id, e],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                }
              }
            );
          });
        }
      }
    );
  }
  await db.query("SELECT user_id from tbl_users", (err, res) => {
    if (err) {
      console.log("error", err);
    } else {
      db.query(
        "SELECT t1.*,\n\
        (SELECT COUNT(*) FROM tbl_provider_service_gender t2 WHERE t1.gender_id = t2.gender_id AND t2.user_id = ?)as is_select\n\
         FROM tbl_service_gender t1",
        [req.user.user_id],
        (err, resp) => {
          if (err) {
            console.log("error", err);
          } else {
            db.query(
              "SELECT t1.*,\n\
                (SELECT COUNT(*) FROM tbl_provider_service_benefit t2 WHERE t1.benefit_id = t2.benefit_id AND t2.user_id = ?)as is_select\n\
                 FROM tbl_benefit t1",
              [req.user.user_id],
              (err, resp1) => {
                if (err) {
                  console.log("error", err);
                } else {
                  body.Status = 1;
                  body.Message = "Benefit edited successful";
                  body.info = {
                    gender_data: resp,
                    benefit_data: resp1,
                  };
                  result(null, body);
                  return;
                }
              }
            );
          }
        }
      );
    }
  });
};

exports.create_checkout = (req, result) => {
  var body = {};
  req.body.booking_by = req.user.user_id;
  req.body.booking_to = req.body.client_id;
  req.body.booking_type = 1;
  var serviceId = req.body.service_id;
  DeleteKeys(req.body, ["service_id", "client_id"]);
  db.query("INSERT INTO tbl_booking SET ?", [req.body], (err, res) => {
    if (err) {
      console.log("error", err);
    } else {
      var sid = serviceId.length == 1 ? [serviceId] : serviceId.split(",");
      sid.forEach((e, i) => {
        db.query(
          "INSERT INTO tbl_service_booking(booking_id,user_id,service_id)VALUES(?,?,?)",
          [res.insertId, req.body.booking_to, e],
          (err, res1) => {
            if (err) {
              console.log("error", err);
            } else {
              if (sid.length - 1 == i) {
                body.Status = 1;
                body.Message = "Checkout created successfully";
                result(null, body);
                return;
              }
            }
          }
        );
      });
    }
  });
};

exports.get_staff_member = (req, result) => {
  var body = {};
  db.query(
    "SELECT t1.user_id,t1.added_by,t1.user_role,t1.first_name,t1.last_name,\n\
  t1.profile_pic,t1.is_available\n\
 FROM tbl_users t1 WHERE t1.added_by = ?",
    [req.body.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        body.Status = 1;
        body.Message = "Member get successful";
        body.info = res;
        result(null, body);
        return;
      }
    }
  );
};

exports.get_opening_calender = (req, result) => {
  var body = {};
  console.log(req.user.user_id);
  db.query(
    "SELECT * FROM tbl_bussiness_hour WHERE user_id = ? AND day = DAYNAME('" +
      req.body.calender_date +
      "')",
    [req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        console.log("res", res);
        db.query(
          "SELECT * FROM tbl_bussiness_hour_break WHERE hour_id = ?",
          [res[0].hour_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
            } else {
              res[0]["break"] = res1;
              body.Status = 1;
              body.Message = "Opening calender get successful";
              body.info = res[0];
              result(null, body);
              return;
            }
          }
        );
      }
    }
  );
};

exports.add_workshift = (req, result) => {
  var body = {};
  var obj = JSON.parse(req.body.workshift_data);
  var workshift = {
    user_id: req.user.user_id,
    member_id: req.body.member_id,
    shift_date: req.body.calender_date,
    start_time: obj.start_time,
    end_time: obj.end_time,
  };
  db.query(
    "INSERT INTO tbl_member_workshift SET ?",
    [workshift],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        var breakdata = obj.break.length <= 0 ? [0] : obj.break;
        breakdata.forEach((e1, i1) => {
          if (e1 != 0) {
            var break_data = {
              user_id: req.user.user_id,
              workshift_id: res.insertId,
              break_start: e1.break_start,
              break_end: e1.break_end,
            };
            db.query(
              "INSERT INTO tbl_member_workshift_break SET ?",
              [break_data],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                }
              }
            );
          }
          if (breakdata.length - 1 == i1) {
            var timeoffdata = obj.timeoff.length <= 0 ? [0] : obj.timeoff;
            timeoffdata.forEach((e2, i2) => {
              if (e2 != 0) {
                var timeoff_data = {
                  user_id: req.user.user_id,
                  member_id: req.body.member_id,
                  timeoff_date: e2.timeoff_date,
                  reason_id: e2.reason_id,
                  type: e2.type,
                  start_date: e2.start_date,
                  end_date: e2.end_date,
                  start_time: e2.start_time,
                  end_time: e2.end_time,
                };
                db.query(
                  "INSERT INTO tbl_workshift_timeoff SET ?",
                  [timeoff_data],
                  (err, res2) => {
                    if (err) {
                      console.log("error", err);
                    }
                  }
                );
              }
              if (timeoffdata.length - 1 == i2) {
                body.Status = 1;
                body.Message = "Workshift added successfully";
                result(null, body);
                return;
              }
            });
          }
        });
      }
    }
  );
};

exports.edit_workshift = (req, result) => {
  var body = {};
  var calender_date = req.body.calender_date;
  function getworkshift() {
    db.query(
      "SELECT * FROM tbl_member_workshift WHERE user_id = ? AND member_id = ? AND day = DAYNAME('" +
        calender_date +
        "')",
      [req.user.user_id, req.body.member_id],
      (err, res) => {
        if (err) {
          console.log("error", err);
        } else {
          if (res.length <= 0) {
            body.Status = 1;
            body.Message = "No workshift added";
            body.info = {};
            result(null, body);
            return;
          } else {
            db.query(
              "SELECT * FROM tbl_member_workshift_break WHERE workshift_id = ?",
              [res[0].workshift_id],
              (err, res1) => {
                if (err) {
                  console.log("error", err);
                } else {
                  db.query(
                    "SELECT * FROM tbl_workshift_timeoff WHERE user_id = ? AND member_id = ?",
                    [req.user.user_id, req.body.member_id],
                    (err, res2) => {
                      if (err) {
                        console.log("error", err);
                      } else {
                        res[0]["break"] = res1;
                        res[0]["timeoff"] = res2;
                        body.Status = 1;
                        body.Message = "Workshift edited successfully";
                        body.info = res[0];
                        result(null, body);
                        return;
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
  if (req.body.workshift_data) {
    var obj = JSON.parse(req.body.workshift_data);
    var workshift = {
      workshift_id: obj.workshift_id,
      user_id: req.user.user_id,
      member_id: req.body.member_id,
      start_time: obj.start_time,
      end_time: obj.end_time,
      is_closed: obj.is_closed,
    };
    db.query(
      "UPDATE tbl_workshifts SET ? WHERE workshift_id = ?",
      [workshift, workshift.workshift_id],
      (err, res) => {
        if (err) {
          console.log("error", err);
        } else {
          var breakdata = obj.break.length <= 0 ? [0] : obj.break;
          breakdata.forEach((e1, i1) => {
            if (e1 != 0) {
              var break_data = {
                user_id: req.user.user_id,
                workshift_id: obj.workshift_id,
                break_start: e1.break_start,
                break_end: e1.break_end,
              };
              if (e1.break_id == 0) {
                //INSERT
                db.query(
                  "INSERT INTO tbl_member_workshift_break SET ?",
                  [break_data],
                  (err, res1) => {
                    if (err) {
                      console.log("error", err);
                    }
                  }
                );
              } else {
                //UPDATE
                db.query(
                  "UPDATE tbl_member_workshift_break SET ? WHERE break_id = ?",
                  [break_data, e1.break_id],
                  (err, res1) => {
                    if (err) {
                      console.log("error", err);
                    }
                  }
                );
              }
            }
            if (breakdata.length - 1 == i1) {
              var timeoffdata = obj.timeoff.length <= 0 ? [0] : obj.timeoff;
              timeoffdata.forEach((e2, i2) => {
                if (e2 != 0) {
                  var timeoff_data = {
                    user_id: req.user.user_id,
                    member_id: req.body.member_id,
                    timeoff_date: e2.timeoff_date,
                    reason_id: e2.reason_id,
                    type: e2.type,
                    start_date: e2.start_date,
                    end_date: e2.end_date,
                    start_time: e2.start_time,
                    end_time: e2.end_time,
                  };
                  if (e2.timeoff_id == 0) {
                    //INSERT
                    db.query(
                      "INSERT INTO tbl_workshift_timeoff SET ?",
                      [timeoff_data],
                      (err, res2) => {
                        if (err) {
                          console.log("error", err);
                        }
                      }
                    );
                  } else {
                    //UPDATE
                    db.query(
                      "UPDATE tbl_workshift_timeoff SET ? WHERE timeoff_id = ?",
                      [timeoff_data, e2.timeoff_id],
                      (err, res2) => {
                        if (err) {
                          console.log("error", err);
                        }
                      }
                    );
                  }
                }
                if (timeoffdata.length - 1 == i2) {
                  getworkshift();
                }
              });
            }
          });
        }
      }
    );
  } else {
    getworkshift();
  }
};

exports.list_all_member_workshift = (req, result) => {
  var body = {};
  db.query(
    "SELECT t1.*,\n\
    t2.first_name,t2.last_name,t2.profile_pic\n\
    FROM tbl_member_workshift t1\n\
    JOIN tbl_users t2 ON t1.member_id = t2.user_id\n\
    WHERE t1.user_id = ? AND t1.day = DAYNAME('" +
      req.body.calender_date +
      "')",
    [req.user.user_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        res.forEach((e, i) => {
          db.query(
            "SELECT * FROM tbl_member_workshift_break WHERE workshift_id = ?",
            [e.workshift_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                res[i]["break"] = res1;
                if (res.length - 1 == i) {
                  body.Status = 1;
                  body.Message = "Workshift listed successfully";
                  body.info = res;
                  result(null, body);
                  return;
                }
              }
            }
          );
        });
      }
    }
  );
};

exports.list_member_workshift = (req, result) => {
  var body = {};
  db.query(
    "SELECT * FROM tbl_member_workshift WHERE user_id = ? AND member_id = ?",
    [req.user.user_id, req.body.member_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
      } else {
        res.forEach((e, i) => {
          db.query(
            "SELECT * FROM tbl_member_workshift_break WHERE workshift_id = ?",
            [e.workshift_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
              } else {
                res[i]["break"] = res1;
                if (res.length - 1 == i) {
                  body.Status = 1;
                  body.Message = "Workshift get successful";
                  body.info = res;
                  result(null, body);
                  return;
                }
              }
            }
          );
        });
      }
    }
  );
};

exports.list_reason = (req, result) => {
  var body = {};
  db.query("SELECT * FROM tbl_timeoff_reason", (err, res) => {
    if (err) {
      console.log("error", err);
    } else {
      body.Status = 1;
      body.Message = "Reason get successful";
      body.info = res;
      result(null, body);
      return;
    }
  });
};

exports.get_time_slot = (req, result) => {
  var body = {};
  db.query("");
};
