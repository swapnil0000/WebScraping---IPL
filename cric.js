const request = require("request");
const cheerio = require("cheerio");
const AllMatchObj = require("./allMatch");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

const iplPath = path.join(__dirname, "ipl");
dirCreator(iplPath);
// homepage
request(url, cb);

function cb(error, response, html) {
  if (error) {
    console.log(error);
  } else {
    // console.log(html);
    extractLink(html);
  }
}

// getting link
function extractLink(html) {
  // parses html
  const $ = cheerio.load(html);
  let anchorElem = $("a[data-hover='View All Results']");
  let link = anchorElem.attr("href");
  console.log(link);
  let fullLink = "https://www.espncricinfo.com" + link;
  console.log(fullLink);
  AllMatchObj.gAllMatches(fullLink);
}

function dirCreator(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
}
