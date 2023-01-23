const express = require('express');
const router = express.Router();
const contact = require('../data/contact');
const Message = require("../model/Message");
const crypto = require('crypto');

router.get('/', (req, res) => {
    return res.status(200).json(contact)
});


/**
 * This is a route handler for a GET request to the '/info/:id' endpoint.
 *
 * It fetches the "id" parameter from the client URL and parse it to int.
 * Then it validates that the id is a valid number, if not it will return a 404 status code with a message "Invalid ID"
 *
 * It then attempts to find the contact details in the 'contact' data store i.e. 'data/contact.json'.
 * If the contact details are found, it will be stored in the req.app.locals.contactDetails, and the contact details will be returned with a 200 status code.
 * If the contact is not found, it will return a 404 status code with a message "Contact not found"
 *
 * In case of any error, it will return a 500 status code with a message "Error in server"
 *
*/
router.get('/info/:id', (req, res) => {
    // fetch "id" from URL param
    const contactID = parseInt(req.params.id);

    // validate id is a number
    if (!Number.isInteger(contactID)) {
        // console.log(typeof contactID);
        return res.status(404).json({ message: "Invalid ID" });
    }

    try {
        // Find the user in the data store
        const contactDetails = contact.find(contact => contact.id === Number(contactID));
        if (contactDetails) {

            // Store contactDetails in locals in context to app
            req.app.locals.contactDetails = contactDetails
            return res.status(200).json(contactDetails);
        } else {
            return res.status(404).json({ message: "Contact not found" })
        }
    } catch (error) {
        return res.status(500).json({ message: "Error in server" });
    }

})

// Using crypto module to generate more secure random number.
const generateRandom = () => {
    const min = 100000;
    const max = 999999;
    // Generates cryptographically strong pseudorandom data.
    const randomBytes = crypto.randomBytes(2);
    // Convert the random data to a 16-bit unsigned integer.
    const randomNumber = (randomBytes.readUInt16BE() % (max - min + 1)) + min;
    return randomNumber;
}


/**
 * This is a route handler for a POST request to the '/otp' endpoint.
 * 
 * It first imports the Twilio client library and initializes it with the account SID and auth token.
 * Then, it uses the generateRandom() function to generate a random 6-digit OTP.
 * It then retrieves the contact details from the res.app.locals.contactDetails object.
 *
 * The code then creates a message object with the Twilio client and sets the message body to include the contact's first name and the generated OTP.
 * The message is sent to the phone number retrieved from the contact object.
 *
 * It then creates a new object with name and OTP and save it to MongoDB.
 *
 * If the message is sent successfully, it sends a success response to the client.
 * In case of any error, it sends a "Something went wrong" message to the client and logs the error to the console.
 */
router.post('/otp', async (req, res) => {
    const accountSID = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const client = require("twilio")(accountSID, authToken)

    // Generate random 6-digit OTP. 
    const OTP = generateRandom();

    // Fetch details stored in contact.
    const contact = res.app.locals.contactDetails;

    try {
        // Create Twilio message instance
        client.messages.create({
            body: `Hi ${contact.firstName}, your OTP is: ${OTP}`,
            from: '+14094032787',
            to: `${contact.phone}`
        }).then(async message => {

            // JSON data with name and OTP message
            var data = {
                name: contact.firstName,
                OTP: OTP,
            }

            // Insert data in mongodb
            const msg = new Message(data);
            await msg.save()

            console.log(`✅ Message sent. ${message.sid}`);
            return res.status(200).send({ success: "Success" })
        }).catch(error => {
            console.log(`❌ 1Message not sent. ${error} `)
            return res.status(500).send({ message: "Something went wrong" })
        })
    } catch (error) {
        console.log(`❌ Message not sent. ${error} `)
        return res.status(500).send({ message: "Something went wrong" })
    }

})

/**
 * This is a route handler for a GET request to the '/getlist' endpoint.
 *
 * It uses Mongoose to fetch all documents in the 'Message' collection,
 * and returns it to the client as a JSON object.
 *
 * The `Message.find({})` method retrieves all documents in the 'Message' collection.
 * The returned documents are then stored in the `msgList` variable.
 *
 * The code then sends a success response (HTTP status code 200) with the `msgList` as the response body.
 * This endpoint can be used to retrieve all the OTPs that have been sent to the users.
*/
router.get('/getlist', async (req, res) => {
    let msgList = await Message.find({})
    // console.log(msgList);
    return res.status(200).json(msgList);
})

module.exports = router;