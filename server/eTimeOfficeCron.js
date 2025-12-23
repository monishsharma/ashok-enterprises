import {fetchEtimeAttendance} from "./helper/eTimeOffice.js";
// import { toISODate, toTimestamp, toMinutes } from "./helper/time";
import {toMinutes, toISODate, toTimestamp} from "./helper/time.js"

const collectionName = process.env.NODE_ENV === "dev" ? "attendance" : "employeeDetails"


export const fetchETimeOfficeDataCron = async() => {

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const fromDate = `${dd}/${mm}/${yyyy}`;
    const toDate = fromDate;


    let synced = 0;
    let skipped = 0;
    try {
        const biometricData = await fetchEtimeAttendance({ fromDate, toDate });
        const employeeCollection =  db.collection(collectionName)
        for(const data of biometricData ) {
            const isoDate = toISODate(data.DateString);
            const employee = await employeeCollection.findOne(
                { empCode: data.Empcode },
                {
                    projection: {
                        name: 1,
                        empCode: 1,
                        attendance: { $elemMatch: { date: isoDate } } // 🔹 THIS IS KEY
                    }
                }
            );
            if (!employee) {
                skipped++;
                continue;
            }
            const attendanceObj = {
                date: isoDate,
                status: data.Status === "P",
                isSunday: new Date(isoDate).getDay() === 0,
                checkinTime: toTimestamp(data.DateString, data.INTime),
                checkoutTime: toTimestamp(data.DateString, data.OUTTime),
                isOverTime: toMinutes(data.OverTime) > 0,
                isAbsent: data.Status === "A",
                month: new Date(isoDate).toLocaleString("default", { month: "long" }),
                year: new Date(isoDate).getFullYear(),
                source: "BIOMETRIC",
            };

            await employeeCollection.updateOne(
                {
                    empCode: data.Empcode,
                    "attendance.date": isoDate // find the array element
                },
                {
                    $set: { "attendance.$": attendanceObj } // update that element
                }
            );

            synced++;

            // console.log(employee)
        }

        console.log(`Attendance fetched successfully from biometric synced=${synced} total=${biometricData.length}`);

        res.json({
            success: true,
            synced,
            skipped,
            total: biometricData.length,
        });


    } catch(err) {
        console.log(err)
    }

}