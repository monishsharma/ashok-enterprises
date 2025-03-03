import express from "express";
import db from "../../db/connection.js";
import Employees from "./employeeSchema.js";
import { ObjectId } from "mongodb";
import { getTodayDate } from "../../helper/server-today-date.js";



const router = express.Router();

const collectionName = process.env.NODE_ENV === "dev" ? "attendance" : "employeeDetails"

    router.get("/list", async(req, res) => {

        let query = {};
        let options = {};
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length > 0) {
            // Dynamically construct the filter conditions
            const filterConditions = queryKeys.map(key => {
                if (key === "year") {
                    return {
                        $or: [
                            { $eq: [`$$item.${key}`, parseInt(req.query[key])] }, // Match the year
                            { $not: { $in: [`$$item.${key}`, [null, undefined]] } } // Handle missing year
                        ]
                    };
                } else {
                    return { $eq: [`$$item.${key}`, req.query[key]] }; // Match other fields
                }
            });

            options = {
                projection: {
                    _id: 1,
                    name: 1,
                    salaryPerDay: 1,
                    payment: 1,
                    advance: 1,
                    esi: 1,
                    extraAdvance: 1,
                    attendance: {
                        $filter: {
                            input: "$attendance",
                            as: "item",
                            cond: {
                                $and: filterConditions
                            }
                        }
                    }
                }
            };
        }


        try {
            let collection = db.collection(collectionName);
            const results = await collection.find(query, options).toArray();
            res.send(results).status(200);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving employee details");
        }
    });

    router.get("/detail/:id", async (req, res) => {
        const query = { _id: new ObjectId(req.params.id) };
        const queryKeys = Object.keys(req.query);

        let options = {};
        if (queryKeys.length > 0) {
            // Dynamically construct the filter conditions
            const filterConditions = queryKeys.map(key => {
                if (key === "year") {
                    return {
                        $or: [
                            { $eq: [`$$item.${key}`, parseInt(req.query[key])] }, // Match the year
                            { $not: { $in: [`$$item.${key}`, [null, undefined]] } } // Handle missing year
                        ]
                    };
                } else {
                    return { $eq: [`$$item.${key}`, req.query[key]] }; // Match other fields
                }
            });

            options = {
                projection: {
                    _id: 1,
                    name: 1,
                    salaryPerDay: 1,
                    payment: 1,
                    advance: 1,
                    esi: 1,
                    extraAdvance: 1,
                    attendance: {
                        $filter: {
                            input: "$attendance",
                            as: "item",
                            cond: {
                                $and: filterConditions
                            }
                        }
                    }
                }
            };
        }

        try {
            let collection = db.collection(collectionName);
            console.log("Mongo Query Options:", JSON.stringify(options, null, 2));
            let results = await collection.find(query, options).toArray();
            res.status(200).send(results);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving employee details");
        }
    });



  router.post("/new", async (req, res) => {
        try {
            const dbMessage = req.body;
            let employeeCollection = db.collection(collectionName);
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

        const todayData = await db.collection(collectionName).findOne({
            _id: new ObjectId(employeeId),
        });
        if (todayData && todayData.attendance && todayData.attendance.length ) {
            const todayAttendance = todayData.attendance.find(data => data.date === updatedFields.date);

            if (todayAttendance) {
                await db.collection(collectionName).findOneAndUpdate(
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
                await db.collection(collectionName).updateOne(
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
        await db.collection(collectionName).findOneAndUpdate({
            _id: new ObjectId(employeeId),
        }, {$set: {name: payload.name, salaryPerDay: payload.salaryPerDay,esi: payload.esi}})
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
        await db.collection(collectionName).findOneAndUpdate({
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

    router.patch('/extra/advance/:employeeId', async (req, res) => {
        const {employeeId} = req.params;
        const payload = req.body;
        await db.collection(collectionName).findOneAndUpdate({
            _id: new ObjectId(employeeId),
        },
        {
            $set: {'extraAdvance.total': payload.total},
            $push: {
                'extraAdvance.detail': payload.detail
            }
        }
    )
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


    router.patch('/mark/all/present', async(req,res) => {
        const collection = db.collection('attendance');
        const attendanceObj =req.body;
       try {
            const respone = await collection.updateMany({
                'attendance.date': attendanceObj.date
            }, { $set: { attendance: attendanceObj } },
            );
            res.status(200).json(respone);
        } catch (err) {
            console.error('Error updating attendance:', err);
        }
    })

    router.patch('/checkout/all', async(req, res) => {
        const collection = db.collection('attendance');
        const updatedFields =req.body;
        let updateQuery = {};

        if (!updatedFields.date || !updatedFields.checkoutTime || !updatedFields.totalWorkingHours) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        for (let key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                updateQuery[`attendance.$[elem].${key}`] = updatedFields[key];
            }
        }
        try {
            const response = await collection.updateMany(
                { 'attendance.date': updatedFields.date, 'attendance.status': true },
                { $set: updateQuery },
                { arrayFilters: [{ 'elem.date': updatedFields.date }], upsert: true }
            );
            res.status(200).json(response);
        } catch (err) {
            console.error('Error updating attendance:', err);
            res.status(500).json({ error: 'Internal server error' });
        }

    })


    router.patch('/run/cron', async(req,res) => {
        try {

            // Access the collection
            const collection = db.collection('attendance');
            const today = new Date();
            const{monthName} = getTodayDate();
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
                month: monthName
            };

            // Update attendance for all employees
            await collection.updateMany({}, { $push: { attendance: attendanceObj } });
            res.status(200).send("done")
            console.log('Attendance updated successfully for all employees.');
        } catch (err) {
            console.error('Error updating attendance:', err);
        }
    })

    router.post("/duplicate/collection", async(req, res) => {
        const collection = db.collection(collectionName);
        const newCollection = collectionName;
        db.collection("employeeDetails").aggregate([
            { $match: {} },
            { $out: newCollection }
         ]).toArray();

         res.status(200).send(`Collection duplicated to ${newCollection}`);
    })

    router.delete('/delete/:employeeId', async (req, res) => {
        const {employeeId} = req.params;
        await db.collection(collectionName).findOneAndDelete({
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
