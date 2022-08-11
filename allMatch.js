const request = require("request");
const cheerio = require("cheerio");
const ScoreCardObj = require("./scorecard");
function getAllMatchesLink(url) {
  request(url, function (error, response, html) {
    if (error) {
      console.log(error);
    } else {
      // console.log(html);
      extractAllLinks(html);
    }
  });
}

function extractAllLinks(html) {
  let $ = cheerio.load(html);
  let scorecardElems = $(`a[data-hover="Scorecard"]`);
  for (let i = 0; i < scorecardElems.length; i++) {
    let link = $(scorecardElems[i]).attr("href");
    // console.log(link);
    let fullLink = "https://www.espncricinfo.com" + link;
    console.log(fullLink);
    ScoreCardObj.ps(fullLink);
  }
}

module.exports = {
  gAllMatches: getAllMatchesLink,
};
