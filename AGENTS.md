# AGENTS.md

This document provides guidance for AI coding assistants working with this project.

## Project Overview

This is Ateş Göral's personal website and portfolio, built with [Eleventy (11ty)](https://www.11ty.dev/) and deployed to GitHub Pages at [ates.dev](https://ates.dev).

**Technology Stack:**
- Static site generator: Eleventy 3.0
- Templating: Liquid templates
- Styling: Sass/SCSS
- Content: Markdown files
- Package manager: pnpm
- Deployment: GitHub Actions → GitHub Pages

## Project Structure

```
ates.dev/
├── src/                      # Source files (Eleventy input directory)
│   ├── _includes/           # Layout templates
│   ├── pages/               # Static pages
│   ├── posts/               # Blog posts (dated folders)
│   ├── styles/              # SCSS stylesheets
│   ├── lib/                 # JavaScript libraries
│   ├── index.md             # Homepage
│   └── service-worker.js    # PWA service worker
├── assets/                   # Static assets (images, downloads)
├── _site/                    # Generated output (gitignored)
├── eleventy.config.js        # Eleventy configuration
├── package.json              # Dependencies and scripts
└── .github/workflows/        # CI/CD configuration
```

## Key Concepts

### Content Organization

1. **Blog Posts** (`src/posts/`):
   - Each post lives in its own dated folder: `YYYY-MM-DD-slug-name/`
   - Main content: `index.md` with frontmatter
   - Images go in `i/` subdirectory within the post folder
   - Draft posts have `draft: true` in frontmatter (excluded from build)

2. **Pages** (`src/pages/`):
   - Similar structure to posts
   - Pages with `omit: true` are excluded from page listings

3. **Collections**:
   - `posts`: All blog posts (non-draft)
   - `pages`: All pages (non-omitted)

### Eleventy Configuration

The site uses several custom configurations in `eleventy.config.js`:

- **Sass compilation**: `.scss` files are automatically compiled to CSS
- **Markdown enhancements**: Uses `markdown-it-anchor` for heading permalinks
- **RSS feed**: Generated at `/feed.xml` (last 10 posts)
- **Passthrough copies**: Static assets are copied directly to output

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (with watch mode)
pnpm serve
# or
npx @11ty/eleventy --serve

# Build for production
pnpm build
```

The dev server runs at `http://localhost:8080` by default.

### Deployment

- Automated via GitHub Actions on push to `main` branch
- Build output (`_site/`) is deployed to `gh-pages` branch
- Custom domain: `ates.dev` (configured via CNAME)

## Guidelines for AI Assistants

### When Working with Content

1. **Blog Posts**:
   - Always create new posts in dated folders: `src/posts/YYYY-MM-DD-slug/index.md`
   - Include proper frontmatter (layout, title, description, image, alt)
   - Place images in `src/posts/YYYY-MM-DD-slug/i/` subdirectory
   - Use relative paths for images: `i/image-name.jpg`

2. **Frontmatter Template** for posts:
   ```yaml
   ---
   layout: layouts/post
   title: "Post Title"
   description: "Brief description for meta tags and feeds"
   image: i/featured-image.jpg
   alt: "Accessible image description"
   ---
   ```

3. **Style Guidelines**:
   - The site has a minimalist aesthetic
   - Code blocks and technical content are common
   - Use semantic HTML and accessible markup
   - Maintain existing design patterns

### When Working with Code

1. **Dependencies**:
   - Use `pnpm` for package management (not npm/yarn)
   - Keep dependencies minimal and up-to-date
   - Document any new dependencies in this file or README

2. **Configuration Changes**:
   - Be cautious when modifying `eleventy.config.js`
   - Test builds locally before committing
   - Preserve existing collections and filters

3. **Styling**:
   - SCSS files are in `src/styles/`
   - Maintain existing design system
   - Use relative units and responsive patterns

### Testing Changes

Before committing changes:

1. Run local development server and verify rendering
2. Test responsive behavior at different screen sizes
3. Check that RSS feed still generates correctly
4. Verify all links work (internal and external)
5. Run a production build to catch any build-time errors

### Git Workflow

- Main branch: `main` (source code)
- Deployment branch: `gh-pages` (generated, auto-managed)
- Create clear, descriptive commit messages
- Don't commit the `_site/` directory or `node_modules/`

## Common Tasks

### Adding a New Blog Post

1. Create folder: `src/posts/YYYY-MM-DD-title-slug/`
2. Create `index.md` with frontmatter
3. Add images to `i/` subdirectory if needed
4. Build and preview locally
5. Commit and push to trigger deployment

### Adding a New Page

1. Create folder: `src/pages/page-name/`
2. Create `index.md` with appropriate layout
3. Add to navigation if needed (edit templates in `src/_includes/`)

### Updating Styles

1. Edit SCSS files in `src/styles/`
2. Eleventy will compile automatically during build
3. Check compiled CSS in `_site/` for verification

## Important Notes

- **Build Output**: The `_site/` directory is gitignored and regenerated on each build
- **URLs**: In templates, use `{{ baseUrl }}` for absolute URLs (handles localhost vs production)
- **Performance**: Keep dependencies light; this is a static site optimized for speed
- **Accessibility**: Maintain semantic HTML and ARIA labels where appropriate
- **SEO**: Each page/post should have proper title, description, and image metadata

## Resources

- [Eleventy Documentation](https://www.11ty.dev/docs/)
- [Liquid Template Language](https://liquidjs.com/)
- [Markdown-It](https://github.com/markdown-it/markdown-it)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Author

Ateş Göral
- Website: [ates.dev](https://ates.dev)
- GitHub: [@atesgoral](https://github.com/atesgoral)
- Email: ates.goral@gmail.com
