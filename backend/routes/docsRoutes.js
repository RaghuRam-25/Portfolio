const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'docs', 'API.md'));
});

module.exports = router;
