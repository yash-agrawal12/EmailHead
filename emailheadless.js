const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();
const emailId = process.env.EMAIL_ID;
const password = process.env.PASSWORD;
const searchQuery = process.env.SEARCH_QUERY;
const folder1 = process.env.FOLDER;

console.log(`Email ID: ${emailId}`);
console.log(`Password: ${password}`);
console.log(`Search Query: ${searchQuery}`);
console.log(`folderr: ${folder1}`);

puppeteer.use(StealthPlugin());
const { executablePath } = require("puppeteer");
const app = express();
app.use(express.json());

app.get('/email', (req, res) => {
  res.send(emailExtract());
});


async function emailExtract() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: executablePath(),
    });
 
     
    const page = await browser.newPage();
    await page.goto("https://accounts.google.com/");

    await page.waitForSelector('[type="email"]');
    await page.type('[type="email"]', emailId);
    await page.click("#identifierNext");

    // Wait for the password input field to appear
    await page.waitForSelector('[type="password"]', { visible: true });
    await page.type('[type="password"]', password);

    await page.click("#passwordNext");
    await page.waitForNavigation();


    const currentDate = new Date().toISOString().slice(0, 10);
    const attach= 'emailAttachment';
    // Set the download behavior
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: path.join(folder1, currentDate, attach, ),
    });

    console.log("Login successful");
//========================================



    // Navigate to the inbox
    await page.goto('https://mail.google.com/mail/u/0/#inbox');

    const searchInput = await page.$('input[aria-label="Search mail"]');
    if (searchInput) {
    //   const searchQuery = searchquery; // Replace with your search query
      // Input the search query and press Enter
      await searchInput.click();
      await searchInput.type(searchQuery);
      await searchInput.press('Enter');
      console.log('Search email successfully...');
    } else {
      console.log('Search input element not found.');
    }

    await page.waitForTimeout(5000);

    // Open the searching email messages
    const emailElements = await page.$$('div[role="main"] .zA');
    const emailCount = emailElements.length;
    console.log('Found ' + emailCount + ' emails in the date range.');

    for (let i = 0; i < emailCount; i++) {
      let emailElement = emailElements[i];

      if (emailElement) {
        const boundingBox = await emailElement.boundingBox();
        if (boundingBox) {
          const x = boundingBox.x + 200;
          const y = boundingBox.y + 0;
          await page.mouse.click(x, y);
          await page.waitForTimeout(10000);

          // Extract and print the sender name, subject, and body of the email
          const senderEmail = await page.$('.gD');
          const senderElement = await senderEmail.evaluate(element => element.getAttribute('email'));
          console.log(`Sender: ${senderElement}`);

          const emailData = await page.evaluate(() => {
            const subjectElement = document.querySelector('h2.hP');
            const bodyElement = document.querySelector('.a3s.aiL');

            const subject = subjectElement ? subjectElement.textContent.trim() : '';
            const body = bodyElement ? bodyElement.innerText : '';

            return { subject, body };
          });

          console.log('Create new folder..');
          const currentDate = new Date().toISOString().slice(0, 10);
          console.log(`Current Date: ${currentDate}`);
          const folder = path.join(folder1, currentDate);

          try {
            await fs.mkdir(folder, { recursive: true });
            console.log(`Created new folder: ${folder}`);
          } catch (error) {
            console.error(`Error creating folder ${folder}: ${error.message}`);
          }

          console.log('Write email content to file');

          const timestamp = new Date();
          const currentTimestamp = timestamp.toLocaleString();
          const fileName = 'email.csv';
          const filePath = path.join(folder, fileName);

          let headerWritten = false;
          try {
            await fs.access(filePath);
          } catch (error) {
            if (error.code === 'ENOENT') {
              // File doesn't exist, create it with headers
              const header = `"emailcode","TimeStamp","SearchFilter","senderElement","Subject","Body"\n`;
              await fs.writeFile(filePath, header);
              headerWritten = true;
            } else {
              console.error(`Error accessing file ${fileName}: ${error.message}`);
              return;
            }
          }

          // Read the existing file content to get the last emailCode value
          if (!headerWritten) {
            try {
              const existingContent = await fs.readFile(filePath, 'utf-8');
              const lines = existingContent.split('\n');
              const lastLine = lines[lines.length - 2]; // Get the last non-empty line
              if (lastLine) {
                const values = lastLine.split(',');
                if (values.length > 0) {
                  const lastEmailCode = parseInt(values[0].replace(/"/g, ''), 10); // Parse the emailcode from the last line
                  if (!isNaN(lastEmailCode)) {
                    emailCode = lastEmailCode + 1; // Increment emailCode based on the last value
                  }
                }
              }
            } catch (error) {
              console.error(`Error reading existing content of ${fileName}: ${error.message}`);
            }
          }

          const csvContent = `"${emailCode}","${currentTimestamp}","${searchQuery}","${senderElement}","${emailData.subject}","${emailData.body}"\n`;
          emailCode++; // Increment emailCode for the next email

          try {
            // Append data to the file
            await fs.appendFile(filePath, csvContent);
            console.log(`Email content saved to: ${filePath}`);
          } catch (err) {
            console.error(`Error writing to file ${fileName}: ${err.message}`);
          }

          // Print the email data
          console.log('Latest Email Data:');
          console.log(`Sender: ${senderElement}`);
          console.log(`Subject: ${emailData.subject}`);
          console.log(`Body: ${emailData.body}`);

          try{
          // Check if the email contains an attachment
          const multipleattachmentButton = await page.$('.T-I.J-J5-Ji.aZj.T-I-ax7.T-I-Js-IF.L3');
          const singleattachmentButton = await page.$$('.T-I.J-J5-Ji.aQv.T-I-ax7.L3');
          const attachmentCount = singleattachmentButton.length /4;
          // console.log(`Attachment count: ${attachmentCount}`);
          
          if (attachmentCount == 1) {
          // await singleattachmentButton.click();
          await page.waitForTimeout(5000);
          await singleattachmentButton[0].click();
          console.log('single  attachment successfully download');
          await page.waitForTimeout(20000);
    
          } else if(attachmentCount >=1) {
          await page.waitForTimeout(5000);
          await multipleattachmentButton.click();
          console.log('multiple attachment successfully download');
          await page.waitForTimeout(20000);
          }else{
          console.log('download button does not found');
          }

        }catch (error) {   
            console.error('An error occurred:', error);
          }
          } else {
            console.log('Email element does not have a bounding box.');
         
        }
        await page.goBack();
        await page.waitForTimeout(6000);
      }
      
    }

      // delete email
  for (let i = 0; i < emailCount; i++) {
    const emailElement = emailElements[i];
   
    if (emailElement) {
      const boundingBox = await emailElement.boundingBox(); 
      if (boundingBox) {
        const x = boundingBox.x + 150; 
        const y = boundingBox.y + 0;   
        await page.mouse.click(x, y);
        await page.waitForTimeout(4000);
  
        try {
          // Click the delete email button
          await page.click('.T-I.J-J5-Ji.T-I-Js-Gs.aap.T-I-awG.T-I-ax7.L3');    
          await page.waitForTimeout(4000);
          // Click the attachment delete button
          await page.click('#tm');
          
          console.log('email successfully deleted');
        } catch (error) {   
          console.error('An error occurred:', error);
        }
      } else {
        console.log('Email element does not have a bounding box.');
      }

      await page.goBack();
      await page.waitForTimeout(4000);
    }
    }

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

let emailCode = 101; // Initialize emailCode
/*
(async () => {
  await emailExtract(); // Call the emailExtract function
})();
*/
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`application run on server ${port}`);
});
