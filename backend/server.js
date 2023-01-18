const app = require('./app')
const dotenv = require('dotenv');
const connectDatabase = require('./config/database')
const cloudinary = require("cloudinary");
dotenv.config({ path: "backend/config/config.env" })
// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});
connectDatabase()
app.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT}`)
})
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});