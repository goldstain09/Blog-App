const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); 
;
const server = express();
console.log("Server Started");

async function main() {
  await mongoose.connect(process.env.MONGO);
  console.log("db connected");
}
main().catch((err) => console.log(err));

server.listen(process.env.PORT || 8080);
