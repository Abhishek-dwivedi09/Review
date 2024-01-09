import {Admin} from "../models"
import {Customer} from "../models"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {ErrorHandler, Emails, GenerateNumber, Password} from "../common"
import { PaginationData } from "../common"; 

 

/**
 * @typedef {object} review
 */

/**
 * GET /v1/customer/review
 * @summary customer reviews
 * @tags Review
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

const review = async (req,res) =>{ 
    
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
      
        
        const reviewWeeklyCounts = Array.from({ length: 4 }, (_, weekIndex) => ({
          week: weekIndex + 1,
          count: 0
        }));  

            // Initialize an array to store the count for each rating
        const ratingCounts = [
            { rating: 1, count: 0 },
            { rating: 2, count: 0 },
            { rating: 3, count: 0 },
            { rating: 4, count: 0 },
            { rating: 5, count: 0 }
        ];

      
        customers.forEach(customer => {
          const signupDay = parseInt(customer.signUpDate.split('/')[0]);
          const weekNumber = getWeekNumber(signupDay);
      
          if (weekNumber >= 1 && weekNumber <= 4) {
            reviewWeeklyCounts[weekNumber - 1].count += 1;
          }
     
          if(customer.review){
            totalReviews++;  
            
          } 

          if(customer.rating){
            const rating = customer.rating;
            const ratingObj = ratingCounts.find(item => item.rating===rating)
            if (ratingObj) {
                ratingObj.count += 1;
            }
          }
      
          if(customer.city){
            uniqueCitySet.add(customer.city);
          }
      
        }); 
      
       // const uniqueCityCount = uniqueCitySet.size;
      
        const responseObj = {
          totalLocations :uniqueCitySet.size,
          totalReviews,
          customers,
          ratingCounts,
        };
      
        if (month) {
            responseObj.weeklyCounts = {
              review: reviewWeeklyCounts,   
       }  
        }
      
        return res.status(200).json(responseObj)
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
        
} 

export default {
    review
  }