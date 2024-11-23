export default function (eleventyConfig) {
  eleventyConfig
    .addPassthroughCopy("assets/**/*")
    .addPassthroughCopy("i/**/*")
    .addPassthroughCopy("downloads/**/*")
    .addPassthroughCopy("pages/*/i/*")
    .addPassthroughCopy("pages/*/*.js")
    .addPassthroughCopy("pages/*/*.pde")
    .addFilter("debug", (value) => Object.keys(value));

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("posts/**/*.md")
  );
  eleventyConfig.addCollection("pages", (collectionApi) =>
    collectionApi.getFilteredByGlob("pages/**/*.md")
  );
}
