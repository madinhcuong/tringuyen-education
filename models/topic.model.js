const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TopicSchema = mongoose.Schema({
    name_topic: {
        type: String,
        default: ""
    }
}, {
    versionKey: false,
    id: false,
    timestamps: true
});

module.exports = mongoose.model('Topic', TopicSchema);
