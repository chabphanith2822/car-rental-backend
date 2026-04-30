import Booking from "../models/Booking.js"
import Car from "../models/Car.js";



// Function to Check Availability of Car for a given Date
const checkAvailability = async (car, pickupDate, returnDate)=>{
    const bookings = await Booking.find({
        car,
        pickupDate: {$lte: returnDate},
        returnDate: {$gte: pickupDate},
    })
    return bookings.length === 0;
}

// API to Check Availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res)=>{
    try {
        const {location, pickupDate, returnDate} = req.body

        // fetch all available cars for the given location
        const cars = await Car.find({location, isAvaliable: true})

        // check car availability for the given date range using promise
        const availableCarsPromises = cars.map(async (car)=>{
            const isAvaliable = await checkAvailability(car._id, pickupDate, returnDate)
            return {...car._doc, isAvaliable: isAvaliable}
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvaliable === true)

        res.json({success: true, availableCars})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to create Booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user; 
        const { car, pickupDate, returnDate } = req.body; 

        const carData = await Car.findById(car);
        if (!carData) {
            return res.json({ success: false, message: "Car not found" });
        }

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({ 
            car, 
            owner: carData.owner, 
            user: _id, 
            pickupDate, 
            returnDate, 
            price 
        });

        res.json({ success: true, message: "Booking Created Successfully!" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to List User Bookings
export const getUserBookings = async (req, res)=>{
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to get Owner Bookings
export const getOwnerBookings = async (req, res)=>{
    try {
        if(req.user.role !== 'owner'){
            return res.json({ success: false, message: "Unauthorized"})
        }
        const bookings = await Booking.find({owner: req.user._id}).populate('car user').select("-user.password").sort({createdAt: -1 })

        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}    

// API to change booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status, payment } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking || booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized or Booking not found" });
        }

        if (status){
            booking.status = status;
        }

        // Update Status and Payment
        if (status) booking.status = status;
        if (payment !== undefined) booking.payment = payment;

        const currentStatus = status.toLowerCase();

        if (currentStatus === 'confirmed') {
            await Car.findByIdAndUpdate(booking.car, { isAvaliable: false });
        } else {
            await Car.findByIdAndUpdate(booking.car, { isAvaliable: true });
        }

        await booking.save();
        res.json({ success: true, message: "Updated Successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API to UpdatePayment Status
export const updatePaymentStatus = async (req, res)=>{
    try {
        const {bookingId} = req.body;
        const {_id} = req.user;
        
        const booking = await Booking.findById(bookingId);

        if (booking.owner.toString() !== _id.toString()){
            return res.json({success: false, message: "Unauthorized"});
        }

        booking.payment = true;
        booking.status = 'Confirmed';
        await booking.save();

        await Car.findByIdAndUpdate(booking.car, {isAvaliable: false});

        res.json({success: true, message: "Payment Verified & Booking Confirmed!"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// API for User deleted booking
export const cancelUserBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const { _id } = req.user; 

        const booking = await Booking.findById(bookingId);

        if (!booking || booking.user.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Booking not found or unauthorized" });
        }

        await Car.findByIdAndUpdate(booking.car, { isAvaliable: true });

        await Booking.findByIdAndDelete(bookingId);

        res.json({ success: true, message: "Booking cancelled successfully!" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API for Admin delete booking user
export const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const deletedBooking = await Booking.findByIdAndDelete(bookingId);

        if (!deletedBooking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        if (deletedBooking.status === 'confirmed') {
            await Car.findByIdAndUpdate(deletedBooking.car, { isAvaliable: true });
        }

        res.json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}