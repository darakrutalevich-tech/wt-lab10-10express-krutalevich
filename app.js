const express = require("express");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Express работает!");
});

app.get("/api/info", (req, res) => {
    res.json({
        application: "Web Technologies",
        technology: "Node.js + Express",
        database: "PostgreSQL"
    });
});

app.post("/api/test", (req, res) => {
    res.json({
        message: "Данные получены",
        data: req.body
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка подключения к базе данных" });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server started on port ${port}`);
});