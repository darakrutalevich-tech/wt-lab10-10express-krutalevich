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

app.get("/api/flights", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                "Id",
                "FlightNumber",
                "Departure",
                "Arrival",
                "Price",
                "IsAvailable",
                "Description"
            FROM "Flights"
            ORDER BY "Id"
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка получения рейсов" });
    }
});

app.get("/api/flights/search", async (req, res) => {
    try {
        const query = req.query.q || "";

        const result = await pool.query(`
            SELECT "Id", "FlightNumber", "Departure", "Arrival", "Price", "IsAvailable", "Description"
            FROM "Flights"
            WHERE
                "FlightNumber" ILIKE $1 OR
                "Departure" ILIKE $1 OR
                "Arrival" ILIKE $1
            ORDER BY "Id"
        `, [`%${query}%`]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка поиска" });
    }
});

app.get("/api/flights/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await pool.query(`
            SELECT
                "Id",
                "FlightNumber",
                "Departure",
                "Arrival",
                "Price",
                "IsAvailable",
                "Description"
            FROM "Flights"
            WHERE "Id" = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Рейс не найден" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка получения рейса" });
    }
});

app.post("/api/flights", async (req, res) => {
    try {
        const { flightNumber, departure, arrival, price, isAvailable, description } = req.body;

        if (!flightNumber || !departure || !arrival || price === undefined) {
            return res.status(400).json({ error: "Некорректные данные рейса" });
        }

        if (price <= 0) {
            return res.status(400).json({ error: "Цена должна быть больше 0" });
        }

        const result = await pool.query(`
            INSERT INTO "Flights"
                ("FlightNumber", "Departure", "Arrival", "Price", "IsAvailable", "Description")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [flightNumber, departure, arrival, price, isAvailable, description || ""]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка создания рейса" });
    }
});

app.put("/api/flights/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { flightNumber, departure, arrival, price, isAvailable, description } = req.body;

        if (!flightNumber || !departure || !arrival || price === undefined) {
            return res.status(400).json({ error: "Некорректные данные рейса" });
        }
        if (price <= 0) {
            return res.status(400).json({ error: "Цена должна быть больше 0" });
        }

        const result = await pool.query(`
            UPDATE "Flights"
            SET "FlightNumber" = $1, "Departure" = $2, "Arrival" = $3,
                "Price" = $4, "IsAvailable" = $5, "Description" = $6
            WHERE "Id" = $7
            RETURNING *
        `, [flightNumber, departure, arrival, price, isAvailable, description || "", id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Рейс не найден" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка изменения рейса" });
    }
});

app.delete("/api/flights/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const result = await pool.query(`
            DELETE FROM "Flights"
            WHERE "Id" = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Рейс не найден" });
        }
        res.json({
            message: "Рейс удалён",
            flight: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка удаления рейса" });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server started on port ${port}`);
});