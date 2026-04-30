import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["owner"], default: 'owner'},
    image: {type: String, default: ''},
},{timestamps: true})

const Owner = mongoose.model('Owner', ownerSchema)

export default Owner