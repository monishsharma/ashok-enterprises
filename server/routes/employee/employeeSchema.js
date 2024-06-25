import mongoose from "mongoose";
import {getTodayDate} from "../../helper/today-date.js";

const {sanitizedDate} = getTodayDate();
// Define a sub-schema for attendance
const attendanceSchema = mongoose.Schema({
    date: {
        type: String,
        default: sanitizedDate // Default value set to today's date
    },
    checkinTime: {
        type: String,
        default: ""
    },
    checkoutTime:  {
        type: String,
        default: ""
    },
    status:  {
        type: Boolean,
        default: false
    },
    isSunday: {
        type: Boolean,
        default: false
    },
    isOverTime: {
        type: Boolean,
        default: false
    },
});

const employeeeSchema = mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    salaryPerDay: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true // Ensures mobile number is unique
    },
    attendance: {
        type: [attendanceSchema], // Array of attendance objects
        default: [{}] // Default value set to an empty attendance object
    }
});

export default mongoose.model('employeeDetails', employeeeSchema)