const puppeteer = require("puppeteer");

const url = "https://twitter.com/i/flow/login";
const timeout = 5 * 1e3; // 5 seconds.

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [],
        devtools: true,
    });

    const ctx = await browser.createIncognitoBrowserContext();

    ctx.on('targetcreated', async target => {
        try {
            const cdpClient = await target.createCDPSession();
            await cdpClient.send('Target.setAutoAttach', {autoAttach: true, waitForDebuggerOnStart: true});
            await cdpClient.send('Runtime.enable');
            await cdpClient.send('Runtime.runIfWaitingForDebugger');
        } catch (err) {
            console.error(err);
        }
    });

    const page = await ctx.newPage();

    const cdpClient = await page.target().createCDPSession();
    await cdpClient.send('Target.setAutoAttach', {autoAttach: true, waitForDebuggerOnStart: true});

    await page.goto(url, {timeout, waitUntil: 'networkidle0'});

    for (const page of await ctx.pages()) {
        for (const frame of page.frames()) {
            await frame.evaluate(async () => 1);
        }
    }

    await browser.close();
})();