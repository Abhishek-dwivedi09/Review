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
    Date: {
        type: String,
        required: true
    },
    issueTitel: {
        type: String,
        required: true
    },     
    status: {
        type: String,
    },

}); 




export default model("support", supportSchema);
