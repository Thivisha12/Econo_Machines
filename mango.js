const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 4055;

// MongoDB connection details
const mongoUrl = "mongodb://localhost:27017/";
const dbName = "kec";
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); // Exit the process if MongoDB connection fails
    });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Serve the form for inserting data
app.get("/insert", (req, res) => {
    res.sendFile(path.join(__dirname, "form3.html"));
});

// Route for inserting data
app.post("/insert", async (req, res) => {
    const { name, email, phoneNumber, address, gender, programme, course} = req.body;
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        await db.collection("items").insertOne({ name, email, phoneNumber, address, gender, programme, course});
        res.redirect("/report");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});

// Endpoint to retrieve and display a simple report
app.get("/report", async (req, res) => {
    try {
        const items = await db.collection("items").find().toArray();

        let tableContent = "<h1>Report</h1><table border='1'><tr><th>Name</th><th>Email</th><th>Phone Number</th><th>Address</th><th>Gender</th><th>Programme</th><th>Course</th><th>Actions</th></tr>";

        tableContent += items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.phoneNumber}</td>
                <td>${item.address}</td>
                <td>${item.gender}</td>
                <td>${item.programme}</td>
                <td>${item.course}</td>
                <td>
                    <a href="/update/${item._id}">Update</a> |
                    <a href="/delete/${item._id}">Delete</a>
                </td>
            </tr>`).join("");

        tableContent += "</table><a href='/'>Back to home</a>";

        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});

// Serve the form for updating data
app.get("/update/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const item = await db.collection("items").findOne({ _id: new ObjectId(id) });
        if (!item) {
            res.status(404).send("Item not found");
            return;
        }
        const form = `
            <form action="/update/${id}" method="POST">
                <input type="hidden" name="id" value="${id}" />
                Name: <input type="text" name="name" value="${item.name}" /><br />
                Email: <input type="email" name="email" value="${item.email}" /><br />
                Phone Number: <input type="text" name="phoneNumber" value="${item.phoneNumber}" /><br />
                Address: <input type="text" name="address" value="${item.address}" /><br />
                Gender: <input type="text" name="gender" value="${item.gender}" /><br />
                Programme: <input type="text" name="programme" value="${item.programme}" /><br />
                Course: <input type="text" name="course" value="${item.course}" /><br />
               
                <button type="submit">Update</button>
            </form>
        `;
        res.send(form);
    } catch (err) {
        console.error("Error fetching item:", err);
        res.status(500).send("Failed to fetch item");
    }
});

// Route to update data
app.post("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, phoneNumber, address, gender, programme, course} = req.body;
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        await db.collection("items").updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, email, phoneNumber, address, gender, programme, course } }
        );
        res.redirect("/report");
    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).send("Failed to update data");
    }
});

// Route to delete data
app.get("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection("items").deleteOne({ _id: new ObjectId(id) });
        res.redirect("/report");
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



