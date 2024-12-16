import { Router } from "express";
import multer from "multer";
import { UserController } from "../controllers/userController.js";

const userControllerInstance = new UserController();
const route = Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for easy processing
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed."));
    }
  },
});


// Define the route with Multer middleware
route.post(
  "/parseData",
  
  upload.fields([
    { name: "frontImage", maxCount: 1 }, // Expect a single file named 'frontImage'
    { name: "backImage", maxCount: 1 },  // Expect a single file named 'backImage'
  ]),
  (err, req, res, next) => {
    // Error handling for Multer (file size/type issues)
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next(); // Pass to the next middleware (controller)
  },
  userControllerInstance.ParseData.bind(userControllerInstance)
);

export default route; // Correctly export the router
