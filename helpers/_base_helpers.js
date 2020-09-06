const fs = require("fs");
var Jimp = require("jimp");
var sizeOf = require("image-size");
const dir = "uploads";
const uuidv4 = require("uuid/v4");
const _ = require("lodash");
const dirImport = "imports";

const specKeys = ["sort", "page", "limit"];

const Logs_Model = require("../models/logs.model");

module.exports = {
  responseOk: (res, data) => {
    res.send(data);
  },

  responseError: (res, status, error_code, message) => {
    res.status(status).send({
      status: status,
      errcode: error_code,
      message: message || messages[status] || "Error corrupt",
    });
  },

  authorizedAdminByPermission: (permission) => {
    return (req, res, next) => {
      const listRoleCurrent = req.authenticatedAdmin.permissionGroup
        ? req.authenticatedAdmin.permissionGroup.permissions
        : [];

      for (let permissionOfUser of listRoleCurrent)
        if (permission === permissionOfUser) return next();
      return module.exports.responseError(res, 888, 888, "UNAUTHORIZED");
    };
  },

  pagingOptions: (req, populate = [], select = {}, sort = {}) => {
    let page = 1;
    let limit = 10;
    let pageNum = _.parseInt(req.query.page);
    if (!_.isNaN(pageNum)) {
      page = pageNum;
    }
    let limitNum = _.parseInt(req.query.limit);
    if (!_.isNaN(limitNum)) {
      limit = limitNum;
    }
    if (_.size(req.query.sort) > 0) {
      let params = _.split(req.query.sort, "|");
      for (let i = 0; i < params.length; i += 2)
        sort[params[i]] = params[i + 1];
    }

    return {
      page: page,
      limit: limit,
      populate: populate,
      select: select,
      sort: sort,
    };
  },

  searchingQueries: (
    req,
    containKeys = [],
    extend = { add: {}, remove: {} }
  ) => {
    let queries = {};
    _.forOwn(req.query, (val, key) => {
      if (_.size(val) > 0 && !_.includes(specKeys, key)) {
        if (key === "createdAt" || key === "updatedAt") {
          queries[key] = {
            $gte: new Date(`${val}T00:00:00`),
            $lt: new Date(`${val}T23:59:59`),
          };
        } else if (_.includes(containKeys, key)) {
          queries[key] = { $regex: val, $options: "i" };
        } else {
          queries[key] = val;
        }
      }
    });
    _.forOwn(extend.add, (val, key) => {
      queries[key] = val;
    });
    _.forOwn(extend.remove, (val, key) => {
      delete queries[key];
    });

    return queries;
  },

  getListIDByModelAndQuery: async (model, query, keyID) => {
    let result = [];
    try {
      result = await model.aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: null,
            list: { $push: `$${keyID}` },
          },
        },
        {
          $project: { _id: false },
        },
      ]);
      return result[0].list;
    } catch (error) {
      return result;
    }
  },

  savelogs: (id_user, action, content) => {
    new Logs_Model({
      id_user: id_user,
      action: action,
      content: content,
    }).save();
  },

  paginateAggregate: async (mode, query, page, limit, addFields) => {
    page = page > 0 ? +page : 1;
    limit = limit > 0 ? +limit : 10;

    let aggregation = [
      ...query,
      {
        $facet: {
          count: [
            {
              $count: "count",
            },
          ],
          docs: [
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
      {
        $project: {
          docs: 1,
          count: { $arrayElemAt: ["$count", 0] },
        },
      },
      {
        $project: {
          docs: 1,
          totalDocs: "$count.count",
        },
      },
      {
        $addFields: {
          totalPages: { $ceil: { $divide: ["$totalDocs", limit] } },
          page,
          limit,
          addFields,
        },
      },
    ];

    let data = await mode.aggregate(aggregation);
    return data[0];
  },

  ImportImages: async (req, res) => {
    let images = "images";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const arr = req.files.file;
    var arr_path = [];
    if (arr.length > 1) {
      for (let i = 0; i < arr.length; i++) {
        let fileUpload = arr[i]; //images
        let name = fileUpload.name.split(".");
        let typeFile = name[name.length - 1];
        //accept file
        if (fileUpload.name.match(/\.(jpg|png)$/i)) {
          let uuid = uuidv4();
          let pathFile = `${dir}/${uuid}.${typeFile}`;
          fileUpload.mv(pathFile, (err) => {
            if (!err) {
              var dimensions = sizeOf(pathFile);
              Jimp.read(pathFile, (err, lenna) => {
                if (err) return err.message;
                lenna
                  //.resize(256, 256)
                  .quality(60) // set
                  .write(pathFile);
              });
            } else return "IMAGES_UPLOAD_FAIL";
          });
          arr_path.push(pathFile);
        }
      }
      return arr_path;
    } else {
      let fileUpload = arr; //image
      let name = fileUpload.name.split(".");
      let typeFile = name[name.length - 1];
      //accept file
      let uuid = uuidv4();
      if (fileUpload.name.match(/\.(jpg|png)$/i)) {
        let pathFile = `${dir}/${uuid}.${typeFile}`;
        let upLoad = await fileUpload.mv(pathFile, async (err) => {
          if (!err) {
            var dimensions = sizeOf(pathFile);
            Jimp.read(pathFile, (err, lenna) => {
              if (err) return err.message;
              lenna
                //.resize(256, 256)
                .quality(60) // set
                .write(pathFile);
            });
          } else return "IMAGES_UPLOAD_FAIL";
        });
        arr_path[0] = pathFile;
        if (!upLoad) {
          return pathFile;
        }
      }
    }
  },

  create_key: () => {
    let time = Date.now();
    var text = "";
    var char_list = "ABCDEFGHPQR";
    for (var i = 0; i < 2; i++) {
      text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    return `${text}${time.toString().slice(9, 13)}`;
  },

  createDiplomaCode: () => {
    let time = Date.now();
    return `A${time.toString().slice(5, 12)}`;
  },

  slug: (title) => {
    if (title == undefined || title == "") {
      return "";
    } else {
      var slug = title.toLowerCase();

      //Xóa Ký Tự Đặc Biệt
      slug = slug.replace(
        /\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\/|\?|\<|\>|\,|\.|\;|\"|\'|\[|\]|\{|\}|\:|\-|\_|\\/gi,
        ""
      );

      // str.replace(/^\s+|\s+$/gm, "");

      //Đổi Khoảng Trằng Thành -
      slug = slug.replace(/ /gi, "");

      return slug;
    }
  },

  // chuyern khoang trắng
  remove_space_url_payment: (title, key_change) => {
    if (title == undefined || title == "") {
      return "";
    } else {
      let slug = title.replace(/ /gi, `${key_change}`);
      return slug;
    }
  },

  // chuyển ký tự
  remove_key_payment: (title, key_change) => {
    if (title == undefined || title == "") {
      return "";
    } else {
      let slug = title.replace(/\-/gi, `${key_change}`);
      return slug;
    }
  },

  getPathFile: async (req, res) => {
    let files = req.files;
    let fileUpload = req.files.file;
    let name = fileUpload.name.split(".");
    let typeFile = name[name.length - 1];

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;

    let now = _.now();

    if (!files) {
      return baseHelper.responseError(res, 400, "import_file_not_found");
    }

    if (!fs.existsSync(dirImport)) {
      fs.mkdirSync(dirImport);
    }

    if (!fs.existsSync(`${dirImport}/${year}`)) {
      fs.mkdirSync(`${dirImport}/${year}`);
    }

    if (!fs.existsSync(`${dirImport}/${year}/${month}`)) {
      fs.mkdirSync(`${dirImport}/${year}/${month}`);
    }
    let pathFile = `${dirImport}/${year}/${month}/${now}.${typeFile}`;
    let upLoad = await fileUpload.mv(pathFile);
    if (!upLoad) {
      return pathFile;
    }
  },

  getValueOfCell: (value) => {
    if (typeof value === "object") return trimSpace(value.result);
    if (typeof value === "string" || typeof value === "number")
      return trimSpace(value);
  },

  // kiem tra number
  isNumber: (n) => {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
  },

  nameFormat: (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str.toUpperCase();
    return str;
  },
};
function trimSpace(str) {
  if (typeof str === "string")
    return str.replace(
      /\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\/|\?|\<|\>|\,|\.|\;|\"|\'|\[|\]|\{|\}|\:|\_|\\/gi,
      ""
    );
  else return str;
}

// delay for
// sleep: ms => {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
// for (let i = 0; i < 10; i++) {
//     await sleep(2000);
//     console.log(i)
// }

//-- paginate

// var pageOptions = {
//   page: req.query.page || 0,
//   limit: 5
// };
// await Logs_model.count().exec(async (err, count) => {
//   await Logs_model.find()
//     .skip(pageOptions.page * pageOptions.limit)
//     .limit(pageOptions.limit)
//     .exec(function(err, docs) {
//       if (err) {
//         res.status(500).json(err);
//         return;
//       }

//       let data_Logs = {
//         docs,
//         totalCount: count,
//         limit: parseInt(pageOptions.limit),
//         page: parseInt(pageOptions.page)
//       };

//       return responseOk(res, data_Logs);
//     });
// });
