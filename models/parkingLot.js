import mongoose from "mongoose";

const parkingLotSchema = new mongoose.Schema({
  capacity: {
    type: Number,
    required: true,
    min: [0, "Capacity cannot be negative"],
    max: [2000, "Capacity cannot be greater than 2000"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("ParkingLot", parkingLotSchema);
