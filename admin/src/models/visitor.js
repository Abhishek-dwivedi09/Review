const mongoose = require('mongoose');
import { Schema, model } from "mongoose";

const VisitorSchema = new mongoose.Schema({
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
    type: Schema.Types.String,
  }, 
  no_of_location: {
    type: Schema.Types.Number,
  },
  visits: {
    type: Schema.Types.Number
  },
  reviews : {
    type: Schema.Types.Number,
  },
  visitDate: {
    type: Schema.Types.String,
  },
  type: {
    type: Schema.Types.String,
  },
  state: {
    type: Schema.Types.String,
  },
  referrals: {
    type: Schema.Types.Number,
  },
  isActive: {
    type: Schema.Types.Boolean,
    default: true,
  },
}, 
{ timestamps: true }
);

// module.exports = User = mongoose.model("users", userSchema); 
export default model("visitor", VisitorSchema);