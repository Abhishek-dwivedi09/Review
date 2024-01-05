import cors from "cors";
import express from "express";
import expressJSDocSwagger from "express-jsdoc-swagger";
import morgan from "morgan";
import router from "./routes";
import logger from "./utils/logger";
import { mongoose } from "mongoose";
import passport from "passport";
var session = require("express-session");
const MongoStore = require('connect-mongo');

const options = {
  info: {
    version: "1.0.0",
    title: "Automatic-Dashboard  WebApp API",
    description: "Automatic-Dashboard  WebApp API documentation",
  },
  security: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
    },
  },
  baseDir: __dirname,
  filesPattern: [
    "./controllers/*.js",
    "./utils/*.schema.js",
    "./routes/index.js",
  ],
  swaggerUIPath: "/v1/admin/api-docs",
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  apiDocsPath: "/v3/api-docs",
  notRequiredAsNullable: false,
  swaggerUiOptions: {
    customSiteTitle: "Automatic-Dashboard | API Doc",
  },
};

const app = express();
app.use(require('prerender-node').set('prerenderToken', 'uBPt7m8u1IfoqK30Z4mT'));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      ttl: 1 * 24 * 60 * 60 // session TTL in seconds
    })
  })
);

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((error) => {
    console.log("Database Error", error);
  });

expressJSDocSwagger(app)(options);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: logger.stream,
  })
);
app.use(cors());
app.use("/v1", router);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//Google GET /auth/google/callback.

app.get(
  "/oauth2/redirect/google",
  passport.initialize(),
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    console.log("req.user", req.user);
    return res.redirect(`${process.env.REDIRETION_URL}?token=${req.user}`);
  }
);

// app.get(
//   "/oauth2/redirect/google",
//   passport.initialize(),
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   function (req, res) {
//     return res.redirect(
//       `http://localhost:8000/v1/auth/api-docs/?token=${req.user}`
//     );
//   }
// );

const port = process.env.PORT || 4003;

app
  .listen(port)
  .on("listening", () => {
    logger.info(`🚀Process started on port ${port}!🚀 `);
  })
  .on("error", (error) => {
    logger.error(`An error occured while starting server`);
    logger.error(error);
  });
