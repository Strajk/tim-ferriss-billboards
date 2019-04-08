const fs = require("fs")
const tabletop = require("tabletop")
const { Parser } = require("json2csv")

tabletop.init({
  key: "https://docs.google.com/spreadsheets/d/1rL6Hg6HgM2DspXN8hHCT8ixEJQBItdCCa5OUgTga81s/edit?usp=sharing",
  simpleSheet: true,
  postProcess (item) {
    delete item.Google // Just helper column
  },
  callback (res) {
    const csvParserFull = new Parser({
      fields: ["Episode", "Title", "Guest", "Quote", "Link", "Time", "MP3", "Spotify", "Overcast"],
    })

    const csvParser = new Parser({
      fields: ["Episode", "Guest", "Quote"],
    })

    fs.writeFileSync("results-full.json", JSON.stringify(res, null, "  "))
    fs.writeFileSync("results-full.csv", csvParserFull.parse(res))
    fs.writeFileSync("results.csv", csvParser.parse(res.filter(x => x.Quote.length && x.Quote !== "–")))

    console.log("I'm done, let's go home now!")
  },
})
