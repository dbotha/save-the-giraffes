const Image = require("@11ty/eleventy-img");
const path = require("path");

async function imageShortcode(src, alt, className = "", sizes = "(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px", loading = "lazy", fetchpriority = "") {
  if (!alt) throw new Error(`Missing alt text for image: ${src}`);

  const metadata = await Image(src, {
    widths: [640, 1024, 1920],
    formats: ["webp"],
    outputDir: "./dist/images/",
    urlPath: "images/",
    filenameFormat: function (id, src, width, format) {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}w.${format}`;
    },
  });

  const webp = metadata.webp;
  const largest = webp[webp.length - 1];
  const srcset = webp.map((img) => `${img.url} ${img.width}w`).join(", ");

  const loadingAttr = loading ? `loading="${loading}"` : "";
  const priorityAttr = fetchpriority ? `fetchpriority="${fetchpriority}"` : "";
  const classAttr = className ? `class="${className}"` : "";

  return `<picture>
  <source type="image/webp" srcset="${srcset}" sizes="${sizes}">
  <img src="${largest.url}" alt="${alt}" ${classAttr} ${loadingAttr} ${priorityAttr} decoding="async" width="${largest.width}" height="${largest.height}">
</picture>`;
}

async function logoShortcode(src, alt, className = "") {
  const metadata = await Image(src, {
    widths: [80, 160],
    formats: ["webp"],
    outputDir: "./dist/images/",
    urlPath: "images/",
    filenameFormat: function (id, src, width, format) {
      return `logo-${width}w.${format}`;
    },
  });

  const webp = metadata.webp;
  const img = webp[webp.length - 1];

  return `<img src="${img.url}" alt="${alt}" class="${className}" width="${img.width}" height="${img.height}" loading="eager">`;
}

async function faviconShortcode(src) {
  await Image(src, {
    widths: [32],
    formats: ["png"],
    outputDir: "./dist/",
    urlPath: "",
    filenameFormat: function () {
      return "favicon-32.png";
    },
  });

  await Image(src, {
    widths: [180],
    formats: ["png"],
    outputDir: "./dist/",
    urlPath: "",
    filenameFormat: function () {
      return "apple-touch-icon.png";
    },
  });

  return `<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addNunjucksAsyncShortcode("logo", logoShortcode);
  eleventyConfig.addNunjucksAsyncShortcode("favicon", faviconShortcode);

  // Pass through files that don't need processing
  eleventyConfig.addPassthroughCopy({ "src/images/logo.webp": "images/logo.webp" });

  return {
    dir: {
      input: "src",
      output: "dist",
    },
    htmlTemplateEngine: "njk",
  };
};
