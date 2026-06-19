import fs from "fs";
import * as cheerio from "cheerio";

const html = fs.readFileSync("prisma/debug-page.html", "utf8");
const $ = cheerio.load(html);

// Print FSL_TUPLE card HTML
console.log("=== FSL_TUPLE.1 CARD ===");
const fsl1 = $('[data-label="FSL_TUPLE.1"]');
if (fsl1.length) {
  // Print all child elements with their classes and text
  fsl1.find("*").each((_, el) => {
    const cls = $(el).attr("class") || "";
    const text = $(el).clone().children().remove().end().text().trim();
    const dl = $(el).attr("data-label") || "";
    if (text || dl) {
      console.log(`  ${$(el).prop("tagName")} class="${cls.slice(0,80)}" data-label="${dl}" | text: "${text.slice(0,100)}"`);
    }
  });
} else {
  console.log("NOT FOUND");
}

console.log("\n=== GROUPED_PROJECT_TUPLE.3 CARD ===");
const gpt3 = $('[data-label="GROUPED_PROJECT_TUPLE.3"]');
if (gpt3.length) {
  gpt3.find("*").each((_, el) => {
    const cls = $(el).attr("class") || "";
    const text = $(el).clone().children().remove().end().text().trim();
    const dl = $(el).attr("data-label") || "";
    if (text || dl) {
      console.log(`  ${$(el).prop("tagName")} class="${cls.slice(0,80)}" data-label="${dl}" | text: "${text.slice(0,100)}"`);
    }
  });
} else {
  console.log("NOT FOUND");
}
