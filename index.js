const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const config = require('./configs/config.json');
const fs = require('fs');

process.setMaxListeners(1000000)

async function sendDiscordNotification(webhookUrl, message) {
  try {
    await axios.post(webhookUrl, { content: message });
    console.log('Notification Discord envoyée avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification Discord :', error);
  }
}

async function loadAllElements() {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();


    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36');

    await page.goto('https://www.lesitedelasneaker.com/release-dates/');

    while (true) {
     
      const loadMoreButton = await page.$('.facetwp-load-more');
      if (!loadMoreButton) {
        break;
      }
      
      await loadMoreButton.click();

      
      await page.waitForTimeout(10000);
    }

    const html = await page.content();
    await browser.close();

    return html;
  } catch (error) {
    throw new Error( error);
  }
}


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

checkForNewSneakers();

setInterval(checkForNewSneakers, 5000);
