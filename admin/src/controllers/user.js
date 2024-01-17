import { Console } from "winston/lib/winston/transports";
import { User } from "../models" 
const mongoose = require('mongoose');
const nodemailer = require('nodemailer'); 
import { PaginationData } from "../common";

require('dotenv').config();


 

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER, // Use an environment variable for email
//       pass: process.env.EMAIL_PASSWORD, // Use an environment variable for password
//     },
//   }); 

//   // Function to send an invitation email
// async function sendInvitationEmail(userEmail, role) {
//     let subject = '';
  
//     // Set subject based on the role
//     switch (role) {
//       case 'admin':
//         subject = 'Invitation to Admin Portal';
//         break;
//       case 'superadmin':
//         subject = 'Invitation to Super Admin Portal';
//         break;
//       case 'manager':
//         subject = 'Invitation to Manager Portal';
//         break;
//       // Add more cases if needed
  
//       default:
//         subject = 'Invitation to the Portal';
//     } 

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: userEmail,
//         subject: subject,
//         text: `Hi! You are being invited to the ${role} portal. Click the link to sign up and set your password.`,
//         // You can include a link to your frontend registration page here
//       };
    
//       await transporter.sendMail(mailOptions);
// } 

// @security BearerAuth
  

/**
 * @typedef {object} user
 * @property {string} firstName - firstName
 * @property {string} lastName - lastName
 * @property {string} email - email
 * @property {string} phone - phone
 * @property {string} role -  role
 * @property {object} permissions -  permissions
 * @property {string} status - status

*/

/**
 * POST /v1/user
 * @summary user create account
 * @tags User 
 * @param {user} request.body.required - User info - multipart/form-data
 * @return {object} 200 - Success response - application/json
 */  

  

function updatePermissions(dataObjects, selectedPermissionsString) {
    try {
      const selectedPermissions = JSON.parse(selectedPermissionsString);
  
      Object.keys(selectedPermissions).forEach(entity => {
        if (dataObjects[entity] && typeof dataObjects[entity] === 'object') {
          Object.keys(selectedPermissions[entity]).forEach(permission => {
            if (dataObjects[entity][permission] !== undefined) {
              dataObjects[entity][permission] = selectedPermissions[entity][permission];
            }
          });
        } else {
          console.error(`Entity '${entity}' does not exist or is not an object.`);
        }
      });
  
      // Return the updated dataObjects
      return dataObjects;
    } catch (error) {
      console.error('Invalid JSON string:', error.message);
      return dataObjects; // Return original dataObjects if parsing fails
    }
  }

const user = async (req,res) =>{ 

    try {  

        const { firstName, lastName, phone, role, email, permissions } = req.body; 

         const status = req.body.status || 'active'

    //   const fileData = req.file; 
     //  console.log(fileData);
        console.log("req.body data", req.body)
    
        if (!permissions) {
            return res.status(400).json({ error: 'objectId and permissions are required in the request body' });
          } 

        if (!firstName || !lastName || !phone || !role || !email ) {
          return res.status(400).json({ error: 'Missing required fields.' });
        } 
         const emails = await User.findOne({email});
         if(emails){
            return res.status(400).json({error: "email alredy exist"});
         }
        
      
        const newUser = new User({
          firstName,
          lastName,
          phone,
          role,
          email,
          status,
         // userImage: fileData ? fileData.location : null,
        }); 
      
    newUser.permissions = updatePermissions(newUser.permissions, permissions);

    console.log("updated permissions", newUser.permissions);


        const savedUser = await newUser.save() 

        res.status(200).send(savedUser);
    
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}  

/**
 * @typedef {object} userDetails
 */

/**
 * GET /v1/user/user-data
 * @summary user data
 * @tags User
 * @param {string} pageLimit.query - pageLimit
 * @param {string} pageNumber.query - pageNumber
 * @param {string} name.query - name
 * @param {string} email.query - email
 * @param {string} role.query - role
 * @param {string} status.query - status
 *  @param {string} _id.query - _id
 * @return {object} 200 - Success response - application/json
 */


const userDetails = async (req,res) =>{

    try {
        const nameParam = req.query.name;
        const pageLimitParam = req.query.pageLimit;
        const pageNumberParam = req.query.pageNumber;
        const emailParam = req.query.email;
        const roleParam = req.query.role;
        const statusParam = req.query.status;
        const idParam = req.query._id;
    
        const filter = {};
    
        if (idParam) {
            filter._id = idParam;
        }
    
        if (nameParam) {
            const nameRegex = new RegExp(nameParam, 'i');
            filter.$or = [
                { firstName: nameRegex },
                { lastName: nameRegex },
                { $expr: { $regexMatch: { input: { $concat: ["$first_name", " ", "$last_name"] }, regex: nameRegex } } }
            ];
        }
    
        if (emailParam) {
            filter.email = emailParam;
        }
    
        const pageLimit = parseInt(pageLimitParam) || 0;
        const pageNumber = parseInt(pageNumberParam) || 1;
    
        if (roleParam) {
            const roles = roleParam.split(',');
            const trimmedRoles = roles.map(role => role.trim());
            filter.role = { $in: trimmedRoles };
        }
    
        if (statusParam) {
            const statuses = statusParam.split(',');
            const trimmedStatues = statuses.map(status => status.trim());
            filter.status = { $in: trimmedStatues };
        } 

        let totalUsers;
    
        if (pageLimit > 0 && pageNumber > 0) {
            const { offset, limit } = PaginationData.paginationData(pageLimit, pageNumber);
              
            totalUsers = await User.countDocuments(filter)
    
            const users = await User.find(filter)
                .skip(offset)
                .limit(limit);
    
            if (!users) {
                return res.status(404).json({ message: 'No users found.' });
            }
    
            const formattedUsers = users.map(user => ({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                permissions: user.permissions,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                __v: user.__v,
            }));

            const responseObj = {
                totalUsers,
                formattedUsers,
                
              };
    
            res.status(200).send(responseObj);
        } else { 
            totalUsers = await User.countDocuments(filter)
            const users = await User.find(filter)
            const formattedUsers = users.map(user => ({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                permissions: user.permissions,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                __v: user.__v,
            })); 

            const responseObj = {
                totalUsers,
                formattedUsers,
                
              };
            return res.status(200).json(responseObj);
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
    
    
}


/**
 * @typedef {object} editUser
 * @property {string} firstName - firstName
 * @property {string} lastName - lastName
 * @property {string} email - email
 * @property {string} phone - phone
 * @property {string} role -  role
 * @property {object} permissions -  permissions
 * @property {string} status - status

*/

/**
 * PUT /v1/user/update-user/{_id}
 * @summary update user 
 * @tags User
 * @param {string} _id.path.required - _id(ObjectId)
 * @param {editUser} request.body.required - User update - multipart/form-data
 * @return {object} 200 - Success response - application/json
 */

const editUser = async (req, res) => {
    try {
        const { _id } = req.params;
        console.log('User ID:', _id);


        const { firstName, lastName, phone, role, email, permissions, status } = req.body;
        console.log("req.body data", req.body)

        if (!firstName || !lastName || !phone || !role || !email) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // // Check if the email already exists for another user
        // const existingUser = await User.findOne({ email, _id: { $ne: userId } });

        // if (existingUser) {
        //     return res.status(400).json({ error: 'Email already exists for another user.' });
        // }

        const userToUpdate = await User.findById(_id);
        console.log('Found User:', userToUpdate);

        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Update the user details
        userToUpdate.firstName = firstName;
        userToUpdate.lastName = lastName;
        userToUpdate.phone = phone;
        userToUpdate.role = role;
        userToUpdate.email = email;
        userToUpdate.status = status;

        // Optionally, update permissions if needed
        userToUpdate.permissions = updatePermissions(userToUpdate.permissions, permissions);

        // Save the updated user
        const updatedUser = await userToUpdate.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @typedef {object} updateStatus
*/

/**
 * PUT /v1/user/update-status/{_id}
 * @summary update user 
 * @tags User
 * @param {string} _id.path.required - _id(ObjectId)
 * @return {object} 200 - Success response - application/json
 */

const updateStatus = async (req,res) =>{
   try{
    const {_id} = req.params;

    const userToUpdate = await User.findById(_id);

if(!userToUpdate){
  res.status(200).json({error : "user not found"});
} 

userToUpdate.status = "suspended";
  // Save the updated user
  const updatedUser = await userToUpdate.save();

  res.status(200).json(updatedUser);
   }
    
 catch (error) {
  res.status(500).json({ error: error.message });
}
};



export default {
    user,
    userDetails,
    editUser,
    updateStatus,
  };