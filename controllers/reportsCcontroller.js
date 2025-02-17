const Orders = require('../models/orderModel')
const Users = require('../models/userModel')
const ExcelJS = require('exceljs');

const getSalesReport = async (req,res)=>{
    try{
let {startDate,endDate} = req.query;

if (!endDate){
    endDate = new Date()
}

if (!startDate){
    startDate = new Date(endDate.getTime()- 30*24*60*60*1000)
}
const orders = await Orders.find().populate('user')
const salesData = await Orders.find({
    createdAt:{$gte:new Date(startDate), $lte:new Date(endDate)},
})



res.render('salesReport', { orders,salesData, startDate, endDate });
    }catch(error){
        console.log(error)
    }
}

const postSalesReport = async(req,res)=>{

    const { startDate, endDate } = req.body;
console.log(req.body)
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start and end dates are required' });
    }

try{
 const orders = await Orders.find({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }).populate('user').populate('orderItems');
         
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Order Report');

        worksheet.columns = [
            { header: 'Order ID', key: '_id', width: 20 },
            { header: 'Customer Name', key: 'customerName', width: 30 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Order Date', key: 'orderDate', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        orders.forEach((order) => {
            worksheet.addRow({
                _id: order.orderId.toString(),
                customerName: order.user.name || 'N/A',
                totalAmount: order.totalPrice || 0,
                orderDate: order.createdAt.toISOString().split('T')[0],
                status: order.status || 'Pending',
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="OrderReport.xlsx"');
        res.send(buffer);

}catch(error){

}

}

module.exports = {
    getSalesReport,
    postSalesReport
}