import  mysql from 'mysql'
import dotenv from 'dotenv'
dotenv.config()
const pool = mysql.createPool({
    connectionLimit  : 10,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password :process.env.DB_PASSWORD,
    database : process.env.DATABASE,

})
pool.getConnection((error,connection)=>{
    try {
        if(error)
    throw error
    console.log('connected to db')
    connection.release()
    } catch (error) {
        console.log(error)
    }
})
export default pool