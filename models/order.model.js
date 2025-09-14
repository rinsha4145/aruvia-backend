import  mongoose from 'mongoose'

const orderSchema=new mongoose.Schema({
  orderId: { type: String, required: true },
    user:{type:mongoose.Schema.ObjectId,ref:'User'},
    address: {
    name: { type: String, trim: true },
     email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  
  phoneNumber: { type: Number, },
    street: { type: String,  },
    city: { type: String,  },
    state: { type: String,  },
    postalCode: { type: String,  },
    country: { type: String,  default: "India" },
    landmark: { type: String },
  },
  description: { type: String, trim: true },
    products:[{
        productId : {type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},
        quantity:{type:Number,required:true,default:1}
    }],
    purchaseDate:{type:Date,default:Date.now},
    totalAmount:{type:Number,required:true},
    paymentStatus:{type:String,enum:["Pending",'Completed'],default:'Pending'},
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

const Order = mongoose.model('Order', orderSchema);
export default Order