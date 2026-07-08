import express from "express"; // Changed from 'require'
import "dotenv/config";
import cors from "cors";
const cors = require('cors');
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// Initialize Express App
const app = express()

// Connect Database
await connectDB()

// Middleware
app.use(cors());
app.use(express.json());

app.use(cors({
    origin: 'https://car-rental-frontend-tan.vercel.app',
    credentials: true
  }));

app.get('/', (req, res)=> res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
