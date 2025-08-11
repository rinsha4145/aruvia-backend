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
  
});

const User= mongoose.model("User", userSchema);
export default User
