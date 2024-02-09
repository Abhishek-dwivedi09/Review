const mongoose = require('mongoose');
import { Schema, model } from "mongoose"

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    temporaryPassword: {
        type: String,
    },
    permissions: {
        customers: {
            view: {
                type: Boolean,
                default: false,
            },
            edit: {
                type: Boolean,
                default: false,
            },
            analytics: {
                type: Boolean,
                default: false,
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId(),
            },
           
        },
        reviews: {
            view: {
                type: Boolean,
                default: false,
            },
            edit: {
                type: Boolean,
                default: false,
            },
            analytics: {
                type: Boolean,
                default: false,
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId(),
            },
        },
        visitors: {
            view: {
                type: Boolean,
                default: false,
            },
            edit: {
                type: Boolean,
                default: false,
            },
            analytics: {
                type: Boolean,
                default: false,
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId(),
            },
           
        },
        freeTrail: {
            view: {
                type: Boolean,
                default: false,
            },
            edit: {
                type: Boolean,
                default: false,
            },
            analytics: {
                type: Boolean,
                default: false,
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId(),
            },
            
        },
        subscriptions: {
            view: {
                type: Boolean,
                default: false,
            },
            edit: {
                type: Boolean,
                default: false,
            },
            analytics: {
                type: Boolean,
                default: false,
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId(),
            },
        },
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
        
    },
    userImage: {
        type: Schema.Types.String,
      },
      status: {
        type: String,
        default: 'active',
    },

    isVerified: {
        type: Boolean,
       // required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}); 




export default model("user", userSchema);
