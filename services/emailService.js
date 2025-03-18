import * as Linking from 'expo-linking';

/**
 * Creates an email to send to a mechanic about a repair
 * @param {string} mechanicEmail - Mechanic's email address
 * @param {Object} vehicle - Vehicle object {year, make, model}
 * @param {string} code - Diagnostic trouble code
 * @param {Array} videos - Array of video objects from search results
 * @returns {Promise} - Promise that resolves when email is opened
 */
export const emailMechanic = async (mechanicEmail, vehicle, code, videos) => {
  try {
    if (!mechanicEmail) {
      throw new Error('Mechanic email is not set');
    }
    
    const { year, make, model } = vehicle;
    
    // Create subject line
    const subject = `Help needed with ${year} ${make} ${model} - Code ${code}`;
    
    // Create email body
    let body = `Hello. I am having some issues with my vehicle I hope you can help me with. I have a ${year} ${make} ${model} with a check engine light on. When I hook up my 
    scanner to check the code I am receiving ${code}. I did a little research on what could be causing code and I either dont have the tools necessary to do the repair, am not comfortable doing the repair myself, or do not have the time to attempt the repair. 
    If you could email me back so we can set up an appointment for me to come in so you can diagnose the issue and give me a quote on the repair it would be greatly appreciated.`;
    
    
    // Create mailto URL
    const mailtoUrl = `mailto:${mechanicEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    const supported = await Linking.canOpenURL(mailtoUrl);
    
    if (supported) {
      await Linking.openURL(mailtoUrl);
    } else {
      // Fallback if mailto is not supported
      console.error('Cannot open email client');
      throw new Error('Cannot open email client');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 