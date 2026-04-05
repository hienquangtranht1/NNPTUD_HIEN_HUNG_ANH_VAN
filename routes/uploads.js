// routes/uploads.js — VÂN phụ trách
var express = require('express');
var router = express.Router();
let upload = require('../utils/uploadHandler');

// POST /api/v1/upload/single — Upload 1 file (Postman: form-data, key=file)
router.post('/single', upload.single('file'), function (req, res) {
  try {
    if (!req.file) return res.status(400).send({ message: 'Không có file được gửi lên' });
    res.send({
      message: 'Upload thành công',
      filename: req.file.filename,
      url: '/uploads/' + req.file.filename
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST /api/v1/upload/multiple — Upload nhiều file (Postman: form-data, key=files)
router.post('/multiple', upload.array('files', 10), function (req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: 'Không có file được gửi lên' });
    }
    let result = req.files.map(f => ({
      filename: f.filename,
      url: '/uploads/' + f.filename
    }));
    res.send({ message: 'Upload thành công', files: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
