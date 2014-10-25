var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: String,
    hash: String,
    google_id: String,
    name: String,
    collected: {},
    surveys_taken: [],
    pendingSurvey: Schema.Types.ObjectId
});

module.exports = mongoose.model('User', UserSchema);
