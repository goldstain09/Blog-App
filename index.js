require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

// routes
const userRoutes = require('./Routes/User');

const server = express();
console.log("Server Started");

async function main() {
  await mongoose.connect(process.env.MONGO);
  console.log("db connected");
}
main().catch((err) => {});


server.use(cors());
server.use(express.json()); 

// settng routes
server.use('/v1/UserApi',userRoutes.userRoutes);


server.listen(process.env.PORT || 8080);
