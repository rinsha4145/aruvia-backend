import Order  from "../models/order.model";

//get all orders
export const getAllOrders = async (req, res,next) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required",
        });

    }
    
    const allOrders = await Order.find({ userID: userId }).populate("products.productId").populate('userID');
    console.log(allOrders)
    if (!allOrders || allOrders.length === 0) {
        return res.status(404).json({success: "false", message: "No orders found for this user"})
    }
    res.status(200).json({allOrders})
}

export const createAddress = async (req, res,next) => {
       const { fullName,phoneNumber,alternatePhoneNumber,email,pincode,state,city,country,buildingName,roadAreaColony,landmark } = req.body;

    if (phoneNumber == alternatePhoneNumber) {
        return res.status(400).json({ success: false, message: "Phone numbers cannot be the same" });
    }
    const newAddress = new Address({userID:req.user.id,fullName,phoneNumber,alternatePhoneNumber,email,pincode,state,city,country,buildingName,roadAreaColony,landmark  });
    
    await newAddress.save();
    res.status(200).json({ success: true, message: 'Address registered successfully', newAddress });
 
};
