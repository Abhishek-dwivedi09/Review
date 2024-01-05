require("dotenv").config();

if (process.env.NODE_ENV === "production") {
  require("./build/index");
} else {
  require("./src/index");
}