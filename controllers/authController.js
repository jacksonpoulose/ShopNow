const userModel = require("../models/userModel.js");
const nodemailer = require("nodemailer");
const { validationResult } = require('express-validator');
const { comparePassword, hashPassword } = require("./../helpers/authHelper.js");
const Products = require('../models/productModel');
const Users = require('../models/userModel')
const Category = require('../models/categoryModel.js')

let otpData = {};

const loadHomePage = async (req, res) => {
  try {
    const products = await Products.find({isDeleted:false}); 
    const newProducts = await Products.find({isDeleted:false}).sort({_id:-1}).limit(8)
    
    res.render('index', { products ,newProducts}); 
  } catch (error) {
    console.log("Error loading home page",error);
    res.status(500).send('Server Error');
  }
}

const loadLoginPage = (req, res) => {
  try {
   
    return res.render('login', { errors: [] });
  } catch (error) {
    console.error('Error rendering login page:', error.message);
    return res.status(500).send('Server Error');
  }
};

const loadAdminLoginPage = (req, res) => {
  try {
    
    return res.render('adminLogin', { errors: [] });
  } catch (error) {
    console.error('Error rendering admin login page:', error.message);
    return res.status(500).send('Server Error');
  }
};


const loadRegisterPage = (req, res) => {
  try {
    
    return res.render('register', { errors: [] });
  } catch (error) {
    console.error('Error rendering register page:', error.message);
    return res.status(500).send('Server Error');
  }
};

function sendOtp(email){
  //Configure nodemailer with email credentials
 let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD, 
  },
});

// Generate a 6-digit OTP
const otp = Math.floor(100000 + Math.random() * 900000);

// Store OTP and email in memory 
otpData[email] = otp;

// Email options
const mailOptions = {
    from: "NexTech OTP",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
};

 // Send OTP email
 transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      console.error("Error sending OTP: ", error);
      res.status(500).send("Error sending OTP");
  } else {
      console.log("OTP sent: " + info.response);
      
  }
});
}
const registerController = async (req, res) => {
  try {
      
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
          return res.render('register', { errors: errors.array() });
      }

      const { name, email, password,billing, phone, password1 } = req.body;

       // check user
       const existingUser = await userModel.findOne({ email });
       if (existingUser) {
         return res.render('UserExists');
       }
 
       if(password!==password1){
         
         return res.render('register',{message:"Password not matching"});
       }
       // save user details
       const hashedPassword = await hashPassword(password);
       const user = await new userModel({
         name,
         email,
         phone,
         billing,
         password: hashedPassword
       }).save();
 
       req.session.email = email
 
     
  let otpsend =  sendOtp(email);
 
  res.status(201).render('sendOTP',{timer: 30,user:req.user || null}); 
  user;
     } catch (error) {
       console.log(error);
       res.status(400).redirect('/404error');
     }
   };
 

  const otpController =async   (req, res) => {
    const { otp } = req.body;
  
  const email = req.session.email

  
    // Check if OTP is correct
    if ( otpData[email]  == otp) {
        delete otpData[email]; 
        const updatedUser = await Users.findOneAndUpdate(
          { email: email },        
          { otpVerified:true},        
          { new: true }              
        );  
        res.redirect('/login');
    } else {
      res.status(400).render('sendOTP',{timer: 60,message:"Please enter a valid otp"});
    }
  };

//resend otp controller
const resendOtpController = async (req,res)=>{
  try{

    const email = req.session.email; 
    if (!email) return res.status(400).json({ success: false, message: 'Email not found in session' });

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD, 
  },
});


const otp = Math.floor(100000 + Math.random() * 900000);


otpData[email] = otp;


const mailOptions = {
    from: "NexTech OTP",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
};


 transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      console.error("Error sending OTP: ", error);
      res.status(500).send("Error sending OTP");
  } else {
      console.log("OTP sent: " + info.response);
      res.status(201).render('sendOTP',{email:req.session.email,timer: 300,user:req.user || null}); 
      
  }
});
  }catch(error){
console.log(error);
  }
}

   //Login controller
   const loginController = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate email and password
      if (!email || !password) {
        
         return res.status(200).render('login',{message: "Invalid email or password"});
      }
  
      // Check if user exists
      const user = await userModel.findOne({email});
      
      if (!user) {
        
        return res.status(200).render('login',{message: "Email is not registered"});
        
      }
      
      // Compare password
      const match = await comparePassword(password, user.password); 
      if (!match) {
        return res.status(200).render('login',{message: "Invalid Password"});
      }
      // check user active or not
      const isBlocked = user.isBlocked;
       if(isBlocked){
        return res.status(200).render('login',{message: "User Blocked by Admin"});  
      }

      //check user otp verified or not

      const otpVerified = user.otpVerified;
    
if(!otpVerified){
       
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD, 
  }
});
const otp = Math.floor(100000 + Math.random() * 900000);
otpData[email] = otp;

const mailOptions = {
    from: "NexTech OTP",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
};

 transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      console.error("Error sending OTP: ", error);
      res.status(500).send("Error sending OTP");
  } else {
      console.log("OTP sent: " + info.response);
      res.status(201).render('sendOTP',{email:req.session.email,timer: 60,user:req.user || null}); 
      user;
  }
});
}else{
  
     
        req.session.userId = user._id; 
        req.session.user = user;
      
        
        //req.session.userAuth=true;
        res.redirect('/');  
      
    }
  
    } catch (error) {
      console.error(error);
      res.status(400).redirect('/404error');
    }
  }

  


   //Admin Login controller
   const adminLoginController = async (req, res) => {
    try {
      const { email, password } = req.body;
      
     // Validate email and password
     if (!email || !password) {
        
      return res.status(200).render('adminLogin',{message: "Invalid email or password"});
   }
  
      // Check if user exists
      const admin = await Users.findOne({ email });
    if (!admin) {
      return res.render('adminLogin', { message: "Email not registered" });
    }
      
    // Compare password
    const match = await comparePassword(password, admin.password); 
    if (!match) {
      return res.status(200).render('adminLogin',{message: "Invalid Password"});
    } 

  
      if (admin.role === 1) {
        //req.session.adminId = admin._id; 
        req.session.admin = admin;
        //req.session.adminAuth=true;
        res.redirect('/admin'); 

      }else{
        res.redirect('/adminlogin');  
      }
    
  
    } catch (error) {
      console.error(error);
      res.status(400).redirect('/404error');
    }
   }


  const getForgotPassword1 = async(req,res)=>{
    try{
        res.status(200).render('forgot-password-1')
    }catch(error){
console.log(error)
    }
}


const postForgotPasword1 = async (req,res)=>{
    try{
        const { email } = req.body;
           
   if (!email) {
     req.flash('errorMessage', 'Email is Required');
     return res.redirect('/login');
   }
 
       // check user
       const existingUser = await Users.findOne({ email });
       if (!existingUser) {
         return res.redirect('/login');
       }
 
       req.session.email = email
 
     
 
 //Configure nodemailer with email credentials
 let transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
       user: process.env.EMAIL, 
       pass: process.env.PASSWORD, 
   },
 });
 
 // Generate a 6-digit OTP
 const otp = Math.floor(100000 + Math.random() * 900000);
 
 // Store OTP and email in memory 
 otpData[email] = otp;
 
 // Email options
 const mailOptions = {
     from: "NexTech OTP",
     to: email,
     subject: "Your OTP Code",
     text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
 };
 
  // Send OTP email
  transporter.sendMail(mailOptions, (error, info) => {
   if (error) {
       console.error("Error sending OTP: ", error);
       res.status(500).send("Error sending OTP");
   } else {
       console.log("OTP sent: " + info.response);
       res.status(200).redirect('/forgot-password-2');
       
   }
 });
        
    }catch(error){
        console.log(error)
        res.status(400).redirect('/404error');
    }
};


const getForgotPassword2 = async(req,res)=>{
    try{

        res.status(200).render('forgot-password-2')
    }catch(error){
        console.log(error)
    }
};

const postForgotPassword2 = async (req,res)=>{

    try{
        const{otp,password,password1} = req.body;
       email=req.session.email
        if(password!==password1){
            req.flash('errorMessage', 'Password not matching');
            return res.redirect('/forgot-password-2');
          }

          const hashedPassword = await hashPassword(password);
          console.log(otpData[email]);
          console.log(otp);
          // save user details
          if ( otpData[email]  == otp) {
            delete otpData[email]; 
            const updatedUser = await userModel.findOneAndUpdate(
              { email: email },        
              { password:hashedPassword},        
              { new: true }              
            );  
            res.redirect('/login');
        } else {
            res.status(400).redirect('/404error')
        }
         
    
    }catch(error){
console.log(error)
res.status(400).redirect('/404error');
    }
}

const searchController = async (req,res)=>{
  try {
    const {query} = req.body  
    
    const searchRegex = new RegExp(query, 'i');

    const categoryFilter = query.toLowerCase() === 'men' ? 'women' : 'men';

   
    const products = await Products.find({
      $and: [
        { category: { $ne: categoryFilter } },
        { $or: [{ name: searchRegex }, { category: searchRegex }] },
      ],
    });
    
    
    res.render('searchIndex', { products, query });
} catch (error) {
    console.error('Search Error:', error);
    res.status(400).redirect('/404error');
}
}

const get404error = (req,res)=>{
    res.status(400).render('404error')
}

  

  module.exports = {
    loadHomePage,
    loadLoginPage,
    loadRegisterPage,
    registerController,
   loginController,
   otpController,
   loadAdminLoginPage,
   adminLoginController,
   getForgotPassword1,
   postForgotPasword1,
   getForgotPassword2,
   postForgotPassword2,
   searchController,
   resendOtpController,
   get404error
  };