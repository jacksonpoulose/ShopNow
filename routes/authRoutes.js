const express = require('express');
const { loadHomePage,
    registerController,
    loginController,
    otpController,
    loadLoginPage,
    loadAdminLoginPage,
    loadRegisterPage,
    adminLoginController,
    getForgotPassword1,
    postForgotPasword1,
    getForgotPassword2,
    postForgotPassword2,
    searchController,
    resendOtpController,
    
    get404error}
  = require('../controllers/authController');
  //const {successGoogleLogin,
   // failureGoogleLogin,} = require('../controllers/gAuthController.js')
const {loadCategoryPage}=require('../controllers/categoryController.js')
const {viewProduct}=require('../controllers/userController.js')
const {isLoggedIn, isAdminLoggedIn, registerValidation, loginValidation} =require('../middlewares/authMiddleware')

const router = express.Router();
const passport = require('passport')
require('../config/passport')


router.get('/', loadHomePage)
router.get('/category',loadCategoryPage)
router.get('/product/:_id',viewProduct)
router.post("/verify-otp", otpController);
router.post('/resend-otp',resendOtpController)
router.get('/login',isLoggedIn,loadLoginPage)
router.get('/adminlogin',isAdminLoggedIn,loadAdminLoginPage)
router.post('/adminlogin',adminLoginController)
router.get('/register',isLoggedIn,loadRegisterPage)
router.post('/login',loginValidation,loginController)
router.post("/register",registerValidation,registerController);
router.get('/forgot-password-1',getForgotPassword1)
router.post('/forgot-password-1', postForgotPasword1);
router.get('/forgot-password-2',getForgotPassword2);
router.post('/forgot-password-2', postForgotPassword2);
router.post('/search',searchController)

router.get('/404error',get404error);

router.use(passport.initialize()); 
router.use(passport.session());

// Auth 
router.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
})); 

// Auth Callback 
// router.get( '/auth/google/callback', 
// 	passport.authenticate( 'google', { 
// 		successRedirect: '/success', 
// 		failureRedirect: '/failure'
// }));

// router.get('/success' , successGoogleLogin); 

// // failure 
// router.get('/failure' , failureGoogleLogin);

module.exports = router;