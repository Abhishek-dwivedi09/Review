const mongoose = require('mongoose');
import { Schema, model } from "mongoose";

const CustomerSchema = new mongoose.Schema({
  first_name: {
    type: Schema.Types.String,
  },
  last_name: {
    type: Schema.Types.String,
  },
  email: {
    type: Schema.Types.String,
  },
  phoneNumber: {
    type: Schema.Types.String,
  },
  state: {
    type: Schema.Types.String,
  },
  city: {
    type: Schema.Types.String,
  },
  gender: {
    type: Schema.Types.String,
  },
  location: {
    type: Schema.Types.Number
  },
  password: {
    type: Schema.Types.String,
  },
  free_trail: {
    type: Schema.Types.String,
  },
  Subscription: {
    type: Schema.Types.String,
  },
  Status: {
    type: Schema.Types.String,
  },
  signUpDate: {
    type: Schema.Types.String,
  },
  type: {
    type: Schema.Types.String,
  },
  isActive: {
    type: Schema.Types.Boolean,
    default: true,
  },
}, 
{ timestamps: true }
);

// module.exports = User = mongoose.model("users", userSchema); 
export default model("customer", CustomerSchema);