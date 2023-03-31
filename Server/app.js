const express = require("express");
const app = express();
const path = require("path");

//serve static files (css, javascript) from the "Client" folder
app.use(express.static(path.join(__dirname, "Client"))); //to make app aware of the static files

//serve the chatRoom.html file
app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "Client", "chatRoom.html")) //render the static files
});

module.exports = app;
