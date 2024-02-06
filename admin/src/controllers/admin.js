import {Admin} from "../models"
import {Customer} from "../models"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {ErrorHandler, Emails, GenerateNumber, Password} from "../common"
import { PaginationData } from "../common";


/**
 * @typedef {object} login
 * @property {string} email - email
 * @property {string} password - password
 */

/**
 * Post /v1/admin/login
 * @summary Login
 * @tags Admin
 * @param {login} request.body - login admin
 * @return {object} 200 - Success response - application/json
 */


const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Admin.findOne({
        email
      });
      if (!user) {
        return res.status(400).json({ message: "email and password not match" });
      }   

      let passwordMatch = false;

      if (user.password.startsWith('$2b$')) {
        // Password is hashed with bcrypt
        passwordMatch = bcrypt.compareSync(password, user.password);
      } else {
        // Password is plain text
        passwordMatch = password === user.password;
      }
  
      // const comparePassword = bcrypt.compareSync(password, data.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "email and password not match" });
      }
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 86400,
        }
      );
      return res.status(200).json({ message: "login successfully", token: token ,data:user});
    } catch (error) {
      return ErrorHandler.errorHandler(res, error);
    }
  };   



/**
 * @typedef {object} forgotPasswordBody
 * @property {string} email - email
 */

/**
 * Post /v1/admin/forgot-password
 * @summary Forget password
 * @tags Admin
 * @param {forgotPasswordBody} request.body.required
 * @return {object} 200 - Success response - application/json
 */

const forgotPassword = async (req, res) => {
  const {
    body: { email },
  } = req;
  try {
    const userData = await Admin.findOne({
      email,
    });
    if (!userData) {
      return res.status(400).json({
        message: "We are sorry your email is not registered with us.",
      });
    }
    // Reset Password TOKEN
    const resetPasswordToken = jwt.sign(
      { email: userData.email },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400,
      }
    );
    // const otp = GenerateNumber.generateNumber();
    const token = jwt.sign(
      {
        id: userData._id,
        email: userData.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400,
      }
    );
    await Admin.findOneAndUpdate(
      {
        email: email,
      },
      {
        $set: {
          token: token,
        },
      }
    );
    const link = `${process.env.CREATORFORGOTPASSWORDLINK}/${userData._id}/${token}`;
    const forEmail = new Emails.Email();
    await forEmail.setTemplate(Emails.AvailableTemplates.RESET_PASSWORD, {
      link: `${link}`,
    });
    await forEmail.sendEmail(userData.email);
    return res.status(200).json({
      //SUCCESS
      message: "Email send successfully",
      email: userData.email,
      link: link,
    });
  } catch (error) {
    ErrorHandler.errorHandler(res, error);
  }
};   

/**
 * @typedef {object} profileUpdate
 * @property {string} firstName - firstName
 * @property {string} lastName - lastName
 * @property {string} email - email
 * @property {string} pass - pass

*/

/**
 * PUT /v1/admin/profile-update
 * @summary update admin profile 
 * @tags Admin
 * @security BearerAuth
 * @param {profileUpdate} request.body.required
 * @return {object} 200 - Success response - application/json
 */

const profileUpdate = async (req,res) =>{
  try{
    const { _id } = req.currentUser;
    console.log("token data", _id)
   const { firstName, lastName, email, phone } = req.body;


   const userToUpdate = await Admin.findById(_id);

if(!userToUpdate){
 res.status(200).json({error : "user not found"});
} 

userToUpdate.firstName = firstName;
userToUpdate.lastName = lastName;
userToUpdate.email = email;
userToUpdate.phone = phone;

 // Save the updated user
 const updatedUser = await userToUpdate.save();

 return res.status(200).json(updatedUser);
  }
   
catch (error) {
 res.status(500).json({ error: error.message });
}
};    


/**
 * @typedef {object} changePass
 * @property {string} oldPassword - oldPassword
 * @property {string} newPassword - newPassword
 * @property {string} confirmNewPassword - confirmNewPassword

*/

/**
 * PUT /v1/admin/change-password
 * @summary update password 
 * @tags Admin
 * @security BearerAuth
 * @param {changePass} request.body.required
 * @return {object} 200 - Success response - application/json
 */
 
const changePass =  async (req,res)=>{

  try {
    const { _id } = req.currentUser;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    // Validate if new password matches the confirmation
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'New password and confirmation do not match' });
    }

    const user = await Admin.findById(_id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (oldPassword !== user.password) {
        return res.status(401).json({ error: 'Invalid old password' });
    }

    user.password = newPassword;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
} catch (error) {
    res.status(500).json({ error: error.message });
}
}  

/**
 * @typedef {object} adminDetails
 */


/**
 * GET /v1/admin/token-details
 * @summary admin token details 
 * @tags Admin
 * @security BearerAuth
 * @return {object} 200 - Success response - application/json
 */  

const adminDetails = async (req,res) =>{
  try {
    const adminDetails = req.adminDetails;
    res.status(200).json([adminDetails]); // Returning admin details in an array format
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  export default {
    login,
    forgotPassword,
    profileUpdate,
    changePass,
    adminDetails,
  }