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
  review : {
    type: Schema.Types.String,
  },
  rating : {
   type: Schema.Types.Number
  },
  Reviews_before : {
    type: Schema.Types.Number
   },
  Reviews_after : {
    type: Schema.Types.Number
   }, 
   rating : {
    type: Schema.Types.Number
   },
  Status: {
    type: Schema.Types.String,
  },
  cancellation_reason: {
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