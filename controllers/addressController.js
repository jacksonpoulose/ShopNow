const Users = require("../models/userModel");
const Products = require("../models/productModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel")
const Coupons = require("../models/couponModel")
const {paypal} = require("../config/paypal");


const addressController = async (req,res)=>{
    try{
      const userId = req.session.userId; 
      const addresses = await Address.find({ userId }); 
  
      res.status(200).render('manageAddress', { addresses });
    }catch(error){
      console.log(error)
    }
    
  }
  
  const updateBillingAddress = async(req,res)=>{
    try{
      const { name, email, address, city, zip, phone } = req.body;
  
  
    }catch(error){
      console.log(error)
    }
  }
  
  const editAccountDetails = async (req,res)=>{
   
      const { name, phone, currentPassword, newPassword, confirmPassword } = req.body;
  
      try {
        userId = req.session.userId
        const user = await Users.findOne({ userId });
    
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
    
        // Verify the current password if provided
        if (currentPassword) {
          const isMatch = await bcrypt.compare(currentPassword, user.password);
          if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
          }
        }
    
        // Update user details
        if (name) user.name = name;
        if (phone) user.phone = phone;
    
        // Handle password change
        if (newPassword) {
          if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
          }
          user.password = await bcrypt.hash(newPassword, 10);
        }
    
        await user.save();
    
        res.json({ success: true, message: 'User updated successfully' });
    }catch(error){
  console.log(error)
    }
  }
  
  const addShippingAddress = async(req,res)=>{
  try{
    const { name, street, city, state, zip } = req.body;
    userId = req.session.userId
  
   const existingAddress = await Address.findOne({name});
   if (existingAddress){
    return res.status(400).json({ message: 'Existing Address' })
   }
    const newAddress = new Address({ userId,name, street, city, state, zip });
    await newAddress.save();
  
    
    res.status(201).json({ message: 'Address saved successfully', address: newAddress });
  }catch(error){
    console.log(error)
  }
  
  }
  
  
  
  
  
  const  removeAddress = async (req,res)=>{
    try{
  const addressId = req.params._id;
  
  const removeAddress = await Address.findByIdAndDelete({addressId});
  
  res.status(200).redirect("/user")
  }catch(error){
    console.log(error)
  }
  
  }

  module.exports ={
    addressController,
  updateBillingAddress,
  editAccountDetails,
  addShippingAddress,
  removeAddress,
  }