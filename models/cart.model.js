import mongoose from "mongoose";

const cartSchema= new mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    products:[{
        productId:{type:mongoose.Schema.ObjectId,ref:'Product'},
        quantity:{type:Number,required:true,default:1}
    }]
})

const Cart=mongoose.model('Cart', cartSchema) 
export default Cart