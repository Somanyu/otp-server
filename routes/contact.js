const express = require('express');
const router = express.Router();
const contact = require('../data/contact')

router.get('/', (req, res) => {
    return res.status(200).json(contact)
});

module.exports = router;