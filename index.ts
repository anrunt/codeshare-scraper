import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // await page.goto('https://codeshare.io/GbovVA');
  await page.goto('https://codeshare.io/wdsbd04');

  try {
    await page.waitForSelector('pre', { timeout: 10000 })
  } catch(err) {
    console.error("Can't load page: ", err);
    await browser.close();
    process.exit(1);
  };

  // Scrolling
  await page.evaluate(()=> {
    const scrollElement = document.querySelector('.CodeMirror-scroll');

    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight; 
    }
  })

  // Waiting for scroll
  await new Promise(resolve => setTimeout(resolve, 2000));

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