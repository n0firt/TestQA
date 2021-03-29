const {Builder, By, Key, until} = require('selenium-webdriver');
const assert = require('assert');

//buikd webdriver
let driver = new Builder().forBrowser('chrome').build();

//main func
(async () => {
    try{
        //go to yandex
        await (await driver).get('https://yandex.ru');

        //wait for page load
        await waitForPageLoad();

        //check the title
        await assert.strictEqual('Яндекс', await driver.getTitle());

        //search your words
        let text = await driver.wait(until.elementLocated(By.name('text')), 5000);
        await checkVisibleAndClick(text);
        await text.sendKeys('расчет расстояний между городами', Key.ENTER);

        //click avtodispetcher site link
        let link = await driver.wait(until.elementLocated(By.css('a[href="https://www.avtodispetcher.ru/distance/"]')), 5000)
        await checkVisibleAndClick(link);

        //get all tabs(count would be 2)
        let windows = await driver.getAllWindowHandles();

        //switch to second tab
        await driver.switchTo().window(await windows[1]);

        //wait for page load
        await waitForPageLoad();

        //check the title
        await assert.strictEqual('Расчет расстояний между городами', await driver.getTitle());

        //fill the form
        let from = await driver.findElement(By.name('from'));
        await checkVisibleAndClick(from);
        await from.sendKeys('Тула');
        //
        let to = await driver.findElement(By.name('to'));
        await checkVisibleAndClick(to);
        await to.sendKeys('Санкт-Петербург');
        //
        let fc = await driver.findElement(By.name('fc'));
        await checkVisibleAndClick(fc);
        await fc.sendKeys(Key.BACK_SPACE, 9);
        //
        let fp = await driver.findElement(By.name('fp'));
        await checkVisibleAndClick(fp);
        await fp.sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, 46);
        //fill the form end

        //submit the form
        let submit1 = await driver.findElement(By.css('input[type="submit"][value="Рассчитать"]'));
        await checkVisibleAndClick(submit1);

        //wait for page load
        await waitForPageLoad();

        //check the title
        await assert.strictEqual('Расстояние между Тулой и Санкт-Петербургом', await driver.getTitle());

        //check results
        await checkResults('897', '3726');

        //click on 'change the way' button
        let anchor = await driver.findElement(By.css('span.anchor'));
        await checkVisibleAndClick(anchor);

        //fill the input
        let v = await driver.wait(until.elementLocated(By.name('v')), 5000);
        await checkVisibleAndClick(v);
        await driver.wait(until.elementIsVisible(v), 3000).sendKeys('Великий Новгород');
        
        //wait for 30 secs
        await driver.sleep(30000);                                                                                          //???

        //scroll to the submit button, because it may be hidden and click on it
        let submit2 = await driver.findElement(By.css('input[type="submit"][value="Рассчитать"]'));
        await checkVisibleAndClick(submit2);

        //check new results
        await checkResults('966', '4002');

        //log that this test was completely passed
        await console.log('\x1b[32m'); 
        await console.log('Passed');
    }
    catch(error){
        //an error happened, so log it with its text
        await console.log('\x1b[31m', 'Failed\r\n' + 'Error: ' + error.message);
    }
    finally{
        //close the webdriver
        await driver.quit();
    }
})();

//func which waits for the page's loading ending by executing script
let waitForPageLoad = async () => 
    await driver.wait(async () => driver.executeScript('return document.readyState')
    .then(readyState => readyState === 'complete'));

//func which checks results by searching elements and asserting values
let checkResults = async (result1, result2) => {

    let element1 = await driver.wait(until.elementLocated(By.css('span#totalDistance')), 5000);
    await assert.strictEqual(result1, await driver.wait(until.elementIsVisible(element1), 5000).getText());

    let element2 = await driver.wait(until.elementLocated(By.css('.distance > #test_summary_variant_d > #summaryContainer > form > p')), 5000);
    let text = await driver.wait(until.elementIsVisible(element2), 5000).getText();
    await assert.strictEqual(true, await text.includes(result2));
};
//func which scroll page to element if its not visible
let checkVisibleAndClick = async element => {
    try
    {
        await element.click();
    }
    catch
    {
        await driver.executeScript("arguments[0].scrollIntoView()", element);
        await driver.sleep(300);
        await element.click(); 
    }
}