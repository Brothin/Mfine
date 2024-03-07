import express from "express";
import * as parkingController from "../controllers/parkingController.js";

const router = express.Router();

router.post("/api/ParkingLots", parkingController.createParkingLot);

router.post("/api/Parkings", parkingController.parkCar);

router.delete("/api/Parkings", parkingController.leaveCar);

router.get("/api/Parkings", parkingController.getRegistrationNumbersByColor);

router.get("/api/Slots", parkingController.getSlotNumbersByColor);

export default router;
