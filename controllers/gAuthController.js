
const Users = require("../models/userModel")
const Products = require('../models/productModel')

const successGoogleLogin = async (req , res) => { 
	if(!req.user) 
		res.redirect('/failure');   
    const email=req.user.email 
    const user = await Users.findOne({email}); 
    console.log(user);
    const products = await Products.find({isDeleted:false})
    const newProducts = await Products.find({isDeleted:false}).sort({_id:-1}).limit(8)
    req.session.userId = user._id; 
    req.session.user = user;
	res.render('index',{user,products,newProducts}); 
}

const failureGoogleLogin = (req , res) => { 
	res.send("Error"); 
} 

 

    module.exports = {
        
        successGoogleLogin,
        failureGoogleLogin
    }