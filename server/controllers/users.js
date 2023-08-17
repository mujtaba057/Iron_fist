import express from "express";
import pool from "../connectDB.js";
import dotenv from "dotenv";
import tokenGenerator from "../utils/token_generators.js";
import userAuth from "../auth/user_auth.js";
dotenv.config();
const userRouter = express.Router();
userRouter.post("/register", (req, res) => {
  const { username, email, password, password2, phone, gender } = req.body;
  console.log(req.body);
  if (password != password2)
    return res
      .status(409)
      .json({ access: false, msg: "password does not match" });
  const query = `insert into users(username,email,password,phone,gender)
  values (?,?,?,?,?)`;
  pool.query(
    query,
    [username, email, password, phone, gender],
    (error, result) => {
      try {
        if (error) throw error;
        console.log(result);
        res.status(200).json({ access: true, msg: "user register" });
      } catch (error) {
        console.log(error);
        if (error.errno == 1062)
          return res
            .status(409)
            .json({ access: false, msg: "user already exist" });

        const match = error.sqlMessage.match(
          /for\s+column\s+'(\w+)'|for\s+column\s+(\d+)/i
        );
        let columnName;
        if (match) columnName = match[1] || match[2];
        if (error.errno == 1406) {
          if (columnName == "username")
            return res.status(414).json({
              access: false,
              msg: "username is too long maximum 150 characters allowed",
            });
          if (columnName == "password")
            return res.status(414).json({
              access: false,
              msg: "password is too long maximum 50 characters allowed",
            });
          if (columnName == "email")
            return res.status(414).json({
              access: false,
              msg: "invalid email",
            });
          if (columnName == "phone")
            return res.status(414).json({
              access: false,
              msg: "invalid phone",
            });
        } else if ((error.errno = 3819 && columnName == "gender")) {
          return res.status(409).json({ access: false, msg: "invalid gender" });
        } else if ((error.errno = 1048 && columnName == "username")) {
          return res
            .status(409)
            .json({ access: false, msg: "must provide username" });
        }
        console.log(error);
        res.status(500).json({ access: false, msg: "server error" });
      }
    }
  );
});
userRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const query = `SELECT COUNT(*) > 0 AS userEXist FROM users WHERE email = ?;`;
  pool.query(query, [email], (error, result) => {
    try {
      if (error) throw error;
      // console.log(result[0])
      if (!result[0].userEXist)
        return res.status(404).json({ access: false, msg: "user not found" });
      const query2 = `SELECT user_id, COUNT(*) > 0 AS matchPwd FROM users WHERE password = ? and email = ?;`;
      pool.query(query2, [password, email], (error, result2) => {
        try {
          if (error) throw error;
          if (!result2[0].matchPwd)
            return res
              .status(409)
              .json({ access: false, msg: "wrong password" });
          const user_id = result2[0].user_id;
          const token = tokenGenerator({ role: "user", user_id });
          return res.status(200).json({
            access: true,
            msg: "login successfully",
            token: { token, role: "user" },
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ access: false, msg: "server error" });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
userRouter.post("/search", async (req, res) => {
  try {
    let { text, latitude, longitude, category } = req.body;
    console.log(req.body);
    if (category == 1) category = ">= 0.8";
    if (category == 2) category = "between 0.5 and 0.7";
    if (category == 3) category = "<= 0.4";
    if (category == 4) category = "between 0 and 10";
    // console.log(!text)
    let query = `SELECT *
    FROM (
      SELECT *,
        ((parking + (ac + 1) + (cardio + 1) + gym + zumba + yoga + aerobic + strength )/10) as category2
      FROM gym
    ) subquery
    WHERE category2 ${category}
    ORDER BY  category2 asc;`;
    if (latitude && longitude) {
      query = `
      SELECT *
    FROM (
      SELECT *,
        ((parking + (ac + 1) + (cardio + 1) + gym + zumba + yoga + aerobic + strength )/10)as category2,
            ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( latitude ) ) ) ) AS distance
        FROM gym 
    ) subquery
    WHERE category2 ${category}
    ORDER BY  distance ASC,category2 ASC;`;
    }
    if (text) {
      query = `
      SELECT *
    FROM (
      SELECT *,
        ((parking + (ac + 1) + (cardio + 1) + gym + zumba + yoga + aerobic + strength )/10)as category2
      FROM gym WHERE SOUNDEX(REPLACE(name, ' ', '')) = SOUNDEX(REPLACE(?, ' ', '')) or name like ? 
    ) subquery
    WHERE category2 ${category}
    ORDER BY  category2 asc;`;
      if (latitude && longitude) {
        query = `
      SELECT *
    FROM (
      SELECT *,
        ((parking + (ac + 1) + (cardio + 1) + gym + zumba + yoga + aerobic + strength )/10)as category2,
            ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( latitude ) ) ) ) AS distance
        FROM gym WHERE SOUNDEX(REPLACE(name, ' ', '')) = SOUNDEX(REPLACE(?, ' ', '')) or name like ? or SOUNDEX(REPLACE(address, ' ', '')) = SOUNDEX(REPLACE(?, ' ', '')) or address like ? 
    ) subquery
    WHERE category2 ${category}
    ORDER BY  distance ASC,category2 ASC;`;
      }
    }

    pool.query(
      query,
      [text, `%${text}%`, text, `%${text}%`],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ access: false, msg: "server error" });
        }
        res
          .status(200)
          .json({ access: true, msg: "matched gym", gym: results });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ access: false, msg: "server error" });
  }
});
userRouter.post("/addtowallet", userAuth, (req, res) => {
  const { user_id, amount } = req.body;
  console.log(req.body);
  const query = `update users set wallet = wallet + ${amount} where user_id = ${user_id} `;
  pool.query(query, (error, result) => {
    try {
      if (error) throw error;
      // console.log(result);
      if (result.affectedRows)
        return res.status(200).json({ access: true, msg: "amount added" });
      res.status(404).json({ access: false, msg: "user not found" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
userRouter.post("/buypass", userAuth, (req, res) => {
  const { user_id, gym_id, days,category,gym_name } = req.body;
  console.log(req.body);

  const query2 = `insert into passes(token,gym_id,user_id,days,category,gym_name)
        value (FLOOR(RAND() * 9000) + 1000,${gym_id},${user_id},${days},${category},?);`;
  pool.query(query2,[gym_name], (error, result) => {
    try {
      if (error) throw error;
      console.log(result);
      res.status(200).json({ access: true, msg: "passed bougth" });
    } catch (error) {
      console.log(error);
      if (error.code == `ER_DUP_ENTRY`) {
        return res
          .status(400)
          .json({ access: false, msg: "already have pass" });
      }
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
userRouter.get("/passes", userAuth, async (req, res) => {
  const { user_id } = req.body;
  const query = `select * from passes where user_id = ${user_id} order by id`;
  pool.query(query, (error, result) => {
    try {
      if (error) throw error;
      res
        .status(200)
        .json({ access: true, msg: "passes fetched", passes: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
userRouter.get("/passes/:gym_id", userAuth, async (req, res) => {
  const { user_id } = req.body;
  const { gym_id } = req.params;
  const query = `select * from passes where user_id = ${user_id} and gym_id = ${gym_id}`;
  pool.query(query, (error, result) => {
    try {
      if (error) throw error;
      res
        .status(200)
        .json({ access: true, msg: "passes fetched", passes: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
userRouter.get("/gym/:gym_id", (req, res) => {
  const { gym_id } = req.params;
  const query = `select * from gym where gym_id = ${gym_id}`;
  pool.query(query, (error, result) => {
    try {
      if (error) throw error;
      let gym = result[0];
      // let category =
      //   (gym.parking +
      //     (gym.ac + 1) +
      //     (gym.cardio + 1) +
      //     gym.gym +
      //     gym.zumba +
      //     gym.yoga +
      //     gym.aerobic +
      //     gym.strength) /
      //   10;
      // // console.log(category);
      // if (category >= 0.8) category = 1;
      // else if (category >= 0.5 && category <= 0.7) category = 2;
      // else category = 3;
      // gym.category = category;
      res.status(200).json({ access: true, msg: "gym fetched", gym });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
userRouter.get("/details", userAuth, async (req, res) => {
  const { user_id } = req.body;
  const query = `select * from users where user_id = ${user_id}`;
  pool.query(query, (error, result) => {
    try {
      if (error) throw error;
      res
        .status(200)
        .json({ access: true, msg: "detais fetched", details: result[0] });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
userRouter.get("/history/:gym_id", userAuth, (req, res) => {
  const { user_id } = req.body;
  const { gym_id } = req.params;
  const query = `select * from history where user_id = ${user_id} and gym_id = ${gym_id} order by history_id desc`;
  pool.query(query, (error, result) => {
    try {
      if (error) throw error;
      res
        .status(200)
        .json({ access: true, msg: "history fetched", history: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
userRouter.get("/history", userAuth, (req, res) => {
  const { user_id } = req.body;
  // const query = `select * from history where user_id = ${user_id}  order by history_id desc`;
  const query = `SELECT h.history_id,u.user_id,g.gym_id,  g.name as gym_name,g.category,h.gym_date, h.amount
  FROM history h
  JOIN users u ON u.user_id = h.user_id
  JOIN gym g ON g.gym_id = h.gym_id  where u.user_id = ${user_id}  order by history_id desc;`
  pool.query(query, (error, result) => {
    try {
      if (error) throw error;
      res
        .status(200)
        .json({ access: true, msg: "history fetched", history: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
export default userRouter;
