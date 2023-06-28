# Puppeteer bug reproduction

Reproduction of [Puppeteer issue #8399](https://github.com/puppeteer/puppeteer/issues/8399)

## How do I use it?

Just run

```bash
node main.js
```

and the binary never finishes executing. Comment out the line calling `frame.evaluate` and the binary will finish.
