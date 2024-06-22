import express from "express";
import db from "../../db/connection.js";
import Employees from "./employeeSchema.js";
import { ObjectId } from "mongodb";
import { getTodayDate } from "../../helper/today-date.js";



const router = express.Router();


    router.get("/list", async(req, res) => {

        let query = {};
        let options = {};
        const key = Object.keys(req.query);
        if (key && key.length) {
            query = {};
            options = {
                projection: {
                  _id: 1,
                  name: 1,
                  salaryPerDay: 1,
                  attendance: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$attendance",
                          as: "item",
                          cond: { $eq: [`$$item.${key}`,  req.query[key]] }
                        }
                      },
                      as: "filteredItem",
                      in: {
                        $mergeObjects: ["$$filteredItem"]
                      }
                    }
                  }
                }
              };
        }


        try {
            let collection = db.collection("employeeDetails");
            const results = await collection.find(query, options).toArray();
            res.send(results).status(200);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving employee details");
        }
    });

    router.get("/detail/:id", async(req, res) => {
        const query = {_id: new ObjectId(req.params.id)};
        let options = {};
        const key = Object.keys(req.query);
        if (key && key.length) {
            options = {
                projection: {
                  _id: 1,
                  name: 1,
                  salaryPerDay: 1,
                  payment: 1,
                  advance: 1,
                  extraAdvance:1,
                  attendance: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$attendance",
                          as: "item",
                          cond: { $eq: [`$$item.${key}`,  req.query[key]] }
                        }
                      },
                      as: "filteredItem",
                      in: {
                        $mergeObjects: ["$$filteredItem"]
                      }
                    }
                  }
                }
              };
        }
        try {
            let collection = db.collection("employeeDetails");
            let results = await collection.find(query, options).toArray();
            res.send(results).status(200);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving employee details");
        }
    });


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
            const todayAttendance = todayData.attendance.find(data => data.date === updatedFields.date);

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
    });

    router.patch('/edit/:employeeId', async (req, res) => {
        const {employeeId} = req.params;
        const payload = req.body;
        await db.collection("employeeDetails").findOneAndUpdate({
            _id: new ObjectId(employeeId),
        }, {$set: {name: payload.name, salaryPerDay: payload.salaryPerDay}})
        .then((response) => {
            res.status(200).send("payment updated succesfully")
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
    });

    router.patch("/update/:type/:employeeId/:year/:month", async (req, res) => {
        const { type,employeeId, year, month } = req.params;

        let updateObject = {};
        Object.keys(req.body).map(key => {
            updateObject[`${type}.${year}.${month}.${key}`] = req.body[key];
        })
        await db.collection("employeeDetails").findOneAndUpdate({
            _id: new ObjectId(employeeId),
        },
        { $set: updateObject },
        { upsert: true, new: true }
    ).then((response) => {
            res.status(200).json(response)
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
    });


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

    router.put('/run/cron', async (req,res) => {
        const {monthName} = getTodayDate();
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
                isOverTime: false,
                isAbsent: false,
                month: monthName,
                year: today.getFullYear()
            };

            // Update attendance for all employees
            await collection.updateMany({}, { $push: { attendance: attendanceObj } });
            res.status(200).send("Attendance updated successfully for all employees")
            console.log('Attendance updated successfully for all employees.');
        } catch (err) {
            console.error('Error updating attendance:', err);
        }
    })

    // router.put('/update-attendance/:employeeId', async (req, res) => {

    //     const {employeeId} = req.params;
    //     const {year} = req.body;
    //     await db.collection("employeeDetails").updateOne({
    //         _id: new ObjectId(employeeId), "attendance": { $exists: true, $ne: [] } ,
    //     },
    //     { $set: { "attendance.$[].year": year } }
    // )
    //     .then((response) => {
    //         res.status(200).json(response)
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //         res.status(500).json({
    //             error: err
    //         })
    //     })

    //   });



export default router;
