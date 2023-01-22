const mongoose = require('mongoose');

const Message = new mongoose.Schema({
    name: { type: "String" },
    OTP: { type: "String" },
    date: {type: Date, default: Date.now}
})

const User = mongoose.model('Message', Message);
module.exports = User;