import express from "express";
import db from "../../db/connection.js";
import attendance from "./attendanceSchema.js";


const router = express.Router();


router.get("/list", async(req, res) => {
    try {
        let collection = db.collection("attendance");
        let results = await collection.find({}).toArray();
        res.send(results).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving employee attendance details");
    }
  });

export default router;