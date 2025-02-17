
//const userModel = require('../models/userModel'); 
const { check } = require('express-validator');


const userAuth = (req, res, next) => {
 
  if (!req.session.user) {
    return res.status(401).redirect('/login')
  }
  next();
};

const adminAuth = (req, res, next) => {
 
  if (!req.session.admin) {
    return res.status(401).redirect('/adminlogin')
  }
  next();
};


const isLoggedIn = async (req,res,next)=>{
if(req.session.user ){
  res.redirect('/')
}else{
  next()
}
}

const isAdminLoggedIn = async (req,res,next)=>{
  if(req.session.admin ){
    res.redirect('/admin')
  }else{
    next()
  }
  }

const registerValidation = [
  check('name').not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('password').not().isEmpty().withMessage('Password is required')
];


module.exports = {
  userAuth,
  adminAuth,
  isLoggedIn,
  isAdminLoggedIn,
  registerValidation,
  loginValidation };
