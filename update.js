const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

// Define your MongoDB connection
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

router.post('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNumber, address, gender, programme, course, password, confirmPassword, agreeTerms } = req.body;
        await db.collection("items").updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, email, phoneNumber, address, gender, programme, course, password, confirmPassword, agreeTerms } }
        );
        res.redirect("/report");
    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).send("Failed to update data");
    }
});
module.exports = router;
