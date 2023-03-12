import puppeteer from 'puppeteer';
import fs from 'fs/promises';

console.log('Launching puppeteer');
const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const filePath = new URL('index.html', import.meta.url);
console.log(`Visiting target page: ${filePath.toString()}`);
const page = await browser.newPage();
await page.goto(filePath.toString());

console.log('Saving as pdf');
const buffer = await page.pdf({
    format: 'a4',
    scale: 0.69,
    landscape: true,
    printBackground: true,
});
await fs.writeFile('sample.pdf', buffer);

console.log('Closing puppeteer');
await browser.close();
