var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var app = express();

// import routes
var productsRoute = require("./routes/products");
var usersRoute = require("./routes/users");

// use routes
app.use("/api/products", productsRoute);
app.use("/api/users", usersRoute);

// add middleware
app.use(
	cors({
		origin: "*",
		methods: ["GET", "PUT", "DELETE", "PATCH", "POST"],
		allowedHeaders:
			"Content-Type, Authorization, Origin, X-Requested-With, Accept",
	})
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
