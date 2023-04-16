const http = require("http");
const path = require("path");
const fs = require("fs");

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const { Server } = require("socket.io");
const app = require("./app");
require("dotenv").config();
// const { socket } = require("dgram");

const User = require("./Models/userModels");

const getOption = require("./getOption");

//connect to access environmental variables
const port = process.env.PORT || 3000;
const MONGODB_CONNECTION_URL = process.env.MONGODB_CONNECTION_URL;
const sessionSecret = process.env.SESSION_SECRET;

//connect mongodb
mongoose
  .connect(MONGODB_CONNECTION_URL)
  .then(() => {
    console.log("MongoDB connected successfully");

    httpServer.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  })
  .catch((error) => console.log("MongoDB connection failed"));

//create app to listen to the server when connected
const httpServer = http.createServer(app);

//set up socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", //when client wants to connect, it can be from any origin
    credentials: true,
  },
});

//create the session middleware MW
const sessionMW = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 13149000000 }, //it's set on false as its on http not https //Also, specified how long it takes the cookies to expire in milliseconds (session expire in 5months)
  store: MongoStore.create({ mongoUrl: MONGODB_CONNECTION_URL }), //connect to a store in a database collection: restaurant chatbot
});

//app to be aware of the session milddleware
app.use(sessionMW);

//configure the middleware to the session server
io.use((socket, next) => {
  sessionMW(socket.request, {}, next);
});
const optionJson = fs.readFileSync(
  path.join(__dirname, "data", "option.json"),
  "utf-8"
); //to read the option file
const options = JSON.parse(optionJson);
//set the event listener for the socket.io
io.on("connection", async (socket) => {
  // console.log(socket.id);
  socket.emit("options", options);

  //creating user IDs
  let user;

  const session = socket.request.session;
  var userId = session.userId;
  console.log(userId);
  if (!userId) {
    // session.userId = uuidv4();
    userId = uuidv4();
    session.userId = userId;
    session.save((error) => {
      if (error) {
        console.log(error);
      }
    });
    user = await User.create({ userId: userId }); //create userId
    console.log("You're a New User");
  } else {
    console.log("Welcome, Registered User");
    user = await User.findOne({ userId: userId }); //search for registered user
  }

  console.log(userId); //confirming that the session is persisting (not creating new session for new user when registered user reload)
});

// Store the options data in the session object
app.use((req, res, next) => {
  req.session.options = options;
  next();
});

//Access the options data from the session object
app.get("/", (req, res) => {
  const options = req.session.options;
  // Use the options data as needed
  res.send("Options data: " + JSON.stringify(options));
});

//to connect the option.json data file
app.get("/", (req, res) => {
  // store the options data in the user's session object
  req.session.options = options;

  // render the chatbot interface
  res.render("chatbot");
});

app.post("/chat", (req, res) => {
  const { message } = req.body;
  const sessionId = req.sessionID;

  //a function that sends a message to the user via the chat interface.
  function sendMessage(res, message) {
    const botMessage = {
      message: message,
      sender: "bot",
    };

    res.json({
      success: true,
      message: botMessage,
    });
  }

  // to create a process message function where you are currently retrieving the user's message and checking which option they selected.

  function processMessage(req, res) {
    // Retrieve user's message from request body
    const userMessage = req.body.Body.trim();

    // Check which option the user selected
    if (userMessage === "1") {
      // Call the getOption function to return the list of items
      const options = getOption("menu");
      sendMessage(res, options);
    } else if (userMessage === "99") {
      // Call the placeOrder function to place the order
      const result = placeOrder(req.sessionID);
      sendMessage(res, result);
    } else if (userMessage === "98") {
      // Call the getOrderHistory function to return the order history
      const orderHistory = getOrderHistory(req.sessionID);
      sendMessage(res, orderHistory);
    } else if (userMessage === "97") {
      // Call the getCurrentOrder function to return the current order
      const currentOrder = getCurrentOrder(req.sessionID);
      sendMessage(res, currentOrder);
    } else if (userMessage === "0") {
      // Call the cancelOrder function to cancel the order
      const result = cancelOrder(req.sessionID);
      sendMessage(res, result);
    } else {
      sendMessage(res, "Invalid option selected. Please try again.");
    }
  }

  // Call the processMessage() function to handle the user's message
  // Process the user message and get the response
  const response = processMessage(message, sessionId);

  // Send the response back to the user
  res.json({ response });
});
