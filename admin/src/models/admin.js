const mongoose = require('mongoose');
import { Schema, model } from "mongoose";

const AdminSchema = new mongoose.Schema({
  firstName: {
    type: Schema.Types.String,
  },
  lastName: {
    type: Schema.Types.String,
  },
  email: {
    type: Schema.Types.String,
  },
  phone: {
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
  password: {
    type: Schema.Types.String,
  },
  isLogedIn: {
    type: Schema.Types.Boolean,
    default: false,
  },
  isActive: {
    type: Schema.Types.Boolean,
    default: true,
  },
}, 
{ timestamps: true }
);

// module.exports = User = mongoose.model("users", userSchema); 
export default model("admin", AdminSchema);