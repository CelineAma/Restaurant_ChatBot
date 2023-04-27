const http = require("http");
const path = require("path");
const fs = require("fs");

const mongoose = require("mongoose");

const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
const { Server } = require("socket.io");
const app = require("./app");
require("dotenv").config();

//connect to access environmental variables
const PORT = process.env.PORT || 3000;
const MONGODB_CONNECTION_URL = process.env.MONGODB_CONNECTION_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;

//connect mongodb
mongoose
  .connect(MONGODB_CONNECTION_URL)
  .then(() => {
    console.log("MongoDB connected successfully");


//create app to listen to the server when connected
const httpServer = http.createServer(app);

    httpServer.listen(PORT, () => {
      console.log("Server started on port, " + PORT);
    });
  })
  .catch((error) => console.log("MongoDB connection failed"));

//create the session middleware MW
var store = new MongoDBStore({
  uri: MONGODB_CONNECTION_URL,
  collection: "sessions",
});

// Catch errors
store.on("error", function (error) {
  console.log(error);
});

const sess = {
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, //it's set on false as its on http not https //Also, specified how long it takes the cookies to expire in milliseconds (session expire in 7 days)
  store: store,
};

if (process.env.NODE_ENV === "production") {
  sess.cookie.secure = true; //serve secure cookies
  sess.cookie.httpOnly = true; //serve secure cookies
}

const sessionMW = session(sess);

//create app to listen to the server when connected
const httpServer = http.createServer(app);

//set up socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", //when client wants to connect, it can be from any origin
    credentials: true,
  },
});

//configure the middleware to the session server
io.use((socket, next) => {
  sessionMW(socket.request, {}, next);
});

//app to be aware of the session milddleware
app.use(sessionMW);

const saveToSession = (session) => {
  session.save(function (err) {
    if (err) {
      console.log(err);
    }
  });
};

io.on("connection", async (socket) => {
  // SESSION
  const session = socket.request.session;
  session.menuDisplayed = undefined;
  session.orderHistory = [];
  saveToSession(session);

  // GET resources
  const menu = JSON.parse(
    fs.readFileSync(path.join(__dirname, "Data", "menu.json"), "utf-8")
  );
  
  // regular expression to include the range of numbers from 2 to 10 (both inclusive)
  const pattern = /^([2-9]|1\d|10)(,([2-9]|1\d|10))*$/;
  socket.on("sendOption", async (option) => {
    switch (true) {
      case option === "1":
        session.menuDisplayed = true;
        saveToSession(session);
        socket.emit("botResponse", {
          type: "menu",
          data: { menu },
        });
        break;

      case option === "99":
        if (session.currentOrder) {
          // Stores checked out order in order history
          session.orderHistory.push(session.currentOrder);
          // Reset currentOrder and menuDisplayed after checkout
          session.currentOrder = undefined;
          session.menuDisplayed = undefined;
          saveToSession(session);
          socket.emit("botResponse", {
            type: "checkout",
            data: {
              text: "Thank you for placing your order with us.",
            },
          });
        } else {
          socket.emit("botResponse", {
            type: "",
            data: {
              text: "I'm sorry, you don't have any active orders to checkout. If you'd like to place an order, please select option 1 to see our menu.",
            },
          });
        }
        break;

      case option === "98":
        if (session.orderHistory.length) {
          socket.emit("botResponse", {
            type: "orderHistory",
            data: {
              orders: session.orderHistory,
            },
          });
        } else {
          socket.emit("botResponse", {
            type: "",
            data: {
              text: "You haven't placed an order with us yet. To get started, please select option 1 to view our menu and place your first order.",
            },
          });
        }
        break;

      case option === "97":
        if (session.currentOrder) {
          socket.emit("botResponse", {
            type: "currentOrder",
            data: session.currentOrder,
          });
        } else {
          socket.emit("botResponse", {
            type: "",
            data: {
              text: "It looks like you don't have any active order. If you'd like to place a new order, please select option 1 to see our menu.",
            },
          });
        }
        break;

      case option === "0":
        if (session.currentOrder) {
          session.currentOrder = undefined;
          saveToSession(session);
          socket.emit("botResponse", {
            type: "",
            data: {
              text: "Order cancelled!",
            },
          });
        } else {
          socket.emit("botResponse", {
            type: "",
            data: {
              text: "I'm sorry, but it looks like you don't have any active orders to cancel.",
            },
          });
        }
        break;

      case pattern.test(option):
        if (session.menuDisplayed) {
          const items = option.split(",");
          const order = menu.filter((item) =>
            items.includes(item.id.toString())
          );
          const total = order.reduce(
            (prevValue, item) => prevValue + item.price,
            0
          );
          socket.emit("botResponse", {
            type: "currentOrder",
            data: { order, total },
          });
          session.currentOrder = { order, total };
          saveToSession(session);
        } else {
          socket.emit("botResponse", {
            type: "menu",
            data: { menu },
          });
          session.menuDisplayed = true;
          saveToSession(session);
          socket.emit("botResponse", {
            type: "",
            data: {
              text: "Please check the current menu list before placing your order, as it may have changed since your last order. Thank you!",
            },
          });
        }
        break;

      default:
        socket.emit("botResponse", {
          type: "unknownInput",
          data: {
            text: "I'm sorry, I don't understand. Could you please choose from the options below?",
          },
        });
        break;
    }
  });
});
