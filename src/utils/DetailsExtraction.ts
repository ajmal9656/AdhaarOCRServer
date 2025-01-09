function extractAadharDetails(front:any, back:any) {
    const details = {
      aadharNumber: front.aadharNumber || back.aadharNumber || null,
      name: extractName(front.rawText, front.name),
      dob: extractDOB(front.rawText),
      gender: extractGender(front.rawText),
      address: extractAddress(back.rawText),
      pin: extractPin(back.rawText)
    };
    return details;
  }
  
  function extractName(rawText: any, name: any) {
    // If name is already provided, return it
    if (name) return name; 
  
    // Ensure rawText is a valid string before using match
    if (typeof rawText !== 'string' || !rawText) {
      throw new Error("Invalid rawText: Expected a non-empty string");
    }
  
    // Try to match the name in rawText using regex
    const nameMatch = rawText.match(/Name:\s?([A-Za-z\s]+)/);
  
    // Return the matched name or null if no match
    return nameMatch ? nameMatch[1].trim() : null;
  }
  
  function extractDOB(rawText:any) {
    
    const dobMatch = rawText.match(/DOB[:\s~]*(\d{2}\/\d{2}\/\d{4})/);
    return dobMatch ? dobMatch[1] : null;
  }
  
  function extractGender(rawText:any) {
    const genderMatch = rawText.match(/\b(Male|Female|Other)\b/i);
    return genderMatch ? genderMatch[1] : null;
  }
  
  function extractAddress(rawText:any) {

    const addressRegex = /Addresss\/[^\w]*(\w[\w\s]+).*?wa:\s([^,]+,[^,]+)/;
    const match = rawText.match(addressRegex);
  
  
   
  
    if (match) {
      const name = match[1].trim(); 
      const location = match[2].trim(); 
      return `${name}, ${location}`;
    }
  
    return null; 
  }

  function extractPin(rawText:any) {
  const pinMatch = rawText.match(/\b\d{6}\b/);
  return pinMatch ? pinMatch[0] : null;
}

export default extractAadharDetails