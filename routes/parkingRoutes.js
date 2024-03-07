import express from "express";
import * as parkingController from "../controllers/parkingController.js";

const router = express.Router();

// Create Parking Lot API
router.post("/api/ParkingLots", parkingController.createParkingLot);

// Park Car API
router.post("/api/Parkings", parkingController.parkCar);

// Leave Car API
router.delete("/api/Parkings", parkingController.leaveCar);

// Registration Number by Color API
router.get("/api/Parkings", parkingController.getRegistrationNumbersByColor);

// Slot Numbers for Car with Color API
router.get("/api/Slots", parkingController.getSlotNumbersByColor);

export default router;
