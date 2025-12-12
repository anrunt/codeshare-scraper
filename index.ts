import puppeteer from "puppeteer";

const CODESHARE_LINK = 'https://codeshare.io/wdsbd04'; 

async function runCrawler() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(CODESHARE_LINK);

    try {
        await page.waitForSelector('.CodeMirror', { timeout: 10000 })
    } catch (err) {
        console.error("Can't load page: ", err);
        await browser.close();
        process.exit(1);
    };

    await page.evaluate(() => {
        const scrollElement = document.querySelector('.CodeMirror-scroll');
        if (scrollElement) {
            scrollElement.scrollTop = 0;
        }
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));

    let previousScrollTop = 0;
    let iterationsCounter = 0;
    
    while (true) {
        const scrollInfo = await page.evaluate(() => {
            const scrollElement = document.querySelector('.CodeMirror-scroll');
            if (scrollElement) {
                scrollElement.scrollTop += 800;
                return {
                    scrollTop: scrollElement.scrollTop,
                    scrollHeight: scrollElement.scrollHeight,
                    clientHeight: scrollElement.clientHeight
                };
            }
            return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        const atBottom = scrollInfo.scrollTop + scrollInfo.clientHeight >= scrollInfo.scrollHeight - 10;
        if (atBottom || scrollInfo.scrollTop === previousScrollTop) {
            break;
        }

        previousScrollTop = scrollInfo.scrollTop;
        iterationsCounter++;
    }

    console.log(`Scrolled ${iterationsCounter} times, waiting for final render...`);
    await new Promise(resolve => setTimeout(resolve, 500));

    const content = await page.evaluate(() => {
        const codeMirror = document.querySelector('.CodeMirror') as any;
        
        if (codeMirror && codeMirror.CodeMirror) {
            return codeMirror.CodeMirror.getValue();
        }
        
        // Fallback
        const lines: string[] = [];
        const lineElements = document.querySelectorAll('.CodeMirror-code > div');
        
        lineElements.forEach((lineDiv) => {
            const pre = lineDiv.querySelector('pre[role="presentation"]');
            if (pre) {
                const text = pre.textContent || "";
                lines.push(text);
            }
        });
        
        return lines.join('\n');
    });

    await browser.close();

    const fs = await import('fs');
    const outputPath = 'output4.txt';

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`Saved content to ${outputPath} (${content.length} characters)`);
}

runCrawler();