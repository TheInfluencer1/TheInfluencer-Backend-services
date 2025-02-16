const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    fromBrandId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Brand"
    },
    toInfluencerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Influencer"
    },
    status: {
        type: String,
        enum: ["Close Deal", "Reject Deal", "Pending"], // Added "Pending"
        default: "Pending"
    }    
},{
    timestamps: true
});

const connectionRequestModel = mongoose.model('ConnectionRequest', connectionRequestSchema);

