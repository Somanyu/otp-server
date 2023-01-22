const express = require('express');
const router = express.Router();
const contact = require('../data/contact')

router.get('/', (req, res) => {
    return res.status(200).json(contact)
});

router.get('/info/:id', (req, res) => {
    const contactID = req.params.id;
    // Find the user in the data store
    const contactDetails = contact.find(contact => contact.id === Number(contactID));
    if(contactDetails) {
        return res.status(200).json(contactDetails);
    } else {
        return res.status(404).json({message: "Contact not found"})
    }

})

router.post('/otp', async (req, res) => {
    const accountSID = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const client = require("twilio")(accountSID, authToken)

    // const { text, phone } = req.body;
    // console.log(req.body.text);
    // return res.status(200).send("OK")

    try {
        // Create Twilio message instance
        client.messages.create({
            body: `Hola amigos!`,
            from: '+14094032787',
            to: `+916370112909`
        }).then(message => {
            console.log(`✅ Message sent. ${message.sid}`);
            return res.status(200).send({success: "Success"})
        }).catch (error => {
            console.log(`❌ Message not sent. ${error} `)
            return res.status(500).send({message: "Something went wrong"})
        })
    } catch (error) {
        console.log(`❌ Message not sent. ${error} `)
        return res.status(500).send({message: "Something went wrong"})
    }

})

module.exports = router;