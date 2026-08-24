import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../../db/connection.js";
// import { createPayment } from "./selector.js";

const router = express.Router();

// getc config

router.get("/config-detail", async (req, res) => {
  try {
    const configCollection = db.collection("config");

    const config = await configCollection.findOne({});

    res.json(config || {});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching config");
  }
});


router.post("/post-config-detail", async (req, res) => {
  try {
    const Config = db.collection("config");

    const { _id, key, title, columns } = req.body;

    if (!key || !title || !columns?.length) {
      return res.status(400).json({
        success: false,
        message: "Key, title and columns are required",
      });
    }

    const validKey = /^[a-zA-Z][a-zA-Z0-9_]*$/;

    if (!validKey.test(key)) {
      return res.status(400).json({
        success: false,
        message: "Invalid config key",
      });
    }

    let config = await Config.findOne({});

    if (!config) {
      await Config.insertOne({
        data: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      config = await Config.findOne({});
    }

    // =========================
    // EDIT CONFIG
    // =========================
    if (_id) {
      const configId = new ObjectId(_id);

      const existingEntry = Object.entries(config.data || {}).find(
        ([_, item]) => item._id?.toString() === configId.toString()
      );

      if (!existingEntry) {
        return res.status(404).json({
          success: false,
          message: "Config not found",
        });
      }

      const [oldKey, oldConfig] = existingEntry;

      // If key was changed, make sure new key is not already used
      if (oldKey !== key && config.data?.[key]) {
        return res.status(400).json({
          success: false,
          message: `Config '${key}' already exists`,
        });
      }

      const updatedConfigData = {
        _id: configId,
        title,
        columns,

        // keep existing values
        values: oldConfig.values || [],
      };

      const update = {
        $set: {
          [`data.${key}`]: updatedConfigData,
          updatedAt: new Date(),
        },
      };

      // If config key was renamed
      if (oldKey !== key) {
        update.$unset = {
          [`data.${oldKey}`]: "",
        };
      }

      const updatedConfig = await Config.findOneAndUpdate(
        {
          _id: config._id,
        },
        update,
        {
          returnDocument: "after",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Config updated successfully",
        data: updatedConfig.data[key],
      });
    }

    // =========================
    // CREATE CONFIG
    // =========================

    if (config.data?.[key]) {
      return res.status(400).json({
        success: false,
        message: `Config '${key}' already exists`,
      });
    }

    const newConfig = {
      _id: new ObjectId(),
      title,
      columns,
      values: [],
    };

    const updatedConfig = await Config.findOneAndUpdate(
      {
        _id: config._id,
      },
      {
        $set: {
          [`data.${key}`]: newConfig,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Config created successfully",
      data: updatedConfig.data[key],
    });
  } catch (error) {
    console.error("Post config detail error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



router.post("/post-config-value", async (req, res) => {
  try {
    const Config = db.collection("config");

    const { configKey } = req.query;
    const body = req.body;

    if (!configKey) {
      return res.status(400).json({
        success: false,
        message: "configKey is required",
      });
    }

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Value is required",
      });
    }

    const config = await Config.findOne({});

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Config document not found",
      });
    }

    if (!config.data?.[configKey]) {
      return res.status(404).json({
        success: false,
        message: `Config '${configKey}' not found`,
      });
    }

    // EDIT
    if (body._id) {
      const valueId = new ObjectId(body._id);

      const { _id, ...updatedData } = body;

      const result = await Config.findOneAndUpdate(
        {
          _id: config._id,
          [`data.${configKey}.values._id`]: valueId,
        },
        {
          $set: {
            [`data.${configKey}.values.$`]: {
              _id: valueId,
              ...updatedData,
            },
            updatedAt: new Date(),
          },
        },
        {
          returnDocument: "after",
        }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Value not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Value updated successfully",
        data: result.data[configKey],
      });
    }

    // ADD
    const newValue = {
      _id: new ObjectId(),
      ...body,
    };

    const result = await Config.findOneAndUpdate(
      {
        _id: config._id,
      },
      {
        $push: {
          [`data.${configKey}.values`]: newValue,
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Value added successfully",
      data: result.data[configKey],
    });
  } catch (error) {
    console.error("Post config value error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});




export default router;