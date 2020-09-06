const { _extend } = require('util');
const { responseOk, responseError } = require('../../helpers/_base_helpers');

const Topic_model = require('../../models/topic.model');

class Topic {

    async getInforTopic(req, res) {
        try {
            let data = await Topic_model.find().select("name_topic")
            return responseOk(res, data)
        } catch (err) {
            console.log(err)
            return responseError(res, 500, '', 'error')
        }
    }

}
module.exports = Topic;
