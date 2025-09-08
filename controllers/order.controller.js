import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
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

    const allOrders = await Order.find(filter)
      .populate("products.productId")
      .populate("user")
      .skip(skip)
      .limit(limit);

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



// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userID,
//       address,
//       products,
//       amount,
//       paymentStatus,
//     } = req.body;

//     // Basic validation
//     if (!products || products.length === 0 || !amount || !address || !address.email) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: products, amount, or address.email",
//       });
//     }

//     // ✅ Try to find user, or set to null if not found
//     let validUser = null;
//     if (userID) {
//       const user = await User.findById(userID);
//       if (user) {
//         validUser = userID;
//       }
//     }

//     // Create the order with or without userID
//     const newOrder = new Order({
//       userID: validUser,
//       address,
//       products,
//       amount,
//       paymentStatus,
//     });

//     await newOrder.save();

//     return res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       data: newOrder,
//     });

//   } catch (error) {
//     console.error("Error creating order:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while creating order",
//     });
//   }
// };

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
// Payment Verification via Frontend Callback
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { orderId, razorpayPaymentId, razorpaySignature } = req.body;
//    console.log('razorpayPaymentId, razorpaySignature----->',razorpayPaymentId, razorpaySignature);
   
//     if (!orderId) {
//       return res.status(400).json({ message: 'Missing payment details' });
//     }

//     const order = await Order.findOne({ orderId });
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     const attemptId = uuidv4();

//     const isVerified = verifyRazorpaySignature(orderId, razorpayPaymentId, razorpaySignature);
//     if (!isVerified) {
//       const failedAttempt = {
//         attemptId,
//         paymentId: razorpayPaymentId,
//         status: 'Failed',
//         error: { message: 'Signature verification failed' },
//         timestamp: new Date()
//       };
//       order.paymentAttempts.push(failedAttempt);
//       order.paymentStatus = 'Failed';
//       await order.save();
//       return res.status(400).json({ message: 'Signature verification failed' });
//     }

//     // Record successful payment
//     const paymentAttempt = {
//       attemptId,
//       paymentId: razorpayPaymentId,
//       status: 'Completed',
//       razorpayResponse: { signature: razorpaySignature, verified: true },
//       timestamp: new Date()
//     };

//     order.paymentStatus = 'Completed';
//     order.paymentId = razorpayPaymentId;
//     order.paymentAttempts.push(paymentAttempt);

//     await order.save();

//     // Send confirmation email
//     try {
//       await sendOrderConfirmationEmail(order, order.address.email);
//     } catch (err) {
//       console.error('Email error:', err);
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Payment verified successfully',
//       attemptId,
//       order
//     });
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

