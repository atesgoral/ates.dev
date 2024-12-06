import markdownItAnchor from "markdown-it-anchor";
import * as sass from "sass";
import path from "path";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets/**/*");
  eleventyConfig.addPassthroughCopy("src/pages/*/i/*");
  eleventyConfig.addPassthroughCopy("src/pages/*/*.js");
  eleventyConfig.addPassthroughCopy("src/pages/*/*.pde");
  eleventyConfig.addPassthroughCopy("src/posts/*/i/*");
  eleventyConfig.addPassthroughCopy("src/posts/*/*.js");

  eleventyConfig.addFilter("debug", (value) => Object.keys(value));

  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.headerLink({
        class: "permalink",
      }),
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
    collectionApi.getFilteredByGlob("src/posts/**/*.md")
  );
  eleventyConfig.addCollection("pages", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/pages/**/*.md")
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

      return async (_data) => {
        return result.css;
      };
    },
  });

  eleventyConfig.addGlobalData("baseUrl", "https://ates.dev");

  // eleventyConfig.addWatchTarget("./src/**/*", {
  // resetConfig: true,
  // });

  // eleventyConfig.setChokidarConfig({
  // usePolling: true,
  // interval: 500,
  // });

  eleventyConfig.setInputDirectory("src");
}