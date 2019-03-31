/* eslint-env jest */

const fs = require("fs")
const m = require("./index")

const fixtures = {
  idealCase: fs.readFileSync(`${__dirname}/fixtures/ideal-case.html`, { encoding: "utf-8" }),
  noBillboard: fs.readFileSync(`${__dirname}/fixtures/no-billboard.html`, { encoding: "utf-8" }),
  noHost: fs.readFileSync(`${__dirname}/fixtures/no-host.html`, { encoding: "utf-8" }),
  noOvercast: fs.readFileSync(`${__dirname}/fixtures/no-overcast.html`, { encoding: "utf-8" }),
  totallyInvalid: fs.readFileSync(`${__dirname}/fixtures/totally-invalid.html`, { encoding: "utf-8" }),
  parenthesisTimestamps: fs.readFileSync(`${__dirname}/fixtures/parenthesis-timestamps.html`, { encoding: "utf-8" }),
}

test("tim-ferriss-billboards", async () => {
  await expect(m.parse(fixtures.idealCase, "idealCase.com")).resolves.toMatchSnapshot()
  await expect(m.parse(fixtures.noBillboard, "noBillboard.com")).resolves.toMatchSnapshot()
  await expect(m.parse(fixtures.noHost, "noHost.com")).resolves.toMatchSnapshot()
  await expect(m.parse(fixtures.noOvercast, "noOvercast.com")).resolves.toMatchSnapshot()
  await expect(m.parse(fixtures.totallyInvalid, "totallyInvalid.com")).resolves.toMatchSnapshot()
  await expect(m.parse(fixtures.parenthesisTimestamps, "parenthesisTimestamps.com")).resolves.toMatchSnapshot()
})
