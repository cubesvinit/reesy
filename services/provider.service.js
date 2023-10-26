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
                                        console.log("if...");
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
                                                                        if(m_data){
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
                                                                            );
                                                                          }
                                                                        );
                                                                        }else{
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
  );
};

exports.edit_bussiness_hour = (req, result) => {
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
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Member added successful";
      result(null, body);
      return;
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
  req.body.regular_message_text = hee.decode(req.body.regular_message_text);
  req.body.push_message_text = hee.decode(req.body.push_message_text);
  db.query("INSERT INTO tbl_message_blast SET ?", [req.body], (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Blast message added Successful";
      result(null, body);
      return;
    }
  });
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
  db.query(
    "UPDATE tbl_message_blast SET ? WHERE message_id = ?",
    [req.body, req.body.message_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT * FROM tbl_message_blast WHERE message_id = ?",
          [req.body.message_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              body.Status = 1;
              body.Message = "Blast message edited Successful";
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

exports.promote_saloon = (req, result) => {
  var body = {};
  req.body.user_id = req.user.user_id;
  if (req.body.promote_id == 0) {
    db.query(
      "SELECT * FROM tbl_promote_saloon WHERE user_id = ?",
      [req.body.user_id],
      (err, res) => {
        if (err) {
          console.log("error", err);
          result(err, null);
          return;
        } else {
          if (res.length <= 0) {
            db.query(
              "INSERT INTO tbl_promote_saloon SET ?",
              [req.body],
              (err, res) => {
                if (err) {
                  console.log("error", err);
                  result(err, null);
                  return;
                } else {
                  body.Status = 1;
                  body.Message = "Promotion added successful";
                  body.promote_id = res.insertId;
                  result(null, body);
                  return;
                }
              }
            );
          } else {
            body.Status = 0;
            body.Message = "You have already promote your saloon";
            body.promote_id = res[0].promote_id;
            result(null, body);
            return;
          }
        }
      }
    );
  } else {
    db.query(
      "UPDATE tbl_promote_saloon SET ? WHERE promote_id = ?",
      [req.body, req.body.promote_id],
      (err, res) => {
        if (err) {
          console.log("error", err);
          result(err, null);
          return;
        } else {
          db.query(
            "SELECT * FROM tbl_promote_saloon WHERE promote_id = ?",
            [req.body.promote_id],
            (err, res1) => {
              if (err) {
                console.log("error", err);
                result(err, null);
                return;
              } else {
                body.Status = 1;
                body.Message = "Promotion edited successful";
                body.info = res1[0];
                result(null, body);
                return;
              }
            }
          );
        }
      }
    );
  }
};

exports.add_announcement = (req, result) => {
  var body = {};
  req.body.user_id = req.user.user_id;
  req.body.message_text = hee.decode(req.body.message_text);
  db.query("INSERT INTO tbl_announcement SET ?", [req.body], (err, res) => {
    if (err) {
      console.log("error", err);
      result(err, null);
      return;
    } else {
      body.Status = 1;
      body.Message = "Announcement added Successful";
      result(null, body);
      return;
    }
  });
};

exports.edit_announcement = (req, result) => {
  var body = {};
  db.query(
    "UPDATE tbl_announcement SET ? WHERE announcement_id = ?",
    [req.body, req.body.announcement_id],
    (err, res) => {
      if (err) {
        console.log("error", err);
        result(err, null);
        return;
      } else {
        db.query(
          "SELECT * FROM tbl_announcement WHERE announcement_id = ?",
          [req.body.announcement_id],
          (err, res1) => {
            if (err) {
              console.log("error", err);
              result(err, null);
              return;
            } else {
              body.Status = 1;
              body.Message = "Announcement edited Successful";
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

exports.delete_announcement = (req, result) => {
  var body = {};
  db.query(
    "DELETE FROM tbl_announcement WHERE announcement_id = ?",
    [req.body.announcement_id],
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
