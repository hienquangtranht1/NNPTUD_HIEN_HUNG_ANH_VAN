var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'resources'))); // Phục vụ các file HTML tĩnh trong resources/

// =====================================================
// MOUNT ROUTES API
// Mỗi thành viên tạo file route của mình, rồi thêm vào đây
// =====================================================
app.use('/', indexRouter);

// === HIỂN phụ trách ===
app.use('/api/v1/auth',          require('./routes/auth'));
app.use('/api/v1/users',         require('./routes/users'));
app.use('/api/v1/roles',         require('./routes/roles'));
app.use('/api/v1/departments',   require('./routes/departments'));

// === HƯNG phụ trách ===
app.use('/api/v1/projects',      require('./routes/projects'));
app.use('/api/v1/categories',    require('./routes/categories'));
app.use('/api/v1/milestones',    require('./routes/milestones'));

// === ANH phụ trách ===
app.use('/api/v1/tasks',         require('./routes/tasks'));
app.use('/api/v1/tags',          require('./routes/tags'));
app.use('/api/v1/taskHistories', require('./routes/taskHistories'));

// === VÂN phụ trách ===
app.use('/api/v1/comments',      require('./routes/comments'));
app.use('/api/v1/attachments',   require('./routes/attachments'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/upload',        require('./routes/uploads'));

// =====================================================
// KẾT NỐI MONGODB — Database: QLTASK
// =====================================================
mongoose.connect('mongodb://localhost:27017/QLTASK');
mongoose.connection.on('connected', () => console.log('✅ MongoDB QLTASK connected'));
mongoose.connection.on('disconnected', () => console.log('❌ MongoDB disconnected'));

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
