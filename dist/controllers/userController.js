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
            const extractedData = extractAadharDetails(frontOCR, backOCR);
            const age = this.calculateAge(extractedData.dob);
            console.log("age", age);
            extractedData.age = age;
            res.status(200).json(extractedData);
        }
        catch (error) {
            console.error("Error while parsing data:", error);
            return res.status(500).json({ message: "An error occurred while parsing data", error: error.message });
        }
    }
    // async performOCR(imageBuffer:any) {
    //     try {
    //       // Use Tesseract to recognize text from the image
    //       const {
    //         data: { text },
    //       } = await Tesseract.recognize(imageBuffer, "eng", {
    //         logger: (m) => console.log(m), 
    //         tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 
    //         preprocess: true, 
    //       });
    //       // Clean and return the OCR text
    //       const cleanedText = this.cleanOCRText(text);
    //       return cleanedText;
    //     } catch (error) {
    //       console.error("Error during OCR processing:", error);
    //       throw error;
    //     }
    //   }
    async performOCR(imageBuffer) {
        try {
            // Use Tesseract to recognize text from the image
            const { data: { text }, } = await Tesseract.recognize(imageBuffer, "eng", {
            // logger: (m) => console.log(m), // Logs OCR progress
            });
            console.log("Original OCR Text:", text); // Log the raw text output
            // Use a regular expression to filter the text
            const whitelistRegex = /[A-Z0-9\s]/g; // Include spaces in the regex if needed
            const cleanedText = this.cleanOCRText(text);
            console.log("Cleaned Text:", cleanedText); // Log the cleaned text
            return cleanedText;
        }
        catch (error) {
            console.error("Error during OCR processing:", error);
            throw error;
        }
    }
    cleanOCRText(text) {
        // Remove excessive whitespaces, and trim the text
        let cleanedText = text.replace(/\s+/g, " ").trim();
        console.log("cleanOCRText", cleanedText);
        const extractedInfo = {
            aadharNumber: this.extractAadharNumber(cleanedText),
            name: this.extractName(cleanedText),
            rawText: cleanedText,
        };
        return extractedInfo;
    }
    extractAadharNumber(text) {
        const aadharRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
        const match = text.match(aadharRegex);
        return match ? match[0].replace(/\s/g, "") : null;
    }
    extractName(text) {
        const nameRegex = /[A-Z][a-z]+ [A-Z][a-z]+/;
        const match = text.match(nameRegex);
        return match ? match[0] : null;
    }
    calculateAge(dob) {
        const [day, month, year] = dob.split('/').map(Number);
        const birthDate = new Date(year, month - 1, day);
        // Get the current date
        const currentDate = new Date();
        // Calculate the age
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDifference = currentDate.getMonth() - birthDate.getMonth();
        // Adjust age if the birthday hasn't occurred yet this year
        if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
            age--;
        }
        console.log("age", age);
        return age;
    }
}
