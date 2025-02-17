const Users = require("../models/userModel");
const Products = require("../models/productModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel")
const Coupons = require("../models/couponModel")
const {paypal} = require("../config/paypal");

const viewProduct = async (req, res) => {
  try {
    const productId = req.params._id;
    const product = await Products.findById(productId);
    const user = await Users.find();
    res.status(200).render("product", { product, user });
  } catch (error) {
    console.log(error);
  }
};

const getDashboard = async (req, res) => {
  try {
     const userId = req.session.userId;
    const products = await Products.find({ isDeleted: false });
    const orders =await Order.find({user:userId}).populate('orderItems.product');
    const addresses = await Address.find({ userId }); 
    
    res.render("dashboard", { products,orders,addresses});
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};




const addToCart = async (req, res) => {
  try {
    const productId = req.params._id;
    const userId = req.session.userId;

    const user = await Users.findOne({ _id: userId }).populate('cart.productId');
    if (!user) {
      return res.redirect('/login'); 
    }

  
    const existingItem = user.cart.find(item => item.productId && item.productId._id.toString() === productId);


    if (existingItem) {
      existingItem.quantity += 1; 
    } else {
      user.cart.push({ productId, quantity: 1 });
    }

   
    await user.save();
    
   res.status(200).redirect('/user/cart')
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while adding to the cart.');
  }
};


const cartController = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }

    const user = await Users.findById(userId).populate('cart.productId');

    const cart = user.cart;
    let subtotal = 0;

    cart.forEach(item => {
      if (item.productId) {
        subtotal += item.quantity * item.productId.discountPrice;
      }
    });

    if (!user || !user.cart) {
      return res.status(200).render("cart", { cart: [], message: "Your cart is empty" });
    }

    res.status(200).render("cart", {
      cart: user.cart,
      message: null,
      subtotal
    });
  } catch (error) {
    console.error("Error fetching cart details:", error);
    res.status(500).send("Internal Server Error");
  }
};

const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;

    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.redirect('/login');
    }

    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();

    res.redirect('/user/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while removing the item.');
  }
};



const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body; 
    const userId = req.session.userId;

    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.redirect('/login');
    }

    const cartItem = user.cart.find(item => item.productId.toString() === productId);
    if (cartItem) {
      cartItem.quantity = parseInt(quantity, 10);
      if (cartItem.quantity <= 0) {
        user.cart = user.cart.filter(item => item.productId.toString() !== productId);
      }
      await user.save();
    }

    res.redirect('/user/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while updating the cart.');
  }
};




const loadCheckoutPage = async (req,res)=>{
  try{
    const userId = req.session.userId;
   

    if (!userId) {
      return res.redirect('/login'); 
    }

    const user = await Users.findById(userId).populate('cart.productId');
    const address = await Address.findOne({userId:userId});
    const coupon = await Coupons.findOne()

    const cart = user.cart;
    let subtotal = 0;

    cart.forEach(item => {
      if (item.productId) {
        subtotal += item.quantity * item.productId.discountPrice;
      }
    });

  
    res.status(200).render('checkout',{
      cart: user.cart,
      message: null,
      address,
      subtotal
    })
  }catch(error){
    console.error(error)
  }
}

const getCouponPage = async(req,res)=>{
  try{
   const products = await Products.find({isDeleted:false})
res.status(200).render('coupon',{products})
  }catch(error){
console.log(error)
  }
}

const applyCoupon = async (req,res)=>{
  try{
const {couponCode,subtotal} = req.body;
const coupon = await Coupons.findOne({couponCode:couponCode});


if(!coupon){
  return res.status(500).json({success:false , message:"Coupon not found"})
}

if (coupon){
  if(new Date(coupon.expirationDate)<new Date()){
    return res.status(500).json({success:false,message:"coupon expired"})
  }
  if (!coupon.isActive){
    return res.status(500).json({success:false,message:"coupon not activated"})
  }
 
}
const discountAmount = subtotal*coupon.discount/100;
console.log(discountAmount)
res.status(200).json({success:true,discountAmount})

  }catch(error){
    console.log(error)
  }
}

const logoutController = async (req, res) => {
  req.session.user = null;
  req.session.userId = null
  console.log(req.session.user)
  res.redirect("/");
};

module.exports = {
 
  addToCart,
  viewProduct,
  getCouponPage,
  logoutController,
  getDashboard,
  cartController,
  loadCheckoutPage,
  removeFromCart,
  updateCartQuantity,
  applyCoupon
  
   };
