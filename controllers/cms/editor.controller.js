const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs,
} = require("../../helpers/_base_helpers");
const fs = require("fs");
const dir = "uploads";
const uuidv4 = require("uuid/v4");
const sizeOf = require("image-size");
const Jimp = require("jimp");

class Editor {
  async Upload_image(req, res) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    let file = req.files.upload;

    let name = file.name.split(".");
    let typeFile = name[name.length - 1];

    let uuid = uuidv4();
    if (file.name.match(/\.(jpg|png)$/i)) {
      let pathFile = `${dir}/${uuid}.${typeFile}`;

      let upLoad = await file.mv(pathFile, async (err) => {
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

      if (!upLoad) {
        pathFile;

        return pathFile;

        // fs.writeFile(pathFile, upLoad, function (err) {
        //   if (err) console.log({ err: err });
        //   else {
        //     html = "";
        //     html += "<script type='text/javascript'>";
        //     html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
        //     html +=
        //       '    var url     = "/uploads/' + req.files.upload.name + '";';
        //     html += '    var message = "Uploaded file successfully";';
        //     html += "";
        //     html +=
        //       "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
        //     html += "</script>";

        //     res.send(html);
        //   }
        // });
      }
    }
    try {
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Editor;
