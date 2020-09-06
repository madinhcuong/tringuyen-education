const { _extend } = require("util");
const { responseOk, responseError, savelogs } = require("../../helpers/_base_helpers");

const News_model = require("../../models/news.model");
const Topic_model = require("../../models/topic.model");

class News {
  async GetInforNews(req, res) {
    try {
      let seach_name_news = req.query.name_news;
      let seach_name_topic = req.query.name_topic;
      if (
        !seach_name_news ||
        seach_name_news == null ||
        seach_name_news == undefined ||
        seach_name_news == ""
      )
        seach_name_news = "";
      if (
        !seach_name_topic ||
        seach_name_topic == null ||
        seach_name_topic == undefined ||
        seach_name_topic == ""
      )
        seach_name_topic = "";

      let data_news = [];
      data_news = await News_model.aggregate([
        { $match: { name_news: { $regex: seach_name_news, $options: "$i" } } },
        {
          $lookup: {
            from: "topics",
            let: { id_topic: "$id_topic" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_topic"] },
                  name_topic: {
                    $regex: seach_name_topic,
                    $options: "$i"
                  }
                }
              },
              { $project: { name_topic: 1 } }
            ],
            as: "topic"
          }
        },
        {
          $project: {
            name_news: 1,
            topic: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $unwind: "$topic"
        },
        {
          $unwind: { path: "$topic", preserveNullAndEmptyArrays: true }
        },
        { $sort: { createdAt: -1 } }
      ]);

      // let array_news = [];
      // if (data_news.length > 0) {
      //   data_news = data_news.map(item => {
      //     if (item.topic.length > 0) {
      //       array_news.push(item);
      //     }
      //   });
      // }
      return responseOk(res, data_news);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetNewsById(req, res) {
    try {
      let id_news = req.params.id;

      let data_news = await News_model.findById(id_news).populate({
        path: "id_topic",
        select: "name_topic"
      });
      if (!data_news) return responseError(res, 400, 4, "NEWS_NOT_FOUND");

      return responseOk(res, data_news);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async CreateNews(req, res) {
    try {
      let body = _extend({}, req.body);

      let data_body = {
        id_topic: body.id_topic,
        image: body.image,
        name_news: body.name_news,
        content: body.content
      };

      await new News_model(data_body).save();

      savelogs(req.authenticatedAdmin._id, "CREATE", "Thêm mới tin tức");

      return responseOk(res, "CREATE_SUCCSESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async EditNews(req, res) {
    try {
      let body = _extend({}, req.body);
      let id_news = req.params.id;

      let data_body = {
        id_topic: body.id_topic,
        image: body.image,
        name_news: body.name_news,
        content: body.content
      };

      let data = await News_model.findByIdAndUpdate(id_news, data_body, {
        new: true
      });
      if (!data) return responseError(res, 400, 4, "NEWS_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa đổi thông tin tin tức");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async DeleteNews(req, res) {
    try {
      let id_news = req.params.id;

      let data = await News_model.findByIdAndDelete(id_news);
      if (!data) return responseError(res, 400, 4, "NEWS_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "DELETE", "Xóa tin tức");

      return responseOk(res, "DELETE_SUCCSESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = News;

// async GetInforNews(req, res) {
//     try {
//         let seach_name_news = req.query.name_news;
//         let seach_name_topic = req.query.name_topic;
//         if (!seach_name_news || seach_name_news == null || seach_name_news == undefined || seach_name_news == '') seach_name_news = '';

//         let query = { name_news: { $regex: seach_name_news, $options: '$i' } };

//         let id_topic = null;
//         if (seach_name_topic && seach_name_topic != null && seach_name_topic != undefined) {
//             let data_topic = await Topic_model.aggregate([
//                 { $match: { name_topic: { $regex: seach_name_topic, $options: '$i' } } },
//                 { $group: { _id: null, list: { $push: '$_id' } } },
//                 { $project: { _id: false } }
//             ]);

//             id_topic = data_topic.length > 0 ? data_topic[0].list : [];
//             query = { name_news: { $regex: seach_name_news, $options: '$i' }, id_topic: { $in: id_topic } };
//         }

//         let options = {
//             sort: { createdAt: -1 },
//             populate: {
//                 path: 'id_topic',
//                 select: 'name_topic'
//             }
//         };

//         let data_news = await News_model.paginate(query, options);
//         if (!data_news) return responseError(res, 400, 4, 'DATA_NEWS_NOT_FOUND');

//         return responseOk(res, data_news)
//     } catch (err) {
//         console.log(err);
//         return responseError(res, 500, 0, "ERROR");
//     }
// }
