const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs,
} = require("../../helpers/_base_helpers");

const Courses_model = require("../../models/courses.model");

class Courses {
  async GetListCourses(req, res) {
    try {
      let seach_name_courses = req.query.name_courses;
      let seach_name_training = req.query.name_training;
      if (
        !seach_name_courses ||
        seach_name_courses == null ||
        seach_name_courses == undefined ||
        seach_name_courses == ""
      )
        seach_name_courses = "";
      if (
        !seach_name_training ||
        seach_name_training == null ||
        seach_name_training == undefined ||
        seach_name_training == ""
      )
        seach_name_training = "";

      let data_Courses = [];
      data_Courses = await Courses_model.aggregate([
        {
          $match: { name: { $regex: seach_name_courses, $options: "$i" } },
        },
        {
          $lookup: {
            from: "trainings",
            let: { id_training: "$id_training" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_training"] },
                  name: {
                    $regex: seach_name_training,
                    $options: "$i",
                  },
                },
              },
              { $project: { name: 1 } },
            ],
            as: "id_training",
          },
        },
        {
          $project: {
            id_training: 1,
            name: 1,
            time: 1,
            tuition_Fees: 1,
            location: 1,
            depict: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $unwind: "$id_training",
        },
        {
          $unwind: { path: "$id_training", preserveNullAndEmptyArrays: true },
        },
        { $sort: { createdAt: -1 } },
      ]);

      return responseOk(res, data_Courses);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListCourses_NoPermission(req, res) {
    try {
      let data = await Courses_model.find({ status: "OPEN" }).select("name");
      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async CreateCourses(req, res) {
    try {
      let body = _extend({}, req.body);

      let data = {
        id_training: body.id_training,
        name: body.name,
        time: body.time,
        tuition_Fees: body.tuition_Fees,
        location: body.location,
        depict: body.depict,
        status: body.status,
      };

      let data_Courses = await new Courses_model(data).save();
      if (!data_Courses)
        return responseError(res, 400, 24, "NOT_CREATE_COURSES");

      savelogs(req.authenticatedAdmin._id, "CREATE", "Thêm mới khóa học");

      return responseOk(res, data_Courses);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetCoursesByID(req, res) {
    try {
      let id_courses = req.params.id;

      let data_Courses = await Courses_model.findById(id_courses)
        .populate({
          path: "id_training",
          select: "name",
        })
        .select(
          "id_training name time tuition_Fees location depict status createdAt updatedAt"
        );

      if (!data_Courses)
        return responseError(res, 400, 26, "NOT_COURSES_NOT_FOUND");

      return responseOk(res, data_Courses);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateCourses(req, res) {
    try {
      let id_courses = req.params.id;
      let body = _extend({}, req.body);

      let data = {
        id_training: body.id_training,
        name: body.name,
        time: body.time,
        tuition_Fees: body.tuition_Fees,
        location: body.location,
        depict: body.depict,
        status: body.status,
      };

      let data_Courses = await Courses_model.findByIdAndUpdate(
        id_courses,
        data,
        { new: true }
      );
      if (!data_Courses)
        return responseError(res, 400, 26, "NOT_COURSES_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa đổi khóa học");

      return responseOk(res, data_Courses);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateStatusCourses(req, res) {
    try {
      let id_courses = req.params.id;
      let body = _extend({}, req.body);

      let data = {
        status: body.status,
      };

      let data_Courses = await Courses_model.findByIdAndUpdate(
        id_courses,
        data,
        { new: true }
      )
        .populate({
          path: "id_training",
          select: "name",
        })
        .select(
          "id_training name time tuition_Fees location depict status createdAt updatedAt"
        );
      if (!data_Courses)
        return responseError(res, 400, 24, "NOT_CREATE_COURSES");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa trạng thái khóa học");

      return responseOk(res, data_Courses);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Courses;
