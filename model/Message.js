const mongoose = require('mongoose');

/**
 * This code defines a Mongoose schema for a "Message" document.
 *
 * The schema defines three fields:
 *   - name: a string field that stores the name of the user.
 *   - OTP: a string field that stores the OTP sent to the user.
 *   - date: a date field that stores the date when the message was sent, 
 *      with a default value of the current date and time.
 *
 * The schema is then used to create a Mongoose model, which is exported for use in other parts of the application.
 * This model creates a Mongoose collection in the MongoDB database with the name 'messages' in which the data will be stored.
*/
const Message = new mongoose.Schema({
    name: { type: "String" },
    OTP: { type: "String" },
    date: {type: Date, default: Date.now}
})

const User = mongoose.model('Message', Message);
module.exports = User;