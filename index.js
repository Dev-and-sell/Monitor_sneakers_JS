const config = require("./configs/config.json")
const axios = require("axios")
async function sendDiscordNotification(webhookUrl, message) {
    try {
        await axios.post(webhookUrl, { content: message });
        console.log('Notification Discord envoyée avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification Discord :', error);
    }
}

async function checkForNewSneakers() {
    try {
       
        
        await sendDiscordNotification(config.WEBHOOK_URL, "hello");
      
    } catch (error) {
      console.error('Erreur lors de la vérification des sneakers :', error);
    }
  }
  
  
  setInterval(checkForNewSneakers, 5000);