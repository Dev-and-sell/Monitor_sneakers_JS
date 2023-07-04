const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const config = require('./configs/config.json');
const fs = require('fs');

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
    await page.goto('https://www.lesitedelasneaker.com/release-dates/');

    while (true) {
      // Vérifie si le bouton "Afficher plus" est présent
      const loadMoreButton = await page.$('.facetwp-load-more');
      if (!loadMoreButton) {
        break;
      }
      // Clique sur le bouton "Afficher plus"
      await loadMoreButton.click();
      await page.waitForTimeout(1000);
    }

    const html = await page.content();
    await browser.close();

    return html;
  } catch (error) {
    throw new Error('Erreur lors du chargement des éléments de la page :', error);
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

// Exécuter la vérification toutes les 1 seconde (1000 ms)
setInterval(checkForNewSneakers, 1000);
