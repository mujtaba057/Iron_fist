import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../connectDB.js";

dotenv.config();
const gymAuth = async (req, res, next) => {
  try {
    let token = req.headers.token;
    if (token == 'null') {
      return res.status(498).json({ access: false, msg: "invalid token" });
    }
    // console.log(token)
    token = JSON.parse(token);
    let role = token.role;
    token = token.token;
    token = jwt.verify(token, process.env.JWT_KEY);
    console.log(token)
    req.body.role = token.role;
    req.body.gym_id = token.gym_id;
    console.log(req.body)
    if (role != req.body.role)
      return res.status(409).json({ access: false, msg: "invalid token" });

    const query = `select gym_id from gym where   gym_id = ?`;
    pool.query(query, [req.body.gym_id], async (error, result) => {
      try {
        if (error) throw error;
        // console.log(result[0]);
        if (!result[0])
          return res
            .status(409)
            .json({ access: false, msg: "unauthorized access" });
        next();
      } catch (error) {
        console.log(error);
        res.status(500).json({ access: false, msg: "server error" });
      }
    });
  } catch (error) {
    console.log(error);
    if (error.name == "JsonWebTokenError" || error.name == "SyntaxError" || error.name == "TokenExpiredError")
      return res.status(498).json({ access: false, msg: "invalid token" });
  
     res.status(500).json({ access: false, msg: "internal error" });
  }
};
export default gymAuth;
