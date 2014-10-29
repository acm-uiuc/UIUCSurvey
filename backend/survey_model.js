var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SurveySchema = new Schema({
    name: String,
    created: Date,
    author: String,
    price: Number,
    expiration: Date,
    target: {},
    distributed: Number,
    question_data: []
});

module.exports = mongoose.model('Survey', SurveySchema);
