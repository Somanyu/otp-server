const express = require('express');
const router = express.Router();
const contact = require('../data/contact');
const Message = require("../model/Message");

router.get('/', (req, res) => {
    return res.status(200).json(contact)
});

router.get('/info/:id', (req, res) => {
    const contactID = req.params.id;

    // Find the user in the data store
    const contactDetails = contact.find(contact => contact.id === Number(contactID));
    if (contactDetails) {

        // Store contactDetails in locals in context to app
        req.app.locals.contactDetails = contactDetails
        return res.status(200).json(contactDetails);
    } else {
        return res.status(404).json({ message: "Contact not found" })
    }

})

const generateRandom = () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return random
}

// // JSON data of OTP messages sent
// var messageList = []

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

router.get('/getlist', async (req, res) => {
    let msgList = await Message.find({})
    // console.log(msgList);
    return res.status(200).json(msgList);
})

module.exports = router;