import {getTodayDate} from "./helper/server-today-date.js";
import db from "./db/connection.js"

export const cron = async() => {

    const collectionName = process.env.NODE_ENV === "dev" ? "attendance" : "employeeDetails"
      //code for the automated task
    try {

        // Access the collection
        const collection = db.collection(collectionName);
        const today = new Date();
        const{monthName, year} = getTodayDate();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Construct the attendance object for the next day
        const attendanceObj = {
            date: today.toISOString().split('T')[0],
            status: false,
            isSunday: today.getDay() === 0, // Check if tomorrow is Sunday
            checkinTime: "",
            checkoutTime: "",
            isOverTime: false,
            isAbsent: false,
            month: monthName,
            year
        };

        // Update attendance for all employees
        await collection.updateMany({}, { $push: { attendance: attendanceObj } });

        console.log('Attendance updated successfully for all employees.');
    } catch (err) {
        console.error('Error updating attendance:', err);
    }

};
