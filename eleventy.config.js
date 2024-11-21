export default function (eleventyConfig) {
  eleventyConfig
    .addPassthroughCopy("assets/**/*")
    .addPassthroughCopy("i/**/*")
    .addPassthroughCopy("downloads/**/*")
    .addPassthroughCopy("pages/*/i/*")
    .addPassthroughCopy("pages/*/*.js")
    .addPassthroughCopy("pages/*/*.pde");
}
