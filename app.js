const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db')
const authRoutes =require('./routes/authRoutes')

//configure env
dotenv.config();

//databse config
connectDB();

//rest object
const app = express();

app.use(cookieParser());

/*/set Layout
app.use(expressLayout)
app.set('layout','./layout/layout');*/

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'views')));

// Body parsing middleware
app.use(express.urlencoded({ extended: false }));

//middelwares
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use(authRoutes);

//PORT
const PORT = process.env.PORT || 5000;

//run listen
app.listen(PORT, () => {
    console.log(
      `Server Running in ${process.env.DEV_MODE} mode on port ${PORT}`);
  })