var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: String,
    hash: String,
    collected: {},
    pendingSurvey: Schema.Types.ObjectId
});

module.exports = mongoose.model('User', UserSchema);
