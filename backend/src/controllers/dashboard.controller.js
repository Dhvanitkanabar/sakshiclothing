import dashboardService from '../services/dashboard.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Parser } from 'json2csv';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStats();
  return res.status(200).json(new ApiResponse(200, data, 'Dashboard stats fetched'));
});

export const exportOrdersCsv = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('customer', 'fullName email').lean();
  const data = orders.map(o => ({
    orderId: o._id,
    customer: o.customer?.fullName,
    email: o.customer?.email,
    status: o.orderStatus,
    paymentStatus: o.paymentStatus,
    total: o.totals?.grandTotal,
    date: o.createdAt
  }));
  
  if (!data.length) {
    return res.status(404).json(new ApiResponse(404, null, 'No orders found to export'));
  }

  const json2csv = new Parser();
  const csv = json2csv.parse(data);

  res.header('Content-Type', 'text/csv');
  res.attachment('orders-export.csv');
  return res.send(csv);
});

export const exportInventoryCsv = asyncHandler(async (req, res) => {
  const products = await Product.find().lean();
  const data = products.map(p => ({
    id: p._id,
    name: p.name,
    status: p.status,
    totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
    price: p.basePrice
  }));

  if (!data.length) {
    return res.status(404).json(new ApiResponse(404, null, 'No inventory found to export'));
  }

  const json2csv = new Parser();
  const csv = json2csv.parse(data);

  res.header('Content-Type', 'text/csv');
  res.attachment('inventory-export.csv');
  return res.send(csv);
});
