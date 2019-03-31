const fs = require("fs")

const cheerio = require("cheerio")
const request = require("request-promise")
const { Parser } = require("json2csv")
const _ = require("lodash")

const guestClassPrefix = "fhww_guest_name-"

async function main () {
  const output = []

  // Fetch episodes
  // ===
  const episodes = await scrapeEpisodesFromApi()

  // Iterate over episodes
  // ===
  for (let episode of episodes) {
    console.info(`⚙️ ${episode}`)
    const html = await request(episode)
    output.push(await parse(html, episode))
  }

  const json2csvParser = new Parser()
  const csv = json2csvParser.parse(output)

  fs.writeFileSync("output.csv", csv)
  console.log("DONE!")
}

if (require.main === module) {
  main()
}

async function parse (html, url) {
  const $ = cheerio.load(html)

  const title = $("h1.entry-title").first().text()
  const number = _.get(title.match(/#(\d{1,3})/), [1])

  const overcast = _.get($("a[href^='https://overcast.fm/+']"), [0, "attribs", "href"])
  const spotify = _.get($("a[href^='https://open.spotify.com/episode/']"), [0, "attribs", "href"])
  const mp3 = _.get($("a[href$='.mp3']:icontains('clicking here')"), [0, "attribs", "href"])

  let guest = ""

  try {
    guest = $(`article[class*='${guestClassPrefix}']`)[0]
      .attribs.class.split(" ")
      .filter(x => x.startsWith(guestClassPrefix))[0]
      .substr(guestClassPrefix.length)
      .split("-")
      .map(x => x.replace(/^./, ch => ch.toUpperCase()))
      .join(" ")
  } catch (e) {
    // ignore
  }

  let quote = ""
  let timestamp = ""

  // Notes
  let notesTitle = $("h3:icontains('Show Notes')")
  if (!notesTitle.length) {
    console.warn("No notes title")
  } else {
    const notes = notesTitle.next("ul")

    // Billboard
    $(notes).find("li").each((i, el) => {
      const text = $(el).text()
      if (text.includes("billboard")) quote = $(el).text()
    })

    if (!quote) {
      console.warn("No billboard note")
    } else {
      timestamp = quote ? quote.match(/[[(](.*?)[\])]/)[1] : ""
    }
  }

  return {
    url,
    number,
    title,
    guest,
    quote,
    timestamp,
    mp3,
    spotify,
    overcast,
  }
}

// eslint-disable-next-line no-unused-vars
async function scrapeEpisodesFromBlog () {
  // TODO: Paginate
  const html = await request("http://tim.blog/podcast/")
  const $ = cheerio.load(html)
  const episodes = $(".podcast").map((i, el) => $(el).find("a").attr("href")).toArray()
  return episodes
}

async function scrapeEpisodesFromApi () {
  const LIMIT = 1
  const PAGE = 1
  const res = await request(`https://tim.blog/wp-json/wp/v2/posts/?per_page=${LIMIT}&page=${PAGE}&categories=223337489`)
  const json = JSON.parse(res)
  const episodes = json.map(x => x.link)
  return episodes
}

module.exports = {
  parse,
}
