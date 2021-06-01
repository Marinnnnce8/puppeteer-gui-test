const puppeteer = require("puppeteer");
const fs = require("fs");
const fsExtra = require('fs-extra')

const testDir = "screenshots";

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

describe("👀 screenshots are correct", function () {
    let browser, page;

    before(async function () {
        // Empty directory before first test.
        if (fs.existsSync(testDir)) fsExtra.emptyDirSync(testDir);
        // Create the test directory if needed.
        if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    });

    // This is ran before every test. It's where you start a clean browser.
    beforeEach(async function () {
        browser = await puppeteer.launch({headless: true});
        page = await browser.newPage();
    });

    // This is ran after every test; clean up after your browser.
    afterEach(() => browser.close());

    // Wide screen tests!
    describe("wide screen", function () {
        beforeEach(async function () {
            const override = Object.assign(page.viewport(), {
                width: 1366,
                height: 5000,
            });
            await page.setViewport(override);
        });
        it("ready set go", async function () {
            return takeBeforeDeploy(page, "");
        });
    });
});

async function takeBeforeDeploy(page, fileName) {
    const global_data = fs.readFileSync("./nb-sitemap.json");
    const jsonContent = JSON.parse(global_data);
    let orderNum = '';
    for (let i = 0; i < jsonContent.url.length; i++) {
        // networkidle0 - consider navigation to be finished when there are no more than 0 network connections for at least 500 ms
        //it wont work if youre working with endless-scrolling-single-page-app like Twitter
        await page.goto(jsonContent.url[i].loc, {
            waitUntil: 'networkidle0'
        });

        fileName = jsonContent.url[i].file;
        await page.screenshot({
            path: `${testDir}/${fileName}-before.png`,
            fullPage: true
        });
        orderNum = i + 1;
        console.log(orderNum + ". \"" + jsonContent.url[i].loc + "\" screenshot done");
    }
}