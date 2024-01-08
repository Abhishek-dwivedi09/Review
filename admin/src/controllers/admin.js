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
 * @typedef {object} customerAnalytics
 */

/**
 * GET /v1/admin/customer/analytics
 * @summary customer Analytics
 * @tags Admin
 * @param {string} pageLimit.query - pageLimit
 * @param {string} pageNumber.query - pageNumber
 * @param {string} month.query - month
 * @param {string} type.query - type
 * @param {string} location.query - location
 * @param {string} Subscription.query - Subscription
 * @param {string} free_trail.query - free_trail
 * @param {string} Status.query - Status
 * @param {string} name.query - name
 * @return {object} 200 - Success response - application/json
 */
 
const monthMap = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
}; 

const getWeekNumber = (day) => {
  // Calculate the week number for a given day of the month
  return Math.ceil(day / 7);
};


const customerAnalytics = async (req,res) => { 
 
try {
  const monthParam = req.query.month;
  const typeParam = req.query.type;
  const pageLimitParam = req.query.pageLimit;
  const pageNumberParam = req.query.pageNumber;
  const nameParam = req.query.name;
  const locationParam = req.query.location;
  const subscriptionParam = req.query.Subscription
  const freeTrailParam = req.query.free_trail
  const statusParam = req.query.Status

  // Validate month parameter
  let month;
  if (monthParam) {
      // Convert month name to lowercase and use it to look up the numeric value
      month = monthMap[monthParam.toLowerCase()];

      if (!month) {
          return res.status(400).json({ error: "Invalid month name" });
      }
  }

  // Validate pageLimit and pageNumber parameters or set default values
  const pageLimit = parseInt(pageLimitParam) || 0;  
  const pageNumber = parseInt(pageNumberParam) || 1;  

  // Define the filter object based on query parameters
  const filter = {};
  if (month) {
      filter.signUpDate = { $regex: `/${month}/` };
  }
  if (typeParam) {
      filter.type = typeParam;
  } 
  if (subscriptionParam) {
    //filter.Subscription = subscriptionParam;
    filter.Subscription = { $regex: new RegExp(subscriptionParam, 'i') };
  } 
  if (freeTrailParam) {
    filter.free_trail = { $regex: new RegExp(freeTrailParam, 'i') };
  }
  if (statusParam) {
   filter.Status = { $regex: new RegExp(statusParam, 'i') };
  }
  if (nameParam) {
      // Use a case-insensitive regex for filtering by first_name, last_name, and their combination
      const nameRegex = new RegExp(nameParam, 'i');
      filter.$or = [
          { first_name: nameRegex },
          { last_name: nameRegex },
          { $expr: { $regexMatch: { input: { $concat: ["$first_name", " ", "$last_name"] }, regex: nameRegex } } }
      ];
  }
  if (locationParam) {
      // Parse the location parameter (support both string and integer values)
      const location = isNaN(locationParam) ? (locationParam.toLowerCase() === "double" ? 2 : 1) : parseInt(locationParam);
      filter.location = location;
  }

  let totalSubscriber;
  let activeCustomers;
  let cancelledCustomers;
  let customers; 
  let totalReviews = 0; 
  //let  totalLocations = 0;  
  let uniqueCitySet =  new Set();

  // Apply pagination only if both pageLimit and pageNumber are provided
  if (pageLimit > 0 && pageNumber > 0) {
      // Pagination data
      const { offset, limit } = PaginationData.paginationData(pageLimit, pageNumber);

      // Retrieve count and data for the specified filters with pagination
      totalSubscriber = await Customer.countDocuments(filter);

    

      activeCustomers = await Customer.countDocuments({
          isActive: true,
          ...filter
      });

      cancelledCustomers = await Customer.countDocuments({
          isActive: false,
          ...filter
      });

      customers = await Customer.find(filter)
          .skip(offset)
          .limit(limit);
  } else {
      // Retrieve count and data without pagination
      totalSubscriber = await Customer.countDocuments(filter);

      activeCustomers = await Customer.countDocuments({
          isActive: true,
          ...filter
      });

      cancelledCustomers = await Customer.countDocuments({
          isActive: false,
          ...filter
      });

      customers = await Customer.find(filter);
  }

  

  // Calculate weekly counts for app registration and activation
  const appRegistrationWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  }));

  const activationWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  }));  

  const reviewWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  }));

  const completedFreeTrailWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  })); 

  const cancelledFreeTrailWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  })); 

  const completedSubscriptionlWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  })); 

  const cancelledSubscriptionWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  }));

  customers.forEach(customer => {
    const signupDay = parseInt(customer.signUpDate.split('/')[0]);
    const weekNumber = getWeekNumber(signupDay);

    // Increment the count for the corresponding week in app registration
    if (weekNumber >= 1 && weekNumber <= 4) {
      appRegistrationWeeklyCounts[weekNumber - 1].count += 1;
    } 

    if (weekNumber >= 1 && weekNumber <= 4) {
      reviewWeeklyCounts[weekNumber - 1].count += 1;
    }

    // Increment the count for the corresponding week in activation (if customer is active)
    if (customer.isActive && weekNumber >= 1 && weekNumber <= 4) {
      activationWeeklyCounts[weekNumber - 1].count += 1;
    }  

    if (customer.free_trail=== "Completed" && weekNumber >= 1 && weekNumber <= 4) {
      completedFreeTrailWeeklyCounts[weekNumber - 1].count += 1;
    } 

    if (customer.free_trail=== "Cancelled" && weekNumber >= 1 && weekNumber <= 4) {
      cancelledFreeTrailWeeklyCounts[weekNumber - 1].count += 1;
    }  

    if (customer.Subscription=== "Active" && weekNumber >= 1 && weekNumber <= 4) {
      completedSubscriptionlWeeklyCounts[weekNumber - 1].count += 1;
    }  

    if (customer.Subscription=== "Cancelled" && weekNumber >= 1 && weekNumber <= 4) {
      cancelledSubscriptionWeeklyCounts[weekNumber - 1].count += 1;
    }   

    if(customer.review){
      totalReviews++;
    } 

    if(customer.city){
      uniqueCitySet.add(customer.city);
    }


  }); 

 // const uniqueCityCount = uniqueCitySet.size;

  const responseObj = {
    totalSubscriber,
    activeCustomers,
    cancelledCustomers,
    totalLocations :uniqueCitySet.size,
    totalReviews,
    customers,
    
  };

  if (month) {
      responseObj.weeklyCounts = {
       appRegistration: appRegistrationWeeklyCounts,
        activation: activationWeeklyCounts,
        freeTrailCompleted: completedFreeTrailWeeklyCounts,
        freeTrailCancelled: cancelledFreeTrailWeeklyCounts,
        subscriptionCompleted: completedSubscriptionlWeeklyCounts,
        subscriptionCancelled: cancelledSubscriptionWeeklyCounts,
        review: reviewWeeklyCounts,   
 }  
  }

  return res.status(200).json(responseObj)
} catch (error) {
  return res.status(500).json({ error: error.message });
}
   
}     

  export default {
    login,
    forgotPassword,
    customerAnalytics,
  }