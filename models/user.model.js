const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    phone: { type: String, required: true },
    landmark: { type: String },
  },
});

module.exports = mongoose.model("User", userSchema);
