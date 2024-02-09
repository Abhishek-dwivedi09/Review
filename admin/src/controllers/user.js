
import { User } from "../models" 
import {Support} from "../models"
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail') 
import { PaginationData } from "../common";

require('dotenv').config(); 


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
 * @security BearerAuth
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

// const user = async (req,res) =>{ 

//     try {  

//         const { firstName, lastName, phone, role, email, permissions } = req.body; 

//          const status = req.body.status || 'active'

//     //   const fileData = req.file; 
//      //  console.log(fileData);
//         console.log("req.body data", req.body)
    
//         if (!permissions) {
//             return res.status(400).json({ error: 'objectId and permissions are required in the request body' });
//           } 

//         if (!firstName || !lastName || !phone || !role || !email ) {
//           return res.status(400).json({ error: 'Missing required fields.' });
//         } 
//          const emails = await User.findOne({email});
//          if(emails){
//             return res.status(400).json({error: "email alredy exist"});
//          }
        
//          const dummyPassword = generateDummyPassword();
      
//         const newUser = new User({
//           firstName,
//           lastName,
//           phone,
//           role,
//           email,
//           status,
//           temporaryPassword: dummyPassword,
//          // userImage: fileData ? fileData.location : null,
//         }); 
      
//     newUser.permissions = updatePermissions(newUser.permissions, permissions);

//     console.log("updated permissions", newUser.permissions);


//         const savedUser = await newUser.save() 

//         // Send email notification
//         sendInvitationEmail(newUser.email, newUser.role);
     
//         console.log(sendInvitationEmail)

//         res.status(200).send(savedUser);
    
//       } catch (error) {
//         res.status(500).json({ error: error.message });
//       }
// }  

// // Function to send an invitation email
// async function sendInvitationEmail(userEmail, role) {
//     try { 

//       const dummyPassword = generateDummyPassword(); 
//         let subject = '';

//         switch (role) {
//             case 'admin':
//                 subject = 'Invitation to Admin Portal';
//                 break;
//             case 'super admin':
//                 subject = 'Invitation to Super Admin Portal';
//                 break;
//             case 'manager':
//                 subject = 'Invitation to Manager Portal';
//                 break;
//             default:
//                 subject = 'Invitation to the Portal';
//         }   

//         const transporter = nodemailer.createTransport({
//           service: 'gmail',
//           auth: {
//             user: process.env.GMAIL,
//             pass: process.env.PASS,
//           },
//         });
        
//         // Define the email options
//         const mailOptions = {
//           from: process.env.GMAIL,
//           to: userEmail,
//           subject: 'Subject of the Email',
//          // text: `Hi! You are being invited to the ${role} portal. Click the link to sign up and set your password.`, 
//          text: `Hi! You are being invited to the ${role} portal. Your temporary password is: ${dummyPassword}. Click the link to sign up and set your password.`,
//         };

//          // Send the email
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending email:', error);
//     } else {
//       console.log('Email sent:', info.response);
//     }
//   }); 
//   return dummyPassword;

//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// }  

// function generateDummyPassword() {
//   // You can generate a random password according to your requirements
//   // For example, using a library like 'randomatic'
//   // Here's a simple example generating a 6-character alphanumeric password
//   return Math.random().toString(36).slice(-6);
// } 

const user = async (req, res) => {
  try {
      const { firstName, lastName, phone, role, email, permissions } = req.body;
      const status = req.body.status || 'active';

      if (!permissions) {
          return res.status(400).json({ error: 'objectId and permissions are required in the request body' });
      }

      if (!firstName || !lastName || !phone || !role || !email) {
          return res.status(400).json({ error: 'Missing required fields.' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ error: "Email already exists" });
      }

      // Generate dummy password
      const dummyPassword = generateDummyPassword();

      const newUser = new User({
          firstName,
          lastName,
          phone,
          role,
          email,
          status,
          temporaryPassword: dummyPassword,
      });

      newUser.permissions = updatePermissions(newUser.permissions, permissions);

      console.log("updated permissions", newUser.permissions);

      const savedUser = await newUser.save();

      // Send invitation email with the same dummy password
      const dummyPasswordSent = await sendInvitationEmail(newUser.email, newUser.role, dummyPassword);

      res.status(200).json({ message: "User created successfully", user: savedUser});
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Function to send an invitation email
async function sendInvitationEmail(userEmail, role, dummyPassword) {
  try {
      let subject = '';

      switch (role) {
          case 'admin':
              subject = 'Invitation to Admin Portal';
              break;
          case 'super admin':
              subject = 'Invitation to Super Admin Portal';
              break;
          case 'manager':
              subject = 'Invitation to Manager Portal';
              break;
          default:
              subject = 'Invitation to the Portal';
      }

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.GMAIL,
              pass: process.env.PASS,
          },
      });

      // Define the email options
      const mailOptions = {
          from: process.env.GMAIL,
          to: userEmail,
          subject: subject,
          text: `Hi! You are being invited to the ${role} portal. Your temporary password is: ${dummyPassword}. Click the link to sign up and set your password.`,
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      
      return dummyPassword; // Return the dummy password sent in the email
  } catch (error) {
      console.error('Error sending email:', error);
      throw error;
  }
}

function generateDummyPassword() {
  // You can generate a random password according to your requirements
  // For example, using a library like 'randomatic'
  // Here's a simple example generating a 6-character alphanumeric password
  return Math.random().toString(36).slice(-6);
}


/**
 * @typedef {object} userDetails
 */

/**
 * GET /v1/user/user-data
 * @summary user data
 * @tags User
 * @security BearerAuth
 * @param {string} pageLimit.query - pageLimit
 * @param {string} pageNumber.query - pageNumber
 * @param {string} name.query - name
 * @param {string} email.query - email
 * @param {string} role.query - role
 * @param {string} status.query - status
 * @param {string} _id.query - _id
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
    
        // if (roleParam) {
        //     const roles = roleParam.split(',');
        //     const trimmedRoles = roles.map(role => role.trim());
        //     filter.role = { $in: trimmedRoles };
        // }  

        if (roleParam) {
            let roles; 

            roles = JSON.parse(roleParam);
        
            // try {
            //     // Attempt to parse roleParam as JSON
            //     roles = JSON.parse(roleParam);
            // } catch (error) {
            //     // If parsing fails, treat roleParam as a comma-separated string
            //     // roles = roleParam.split(',').map(role => role.trim());
            //     res.status(500).json({error: "please provide array of string"});
            // }
        
            const trimmedRoles = roles.map(role => role.trim());
            filter.role = { $in: trimmedRoles };
        
            // Add detailed console logs for debugging
            console.log("RoleParam Type:", typeof roleParam);
            console.log("RoleParam Content:", roleParam);
            console.log("Trimmed Roles:", trimmedRoles);
            console.log("Filter:", filter);
        }
        
        
        
    
        if (statusParam) {
            let statuses; 

            statuses = JSON.parse(statusParam);
        
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
 * @security BearerAuth
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
 * @security BearerAuth
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

/**
 * @typedef {object} support 
 */


/**
 * GET /v1/user/support
 * @summary user support 
 * @tags User 
 * @security BearerAuth
 * @param {string} pageLimit.query - pageLimit
 * @param {string} pageNumber.query - pageNumber
 * @param {string} name.query - name
 * @param {string} status.query - status
 * @return {object} 200 - Success response - application/json
 */  


const support = async (req,res) => {
   
  // try { 
  //     const nameParam = req.query.name;
  //     const statusParam = req.query.status; 
  //       const pageLimitParam = req.query.pageLimit;
  //       const pageNumberParam = req.query.pageNumber;

  //     const filter = {};
  //     if (nameParam) {
  //         filter.name = nameParam;
  //       } 
    
  //       if (statusParam) {
  //         let statuses; 

  //         statuses = JSON.parse(statusParam);
      
  //         const trimmedStatues = statuses.map(status => status.trim());
  //         filter.status = { $in: trimmedStatues };
         
  //       }  


  //       let supportRequest;
  //       let open;
  //       let closed;
  //       let invalidRequest;
  //       let data; 

  //       const pageLimit = parseInt(pageLimitParam) || 0;
  //       const pageNumber = parseInt(pageNumberParam) || 1;
 
  //       if (pageLimit > 0 && pageNumber > 0) {
  //         const { offset, limit } = PaginationData.paginationData(
  //           pageLimit,
  //           pageNumber
  //         ); 
  //         supportRequest = await Support.countDocuments(filter);

  //         open = await Support.countDocuments({
  //           status: 'open',
  //           ...filter
  //         })

  //         closed = await Support.countDocuments({
  //           status: 'closed',
  //           ...filter
  //         })

  //         invalidRequest = await Support.countDocuments({
  //           status: 'invalid request',
  //           ...filter
  //         }) 

  //         data = await Support.find(filter)
  //           .skip(offset)
  //           .limit(limit);
  //         } else { 

  //           supportRequest = await Support.countDocuments(filter);

  //           open = await Support.countDocuments({
  //             status: 'open',
  //             ...filter
  //           })
  
  //           closed = await Support.countDocuments({
  //             status: 'closed',
  //             ...filter
  //           })
  
  //           invalidRequest = await Support.countDocuments({
  //             status: 'invalid request',
  //             ...filter
  //           }) 
  
  //           data = await Support.find(filter)
  //         } 

  //         const responseObj = {
  //           supportRequest,
  //           open,
  //           closed,
  //           invalidRequest,
  //           data,
  //         }  
  //         return res.status(200).json(responseObj)

  // } catch (error) {
  //   return res.status(500).json({ error: error.message });   
  // }  

  try {
    const nameParam = req.query.name;
    const statusParam = req.query.status;
    const pageLimitParam = req.query.pageLimit;
    const pageNumberParam = req.query.pageNumber;
  
    const filter = {};
    if (nameParam) {
      filter.name = nameParam;
    }
  
    let originalOpenCount;
    let originalClosedCount;
    let originalInvalidCount;
  
    // Count open requests without status filter
    originalOpenCount = await Support.countDocuments({ status: 'open', ...filter });
  
    // Count closed requests without status filter
    originalClosedCount = await Support.countDocuments({ status: 'closed', ...filter });
  
    // Count invalid requests without status filter
    originalInvalidCount = await Support.countDocuments({ status: 'invalid', ...filter });
  
    let supportRequest;
    let open;
    let closed;
    let invalidRequest;
    let data;
  
    const pageLimit = parseInt(pageLimitParam) || 0;
    const pageNumber = parseInt(pageNumberParam) || 1;
  
    // Count all support requests without status filter
    supportRequest = await Support.countDocuments(filter);
  
    if (statusParam) {
      try {
        let statuses = JSON.parse(statusParam);
        const trimmedStatuses = statuses.map(status => status.trim());
  
        if (trimmedStatuses.length > 0) {
          // Retrieve data based on status filter
          data = await Support.find({ status: { $in: trimmedStatuses }, ...filter });
        }
      } catch (error) {
        return res.status(400).json({ error: "Invalid status parameter format" });
      }
    } else {
      // No status filter, retrieve all data
      if (pageLimit > 0 && pageNumber > 0) {
        const { offset, limit } = PaginationData.paginationData(pageLimit, pageNumber);
  
        data = await Support.find(filter).skip(offset).limit(limit);
      } else {
        data = await Support.find(filter);
      }
    }
  
    // Use the original counts instead of counting again
    open = originalOpenCount;
    closed = originalClosedCount;
    invalidRequest = originalInvalidCount;
  
    const responseObj = {
      supportRequest,
      open,
      closed,
      invalidRequest,
      data,
    };
  
    return res.status(200).json(responseObj);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
  
}
 

/**
 * @typedef {object} updateSupport
*/

/**
 * PUT /v1/user/support/update/{_id}
 * @summary update status of user support
 * @tags User
 * @security BearerAuth
 * @param {string} _id.path.required - _id(ObjectId)
 * @param {string} status.query - status
 * @return {object} 200 - Success response - application/json
 */

const updateSupport = async (req,res) =>{
  try{
   const {_id} = req.params;
   const statusParam = req.query.status;

   const userToUpdate = await Support.findById(_id);

if(!userToUpdate){
 res.status(200).json({error : "user not found"});
} 

userToUpdate.status = statusParam;
 // Save the updated user
 const updatedUser = await userToUpdate.save();

 res.status(200).json(updatedUser);
  }
   
catch (error) {
 res.status(500).json({ error: error.message });
}
};    


/**
 * @typedef {object} supportDetails
*/

/**
 * GET /v1/user/support-details/{_id}
 * @summary support details by indiviual users
 * @tags User
 * @security BearerAuth
 * @param {string} _id.path.required - _id(ObjectId)
 * @return {object} 200 - Success response - application/json
 */

const supportDetails = async (req,res) =>{
  try{
   const {_id} = req.params;

   const userData = await Support.findById(_id);

if(!userData){
 res.status(200).json({error : "user not found"});
} 

// userToUpdate.status = statusParam;
//  // Save the updated user
//  const updatedUser = await userToUpdate.save();

 res.status(200).json(userData);
  }
   
catch (error) {
 res.status(500).json({ error: error.message });
}
};   

async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL,
          pass: process.env.PASS
      }
  });

  const mailOptions = {
      from: process.env.GMAIL,
      to,
      subject,
      text
  };

  await transporter.sendMail(mailOptions);
}


/**
 * @typedef {object} reply
 * @property {string} reply - reply

*/

/**
 * POST /v1/user/send-reply/{supportId}
 * @summary support details by indiviual users
 * @tags User
 * @security BearerAuth
 * @param {string} supportId.path.required - supportId(ObjectId)
 * @param {reply} request.body.required - reply
 * @return {object} 200 - Success response - application/json
 */

const reply = async (req, res) => {
  try {
    const { supportId } = req.params;
    const { reply } = req.body;

    // Fetch the email by supportId
    const support = await Support.findById(supportId);

    if (!support) {
        throw new Error('Support request not found');
    }

    // Extract email from the support document
    const email = support.email;

    // Send the reply email
    await sendEmail(email, 'Reply to Your Support Request', reply);

    // Respond to the API request
    res.status(200).json({ message: 'Reply email sent successfully' });
} catch (error) {
    console.error('Error sending reply email:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
}
}; 




export default {
    user,
    userDetails,
    editUser,
    updateStatus,
    support,
    updateSupport,
    supportDetails,
    reply,
  };