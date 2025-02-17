
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Products = require('../models/productModel');
const Users = require('../models/userModel.js');
const Category = require('../models/categoryModel.js')
const Orders = require("../models/orderModel.js");
const Coupon = require("../models/couponModel.js");
const Sales = require('../models/salesModel.js');
const {storage,upload} = require('../helpers/productHelper.js');
const { error } = require('console');

// const getAdminDashboard = async (req, res) => {
//   try {
//       const orders = await Orders.find();
//       const products = await Products.find({isDeleted:false})
//       let revenue =  orders.reduce((acc,order)=>acc+order.totalPrice,0).toFixed(2)
//       let productsInStore = products.length
//       let totalOrders = orders.length
//       let endDate = new Date()
//       let startDate = new Date(endDate.getTime()-30*24*60*60*1000)
//       let monthlyOrders = await Orders.find({createdAt:{$gte:startDate,$lte:endDate}});
//       let monthlySales = monthlyOrders.reduce((acc,curr)=>acc+curr.totalPrice,0).toFixed(2)
//       const sales = await Sales.find();

//       const salesData = {
//         labels: sales.map(s => s.month),
//         sales: sales.map(s => s.amount),
//     };
//       console.log(salesData)
      
//       return res.status(200).render('admindashboard',{revenue,productsInStore,totalOrders,monthlySales,salesData});
//   } catch (error) {
//       console.error('Error rendering admin dashboard:', error.message);
//       return res.status(500).render('404error');
//   }
// };

const getAdminDashboard = async (req, res) => {
  try {
      const orders = await Orders.find();
      const products = await Products.find({ isDeleted: false });

      let revenue = orders.reduce((acc, order) => acc + order.totalPrice, 0).toFixed(2);
      let productsInStore = products.length;
      let totalOrders = orders.length;

      let endDate = new Date();
      let startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      let monthlyOrders = await Orders.find({ createdAt: { $gte: startDate, $lte: endDate } });
      let monthlySales = monthlyOrders.reduce((acc, curr) => acc + curr.totalPrice, 0).toFixed(2);

      // **Generate Sales Data Dynamically from Orders**
      const salesData = await Orders.aggregate([
          {
              $group: {
                  _id: { $month: "$createdAt" }, // Group by month (1 = Jan, 2 = Feb, etc.)
                  totalSales: { $sum: "$totalPrice" }, // Sum sales per month
              }
          },
          { $sort: { _id: 1 } } // Sort by month
      ]);

      // Convert month numbers to readable labels
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedSalesData = {
          labels: salesData.map(s => monthNames[s._id - 1]), // Convert month numbers to names
          sales: salesData.map(s => s.totalSales.toFixed(2)),
      };

      console.log(formattedSalesData);

      return res.status(200).render('admindashboard', {
          revenue,
          productsInStore,
          totalOrders,
          monthlySales,
          salesData: formattedSalesData, // Pass formatted sales data to EJS
      });

  } catch (error) {
      console.error('Error rendering admin dashboard:', error.message);
      return res.status(500).render('404error');
  }
};
 

const getUsersList = async (req,res)=>{
  try{
   const users =await Users.find();
   if(!Array.isArray(users)){
    throw new Error("Invalid data format")
   }
   res.render('page-users-list',{users})
  }catch(error){
   console.error("error fetching users:",error)
   return res.status(500).render('404error');
  }
}

const getUsersCards = async (req,res)=>{
  try{
const users =await Users.find();
if(!Array.isArray(users)){
  throw new Error("Invalid data format")
 }
res.render('page-users-cards',{users})
  }catch(error){
    console.error("error fetching users:",error)
    res.status(500).send("Internal server error")
  }
}


const getProductsList = async (req, res) => {
  try {
    const { sort, filter } = req.query;

    
    const filterConditions = {};
    if (filter?.category&& filter.category !== '') {filterConditions.category = filter.category}
    
    let sortCondition = {};
    if (sort === 'price_asc') sortCondition = { price: 1 };
    else if (sort === 'price_desc') sortCondition = { price: -1 };
    else if (sort === 'rating') sortCondition = { rating: -1 };

  
    const products = await Products.find(filterConditions).sort(sortCondition);
      res.render('page-products-list', { products });
  } catch (error) {
      res.status(500).send('Error fetching items');
  }
};


const getAddProduct = async (req, res) => {
  try {
      res.status(200).render('addProduct');
  } catch (error) {
      console.error('Error in getAddProduct:', error);
      res.status(500).send('An error occurred while processing your request.');
  }
};



const postAddProduct = async (req, res) => {
    try {
      const { name, description, category, price,size,stock, discountPrice } = req.body;
  
      const products = await Products.find(); 

      if (!name || !description || !stock|| !size|| !category || !discountPrice ) {
        return res.status(400).render('addProduct',{ message: 'Please provide all required fields' });
      }
  
const imagePaths = req.files.map(file => ({
    url: `/uploads/${file.filename}`  
  }));
  
  
const existProduct = await Products.findOne({name})

  if(existProduct){
    return res.status(400).render('addProduct',{message:"This product name already exists"})
  }
      
      const newProduct = new Products({
        name,
        description,
        category,
        size,
        stock,
        price,
        discountPrice,
       
        images: imagePaths,   
        
      });
  
      const savedProduct = await newProduct.save();
      res.status(201).redirect('/admin/addproduct');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Admin Edit products
const getEditProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params._id);
        
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('EditProduct',{product});
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Edit product
const postEditProduct = async (req, res) => {
  try {
      const productId = req.params._id;
      
     
      const product = await Products.findById(productId);
      if (!product) {
          return res.status(404).send('Product not found');
      }

      product.name = req.body.name;
      product.description = req.body.description;
      product.price = req.body.price;
      product.discountPrice = req.body.discountPrice;
      product.category = req.body.category;

      // Handle removal of images
      if (req.body.removeImages) {
          const imagesToRemove = Array.isArray(req.body.removeImages) ? req.body.removeImages : [req.body.removeImages];
          product.images = product.images.filter(image => !imagesToRemove.includes(image.url));

         
          imagesToRemove.forEach(imageUrl => {
              const imagePath = path.join(__dirname, '..', imageUrl); 
              fs.unlink(imagePath, err => {
                  if (err) {
                      console.error(`Failed to delete image: ${imageUrl}`);
                  }
              });
          });
      }

      // Handle new image uploads
      if (req.files) {
          const newImages = req.files.map(file => ({
              url: `/uploads/${file.filename}`, 
              filename: file.filename
          }));
          product.images.push(...newImages); 
      }

      await product.save();

      res.redirect(`/admin/product/edit/${productId}`);
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while updating the product.');
  }
};

const deleteProduct = async (req, res) => {
  try {
      const { id } = req.body; 
       
      const Product = await Products.findById(id);
      if (!Product) {
          return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      Product.isDeleted = !Product.isDeleted;
     
      await Product.save();


      res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, message: 'Error deleting product.' });
  }
};


const getCategoryList = async(req,res)=>{
  try{
    const category = await Category.find();
    res.render('page-categories',{category})
  }catch(error){
    console.log(error)
  }
}

const addCategory = async (req,res)=>{
  const {name,slug,parent,description}= req.body;
  try{
    
const category = new Category({
  name:name,
  parent:parent || null,
  slug:slug,
  description:description
})
await category.save();
res.redirect('/admin/categories-list')
  }catch(error){
console.log(error)
  }
};

const getEditCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params._id);
        
    if (!category) {
      return res.status(404).send('Category not found');
    }
    res.render('editCategory',{category});
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

const postEditCategory = async(req,res)=>{
  try{
const categoryId = req.params._id;
const {name,slug,parent,description} = req.body;
const category = await Category.findById(categoryId);
const parentId = parent ? mongoose.Types.ObjectId(parent) : null;
if (!category) {
    return res.status(404).send('Category not found');
}

category.name = name;
category.slug = slug;
category.parent = parentId;
category.description = description;

await category.save();
res.redirect(`/admin/category/edit/${categoryId}`)
  }catch(error){
console.log (error)
  }
}

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params._id;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).send('Category not found');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { isActive: !category.isActive }, 
      { new: true }
    );

    res.redirect('/admin/categories-list');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};


// const blockUser = async (req, res) => {
//   try {
      
//           userId=req.params._id
//       const updatedUser = await Users.findByIdAndUpdate(userId, { isBlocked: true });

//       if (!updatedUser) {
//           return res.status(404).render("page-users-list",{ message: 'User not found.' });
//       }

//       res.status(200).redirect('/admin/users-list');
//   } catch (error) {
//       console.error('Error blocking user:', error);
//       res.status(500).render("page-users-list",{ message: 'Error blocking User.' });
//   }
// };

// const unblockUser = async (req, res) => {
//   try {
       
//           userId=req.params._id
//       const updatedUser = await Users.findByIdAndUpdate(userId, { isBlocked: false });

//       if (!updatedUser) {
//           return res.status(404).render("page-users-list",{ message: 'User not found.' });
//       }

//       res.redirect('/admin/users-list');
//   } catch (error) {
//       console.error('Error blocking user:', error);
//       res.status(500).json({ success: false, message: 'Error blocking User.' });
//   }
// };

const handleUser = async (req,res)=>{
  userId=req.params._id
  try{
const user = await Users.findOne({_id:userId}) 
  if(user.isBlocked){
    const updatedUser = await Users.findByIdAndUpdate(userId, { isBlocked: false });
    res.redirect('/admin/users-list');
  }else{
    const updatedUser = await Users.findByIdAndUpdate(userId, { isBlocked: true });
    res.redirect('/admin/users-list');
  }
}catch(error){
  console.log(error)
}
}

const getOrdersList = async (req,res)=>{
  try{
    
   const orders = await Orders.find().populate('user')
   
res.status(200).render('page-orders',{orders})
}catch(error){
console.log(error)
}
}

const getOrderDetailsPage= async (req,res)=>{
  try{
const orderId = req.params._id;
const order = await Orders.findOne({_id:orderId}).populate('user').populate('orderItems.product')
    res.status(200).render("page-order-detail",{order})
  }catch(error){

  }
}

const updateOrderStatus = async (req,res)=>{
try{
  const { orderId, status } = req.body;
  console.log(req.body)
  await Orders.findByIdAndUpdate({_id:orderId}, { status: status });
  const order= await Orders.findOne({_id:orderId}).populate('user')

  res.status(200).render("page-order-detail",{order})

}catch(error){

}
}

const getReviewPage = async (req,res)=>{
  try{
res.status(200).render('page-reviews-list')
  }catch(error){
    console.log(error)
  }
}

const getCouponPage = async (req,res)=>{
  try{
res.status(200).render('page-coupons-list')
  }catch(error){
    console.log(error)
  }
}

const getAddCouponPage = async (req,res)=>{
  try{
res.status(200).render('addCoupon')
  }catch(error){
    console.log(error)
  }
}

function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}


const createCoupon =async (req,res)=>{
  try{
const {couponName,description,minimumPurchase,discount,category,expirationDate,usageLimit} = req.body;
console.log(req.body)
const Code = generateRandomCode();

const newCoupon = new Coupon({
  couponCode:Code,
  couponName:couponName,
  description:description,
  minimumPurchase:minimumPurchase,
  discount:discount,
  expirationDate:expirationDate,
  category:category,
  usageLimit:usageLimit
})

await newCoupon.save();
res.status(200).send("coupon created")
  }catch(error){
    console.log(error)
  }
}



  
const logoutController = async (req,res)=>{
  req.session.admin=null
      res.redirect('/adminlogin')
  }


module.exports = {
    getAdminDashboard,
    getUsersList,
    getUsersCards,
    getProductsList,
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    deleteProduct,
    getCategoryList,
    addCategory,
    getEditCategory,
    postEditCategory,
    deleteCategory,
    handleUser,
    getOrdersList,
    getOrderDetailsPage,
    updateOrderStatus,
    getReviewPage,
    getCouponPage,
    getAddCouponPage,
  createCoupon,
    logoutController
}