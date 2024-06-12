import db from "./db/connection.js"

export const cron = async() => {
    
      //code for the automated task
    try {

        // Access the collection
        const collection = db.collection('employeeDetails');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Construct the attendance object for the next day
        const attendanceObj = {
            date: today.toISOString().split('T')[0],
            status: false,
            isSunday: today.getDay() === 0, // Check if tomorrow is Sunday
            checkinTime: "",
            checkoutTime: "",
            isOverTime: false
        };

        // Update attendance for all employees
        await collection.updateMany({}, { $push: { attendance: attendanceObj } });

        console.log('Attendance updated successfully for all employees.');
    } catch (err) {
        console.error('Error updating attendance:', err);
    }

};
