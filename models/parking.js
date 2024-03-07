import mongoose from "mongoose";

const parkingSchema = new mongoose.Schema({
  parkingLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingLot",
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{1,4}$/.test(v);
      },
      message: "Invalid registration number",
    },
  },
  color: {
    type: String,
    enum: ["RED", "GREEN", "BLUE", "BLACK", "WHITE", "YELLOW", "ORANGE"],
    required: true,
  },
  slotNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["PARKED", "LEFT"],
    default: "PARKED",
  },
});

export default mongoose.model("Parking", parkingSchema);
