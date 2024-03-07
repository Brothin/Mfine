import ParkingLot from "../models/parkingLot.js";
import Parking from "../models/parking.js";

// Create Parking Lot API
export const createParkingLot = async (req, res) => {
  try {
    // Validate input payload
    const { id, capacity } = req.body;
    if (!id) {
      throw new Error("id is required");
    }
    if (capacity < 0 || capacity > 2000) {
      throw new Error("Capacity should be between 0 and 2000");
    }

    // Create new parking lot
    const parkingLot = new ParkingLot({ _id: id, capacity });
    await parkingLot.save();

    // Prepare the response object with the correct id
    const response = {
      id: parkingLot._id,
      capacity: parkingLot.capacity,
      isActive: true, // Assuming the newly created parking lot is always active
    };

    // Return response
    res.status(200).json({ isSuccess: true, response });
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, error: { reason: error.message } });
  }
};

export const parkCar = async (req, res) => {
  try {
    // Validate input payload
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

    // Find the parking lot
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot || !parkingLot.isActive) {
      throw new Error("Invalid or inactive parking lot");
    }

    // Find the nearest available slot
    const nearestAvailableSlot = await Parking.findOne({
      parkingLotId,
      status: "PARKED",
    })
      .sort({ slotNumber: 1 })
      .exec();

    let slotNumber;
    if (!nearestAvailableSlot) {
      // If no parked cars, assign slot 1
      slotNumber = 1;
    } else {
      // Otherwise, assign the next available slot number
      slotNumber = nearestAvailableSlot.slotNumber + 1;
    }

    // Create a new parking record
    const parking = new Parking({
      parkingLotId,
      registrationNumber,
      color,
      slotNumber,
    });
    await parking.save();

    // Return response
    res
      .status(200)
      .json({ isSuccess: true, response: { slotNumber, status: "PARKED" } });
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, error: { reason: error.message } });
  }
};

// Leave Car API
export const leaveCar = async (req, res) => {
  try {
    // Validate input payload
    const { parkingLotId, registrationNumber } = req.body;
    if (!parkingLotId || !registrationNumber) {
      throw new Error("parkingLotId and registrationNumber are required");
    }
    const regex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
    if (!regex.test(registrationNumber)) {
      throw new Error("Invalid registration number");
    }
    // Find and delete the parked car
    const deletedCar = await Parking.findOneAndDelete({
      parkingLotId,
      registrationNumber,
      status: "PARKED",
    });

    if (!deletedCar) {
      throw new Error("Car not found or already left the parking lot");
    }

    // Return response
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

// Registration Number by Color API
export const getRegistrationNumbersByColor = async (req, res) => {
  try {
    // Validate query parameters
    const { color, parkingLotId } = req.query;
    if (!color || !parkingLotId) {
      throw new Error("Color and parkingLotId are required");
    }

    // Find parked cars with the specified color and parking lot ID
    const parkedCars = await Parking.find({
      parkingLotId,
      color,
      status: "PARKED",
    });

    if (parkedCars.length === 0) {
      // Return error response if no cars found with the specified color
      return res.status(200).json({
        isSuccess: false,
        error: { reason: `No car found with color ${color}` },
      });
    }

    // Extract registration numbers and colors from the parked cars
    const registrations = parkedCars.map((car) => ({
      color: car.color,
      registrationNumber: car.registrationNumber,
    }));

    // Return response with registrations if cars found
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

// Slot Numbers for Car with Color API
export const getSlotNumbersByColor = async (req, res) => {
  try {
    // Validate query parameters
    const { color, parkingLotId } = req.query;
    if (!color || !parkingLotId) {
      throw new Error("Color and parkingLotId are required");
    }

    // Find parked cars with the specified color
    const parkedCars = await Parking.find({
      parkingLotId,
      color,
      status: "PARKED",
    });

    if (parkedCars.length === 0) {
      // Return error response if no cars found with the specified color
      return res.status(200).json({
        isSuccess: false,
        error: { reason: `No car found with color ${color}` },
      });
    }

    // Extract and sort slot numbers of the parked cars
    const slots = parkedCars.map((car) => car.slotNumber).sort((a, b) => a - b);

    // Return response with slots if cars found
    res.status(200).json({ isSuccess: true, response: { slots } });
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, error: { reason: error.message } });
  }
};
