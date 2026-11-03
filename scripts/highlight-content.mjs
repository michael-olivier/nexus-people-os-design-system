import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const hljs = require("highlight.js/lib/common");

const LANG_ALIASES = {
  html: "xml",
  terminal: "bash",
  shell: "bash",
};

const decodeHtmlEntities = (value) =>
  value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"');

export const highlightDocCode = (html) =>
  html.replace(/<code class="language-([\w-]+)">([\s\S]*?)<\/code>/g, (_, lang, raw) => {
    const source = raw.includes("&lt;") ? decodeHtmlEntities(raw) : raw;
    const language = LANG_ALIASES[lang] ?? lang;
    let highlighted;
    try {
      highlighted = hljs.highlight(source.trimEnd(), { language }).value;
    } catch {
      highlighted = hljs.highlightAuto(source.trimEnd()).value;
    }
    return `<code class="hljs language-${lang}">${highlighted}</code>`;
  });
