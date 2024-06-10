import express from "express";
import db from "../../db/connection.js";
import Employees from "./employeeSchema.js";
import { ObjectId } from "mongodb";

import cron from 'node-cron';

async function updateAttendance() {
    try {

        // Access the collection
        const collection = db.collection('employeeDetails');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Construct the attendance object for the next day
        const attendanceObj = {
            date: tomorrow.toISOString().split('T')[0],
            status: false,
            isSunday: tomorrow.getDay() === 0, // Check if tomorrow is Sunday
            checkinTime: "",
            checkoutTime: ""
        };

        // Update attendance for all employees
        await collection.updateMany({}, { $push: { attendance: attendanceObj } });

        console.log('Attendance updated successfully for all employees.');
    } catch (err) {
        console.error('Error updating attendance:', err);
    }
}

cron.schedule('0 0 * * *', () => {
    // Your task code here
    updateAttendance()
    console.log('Task running at midnight!');
  });


const router = express.Router();


    router.get("/list", async(req, res) => {
        try {
            let collection = db.collection("employeeDetails");
            let results = await collection.find({}).toArray();
            res.send(results).status(200);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving employee details");
        }
    });

    // router.get("/list/:data", async(req, res) => {
    //     console.log(date);
    //     try {
    //         let collection = db.collection("employeeDetails");
    //         let results = await collection.find({}).toArray();
    //         res.send(results).status(200);
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).send("Error retrieving employee details");
    //     }
    // });


  router.post("/new", async (req, res) => {
        try {
            const dbMessage = req.body;
            let employeeCollection = db.collection("employeeDetails");
            const employeePayload = new Employees(dbMessage);
            let result = await employeeCollection.insertOne(employeePayload);
            res.status(201).send(result);
        } catch (err) {
            console.error(err);
            if (err.code === 11000 && err.keyPattern && err.keyPattern.mobile) {
                // Duplicate mobile number
                return res.status(400).send("Mobile number already exists");
            } else {
                console.error(err);
                res.status(500).send("Error adding employee");
            }
        }
    });

    router.patch('/:employeeId', async (req, res) => {
        const {employeeId} = req.params;
        let updateQuery = {};
        const updatedFields = req.body; // Fields to be updated
        for (let key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                updateQuery[`attendance.$[elem].${key}`] = updatedFields[key];
            }
        }

        const todayData = await db.collection("employeeDetails").findOne({
            _id: new ObjectId(employeeId),
        });
        if (todayData && todayData.attendance && todayData.attendance.length ) {
            const todayAttendance = todayData.attendance.find(data => data.date === new Date().toISOString().split('T')[0]);
            if (todayAttendance) {
                await db.collection("employeeDetails").findOneAndUpdate(
                    {
                        _id: new ObjectId(employeeId),
                        'attendance.date': updatedFields.date
                    },
                    {
                        $set: updateQuery
                    },
                    { new: true, arrayFilters: [{ 'elem.date': updatedFields.date }], upsert: true }
                )
                .then((response) => {
                    res.status(200).json(response)
                })
                .catch((err) => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })

            } else {
                await db.collection("employeeDetails").updateOne(
                    {
                        _id: new ObjectId(employeeId)
                    },
                    {
                        $push: { attendance: updatedFields }
                    }
                )
                .then((response) => {
                    res.status(200).json(response)
                })
                .catch((err) => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })

            }
        }
        console.log(todayData)

    });

    router.patch('/edit/:employeeId', async (req, res) => {
        const {employeeId} = req.params;
        const payload = req.body;
        await db.collection("employeeDetails").findOneAndUpdate({
            _id: new ObjectId(employeeId),
        }, {$set: {name: payload.name, salaryPerDay: payload.salaryPerDay}})
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
    })

    router.delete('/delete/:employeeId', async (req, res) => {
        const {employeeId} = req.params;
        await db.collection("employeeDetails").findOneAndDelete({
            _id: new ObjectId(employeeId),
        })
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
    })


export default router;