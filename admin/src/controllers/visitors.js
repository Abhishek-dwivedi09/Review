import { Visitor } from "../models";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ErrorHandler, Emails, GenerateNumber, Password } from "../common";
import { PaginationData } from "../common";

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
 * @param {string} state.query - state
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

    const responseObj = {
      totalVisitors,
      visitors,
    };

    return res.status(200).json(responseObj);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  visitors,
};
