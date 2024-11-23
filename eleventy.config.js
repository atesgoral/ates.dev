import markdownItAnchor from "markdown-it-anchor";
import * as sass from "sass";
import path from "path";
import { wrap } from "module";

export default function (eleventyConfig) {
  eleventyConfig
    .addPassthroughCopy("assets/**/*.woff*")
    .addPassthroughCopy("assets/**/*.js")
    .addPassthroughCopy("i/**/*")
    .addPassthroughCopy("downloads/**/*")
    .addPassthroughCopy("pages/*/i/*")
    .addPassthroughCopy("pages/*/*.js")
    .addPassthroughCopy("pages/*/*.pde")
    .addFilter("debug", (value) => Object.keys(value));

  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAnchor, {
      permalink: true,
      permalinkBefore: false,
      permalinkSymbol: "#",
      // permalinks: markdownItAnchor.permalink.headerLink({
      //   // symbol: "#",
      //   // placement: "after",
      // }),
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
    compile: function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);

      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || "."],
      });

      // Register any Sass dependencies for incremental builds
      this.addDependencies(inputPath, result.loadedUrls);

      return async (data) => {
        return result.css;
      };
    },
  });
}
