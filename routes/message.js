const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ from: "Somanyu", body: "This is a message" })
});

module.exports = router