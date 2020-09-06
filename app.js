require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();

// Configuring the database
const dbConfig = require("./config/database.config");

const mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate-v2");

mongoose.Promise = global.Promise;
mongoose.plugin(mongoosePaginate);

mongoose.set("toJSON", {
  virtuals: true,
});
mongoose.set("toObject", {
  virtuals: true,
});

//development
// Connecting to the database
mongoose
  .connect(
    process.env.NODE_ENV == "production" ? dbConfig.url_prod : dbConfig.url_dev,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.set("view engine", "html");
app.use(cors({ origin: true }));
app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

require("heroku-self-ping").default("https://tringuyeneducation.herokuapp.com");

//--- static file
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  "/static",
  express.static(path.join(__dirname, "views/web/build/static"))
);
//--- end static file

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: false, parameterLimit: 50000 })
);
app.use(cookieParser());
app.use(cors("*"));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.use("/web/api", require("./routes/webApi.route"));
app.use("/client/api", require("./routes/clientApi.route"));
app.use("/cms/api", require("./routes/cmsApi.route"));

require("./seeds/admin.seed");
require("./seeds/training.seed");
require("./seeds/statistic.seed");

//--- sendFile file
app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/web/build/index.html"));
});
//--- end sendFile file

const http = require("http").Server(app);

let server = http.listen(
  process.env.NODE_ENV == "production" ? process.env.PORT : 9000,
  () => {
    console.log("Server is listen on port 9000");
  }
);

global.io = require("socket.io")(server);
require("./helpers/socket_Server")(1);

module.exports = http;
