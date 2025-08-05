const  mongoose  = require('mongoose')

const orderSchema=new mongoose.Schema({
    userID:{type:mongoose.Schema.ObjectId,ref:'Users',required:true},
    products:[{
        productId : {type:mongoose.Schema.ObjectId,ref:'Products',required:true},
        quantity:{type:Number,required:true,default:1}
    }],
    purchaseDate:{type:Date,default:Date.now},
    amount:{type:Number,required:true},
    paymentStatus:{type:String,enum:["Pending",'Completed',"Cancelled","Refund"],default:'Pending'},
    shippingStatus: { type: String,enum:["Pending",'Delivered',"Processing","Cancelled"] ,default: "Pending" },
    expectedDeliveryTime: { 
        type: Date,
        default: function() {
            let deliveryDate = new Date(this.purchaseDate);
            deliveryDate.setDate(deliveryDate.getDate() + 4);
            return deliveryDate;
        }
    },
  

})

module.exports=mongoose.model('Order',orderSchema)