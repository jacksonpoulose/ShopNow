const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');

//configure env
dotenv.config();

const mongoUrl = process.env.MONGO_URI;
const secretKey = process.env.SECRET_KEY;

if (!mongoUrl || !secretKey) {
  throw new Error('Missing MONGO_URI or SECRET_KEY in environment variables');
}

const sessionOptions = {
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
    store: MongoStore.create({
      mongoUrl:mongoUrl, 
    }),
  };
   
  module.exports = session(sessionOptions);