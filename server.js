import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URL = "mongodb://charanya:charanya123@localhost:27017";
const dbname = "booksDB";

const client = new MongoClient(MONGO_URL);
const app = express();

app.use(express.json());

let db;

// POST: Create a book
app.post("/api/v1/books", async (req, res) => {
    try {
        const body = req.body;
        const result = await db.collection("books").insertOne(body);

        res.status(201).json({
            message: "Book created successfully",
            data: { _id: result.insertedId }
        });
    } catch (err) {
        res.status(500).json({
            message: "Error creating book",
            error: err.message
        });
    }
});

// GET: Fetch all books or filter by category
app.get("/api/v1/books", async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {};

        const result = await db.collection("books")
            .find(query)
            .toArray();

        res.status(200).json({
            message: "Books fetched successfully",
            data: result
        });
    } catch (err) {
        res.status(500).json({
            message: "Problem in fetching books",
            error: err.message
        });
    }
});

// GET: Fetch one book by ID
app.get("/api/v1/books/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const result = await db.collection("books").findOne({
            _id: new ObjectId(id)
        });

        if (!result) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book fetched successfully",
            data: result
        });
    } catch (err) {
        res.status(500).json({
            message: "Problem in fetching book details",
            error: err.message
        });
    }
});

// PUT: Update a book by ID
app.put("/api/v1/books/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const updateData = req.body;

        const result = await db.collection("books").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Problem in updating book details",
            error: err.message
        });
    }
});

// DELETE: Delete a book by ID
app.delete("/api/v1/books/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const result = await db.collection("books").deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Problem in deleting book details",
            error: err.message
        });
    }
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Connect to MongoDB before starting the server
async function startServer() {
    try {
        await client.connect();
        db = client.db(dbname);

        console.log(`Connected to database: ${dbname}`);

        app.listen(8080, () => {
            console.log("Server running at http://localhost:8080");
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
}

startServer();