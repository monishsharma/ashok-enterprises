import express from "express";
import {db} from "../../db/connection.js";
import Employees from "./employeeSchema.js";
import { ObjectId } from "mongodb";
import { getTodayDate } from "../../helper/server-today-date.js";
import { fetchEtimeAttendance } from "../../helper/eTimeOffice.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { formatMinutes } from "../../helper/formatMinutes.js";
import moment from "moment-timezone";

const router = express.Router();
const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const collectionName = process.env.NODE_ENV === "dev" ? "employeeDetails" : "employeeDetails"
// const collectionName = process.env.NODE_ENV === "dev" ? "attendance" : "employeeDetails"
// Puppeteer config
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let browser;
let isProduction = process.env.NODE_ENV === "prod";
// const collectionName = isProduction ? "invoices" : "invoicesCopy";

async function getBrowser() {
  if (browser) return browser;

  if (isProduction) {
    const puppeteer = (await import("puppeteer-core")).default;
    const chromium = (await import("@sparticuz/chromium")).default;

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = (await import("puppeteer")).default;
    browser = await puppeteer.launch();
  }

  return browser;
}

console.log(process.env.NODE_ENV)


    router.get("/list", async(req, res) => {

        let query = {};
        let options = {};
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length > 0) {
            // Dynamically construct the filter conditions
            const filterConditions = queryKeys.map(key => {
            const value = req.query[key];
            return {
                $eq: [`$$item.${key}`, key === "year" ? parseInt(value) : value]
            };
            });

            options = {
                projection: {
                    _id: 1,
                    name: 1,
                    salaryPerDay: 1,
                    payment: 1,
                    advance: 1,
                    empCode: 1,
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
            const value = req.query[key];
            return {
                $eq: [`$$item.${key}`, key === "year" ? parseInt(value) : value]
            };
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
        try {
            const { employeeId } = req.params;
            const updatedFields = req.body;

            const result = await db.collection(collectionName).updateOne(
            { _id: new ObjectId(employeeId) },
            [
                {
                $set: {
                    attendance: {
                    $cond: {
                        if: {
                        $in: [updatedFields.date, "$attendance.date"]
                        },
                        then: {
                        $map: {
                            input: "$attendance",
                            as: "a",
                            in: {
                            $cond: [
                                { $eq: ["$$a.date", updatedFields.date] },
                                { $mergeObjects: ["$$a", updatedFields] },
                                "$$a"
                            ]
                            }
                        }
                        },
                        else: {
                        $concatArrays: ["$attendance", [updatedFields]]
                        }
                    }
                    }
                }
                }
            ]
            );

            res.status(200).send("success");
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
});

router.post('/attendance/bulk', async (req, res) => {
  try {
    const records = req.body; // array of { employeeId, ...attendancePayload }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "No records provided" });
    }

    const operations = records.map(item => {
      const { employeeId, date, ...attendanceData } = item;

      return {
        updateOne: {
          filter: { _id: new ObjectId(employeeId) },
          update: [
            {
              $set: {
                attendance: {
                  $cond: {
                    if: { $in: [date, "$attendance.date"] },
                    then: {
                      $map: {
                        input: "$attendance",
                        as: "a",
                        in: {
                          $cond: [
                            { $eq: ["$$a.date", date] },
                            { $mergeObjects: ["$$a", { date, ...attendanceData }] },
                            "$$a"
                          ]
                        }
                      }
                    },
                    else: {
                      $concatArrays: ["$attendance", [{ date, ...attendanceData }]]
                    }
                  }
                }
              }
            }
          ]
        }
      };
    });

    await db
      .collection(collectionName)
      .bulkWrite(operations, { ordered: false });

    res.status(200).json({
      success: true,
      processed: operations.length
    });

  } catch (err) {
    console.error("Bulk attendance error:", err);
    res.status(500).json({ error: err.message });
  }
});



    router.patch('/edit/:employeeId', async (req, res) => {
        const {employeeId} = req.params;
        const payload = req.body;
        await db.collection(collectionName).findOneAndUpdate({
            _id: new ObjectId(employeeId),
        }, {$set: {name: payload.name, salaryPerDay: payload.salaryPerDay,esi: payload.esi, empCode: payload.empCode}})
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

   router.get("/sync/etimeoffice", async(req,res) => {
    const { fromDate, toDate } = req.query;
    try {
        const biometricData = await fetchEtimeAttendance({ fromDate, toDate });
        // const employeeCollection =  db.collection(collectionName)
        // for(const data of biometricData ) {
        //     const isoDate = toISODate(data.DateString);
        //     const employee = await employeeCollection.findOne(
        //         { empCode: data.Empcode },
        //         {
        //             projection: {
        //                 name: 1,
        //                 empCode: 1,
        //                 attendance: { $elemMatch: { date: isoDate } } // 🔹 THIS IS KEY
        //             }
        //         }
        //     );
        //     if (!employee) {
        //         skipped++;
        //         continue;
        //     }
        //     const attendanceObj = {
        //         date: isoDate,
        //         status: data.Status === "P",
        //         isSunday: new Date(isoDate).getDay() === 0,
        //         checkinTime: toTimestamp(data.DateString, data.INTime),
        //         checkoutTime: toTimestamp(data.DateString, data.OUTTime),
        //         isOverTime: toMinutes(data.OverTime) > 0,
        //         isAbsent: data.Status === "A",
        //         month: new Date(isoDate).toLocaleString("default", { month: "long" }),
        //         year: new Date(isoDate).getFullYear(),
        //         source: "BIOMETRIC",
        //     };

        //     await employeeCollection.updateOne(
        //         {
        //             empCode: data.Empcode,
        //             "attendance.date": isoDate // find the array element
        //         },
        //         {
        //             $set: { "attendance.$": attendanceObj } // update that element
        //         }
        //     );

        //     synced++;

        //     // console.log(employee)
        // }
        res.json({
            success: true,
            data: biometricData
        });
        //  res.status(200).json(employee);


    } catch(err) {
        console.log(err)
    }
   });


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

    router.get("/generate-salary-slip-pdf", async (req, res) => {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const{month,year}=req.query;
        let query = {};
        let options = {};
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length > 0) {
            // Dynamically construct the filter conditions
            const filterConditions = queryKeys.map(key => {
            const value = req.query[key];
            return {
                $eq: [`$$item.${key}`, key === "year" ? parseInt(value) : value]
            };
            });

            options = {
                projection: {
                    _id: 1,
                    name: 1,
                    salaryPerDay: 1,
                    payment: 1,
                    advance: 1,
                    empCode: 1,
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
            const employeesData = results
            .map(emp =>
                {
                    const totalWorkingMinutes = emp.attendance.reduce((sum, day) => sum + (day.totalWorkingHours?.min || 0),0);
                    const totalOTMinutes = emp.attendance.reduce((sum, day) => sum + (day.overTimeHours?.min || 0),0);
                    const sundayPresentCount = emp.attendance.filter(day => {
                        const isSunday = new Date(day.date).getDay() === 0;
                        return isSunday && day.status === true;
                    }).length;
                    return ({
                        month,
                        year,
                        empCode: emp.empCode,
                        name: emp.name,
                        sundayPresentCount,
                        salaryPerDay: `₹ ${emp.salaryPerDay}`,
                        attendance: emp.attendance,
                        totalPresent: emp.attendance.filter(a => a.status).length,
                        totalAbsent: emp.attendance.filter(a => !a.status).length,
                        totalWork: formatMinutes(totalWorkingMinutes).formatted,
                        totalOT: formatMinutes(totalOTMinutes).formatted,
                        days: emp.attendance.map(d => {

                            const work = formatMinutes(d.totalWorkingHours?.min || 0).formatted;
                            const OT = formatMinutes(d.overTimeHours?.min || 0).formatted;


                        return {
                                ...d,
                                formattedCheckinTime: d.checkinTime ? moment.tz(Number(d.checkinTime), "Asia/Kolkata").format("HH:mm"): "--:--",
                                formattedCheckoutTime: d.checkoutTime? moment.tz(Number(d.checkoutTime), "Asia/Kolkata").format("HH:mm"): "--:--",
                                dayName: weekday[new Date(d.date).getDay()],
                                dayNumber: new Date(d.date).getDate(),
                                workingHour: work,
                                overtime: OT
                            };
                        }),
                    })
            })
            .sort((a, b) =>
                a.empCode.localeCompare(b.empCode, undefined, { numeric: true })
            ).slice(1)
            const html = await ejs.renderFile(
                  path.join(__dirname, "../billing/invoice-config/templates/salarySlip.ejs"),
                  {
                    employeesData
                  }
                );
            await page.setContent(html, { waitUntil: "networkidle0" });
                const pdfBuffer = await page.pdf({
                  format: "LEGAL",
                  landscape: true,
                  printBackground: true,
                  scale: 1,
                });
            await page.close();
            res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=SALARY_SLIP_${month}.pdf`,
            "Content-Length": pdfBuffer.length,
            });

            res.send(Buffer.from(pdfBuffer));
            // res.send(results).status(200);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving employee details");
        }




    })




export default router;
