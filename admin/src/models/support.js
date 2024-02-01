const mongoose = require('mongoose');
import { Schema, model } from "mongoose"

const supportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    issue: {
        type: String,
        required: true
    }, 
    requestNo: {
        type: Number,
        required: true
    }, 
    description: {
        type: String,
        required: true
    },           
    status: {
        type: String,
    },
    date: {
        type: String,
        required: true
    },

}); 




export default model("support", supportSchema);
