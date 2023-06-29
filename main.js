const puppeteer = require("puppeteer");
const url = "https://twitter.com/i/flow/login";
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36';
const viewPort = {
    width: 1440,//px
    height: 812//px
};
const timeout = 30 * 1e3; // 30 seconds in ms.

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            // enable FLoC
            '--enable-blink-features=InterestCohortAPI',
            '--enable-features="FederatedLearningOfCohorts:update_interval/10s/minimum_history_domain_size_required/1,FlocIdSortingLshBasedComputation,InterestCohortFeaturePolicy"',
            '--js-flags="--async-stack-traces --stack-trace-limit 32"',
            '--show-autofill-signatures'
        ],
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
    await page.setUserAgent(userAgent);
    await page.setViewport(viewPort);

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