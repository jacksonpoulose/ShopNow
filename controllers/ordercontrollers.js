const Users = require("../models/userModel");
const Products = require("../models/productModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel")
const Coupons = require("../models/couponModel")
const {paypal} = require("../config/paypal");
const PDFDocument = require('pdfkit');
const fs = require('fs');



const createOrder = async (req,res)=>{
    try{
        const userId = req.session.userId;
        const { paymentMethod,coupon } = req.body;

        const user = await Users.findById(userId).populate('cart.productId');
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
       
        const address = await Address.findOne({ userId: userId });
        if (!address) {
            return res.status(404).send({ error: 'Shipping address not found' });
        }
  
        if(!paymentMethod){
          return res.status(404).redirect("/user/checkout")
        }
  
        
        const cart = user.cart;
        let subtotal = 0;
        let totalPrice = cart.reduce((total, item) => {
          if (item.productId) {
              return total + item.productId.discountPrice * item.quantity;
          }
          return total;
      }, 0);
  
         
      for (let item of cart) {
        if (item.productId) {
            if (item.productId.stock < item.quantity) {
                return res.status(400).render('checkout', { 
                    message: `Insufficient stock for ${item.productId.name}` ,address,cart,subtotal
                });
            }
        }
    }
  
       
    for (let item of cart) {
        if (item.productId) {
            item.productId.stock -= item.quantity;
            item.productId.totalSell += item.quantity;
  
            if (item.productId.stock === 0) {
                item.productId.soldOut = true;
            }
  
            subtotal += item.quantity * item.productId.discountPrice;
  
            
            await item.productId.save();
        }
    }
  
  
    if(paymentMethod === 'CashonDelivery'){
if(subtotal>1000){
    return res.status(400).render('checkout', { 
        message: `Cash on delivery unavailable for this order, choose another payment method` ,address,cart,subtotal
    });
}
    }

    const checkCoupon = await Coupons.findOne({couponCode:coupon})
    if(checkCoupon){
      totalPrice = totalPrice *(100-checkCoupon.discount)/100;
      console.log(totalPrice)
  } 
  
        const newOrder = new Order({
            orderId: `ORD-${Date.now()}`, 
            user: userId,
            orderItems: cart.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                price: item.productId.discountPrice
            })),
            address: {
                name: address.name,
                street: address.street,
                city: address.city,
                state: address.state,
                zip: address.zip
            },
            totalPrice: totalPrice,
            status: 'PROCESSING',
        });
  
        const savedOrder = await newOrder.save();
   
        const order = await Order.findOne({orderId:newOrder.orderId})
        req.session.order = order;

        switch (paymentMethod) {
            case 'CashonDelivery':
                res.status(200).render('orderPlaced', {
                    order,
                    message: null,
                    address,
                    subtotal,
                    savedOrder
                });
                console.log('Payment Method:', paymentMethod);
                break;
            case 'DebitCard':
               
                console.log('Payment Method:', paymentMethod);
                break;
        
            case 'PayPal':

            res.status(200).render('paypal',{
              order,
              message: null,
              address,
              subtotal,
              })
    
                break;
    
            default:
                console.log('Invalid payment method selected.');
        }
    
        
    }catch(error){
        console.log(error);
        res.status(500).send({ error: 'An error occurred while placing the order' });
    }
}

const getOrderPage = async (req,res)=>{
  try{
    const userId = req.session.userId;
    const products = await Products.find({ isDeleted: false });
    const orders =await Order.find({user:userId}).populate('orderItems.product').sort({_id:-1});
    res.status(200).render('userOrders',{orders,products})
  }catch(error){
    console.log(error)
  }
  
}

const viewOrderDetails = async (req,res)=>{
try{
  const userId = req.session.userId;
  const orderID = req.params.id || req.params._id;


  
  const address = await Address.findOne({ userId: userId });
  const products = await Products.find({ isDeleted: false });
  const order =await Order.findOne({ _id:orderID }).populate('orderItems.product');
  
  res.status(200).render('orderView',{order,products})
}catch(error){
  console.log(error)
}
} 

const paypalPaymentController = async (req,res)=>{
  try {
        const order = req.session.order;
        
const orderDetails = await Order.findOne({orderId:order.orderId}).populate('orderItems.product');


if (!orderDetails) {
    return res.status(404).json({ message: "Order not found" });
  }

const items = orderDetails.orderItems.map(item=>({
    name: item.product.name,
    sku: item.product._id.toString(),
    price: item.price.toFixed(2), 
    currency: "USD",
    quantity: item.quantity
}))

const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/user/paid",
            "cancel_url": "http://localhost:3000/user/paymentCancelled"
        },
        "transactions": [{
            "item_list": {
                "items": items
            },
            "amount": {
                "currency": "USD",
                "total": total
            },
            "description":  `Order #${orderDetails._id} payment`
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
              if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href);
              }
            }
        }
      });

} catch (error) {
    console.log(error.message);
}

} 

const paymentConfirmation = async(req,res)=>{
try{

    const userId = req.session.userId;
    const orders = req.session.order;
        
const order = await Order.findOne({orderId:orders.orderId}) .populate({
    path: 'orderItems.product',
    model: 'Product', 
});   
    const address = await Address.findOne({ userId: userId });
    const products = await Products.find({ isDeleted: false });
    
res.status(200).render('paid',{address,products,order})
}catch(error){

}
}

const invoiceDownload = async (req,res)=>{
try{
const orderId = req.params._id;
const order = await Order.findById(orderId).populate('user','name email').populate('orderItems.product');

if (!order) {
    return res.status(404).send('Order not found');
}

const doc =new PDFDocument();

 res.setHeader('Content-Type', 'application/pdf');
 res.setHeader(
     'Content-Disposition',
     `attachment; filename=invoice-${orderId}.pdf`
 );

 doc.pipe(res);

 
 doc.fontSize(20).text('Invoice', { underline: true });
 doc.text(`Order ID: ${order._id}`);
 doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
 doc.text(`Customer Name: ${order.user.name}`);
 doc.text(`Email: ${order.user.email}`);
 doc.text(' ');
 doc.fontSize(16).text('Order Details:');
 order.orderItems.forEach(item => {
     doc.text(`- ${item.product.name} x ${item.quantity} @ $${item.price}`);
 });
 doc.text(' ');
 doc.fontSize(18).text(`Total: $${order.totalPrice}`);

 
 doc.end();
 
}catch(error){
    console.log(error)
}
}

module.exports = {
    createOrder,
  getOrderPage,
  viewOrderDetails,
  paypalPaymentController,
  paymentConfirmation,
  invoiceDownload
}