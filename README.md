# ates.dev

My personal website, running on GitHub Pages, because simple is good.

## Running locally

```
bundle install --path vendor/bundle
bundle exec jekyll serve
```

## Patching on M1 Ventura

1. `eval $(brew info libffi|grep ' export ')`
2. `bundle config build.nokogiri --use-system-libraries`
