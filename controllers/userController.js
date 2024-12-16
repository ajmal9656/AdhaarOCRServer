import Tesseract from "tesseract.js";
import extractAadharDetails from "../utils/DetailsExtraction.js";
export class UserController {
    // Parse data method
    async ParseData(req, res) {
      try {
        
        // Extract the uploaded images from req.files object
    const frontImage = req.files["frontImage"][0];
    const backImage = req.files["backImage"][0];

    // Ensure both front and back images are uploaded
    if (!frontImage || !backImage) {
      return res.status(400).json({ message: "Front and back images are required." });
    }

    // Perform OCR on the front and back images
    const frontOCR = await this.performOCR(frontImage.buffer);
    const backOCR = await this.performOCR(backImage.buffer);

    // Extract relevant data from OCR text
    const extractedData = extractAadharDetails(frontOCR, backOCR);

    const age =  this.calculateAge(extractedData.dob);
    console.log("age",age);
    

    extractedData.age =age;
    


    // Send the extracted details in the response
    res.status(200).json(extractedData);
      } catch (error) {
        console.error("Error while parsing data:", error);
  
        // Handle errors and respond with an error message
        return res.status(500).json({ message: "An error occurred while parsing data", error: error.message });
      }
    }

  async performOCR(imageBuffer) {
      try {
        // Use Tesseract to recognize text from the image
        const {
          data: { text },
        } = await Tesseract.recognize(imageBuffer, "eng", {
          logger: (m) => console.log(m), // Logs OCR process progress
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", // Restrict OCR to alphanumeric characters (helpful for Aadhaar cards)
          preprocess: true, // Preprocess the image to enhance OCR accuracy (this might require fine-tuning)
        });
    
        // Clean and return the OCR text
        const cleanedText = this.cleanOCRText(text);
        return cleanedText;
      } catch (error) {
        console.error("Error during OCR processing:", error);
        throw error;
      }
    }

    cleanOCRText(text) {
      // Remove excessive whitespaces, and trim the text
      let cleanedText = text.replace(/\s+/g, " ").trim();
    
      const extractedInfo = {
        aadharNumber: this.extractAadharNumber(cleanedText),
        name: this.extractName(cleanedText),
        rawText: cleanedText, // Keep the raw text for debugging or further analysis
      };
    
      return extractedInfo;
    }
    
    extractAadharNumber(text) {
      // Aadhaar number is a 12-digit number (grouped 4-4-4)
      const aadharRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
      const match = text.match(aadharRegex);
      return match ? match[0].replace(/\s/g, "") : null; // Remove spaces if matched
    }
    
    extractName(text) {
      // Aadhaar name extraction using regex (improve this as needed)
      const nameRegex = /[A-Z][a-z]+ [A-Z][a-z]+/;
      const match = text.match(nameRegex);
      return match ? match[0] : null; // Return the matched name
    }

    calculateAge(dob) {
      // Convert the dob string into a Date object
      const [day, month, year] = dob.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day); // month is 0-indexed in JavaScript
    
      // Get the current date
      const currentDate = new Date();
    
      // Calculate the age
      let age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    
      // Adjust age if the birthday hasn't occurred yet this year
      if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
      }

      console.log("age",age);
    
      return age;
    }
    
  }
  
