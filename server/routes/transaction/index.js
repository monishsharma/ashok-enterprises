import express from "express";
import { db } from "../../db/connection.js";
// import { createPayment } from "./selector.js";

const router = express.Router();

router.get("/outstanding", async (req, res) => {
  const { company } = req.query;

  try {
    const result = await db.collection("transactions").aggregate([
      { $match: { company } },

      { $unwind: "$entries" },

      {
        $lookup: {
          from: "ledger",
          localField: "entries.ledgerId",
          foreignField: "_id",
          as: "ledger"
        }
      },

      { $unwind: "$ledger" },

      // ✅ ADD FILTER HERE
      {
        $match: {
          "ledger.type": "asset"
        }
      },

      {
        $group: {
          _id: "$entries.ledgerId",
          name: { $first: "$ledger.name" },
          debit: {
            $sum: {
              $cond: [{ $eq: ["$entries.type", "debit"] }, "$entries.amount", 0]
            }
          },
          credit: {
            $sum: {
              $cond: [{ $eq: ["$entries.type", "credit"] }, "$entries.amount", 0]
            }
          }
        }
      }
    ]).toArray();

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error calculating outstanding");
  }
});

// router.post("/payment", async (req, res) => {
//   try {
//     const { company, ledgerId, amount, date } = req.body;

//     await createPayment({ company, ledgerId, amount, date });

//     res.json({ message: "Payment recorded" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error creating payment");
//   }
// });

export default router;