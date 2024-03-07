import ParkingLot from "../models/parkingLot.js";
import Parking from "../models/parking.js";

export const createParkingLot = async (req, res) => {
  try {
    const { id, capacity } = req.body;
    
    if (!id) {
      throw new Error("id is required");
    }
    
    if (capacity < 0 || capacity > 2000) {
      throw new Error("Capacity should be between 0 and 2000");
    }

    const parkingLot = new ParkingLot({ _id: id, capacity });
    await parkingLot.save();

    const response = {
      id: parkingLot._id,
      capacity: parkingLot.capacity,
      isActive: true, 
    };

    res.status(200).json({ isSuccess: true, response });
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, error: { reason: error.message } });
  }
};

export const parkCar = async (req, res) => {
  try {
    const { parkingLotId, registrationNumber, color } = req.body;
    
    if (!parkingLotId) {
      throw new Error("parkingLotId is required");
    }

    const regex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
    if (!registrationNumber || !regex.test(registrationNumber)) {
      throw new Error("Invalid registration number");
    }
    
    if (
      !["RED", "GREEN", "BLUE", "BLACK", "WHITE", "YELLOW", "ORANGE"].includes(
        color
      )
    ) {
      throw new Error("Invalid car color");
    }

    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot || !parkingLot.isActive) {
      throw new Error("Invalid or inactive parking lot");
    }

    const nearestAvailableSlot = await Parking.findOne({
      parkingLotId,
      status: "PARKED",
    })
      .sort({ slotNumber: 1 })
      .exec();

    let slotNumber;
    if (!nearestAvailableSlot) {
      slotNumber = 1;
    } else {
      slotNumber = nearestAvailableSlot.slotNumber + 1;
    }

    const parking = new Parking({
      parkingLotId,
      registrationNumber,
      color,
      slotNumber,
    });
    await parking.save();

    res
      .status(200)
      .json({ isSuccess: true, response: { slotNumber, status: "PARKED" } });
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, error: { reason: error.message } });
  }
};

export const leaveCar = async (req, res) => {
  try {
    const { parkingLotId, registrationNumber } = req.body;
    
    if (!parkingLotId || !registrationNumber) {
      throw new Error("parkingLotId and registrationNumber are required");
    }
    
    const regex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
    if (!regex.test(registrationNumber)) {
      throw new Error("Invalid registration number");
    }

    const deletedCar = await Parking.findOneAndDelete({
      parkingLotId,
      registrationNumber,
      status: "PARKED",
    });

    if (!deletedCar) {
      throw new Error("Car not found or already left the parking lot");
    }

    res.status(200).json({
      isSuccess: true,
      response: {
        slotNumber: deletedCar.slotNumber,
        registrationNumber: deletedCar.registrationNumber,
        status: "LEFT",
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, error: { reason: error.message } });
  }
};

export const getRegistrationNumbersByColor = async (req, res) => {
  try {
    const { color, parkingLotId } = req.query;
    
    if (!color || !parkingLotId) {
      throw new Error("Color and parkingLotId are required");
    }

    const parkedCars = await Parking.find({
      parkingLotId,
      color,
      status: "PARKED",
    });

    if (parkedCars.length === 0) {
      return res.status(200).json({
        isSuccess: false,
        error: { reason: `No car found with color ${color}` },
      });
    }

    const registrations = parkedCars.map((car) => ({
      color: car.color,
      registrationNumber: car.registrationNumber,
    }));

    res.status(200).json({
      isSuccess: true,
      response: { registrations },
    });
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, error: { reason: error.message } });
  }
};

export const getSlotNumbersByColor = async (req, res) => {
  try {
    const { color, parkingLotId } = req.query;
    
    if (!color || !parkingLotId) {
      throw new Error("Color and parkingLotId are required");
    }

    const parkedCars = await Parking.find({
      parkingLotId,
      color,
      status: "PARKED",
    });

    if (parkedCars.length === 0) {
      return res.status(200).json({
        isSuccess: false,
        error: { reason: `No car found with color ${color}` },
      });
    }

    const slots = parkedCars.map((car) => car.slotNumber).sort((a, b) => a - b);

    res.status(200).json({ isSuccess: true, response: { slots } });
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, error: { reason: error.message } });
  }
};
