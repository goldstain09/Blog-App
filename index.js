require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

// routes
const userRoutes = require("./Routes/User");
const postRoutes = require("./Routes/Post");

const server = express();
// console.log("Server Started");

async function main() {
  await mongoose.connect(process.env.MONGO);
  // console.log("db connected");
}
main().catch((err) => {
  // console.log(err);
});

server.use(cors());
server.use(express.json());
server.use(express.static(process.env.STATIC));

// settng routes
server.use("/v1/UserApi", userRoutes.userRoutes);
server.use("/v1/PostApi", postRoutes.postRoutes);
server.use('*', (req,res)=>{
  res.sendFile(path.resolve(__dirname,'View','index.html'));
})

server.listen(process.env.PORT || 8080);
