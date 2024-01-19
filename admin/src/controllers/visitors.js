import { Visitor } from "../models";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ErrorHandler, Emails, GenerateNumber, Password } from "../common";
import { PaginationData } from "../common";
const moment = require('moment');

/**
 * @typedef {object} visitors
 */

/**
 * GET /v1/visitor
 * @summary visitors data
 * @tags Visitors
 * @param {string} pageLimit.query - pageLimit
 * @param {string} pageNumber.query - pageNumber
 * @param {string} month.query - month
 * @param {string} location.query - location
 * @param {string} city.query - city
 * @security BearerAuth
 * @param {string} state.query - state
 * @param {string} today.query - today
 * @param {string} thisWeek.query - thisWeek
 * @param {string} review.query - review
 * @param {string} name.query - name
 * @return {object} 200 - Success response - application/json
 */

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

function getCurrentWeekDates() {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - currentDay);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

const visitors = async (req, res) => {
  try {
    const cityParam = req.query.city;
    const reviewParam = req.query.review;
    const monthParam = req.query.month;
    const pageLimitParam = req.query.pageLimit;
    const pageNumberParam = req.query.pageNumber;
    const nameParam = req.query.name;
    const  stateParam = req.query.state
    const locationParam = req.query.location;
    const todayParam = req.query.today; // New query parameter for today
    const thisWeekParam = req.query.thisWeek; // New query parameter for this week
   

    // validate filter
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

    const filter = {};
    if (month) {
      filter.visitDate = { $regex: `/${month}/` };
    } 


    if (cityParam) {
      filter.city = cityParam;
    } 

    if (stateParam) {
      filter.state = stateParam;
    }

    if (reviewParam) {
      filter.reviews = reviewParam;
    }

    if (cityParam) {
      filter.city = cityParam;
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
      filter.location = locationParam;
    } 

    if (todayParam) {
      const today = new Date();
      const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      console.log("Formatted Today:", formattedToday);

      // Trim spaces and adjust the regex
      filter.visitDate = formattedToday.trim();
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
  

      filter.visitDate = {
        $gte: formattedStartOfWeek.trim(),
        $lte: formattedToday.trim(),
        $regex: `^\\d{2}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
    };
      console.log("Filter for This Week:", filter);
  }
  
    let totalVisitors;
    let visitors;

    if (pageLimit > 0 && pageNumber > 0) {
      const { offset, limit } = PaginationData.paginationData(
        pageLimit,
        pageNumber
      );

      totalVisitors = await Visitor.countDocuments(filter);
      console.log("Total Visitors:", totalVisitors);

      visitors = await Visitor.find(filter).skip(offset).limit(limit);
      console.log("Resulting Visitors:", visitors);
    } else {
      totalVisitors = await Visitor.countDocuments(filter);
      console.log("Total Visitors:", totalVisitors);

      visitors = await Visitor.find(filter);
      console.log("Resulting Visitors:", visitors);
    } 

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

    const cityCounts = await Visitor.aggregate(cityCountPipeline);

    const cityVisitorCounts = cityCounts.map((item) => ({
      city: item._id,
      visitorCount: item.count,
    }));


    const responseObj = {
      totalVisitors,
      visitors,
      cityVisitorCounts,
    };

    return res.status(200).json(responseObj);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}; 




export default {
  visitors,
};
