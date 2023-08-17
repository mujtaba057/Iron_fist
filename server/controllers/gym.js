import express, { json, query } from "express";
import pool from "../connectDB.js";
import multer from "multer";
import url from "url";
import path from "path";
import fs from "fs/promises";
import gymAuth from "../auth/gym_auth.js";
import tokenGenerator from "../utils/token_generators.js";
const gymRouter = express.Router();
const dirname = url.fileURLToPath(new URL(".", import.meta.url));
let index = 0;
let images = [];
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    const staticPath = path.join(dirname, "../assets/images");
    console.log(staticPath);
    cb(null, staticPath);
  },
  filename: (req, file, cb) => {
    const extension = file.originalname.split(".").pop();
    let fileName = "temp" + index + "." + extension;
    images.push(fileName);
    console.log(index, fileName);
    index++;
    cb(null, fileName);
  },
});
const uploadImages = multer({
  storage: storage2,
  limits: { fileSize: 100 * 1024 * 1024 },
});
gymRouter.post("/register", uploadImages.array("images", 12), (req, res) => {
  let {
    name,
    email,
    password,
    password2,
    address,
    latitude,
    longitude,
    parking,
    ac,
    cardio,
    gym,
    zumba,
    yoga,
    crossfit,
    aerobic,
    strength,
    fees,
  } = req.body;
  console.log(req.body);
  if (parking) parking = 1; else parking = 0
  if (ac) ac = 1; else ac = 0
  if (cardio) cardio = 1; else cardio = 0
  if (gym) gym = 1; else gym = 0
  if (zumba) zumba = 1; else zumba = 0
  if (yoga) yoga = 1; else yoga = 0
  if (crossfit) crossfit = 1; else crossfit = 0
  if (aerobic) aerobic = 1; else aerobic = 0
  if (strength) strength = 1; else strength = 0
  if (password != password2){
    images.forEach((fileName) => {
      const filePath = path.join(dirname, "../assets/images", fileName);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${fileName}: ${err}`);
        } else {
          console.log(`File ${fileName} deleted successfully.`);
        }
      });
    });
    return res
    .status(409)
    .json({ access: false, msg: "password does not match" });
  }
   
  const query = `INSERT INTO gym (name,email,password,address,latitude,longitude,parking,ac,cardio,gym,zumba,yoga,crossfit,aerobic,strength,fees,category)
      SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
          CASE
              WHEN (${parking} + (${ac} + 1) + (${cardio} + 1) + ${gym} + ${zumba} + ${yoga} + ${aerobic} + ${strength}) / 10 >= 0.8 THEN 1
              WHEN (${parking} + (${ac} + 1) + (${cardio} + 1) + ${gym} + ${zumba} + ${yoga} + ${aerobic} + ${strength}) / 10 BETWEEN 0.5 AND 0.7 THEN 2
              WHEN (${parking} + (${ac} + 1) + (${cardio} + 1) + ${gym} + ${zumba} + ${yoga} + ${aerobic} + ${strength}) / 10 <= 0.4 THEN 3
          END AS category
      FROM gym
      WHERE gym_id = 1;`;
  // const query = `insert into  gym (name,email,password,address,latitude,longitude,parking,ac,cardio,gym,zumba,yoga,crossfit,aerobic,strength,fees)
  //   values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  pool.query(
    query,
    [
      name,
      email,
      password,
      address,
      latitude,
      longitude,
      parking,
      ac,
      cardio,
      gym,
      zumba,
      yoga,
      crossfit,
      aerobic,
      strength,
      fees,
    ],
    async (error, result) => {
      try {
        if (error) throw error;
        console.log(result);
        let lImages = [];
        for (let i = 0; i < images.length; i++) {
          const staticPath = path.join(dirname, "../assets/images/");
          console.log(
            staticPath +
              result.insertId +
              "-" +
              (i + 1) +
              "." +
              images[i].split(".").pop()
          );
          await fs.rename(
            staticPath + images[i],
            staticPath +
              result.insertId +
              "-" +
              (i + 1) +
              "." +
              images[i].split(".").pop()
          );
          lImages.push(
            result.insertId + "-" + (i + 1) + "." + images[i].split(".").pop()
          );
        }
        console.log(result.insertId)
        const query2 = `update gym set images = JSON_ARRAY(?) where gym_id = ${result.insertId}`;
        pool.query(query2, [lImages], (error, result) => {
          if (error) throw error;
          res.status(200).json({ access: true, msg: "gym register" });
        });
      } catch (error) {
        console.log(error);

        images.forEach((fileName) => {
          const filePath = path.join(dirname, "../assets/images", fileName);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${fileName}: ${err}`);
            } else {
              console.log(`File ${fileName} deleted successfully.`);
            }
          });
        });
        
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
          if (columnName == "name")
            return res.status(414).json({
              access: false,
              msg: "username is too long maximum 50 characters allowed",
            });
          if (columnName == "password")
            return res.status(414).json({
              access: false,
              msg: "password is too long maximum 50 characters allowed",
            });
          if (columnName == "address")
            return res.status(414).json({
              access: false,
              msg: "address is too long maximum 200 characters allowed",
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
        }
        console.log(error);
        res.status(500).json({ access: false, msg: "server error" });
      }
    }
  );
});
gymRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT COUNT(*) > 0 AS userEXist FROM gym WHERE email = ?;`;
  pool.query(query, [email], (error, result) => {
    try {
      if (error) throw error;
      // console.log(result[0])
      if (!result[0].userEXist)
        return res.status(404).json({ access: false, msg: "user not found" });
      const query2 = `SELECT gym_id, COUNT(*) > 0 AS matchPwd FROM gym WHERE password = ? and email = ?;`;
      pool.query(query2, [password, email], (error, result2) => {
        try {
          if (error) throw error;
          if (!result2[0].matchPwd)
            return res
              .status(409)
              .json({ access: false, msg: "wrong password" });
          const gym_id = result2[0].gym_id;
          console.log(gym_id);
          const token = tokenGenerator({ role: "gym", gym_id });
          return res.status(200).json({
            access: true,
            msg: "login successfully",
            token: { token, role: "gym" },
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

gymRouter.post("/verifytoken", gymAuth, (req, res) => {
  const { gym_id, token, gym_name } = req.body;

  pool.getConnection((error, conn) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ access: false, error: "server error" });
    }
    conn.beginTransaction((error2) => {
      if (error2) {
        console.log(error2);
        return conn.rollback(() => {
          return res.status(500).json({ access: false, error: "server error" });
        });
      }
      const query = `SELECT *
      FROM users
      RIGHT JOIN passes on  passes.user_id = users.user_id  where gym_id = ${gym_id} and token = ${token}`;
      conn.query(query, (error3, result) => {
        if (error3) {
          console.log(error3);
          return conn.rollback(() => {
            return res
              .status(500)
              .json({ access: false, error: "server error" });
          });
        }
        // console.log(result);
        if (result.length) {
          const user_id = result[0].user_id;
          const user_name = result[0].username;
          const user_phone = result[0].phone;
          console.log(result[0]);
          let amount = 600 / 30;
          const days = result[0].days;
          const category = result[0].category;
          if (category == 1) amount = 2100 / 30;
          if (category == 2) amount = 1200 / 30;
          console.log(user_id, result[0].category);
          const query2 = `select wallet from users where user_id = ${user_id}`;
          conn.query(query2, (error4, result) => {
            if (error4) {
              console.log(error3);
              return conn.rollback(() => {
                return res
                  .status(500)
                  .json({ access: false, error: "server error" });
              });
            }
            const wallet = result[0].wallet;
            // console.log(wallet);
            if (wallet < amount)
              return res
                .status(402)
                .json({ access: false, msg: "insuffient balance" });
            const query3 = `update passes set days = days - 1  where gym_id = ${gym_id} and token = ${token}`;
            conn.query(query3, (error4, result2) => {
              if (error4) {
                console.log(error3);
                return conn.rollback(() => {
                  return res
                    .status(500)
                    .json({ access: false, error: "server error" });
                });
              }
              const query4 = `update users set wallet = wallet - ${amount} where user_id = ${user_id}`;
              conn.query(query4, (error5, result) => {
                if (error5) {
                  console.log(error5);
                  return conn.rollback(() => {
                    return res
                      .status(500)
                      .json({ access: false, error: "server error" });
                  });
                }
                const query5 = `update gym set wallet = wallet + ${amount} where gym_id = ${gym_id}`;
                conn.query(query5, (error6, result) => {
                  if (error6) {
                    console.log(error6);
                    return conn.rollback(() => {
                      return res
                        .status(500)
                        .json({ access: false, error: "server error" });
                    });
                  }
                  console.log(
                    `${gym_id}, ${user_id}, ${category}, ${new Date()}, ${amount}`
                  );
                  const query6 = `insert into history(gym_id,user_id,gym_date,amount)
                  value (${gym_id}, ${user_id}, ?, ${amount})`;
                  const date = new Date();
                  conn.query(
                    query6,
                    [date, gym_name, user_name, user_phone],
                    (error7, result) => {
                      if (error7) {
                        console.log(error7);
                        return conn.rollback(() => {
                          return res
                            .status(500)
                            .json({ access: false, error: "server error" });
                        });
                      }
                      if (days == 1) {
                        const query7 = `delete from passes where user_id = ${user_id} and gym_id = ${gym_id}`;
                        conn.query(query7, (error8, result) => {
                          if (error8) {
                            console.log(error8);
                            return conn.rollback(() => {
                              return res
                                .status(500)
                                .json({ access: false, error: "server error" });
                            });
                          }
                          conn.commit((err) => {
                            if (error7) {
                              console.log(err);
                              return conn.rollback(() => {
                                return res.status(500).json({
                                  access: false,
                                  error: "server error",
                                });
                              });
                            }
                            res
                              .status(200)
                              .json({ access: true, msg: "verified" });
                          });
                        });
                      } else {
                        conn.commit((err) => {
                          if (error7) {
                            console.log(err);
                            return conn.rollback(() => {
                              return res
                                .status(500)
                                .json({ access: false, error: "server error" });
                            });
                          }
                          res
                            .status(200)
                            .json({ access: true, msg: "verified" });
                        });
                      }
                    }
                  );
                });
              });
            });
          });
        } else
          return res
            .status(404)
            .json({ access: false, msg: "Invalid token or token expired" });
      });
    });
  });
});
gymRouter.get("/details", gymAuth, async (req, res) => {
  const { gym_id } = req.body;
  const query = `select * from gym where gym_id = ${gym_id}`;
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
gymRouter.post("/movetoaccount", gymAuth, (req, res) => {
  const { gym_id, amount } = req.body;
  console.log(req.body);
  const query = `
  UPDATE gym
  SET wallet = CASE
    WHEN wallet - ${amount} >= 0 THEN wallet - ${amount}
    ELSE wallet
  END
  WHERE gym_id = ${gym_id}
`;

  pool.query(query, (error, result) => {
    try {
      if (error) throw error;
      console.log(result);
      if (result.changedRows)
        return res
          .status(200)
          .json({ access: true, msg: "amount transfer to account" });
      else
        return res.status(402).json({ access: false, msg: "not enough money" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ access: false, msg: "server error" });
    }
  });
});
gymRouter.get("/history", gymAuth, (req, res) => {
  const { gym_id } = req.body;
  // const query = `select * from history where gym_id = ${gym_id}  order by history_id desc`;
  const query = `SELECT h.history_id, u.username as user_name, h.gym_date, h.amount,u.phone as user_phone
  FROM history h
  JOIN users u ON u.user_id = h.user_id
  JOIN gym g ON g.gym_id = h.gym_id  where g.gym_id = ${gym_id}  order by history_id desc;`
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


gymRouter.get("/common", async (req, res) => {
  try {
    let data = await fs.readFile("data.json");
    data = JSON.parse(data);
    // console.log(JSON.parse(data))
    const query = `insert into gym(name,email,password,address,latitude,longitude,parking,ac,cardio,gym,zumba,yoga,crossfit,aerobic,strength,fees)
    values ?`;
    const values = [];
    for (let i = 0; i < data.length; i++) {
      values.push([
        data[i].name,
        data[i].email,
        data[i].password,
        data[i].address,
        data[i].latitude,
        data[i].longitude,
        data[i].parking,
        data[i].ac,
        data[i].cardio,
        data[i].gym,
        data[i].zumba,
        data[i].yoga,
        data[i].crossfit,
        data[i].aerobic,
        data[i].strength,
        data[i].fees,
      ]);
    }
    pool.query(query, [values], (error, result) => {
      if (error) throw error;
      res.send(result);
    });
    // console.log(values)
  } catch (error) {
    console.log(error);
  }
});
export default gymRouter;
