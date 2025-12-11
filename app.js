const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require("passport")
const sessionConfig = require('./config/session');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db')
const {userAuth,adminAuth} = require('./middlewares/authMiddleware')
const authRoutes =require('./routes/authRoutes');
const adminRoutes =require('./routes/adminRoutes');
const userRoutes =require('./routes/userRoutes');

const serverless = require("serverless-http");

//configure env
dotenv.config();

//databse config
connectDB();

//rest object
const app = express();
app.use(cookieParser());


// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'views')));
app.use('/uploads', express.static('uploads'));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }))

//middelwares
app.use(express.json());
app.use(morgan("dev"));
app.use(sessionConfig);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.session.user; 
  next();
});

app.use((req, res, next) => {
  res.locals.admin = req.session.admin;
  next();
});

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
   
//routes
app.use(authRoutes);
app.use('/admin',adminAuth,adminRoutes);
app.use('/user',userAuth,userRoutes)

//PORT
const PORT = process.env.PORT || 5000;

//run listen
app.listen(PORT, () => {
    console.log(
      `Server Running in ${process.env.DEV_MODE} mode on port ${PORT}`);
  })

  module.exports = app;

  module.exports.handler = serverless(app);