const express = require('express');
const router = express.Router();
const contact = require('../data/contact');
const Message = require("../model/Message");
const crypto = require('crypto');

router.get('/', (req, res) => {
    return res.status(200).json(contact)
});

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
    const randomBytes = crypto.randomBytes(2);
    const randomNumber = (randomBytes.readUInt16BE() % (max - min + 1)) + min;
    return randomNumber;
}



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