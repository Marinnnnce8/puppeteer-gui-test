const puppeteer = require("puppeteer");
const fs = require("fs");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");

const testDir = "screenshots";

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

describe("👀 screenshots are correct", function () {
    let browser, page;

    before(async function () {
        // Create the test directory if needed.
        if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    });

    // This is ran before every test. It's where you start a clean browser.
    beforeEach(async function () {
        browser = await puppeteer.launch();
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
            //first takeBeforeDeploy, then takeAfterAndCompare
            return takeAfterAndCompare(page, "");
        });
    });
});

async function takeAfterAndCompare(page, fileName) {
    const global_data = fs.readFileSync("./nb-sitemap.json");
    const jsonContent = JSON.parse(global_data);
    let orderNum = '';
    let linkName = '';
    for (let i = 0; i < jsonContent.url.length; i++) {
        await page.goto(jsonContent.url[i].loc, {waitUntil: 'networkidle0'});
        fileName = jsonContent.url[i].file;
        linkName = jsonContent.url[i].loc;

        await page.screenshot({
            path: `${testDir}/${fileName}-after.png`,
            fullPage: true
        });
        orderNum = i + 1;
        compareScreenshots(fileName, orderNum, linkName);
    }
}

async function compareScreenshots(fileName, orderNum, linkName) {
    numDiffPixels = 0;

    const img1 = fs
        .createReadStream(`${testDir}/${fileName}-after.png`)
        .pipe(new PNG())
        .on("parsed", doneReading);
    const img2 = fs
        .createReadStream(`${testDir}/${fileName}-before.png`)
        .pipe(new PNG())
        .on("parsed", doneReading);

    let filesRead = 0;

    function doneReading() {
        // Wait until both files are read.
        if (++filesRead < 2) return;

        // Do the visual diff.
        const diff = new PNG({
            width: img1.width,
            height: img2.height
        });
        const numDiffPixels = pixelmatch(
            img1.data,
            img2.data,
            diff.data,
            img1.width,
            img1.height, {
                threshold: 0.1
            }
        );

        // Create diff image
        if (numDiffPixels > 0) {
            if (!fs.existsSync(`${testDir}/diffs`))
            fs.mkdirSync(`${testDir}/diffs`);
            diff.pack().pipe(
                fs.createWriteStream(`${testDir}/diffs/${fileName}.png`)
            );
            console.log(orderNum + ". Page \"" + linkName + "\" has failed the test (" + numDiffPixels + " different px)");
            return;
        }
        console.log(orderNum + ". Page \"" + linkName + "\" has passed the test (" + numDiffPixels + " different px)");
    }
}