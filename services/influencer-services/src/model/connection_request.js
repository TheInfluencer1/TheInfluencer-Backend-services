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
        enum: ["CloseDeal", "RejectDeal", "Pending"], 
        default: "Pending"
    }    
}, {
    timestamps: true
});

connectionRequestSchema.pre("save", function (next) {
    if (this.fromBrandId.equals(this.toInfluencerId)) {
        return next(new Error("fromBrandId and toInfluencerId should be different"));
    }

    const statusVal = ["CloseDeal", "RejectDeal", "Pending"];
    if (!statusVal.includes(this.status)) {
        return next(new Error("Invalid Status"));
    }

    next();
});

const connectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = connectionRequestModel;
