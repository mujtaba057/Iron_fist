import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
function tokenGenerator(payload,expiry = '1d'){
   console.log(process.env.JWT_KEY)
   return jwt.sign(payload,process.env.JWT_KEY,{expiresIn : expiry})
 
}
export default tokenGenerator