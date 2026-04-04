var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send({ message: 'API Quản lý Công việc - QLTASK v1.0', status: 'running' });
});

module.exports = router;
