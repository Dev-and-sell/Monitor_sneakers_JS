const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const config = require('./configs/config.json');
const fs = require('fs');

process.setMaxListeners(1000000)

// Fonction pour envoyer une notification Discord via un webhook
async function sendDiscordNotification(webhookUrl, message) {
  try {
    await axios.post(webhookUrl, { content: message });
    console.log('Notification Discord envoyée avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification Discord :', error);
  }
}

// Fonction pour charger tous les éléments de la page
async function loadAllElements() {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Définir un User-Agent personnalisé
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36');

    await page.goto('https://www.lesitedelasneaker.com/release-dates/');

    while (true) {
      // Vérifie si le bouton "Afficher plus" est présent
      const loadMoreButton = await page.$('.facetwp-load-more');
      if (!loadMoreButton) {
        break;
      }
      // Clique sur le bouton "Afficher plus"
      await loadMoreButton.click();

      // Attendez 10 secondes avant de continuer la boucle
      await page.waitForTimeout(10000);
    }

    const html = await page.content();
    await browser.close();

    return html;
  } catch (error) {
    throw new Error( error);
  }
}

// Fonction pour vérifier les nouvelles sneakers
async function checkForNewSneakers() {
  try {
    const html = await loadAllElements();
    const $ = cheerio.load(html);

    const newSneakers = $('.c-uprelease')
      .map((index, element) => $(element).attr('href'))
      .get();

    console.log(newSneakers);

    // if (newSneakers.length > 0) {
    //   // Construire le message de notification
    //   let notificationMessage = 'Nouvelles sneakers disponibles :\n';

    //   newSneakers.forEach(sneaker => {
    //     notificationMessage += `- ${sneaker}\n`;
    //   });

    //   await sendDiscordNotification(config.WEBHOOK_URL, notificationMessage);
    // } else {
    //   console.log('Aucune nouvelle sneaker disponible.');
    // }
  } catch (error) {
    console.error('Erreur lors de la vérification des sneakers :', error);
  }
}

// Exécuter la vérification une fois au démarrage
checkForNewSneakers();

// Exécuter la vérification toutes les 5 secondes
setInterval(checkForNewSneakers, 5000);
