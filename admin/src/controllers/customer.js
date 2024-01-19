import { Admin } from "../models";
import { Customer } from "../models";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ErrorHandler, Emails, GenerateNumber, Password } from "../common";
import { PaginationData } from "../common";


const monthMap = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

const getWeekNumber = (day) => {
  // Calculate the week number for a given day of the month
  return Math.ceil(day / 7);
}; 


/**
 * @typedef {object} customerAnalytics
*/

/**
 * GET /v1/customer/analytics
 * @summary customer Analytics
 * @tags Customer
 * @param {string} pageLimit.query - pageLimit
 * @param {string} pageNumber.query - pageNumber
 * @param {string} month.query - month
 * @param {string} type.query - type
 * @security BearerAuth
 * @param {string} location.query - location
 * @param {string} Subscription.query - Subscription
 * @param {string} free_trail.query - free_trail
 * @param {string} Status.query - Status
 * @param {string} name.query - name
 * @return {object} 200 - Success response - application/json
 */
 

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
  
  
  
    }); 
  
   // const uniqueCityCount = uniqueCitySet.size;
  
    const responseObj = {
      totalSubscriber,
      activeCustomers,
      cancelledCustomers,
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
   }  
    }
  
    return res.status(200).json(responseObj)
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
     
  }  
  
  // free trail api 
   
  /**
   * @typedef {object} freeTrails
   */
  
  /**
   * GET /v1/customer/free_trail
   * @summary customer free trail data
   * @tags Customer
   * @security BearerAuth
   * @param {string} today.query - today
   * @param {string} thisWeek.query - thisWeek
   * @param {string} month.query - month
   * @return {object} 200 - Success response - application/json
   */ 
  
   const freeTrails = async (req,res) => { 
  
    try { 
       
      const monthParam = req.query.month;
      const todayParam = req.query.today;
      const thisWeekParam = req.query.thisWeek; 
    
      let month; 
        
      if (monthParam) {
    
        month = monthMap[monthParam.toLowerCase()];
    
        if (!month) {
            return res.status(400).json({ error: "Invalid month name" });
        }
    }  

    const filter = {};
    if (month) {
        filter.signUpDate = { $regex: `/${month}/` };
    } 

    if (todayParam) {
      const today = new Date();
      const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      console.log("Formatted Today:", formattedToday);

      // Trim spaces and adjust the regex
      filter.signUpDate = formattedToday.trim();
      console.log("Filter for Today:", filter);
    } 

    if (thisWeekParam) {
      const today = new Date();
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); // Start of the week (Sunday)
  
     const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
     console.log("Formatted Today:", formattedToday);


      // Format start and end dates in "dd/mm/yyyy" format
      const formattedStartOfWeek = `${startOfWeek.getDate().toString().padStart(2, '0')}/${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}/${startOfWeek.getFullYear()}`;

  
      console.log("Formatted Start of Week:", formattedStartOfWeek);
  

      filter.signUpDate = {
        $gte: formattedStartOfWeek.trim(),
        $lte: formattedToday.trim(),
        $regex: `^\\d{2}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
    };
      console.log("Filter for This Week:", filter);
  }
  
     let totalFreeTrails;
     let cancelledFreeTrails;
     let activeFreeTrails;
     let convertedToSubscription; 
     let customers;
  
  
    totalFreeTrails = await Customer.countDocuments(filter) 
  
       cancelledFreeTrails = await Customer.countDocuments({
          free_trail : "Cancelled",
          ...filter
       }) 
  
       activeFreeTrails = await Customer.countDocuments({
        free_trail : "Completed",
        ...filter
     }) 
  
     convertedToSubscription = await Customer.countDocuments({
      Subscription : "Not started",
      ...filter
   })  

    // Count cancellation reasons
    const cancellationReasonCounts = await Customer.aggregate([
      { $match: filter },
      {
          $group: {
              _id: '$cancellation_reason',
              count: { $sum: 1 }
          }
      },
      {
          $project: {
              cancellation_reason: '$_id',
              count: 1,
              _id: 0
          }
      }
  ]);
  
    customers = await Customer.find(filter);
 
    var totalweeklycount = Array.from({ length: 4 }, (_, weekIndex) => ({
      week: weekIndex + 1,
      count: 0
    }));   
  
     var convertedToSubscriptions = Array.from({ length: 4 }, (_, weekIndex) => ({
      week: weekIndex + 1,
      count: 0
    }));    

    var freeTrailExpired = Array.from({ length: 4 }, (_, weekIndex) => ({
      week: weekIndex + 1,
      count: 0
    })); 

    var freeTrailCancellation = Array.from({ length: 4 }, (_, weekIndex) => ({
      week: weekIndex + 1,
      count: 0
    }));    
  
  
  
   
    customers.forEach(customer => {
      const signupDay = parseInt(customer.signUpDate.split('/')[0]);
      const weekNumber = getWeekNumber(signupDay);
  
      // Increment the count for the corresponding week in app registration
      if (weekNumber >= 1 && weekNumber <= 4) {
        totalweeklycount[weekNumber - 1].count += 1;
      } 
  
      if (customer.Subscription=== "Not started" && weekNumber >= 1 && weekNumber <= 4) {
        convertedToSubscriptions[weekNumber - 1].count += 1;
      } 

      if (customer.free_trail=== "Expired" && weekNumber >= 1 && weekNumber <= 4) {
        freeTrailCancellation[weekNumber - 1].count += 1;
      } 

      if (customer.free_trail=== "Cancelled" && weekNumber >= 1 && weekNumber <= 4) {
        freeTrailExpired[weekNumber - 1].count += 1;
      } 
  
    })
  
  
  
      const responseObj = {
        totalFreeTrails,
        activeFreeTrails,
        convertedToSubscription,
        cancelledFreeTrails,
        cancellationReasonCounts,
       //  customers,
      } 
  
      if(month) {
        responseObj.weeklyCounts = {
          totalFreeTrailsWeeklyCounts: totalweeklycount,
          convertedToSubscriptionWeeklyCount: convertedToSubscriptions, 
          freeTrailCancellationWeeklyCount: freeTrailCancellation,
          freeTrailExpiredWeeklyCount: freeTrailExpired,
             
    }  
      }
     
     res.status(200).json(responseObj)
      
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  
   
   }  
  
  
/**
 * @typedef {object} review
 */

/**
 * GET /v1/customer/review
 * @summary customer reviews
 * @tags Customer
 * @param {string} pageLimit.query - pageLimit
 * @param {string} pageNumber.query - pageNumber
 * @param {string} month.query - month
 * @param {string} type.query - type
 * @security BearerAuth
 * @param {string} location.query - location
 * @param {string} Subscription.query - Subscription
 * @param {string} free_trail.query - free_trail
 * @param {string} Status.query - Status
 * @param {string} rating.query - rating
 * @param {string} name.query - name
 * @return {object} 200 - Success response - application/json
 */

  

const review = async (req, res) => {
  try {
    const monthParam = req.query.month;
    const typeParam = req.query.type;
    const pageLimitParam = req.query.pageLimit;
    const pageNumberParam = req.query.pageNumber;
    const nameParam = req.query.name;
    const locationParam = req.query.location;
    const subscriptionParam = req.query.Subscription;
    const freeTrailParam = req.query.free_trail;
    const statusParam = req.query.Status;
    const ratingParam = req.query.rating;

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

    if (ratingParam) {
      filter.rating = ratingParam;
    }
    if (subscriptionParam) {
      //filter.Subscription = subscriptionParam;
      filter.Subscription = { $regex: new RegExp(subscriptionParam, "i") };
    }
    if (freeTrailParam) {
      filter.free_trail = { $regex: new RegExp(freeTrailParam, "i") };
    }
    if (statusParam) {
      filter.Status = { $regex: new RegExp(statusParam, "i") };
    }
    if (nameParam) {
      // Use a case-insensitive regex for filtering by first_name, last_name, and their combination
      const nameRegex = new RegExp(nameParam, "i");
      filter.$or = [
        { first_name: nameRegex },
        { last_name: nameRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$first_name", " ", "$last_name"] },
              regex: nameRegex,
            },
          },
        },
      ];
    }
    if (locationParam) {
      // Parse the location parameter (support both string and integer values)
      const location = isNaN(locationParam)
        ? locationParam.toLowerCase() === "double"
          ? 2
          : 1
        : parseInt(locationParam);
      filter.location = location;
    }

    let totalSubscriber;
    let activeCustomers;
    let cancelledCustomers;
    let customers;
    let totalReviews;
    //let  totalLocations = 0;
    let uniqueCitySet = new Set();

    // Apply pagination only if both pageLimit and pageNumber are provided
    if (pageLimit > 0 && pageNumber > 0) {
      // Pagination data
      const { offset, limit } = PaginationData.paginationData(
        pageLimit,
        pageNumber
      );

      // Retrieve count and data for the specified filters with pagination
      totalSubscriber = await Customer.countDocuments(filter);

      activeCustomers = await Customer.countDocuments({
        isActive: true,
        ...filter,
      });

      cancelledCustomers = await Customer.countDocuments({
        isActive: false,
        ...filter,
      });

      totalReviews = await Customer.countDocuments({
        review: { $exists: true },
        ...filter,
      });

      customers = await Customer.find(filter).skip(offset).limit(limit);
    } else {
      // Retrieve count and data without pagination
      totalSubscriber = await Customer.countDocuments(filter);

      activeCustomers = await Customer.countDocuments({
        isActive: true,
        ...filter,
      });

      cancelledCustomers = await Customer.countDocuments({
        isActive: false,
        ...filter,
      });

      customers = await Customer.find(filter);

      // Count total reviews without pagination
      totalReviews = await Customer.countDocuments({
        review: { $exists: true },
        ...filter,
      });
    }

    const reviewWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
      week: weekIndex + 1,
      count: 0,
    }));

    // Initialize an array to store the count for each rating
    const ratingCounts = [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 0 },
      { rating: 5, count: 0 },
    ];

    customers.forEach((customer) => {
      const signupDay = parseInt(customer.signUpDate.split("/")[0]);
      const weekNumber = getWeekNumber(signupDay);

      if (weekNumber >= 1 && weekNumber <= 4) {
        reviewWeeklyCounts[weekNumber - 1].count += 1;
      }

      if (customer.rating) {
        const rating = customer.rating;
        const ratingObj = ratingCounts.find((item) => item.rating === rating);
        if (ratingObj) {
          ratingObj.count += 1;
        }
      }

      if (customer.city) {
        uniqueCitySet.add(customer.city);
      }
    });

    // const uniqueCityCount = uniqueCitySet.size;

    const responseObj = {
      totalLocations: uniqueCitySet.size,
      totalReviews,
      customers,
      ratingCounts,
    };

    if (month) {
      responseObj.weeklyCounts = {
        review: reviewWeeklyCounts,
      };
    }

    return res.status(200).json(responseObj);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}; 


/**
 * @typedef {object} subscription
 */

/**
 * GET /v1/customer/subscription
 * @summary customer subscription data 
 * @tags Customer
 * @security BearerAuth
 * @param {string} pageLimit.query - pageLimit
 * @param {string} pageNumber.query - pageNumber
 * @param {string} month.query - month
 * @param {string} today.query - today
 * @param {string} thisWeek.query - thisWeek
 * @param {string} state.query - state
 * @param {string} type.query - type
 * @param {string} name.query - name
 * @return {object} 200 - Success response - application/json
 */ 

  const subscription = async (req,res)=>{

     try { 

      const monthParam = req.query.month;
      const todayParam = req.query.today; // New query parameter for today
      const thisWeekParam = req.query.thisWeek; 
      const pageLimitParam = req.query.pageLimit;
      const pageNumberParam = req.query.pageNumber;
      const  stateParam = req.query.state
      const  typeParam = req.query.type

      let month; 
        
      if (monthParam) {
    
        month = monthMap[monthParam.toLowerCase()];
    
        if (!month) {
            return res.status(400).json({ error: "Invalid month name" });
        }
    } 
     
      // Validate pageLimit and pageNumber parameters or set default values
    const pageLimit = parseInt(pageLimitParam) || 0;  
    const pageNumber = parseInt(pageNumberParam) || 1;   
  
    const filter = {};
    if (month) {
        filter.signUpDate = { $regex: `/${month}/` };
    }  

    if (todayParam) {
      const today = new Date();
      const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      console.log("Formatted Today:", formattedToday);

      // Trim spaces and adjust the regex
      filter.signUpDate = formattedToday.trim();
      console.log("Filter for Today:", filter);
    } 

    if (thisWeekParam) {
      const today = new Date();
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); // Start of the week (Sunday)
  
     const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
     console.log("Formatted Today:", formattedToday);


      // Format start and end dates in "dd/mm/yyyy" format
      const formattedStartOfWeek = `${startOfWeek.getDate().toString().padStart(2, '0')}/${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}/${startOfWeek.getFullYear()}`;

  
      console.log("Formatted Start of Week:", formattedStartOfWeek);
  

      filter.signUpDate = {
        $gte: formattedStartOfWeek.trim(),
        $lte: formattedToday.trim(),
        $regex: `^\\d{2}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
    };
      console.log("Filter for This Week:", filter);
  }

 if (stateParam) {
      filter.state = stateParam;
    } 

    if (typeParam) {
      filter.type = typeParam;
    }
   

  
     let totalSubscriptions;
     let cancelledSubscription;
     let activeSubscription;
     let expiredSubscription; 
     let customers; 

     if(pageLimit >0 && pageNumber>0){
       
      const { offset, limit } = PaginationData.paginationData(pageLimit, pageNumber); 
      totalSubscriptions = await Customer.countDocuments({
        ...filter
     }) 
  
       cancelledSubscription = await Customer.countDocuments({
          Subscription : "Cancelled",
          ...filter
       }) 
  
       activeSubscription = await Customer.countDocuments({
        Subscription : "Active",
        ...filter
     }) 
  
     expiredSubscription = await Customer.countDocuments({
      Subscription : "Expired",
      ...filter
   })  
  
   customers = await Customer.find(filter)
   .skip(offset)
   .limit(limit); 
  
  } else{ 
  
    totalSubscriptions = await Customer.countDocuments({
      ...filter
   }) 

     cancelledSubscription = await Customer.countDocuments({
        Subscription : "Cancelled",
        ...filter
     }) 

     activeSubscription = await Customer.countDocuments({
      Subscription : "Active",
      ...filter
   }) 

   expiredSubscription = await Customer.countDocuments({
    Subscription : "Expired",
    ...filter
 })  

 customers = await Customer.find(filter)
  }  

  var totalSubscriptionweeklycount = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  }));

  var activeSubscriptionweeklycount = Array.from({ length: 4 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    count: 0
  }));  

  customers.forEach(customer => {
    const signupDay = parseInt(customer.signUpDate.split('/')[0]);
    const weekNumber = getWeekNumber(signupDay);

    if (customer.Subscription=== "Active" && weekNumber >= 1 && weekNumber <= 4) {
      activeSubscriptionweeklycount[weekNumber - 1].count += 1;
    } 

    if (weekNumber >= 1 && weekNumber <= 4) {
      totalSubscriptionweeklycount[weekNumber - 1].count += 1;
    }

  }) 

   // Aggregation pipeline to get count of visitors based on city
   const cityCountPipeline = [
    { $match: filter },
    {
      $group: {
        _id: "$city",
        count: { $sum: 1 },
      },
    },
  ];

  const cityCounts = await Customer.aggregate(cityCountPipeline);

  const citySubscriberCounts = cityCounts.map((item) => ({
    city: item._id,
    visitorCount: item.count,
  }));


   
  const responseObj = {
    totalSubscriptions,
    activeSubscription,
    cancelledSubscription,
    expiredSubscription,
    customers,
    citySubscriberCounts,
  } 

  if(month) {
    responseObj.weeklyCounts = {
      activeWeeklyCount: activeSubscriptionweeklycount,
      totalSubscriptionweeklycount: totalSubscriptionweeklycount
         
}  
  }
 
 res.status(200).json(responseObj)
  
      
     } catch (error) { 

      return res.status(500).json({ error: error.message });
      
     }
  }

export default {
  customerAnalytics,
  freeTrails,
  review,
  subscription,
};
