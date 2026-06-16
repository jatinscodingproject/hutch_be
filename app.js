require("dotenv").config();

const express = require("express");
const cors = require("cors");

const hutchRoutes = require("./routes/routes.hutch");
const callbackRoutes = require("./routes/routes.callback");
const sequelize = require("./config/db");
const app = express();

const allowedOrigins = [
    "http://sl.yumzyy.com",
    "https://sl.yumzyy.com",
    "http://www.sl.yumzyy.com",
    "https://www.sl.yumzyy.com",

    "http://sl.eduwav.com",
    "https://sl.eduwav.com",
    "http://www.sl.eduwav.com",
    "https://www.sl.eduwav.com",

    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow Postman, server-to-server requests, etc.
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(`CORS blocked for origin: ${origin}`)
            );
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Accept"
        ]
    })
);

app.use(express.json());

app.use("/api/hutch", hutchRoutes);
app.use("/", callbackRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
});

sequelize
  .sync({ alter: true }) // or sync()
  .then(() => {
    console.log("Database synced");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Sync Error:", err);
  });