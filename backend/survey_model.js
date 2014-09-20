var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SurveySchema = new Schema({
    name: String,
    author: String,
    price: Number,
    questions: []

});

module.exports = mongoose.model('Survey', SurveySchema);
