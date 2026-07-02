import orderService from '../services/order.service.js';
import cartService from '../services/cart.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { generateInvoiceHTML } from '../utils/invoiceGenerator.js';

export const checkout = asyncHandler(async (req, res) => {
  const { shippingAddressId, items, isFromCart } = req.body;
  
  if (!shippingAddressId) {
    throw new ApiError(400, 'Shipping address is required');
  }

  let orderItems = items;

  // If checking out from Cart, fetch cart items directly
  if (isFromCart) {
    // For authenticated checkout, guestId can be null if relying on userId.
    // The requirement is that users must be authenticated, so we use req.user._id
    const cart = await cartService.getCart(req.user._id, null);
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }
    
    orderItems = cart.items.map(item => ({
      productId: item.product._id || item.product,
      variantId: item.variantId,
      quantity: item.quantity
    }));
  }

  const order = await orderService.createCheckoutOrder(req.user._id, orderItems, shippingAddressId);

  // If from cart and successful, clear cart
  if (isFromCart) {
    await cartService.clearCart(req.user._id, null);
  }

  return res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);
  return res.status(200).json(new ApiResponse(200, orders, 'Orders fetched successfully'));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, order, 'Order details fetched successfully'));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, order, 'Order cancelled successfully'));
});

// Buy Now — checkout a single product without touching cart
export const buyNow = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1, shippingAddressId } = req.body;
  if (!productId || !variantId || !shippingAddressId) {
    throw new ApiError(400, 'productId, variantId and shippingAddressId are required');
  }
  const order = await orderService.createCheckoutOrder(
    req.user._id,
    [{ productId, variantId, quantity }],
    shippingAddressId
  );
  return res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
});

export const getInvoice = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id);
  const html = generateInvoiceHTML(order);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `inline; filename="invoice-${order.orderNumber}.html"`);
  return res.send(html);
});

// Admin Controllers
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, sort } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } }
    ];
  }
  const orders = await orderService.getAllOrders(filter, sort ? { [sort]: -1 } : undefined);
  return res.status(200).json(new ApiResponse(200, orders, 'All orders fetched successfully'));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status, note);
  return res.status(200).json(new ApiResponse(200, order, 'Order status updated'));
});

export const updateTracking = asyncHandler(async (req, res) => {
  const { tracking } = req.body;
  const order = await orderService.updateTracking(req.params.id, tracking);
  return res.status(200).json(new ApiResponse(200, order, 'Tracking information updated'));
});
