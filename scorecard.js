const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
// const url =
//   "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";

function processScoreCard(url) {
  request(url, cb);
}
// homepage

function cb(error, response, html) {
  if (error) {
    console.log(error);
  } else {
    // console.log(html);
    extractMatchDetails(html);
  }
}
function extractMatchDetails(html) {
  // venue, date and result common for both the teams
  //   .event .description for venue and date
  //   .event .status-text for result
  let $ = cheerio.load(html);
  let descElem = $(".event .description");
  result = $(".event .status-text");
  let [num, venue, date] = descElem.text().split(",");

  //   console.log(venue);
  //   console.log(date);
  //   console.log(result.text());
  let innings = $(".card.content-block.match-scorecard-table>.Collapsible");
  let htmlString = "";
  for (let i = 0; i < innings.length; i++) {
    // htmlString += $(innings[i]).html();
    // team opponent
    let teamName = $(innings[i]).find("h5").text();
    teamName = teamName.split("INNINGS")[0].trim();
    let opponentIndex = i == 0 ? 1 : 0;
    let opponentName = $(innings[opponentIndex]).find("h5").text();
    opponentName = opponentName.split("INNINGS")[0].trim();

    console.log(`${venue} ${date} ${teamName} ${opponentName} $`);

    // player runs balls fours sixes strikerate
    let cinning = $(innings[i]);
    let allRows = cinning.find(".table.batsman tbody tr ");
    for (let j = 0; j < allRows.length; j++) {
      let allCols = $(allRows[j]).find("td");
      let isWorthy = $(allCols[0]).hasClass("batsman-cell");
      if (isWorthy) {
        // console.log(allCols.text());
        let playerName = $(allCols[0]).text().trim();
        let runs = $(allCols[2]).text().trim();
        let balls = $(allCols[3]).text().trim();
        let fours = $(allCols[5]).text().trim();
        let sixes = $(allCols[6]).text().trim();
        let sr = $(allCols[7]).text().trim();
        console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes}`);
        processPlayer(
          teamName,
          playerName,
          runs,
          balls,
          fours,
          sixes,
          sr,
          opponentName,
          venue,
          date,
          result
        );
      }
    }
  }
  console.log(htmlString);
}
function processPlayer(
  teamName,
  playerName,
  runs,
  balls,
  fours,
  sixes,
  sr,
  opponentName,
  venue,
  date,
  result
) {
  let teamPath = path.join(__dirname, "ipl", teamName);
  dirCreator(teamPath);
  let filePath = path.join(teamPath, playerName + ".xlsx");
  let content = excelReader(filePath, playerName);
  let playerObj = {
    teamName,
    playerName,
    runs,
    balls,
    fours,
    sixes,
    sr,
    opponentName,
    venue,
    date,
    result,
  };
  content.push(playerObj);
  excelWriter(filePath, content, playerName);
}
function dirCreator(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
}

function excelWriter(filePath, json, sheetName) {
  let newWB = xlsx.utils.book_new();
  let newWS = xlsx.utils.json_to_sheet(json);
  xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
  xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName) {
  if (!fs.existsSync(filePath)) return [];
  let wb = xlsx.readFile(filePath);
  let excelData = wb.Sheets[sheetName];
  let ans = xlsx.utils.sheet_to_json(excelData);
  return ans;
}

module.exports = {
  ps: processScoreCard,
};
