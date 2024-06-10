import mongoose from "mongoose";

const attendanceSchema = mongoose.Schema({
    id: {
        type: String,
    },
    name: {
        type: String
    },
    isSunday: {
        type: Boolean,
        default: false
    },
    checkinTime: {
        type: String,
        default: ""
    },
    checkoutTime: {
        type: String,
        default: ""
    }
});

export default mongoose.model('attendance', attendanceSchema)