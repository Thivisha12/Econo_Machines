const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const mongoUrl = "mongodb://localhost:27017";
const dbName = "KEC";
let db;

MongoClient.connect(mongoUrl).then((client) => {
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the process if MongoDB connection fails
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection("items").deleteOne({ _id: new ObjectId(id) });
        res.redirect("/report");
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});
module.exports = router;



