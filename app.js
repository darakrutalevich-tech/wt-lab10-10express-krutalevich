const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Express работает!");
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server started on port ${port}`);
});