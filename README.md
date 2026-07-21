# Privateer Website

The website for the Privateer project, hosted at [privateerproj.com](https://privateerproj.com/).

## Stack

- [Hugo](https://gohugo.io/) (extended) — static site generator
- Custom layouts and partials (no external theme)
- GitHub Pages — hosting, deployed via GitHub Actions

## Local Development

Requires [Hugo extended](https://gohugo.io/installation/) installed locally.

```bash
hugo server
```

Open `http://localhost:1313`.

## Building

```bash
hugo --minify
```

Output goes to `public/`.

## Deployment

Pushes to `main` trigger the `Deploy to GitHub Pages` workflow (`.github/workflows/deploy.yml`), which builds and deploys automatically.

## License

See [LICENSE](./LICENSE) for details.
