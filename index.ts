const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // await page.goto('https://codeshare.io/GbovVA');
  await page.goto('https://codeshare.io/wdsbd04');

  await page.waitForSelector('pre', { timeout: 10000 }).catch(() => {});

  await page.evaluate(()=> {
    window.scrollTo(0, document.body.scrollHeight);
  })

  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => {
    const codeLines: string[] = [];
    
    const preElements = document.querySelectorAll('pre[role="presentation"]');

    preElements.forEach((pre) => {
      const text = pre.textContent?.trim();

      if (text) {
        codeLines.push(text);
      }
    })

    return codeLines.join('\n');
  });

  console.log(data);

  await browser.close();
})();