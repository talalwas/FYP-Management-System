#!/usr/bin/env node

/**
 * Load env vars from the .env file
 */
require("dotenv").config();

/**
 * Module dependencies.
 */

var app = require("../app");
var io = require("socket.io");
var debug = require("debug")("fypmangement:server");
var http = require("http");
var fs = require("fs");
const jwt_decode = require("jwt-decode");
const { uploadsDir } = require("../helpers/constants");
const Group = require("../models/Groups");
const Message = require("../models/Message");
const { roles } = require("../helpers/constants");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "4000");
app.set("port", port);
console.log("Starting on PORT:", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Setup Socket IO
 */

io = io(server, {});

// auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // just by decoding it we're good
  jwt_decode(token);
  next();
});

io.on("connection", async (socket) => {
  const group = new Group();
  const user = getUserFromToken(socket);
  console.log("connection established with", user._id, user.role);

  if (user.role == roles.S) {
    // for student
    const myGroup = await group.getGroupWithUserId(user._id);
    if (myGroup) {
      // add student to their group's room
      socket.join(myGroup._id.toString());
      io.to(socket.id).emit("first", {
        msg: "https://tenor.com/bnZ2s.gif",
        // weird that we're sending it back
        // but client is going to need it anyways (to identify their room)
        // why not just send it here.
        groupId: myGroup._id,
      });
    }
  } else if (user.role == roles.F) {
    // add supervisor to all of supervised groups rooms
    // may seem weird and slow but we save a "join-a-room" event
    const myGroups = await group.getSupervisedGroups(user._id);
    if (myGroups) {
      myGroups.forEach((el) => {
        socket.join(el._id.toString());
      });
      // just so we can have some ACK on client side
      io.to(socket.id).emit("first", {
        msg: "https://tenor.com/bk82L.gif",
        // we don't send Group ID now because
        // client will have it already
      });
    }
  }

  socket.on("roomMessage", async (data) => {
    // send group to the message
    const readToken = jwt_decode(data.token);
    // save message
    const message = new Message({
      sender: readToken._id,
      content: data.msg,
      group: data.groupId,
    });
    message.saveMessage();

    io.in(data.groupId).emit("roomMessage", {
      _id: readToken._id,
      firstname: readToken.firstname,
      role: readToken.role,
      msg: data.msg,
    });
  });
});

function getUserFromToken(socket) {
  const token = socket.handshake.auth.token;
  return jwt_decode(token);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
