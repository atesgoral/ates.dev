import markdownItAnchor from 'markdown-it-anchor';
import * as sass from 'sass';
import path from 'path';

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
  const isDev = process.env.ELEVENTY_RUN_MODE === 'serve';

  eleventyConfig.addPassthroughCopy('src/service-worker.js');
  eleventyConfig.addPassthroughCopy('assets/**/*');
  eleventyConfig.addPassthroughCopy('src/pages/*/i/*');
  eleventyConfig.addPassthroughCopy('src/pages/*/*.js');
  eleventyConfig.addPassthroughCopy('src/pages/*/*.pde');
  eleventyConfig.addPassthroughCopy('src/posts/*/i/*');
  eleventyConfig.addPassthroughCopy('src/posts/*/*.js');
  eleventyConfig.addPassthroughCopy('src/lib/*.js');

  eleventyConfig.addFilter('debug', (value) => Object.keys(value));

  eleventyConfig.amendLibrary('md', (mdLib) => {
    mdLib.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.headerLink({
        class: 'permalink',
      }),
      slugify: (text) => {
        const slug = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        return /^\d{4}$/.test(slug) ? `year-${slug}` : slug;
      },
    });
  });

  eleventyConfig.addCollection('posts', (collectionApi) =>
    collectionApi
      .getFilteredByGlob('src/posts/**/*.md')
      .filter((post) => !post.data.draft),
  );
  eleventyConfig.addCollection('pages', (collectionApi) =>
    collectionApi
      .getFilteredByGlob('src/pages/**/*.md')
      .filter((page) => !page.data.omit),
  );

  eleventyConfig.addTemplateFormats('scss');
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    compile: function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);

      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || '.'],
      });

      // Register any Sass dependencies for incremental builds
      this.addDependencies(inputPath, result.loadedUrls);

      return async (_data) => {
        return result.css;
      };
    },
  });

  eleventyConfig.addGlobalData(
    'baseUrl',
    isDev ? 'http://localhost:8080' : 'https://ates.dev',
  );

  eleventyConfig.setInputDirectory('src');
}
