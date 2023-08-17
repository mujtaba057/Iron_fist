import express from "express";
import cors from "cors";
import pool from "./connectDB.js";
import gymRouter from "./controllers/gym.js";
import userRouter from "./controllers/users.js";
const app = express();
import dotenv from 'dotenv'
import gymAuth from "./auth/gym_auth.js";
import userAuth from "./auth/user_auth.js";
import {dirname} from 'path'
import { fileURLToPath } from "url";
import path from "path";
dotenv.config()
app.use(express.json());
const __dirname = dirname(fileURLToPath(import.meta.url))

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
//   });
app.use(cors());

// Serve HTML files from a specific directory
app.use(express.static(path.join(__dirname, 'client'), {
  extensions: ['html']
}));

app.get('/*.js', (req, res, next) => {
  if (req.headers.referer) {
    // Check the referer header to ensure the request is coming from an HTML file
    const refererExtension = path.extname(req.headers.referer);
    if (refererExtension === '.html') {
      return next();
    }
  }
  res.sendStatus(404);
});

app.get('/*.css', (req, res, next) => {
  if (req.headers.referer) {
    // Check the referer header to ensure the request is coming from an HTML file
    const refererExtension = path.extname(req.headers.referer);
    if (refererExtension === '.html') {
      return next();
    }
  }
  res.sendStatus(404);
});

app.get('/api/gymauth',gymAuth,(req,res)=>{
  res.status(200).json({access : true, msg : 'authenticated'})
})
app.get('/api/userauth',userAuth,(req,res)=>{
  res.status(200).json({access : true, msg : 'authenticated'})
})
app.use("/api/gym",gymRouter)
app.use("/api/user",userRouter)
console.log(path.join(__dirname,'/client'))
app.use(express.static(path.join(__dirname,'/client')))
app.use('/*',(req,res)=>{
  res.sendFile(path.join(__dirname,  '/client', "index.html"));

})
app.listen(process.env.PORT, () => {
  console.log("server started at port " + process.env.PORT);
});
export default app