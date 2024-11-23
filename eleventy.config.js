import markdownItAnchor from "markdown-it-anchor";
import * as sass from "sass";

export default function (eleventyConfig) {
  eleventyConfig
    .addPassthroughCopy("assets/**/*")
    .addPassthroughCopy("i/**/*")
    .addPassthroughCopy("downloads/**/*")
    .addPassthroughCopy("pages/*/i/*")
    .addPassthroughCopy("pages/*/*.js")
    .addPassthroughCopy("pages/*/*.pde")
    .addFilter("debug", (value) => Object.keys(value));

  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAnchor, {
      slugify: (text) => {
        const slug = text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        return /^\d{4}$/.test(slug) ? `year-${slug}` : slug;
      },
    });
  });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("posts/**/*.md")
  );
  eleventyConfig.addCollection("pages", (collectionApi) =>
    collectionApi.getFilteredByGlob("pages/**/*.md")
  );

  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compile: async function (inputContent) {
      let result = sass.compileString(inputContent);
      return async () => result.css;
    },
  });
}
