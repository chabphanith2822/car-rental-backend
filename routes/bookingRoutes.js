import express from "express";
import { cancelUserBooking, changeBookingStatus, checkAvailabilityOfCar, createBooking, deleteBooking, getOwnerBookings, getUserBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";


const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar)
bookingRouter.post('/create', protect, createBooking)
bookingRouter.get('/user', protect, getUserBookings)
bookingRouter.get('/owner', protect, getOwnerBookings)
bookingRouter.post('/change-status', protect, changeBookingStatus)
bookingRouter.post('/cancel-user-booking', protect, cancelUserBooking)
bookingRouter.post('/delete', protect, deleteBooking)

export default bookingRouter;