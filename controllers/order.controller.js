import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import crypto from "crypto";
//get orders 
export const getAllOrders = async (req, res, next) => {
  try {
    // ✅Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //  Filtering
    const filter = {};
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    const allOrders = await Order.find(filter).populate("products.productId").populate("user").sort({ purchaseDate: -1 }).skip(skip).limit(limit);
    const totalOrders = await Order.countDocuments(filter);

    if (!allOrders || allOrders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({
      success: true,
      count: allOrders.length,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      orders: allOrders,
    });
  } catch (error) {
    next(error);
  }
};


export const createOrder = async (req, res) => {
  try {
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { userID, products, totalAmount, address,description } = req.body;

    // Validate products
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    const normalizedProducts = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      if (!product.productId || !product.quantity) {
        return res.status(400).json({
          message: `Missing productId or quantity at index ${i}`,
        });
      }

      const quantity = parseInt(product.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: `Invalid quantity at index ${i}`,
        });
      }

      normalizedProducts.push({
        productId: product.productId,
        quantity,
      });
    }

    // Validate totalAmount
    if (!totalAmount) {
      return res.status(400).json({ message: 'Total amount is required' });
    }

    // Validate address
    const { name, email, phoneNumber, street, city, state, postalCode, country, landmark } = address || {};

    if (!name || !email || !phoneNumber || !street || !city || !state || !postalCode || !country || !landmark) {
      return res.status(400).json({ message: 'Complete address details are required' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.toString())) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Create Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        receipt: uuidv4(),
        notes: {
          description: 'Order Payment',
          name,
          email,
          contact: phoneNumber,
        },
      });
    } catch (err) {
      console.error('Razorpay API Error:', err);
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }
console.log(razorpayOrder.id)
    // Create DB Order
    const newOrder = new Order({
      orderId: razorpayOrder.id,
      user: userID || null,
      products: normalizedProducts,
      totalAmount,
      description,
      address: {
        name,
        email,
        phoneNumber,
        street,
        city,
        state,
        postalCode,
        country,
        landmark
      },
    });

    await newOrder.save();

    // Clear cart
    await Cart.deleteOne({ user: userID });
    console.log(`Cart cleared for user: ${userID}`);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder,
      razorpayOrderId: razorpayOrder.id,
    });

  } catch (error) {
    console.error('createOrder Error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};
// Payment Verification 

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters",
      });
    }

    // Find the order by Razorpay order ID
    const order = await Order.findOne({
      orderId: razorpay_order_id,
      paymentStatus: "Pending",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No pending order found with this Razorpay order ID",
      });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(401).json({
        success: false,
        message: "Payment verification failed - invalid signature",
      });
    }

    // ✅ Mark order as completed
    order.paymentStatus = "Completed";
    order.purchaseDate = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and completed successfully",
      order,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

// RAZOR PAY WEBHOOK HANDLER
export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // ✅ Verify signature
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(req.body); // raw body, not parsed JSON
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    // ✅ Parse the event
    const webhookData = JSON.parse(req.body.toString());
    const event = webhookData.event;

    if (event === "payment.captured") {
      const payment = webhookData.payload.payment.entity;

      // Find the order using Razorpay Order ID
      const order = await Order.findOne({ orderId: payment.order_id });

      if (order) {
        order.paymentStatus = "Completed";
        order.purchaseDate = new Date();
        order.razorpayPaymentId = payment.id;
        await order.save();
        console.log(`✅ Order ${order._id} marked as Completed`);
      }
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false, message: "Webhook handling failed" });
  }
};