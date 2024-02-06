const mongoose = require('mongoose');
import { Schema, model } from "mongoose"

const supportSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
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
    email: {
        type: String,
        required: true
    },


}); 




export default model("support", supportSchema);
