import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  password: { type: String,  },
  phoneNumber: { type: Number, },
  address: {
    alterPhoneNumber: { type: Number, },
    street: { type: String,  },
    city: { type: String,  },
    state: { type: String,  },
    postalCode: { type: String,  },
    country: { type: String,  default: "India" },
    landmark: { type: String },
  },
  
});

const User= mongoose.model("User", userSchema);
export default User
