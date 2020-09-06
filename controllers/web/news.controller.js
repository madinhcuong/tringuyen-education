const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs
} = require("../../helpers/_base_helpers");

const news_model = require("../../models/news.model");

class News {
  async GetLisNewsHome(req, res) {
    try {
      let data = await news_model.aggregate([
        { $project: { name_news: 1, image: 1, createdAt: 1 } },
        { $sort: { createdAt: -1 } },
        { $limit: 6 }
      ]);

      return responseOk(res, data);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListNewsByIdTopic(req, res) {
    try {
      let query = {};
      let pageOptions = {
        page: req.query.page || 1,
        limit: 10
      };
      let id_topic = req.params.id;

      news_model
        .paginate(
          {
            id_topic: id_topic
          },
          {
            populate: [
              {
                path: "id_topic",
                select: "name_topic"
              }
            ],
            select: "name_news image",
            page: pageOptions.page,
            limit: pageOptions.limit
          }
        )
        .then(result => {
          return responseOk(res, result);
        });
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetNewsById(req, res) {
    try {
      let id_news = req.params.id;

      let data_news = await news_model
        .findById(id_news)
        .select("name_news image content createdAt");
      if (!data_news) return responseError(res, 400, 4, "NEWS_NOT_FOUND");

      return responseOk(res, data_news);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListNewsSliderHome(req, res) {
    try {
      let data = await news_model.aggregate([
        { $sample: { size: 3 } },
        { $project: { name_news: 1, content: 1 } }
      ]);

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = News;
