# [koa-prometheus](https://github.com/prayerslayer/koa-prometheus)

[![NPM version](http://img.shields.io/npm/v/koa-prometheus.svg?style=flat-square)](https://www.npmjs.com/package/koa-prometheus)
[![NPM downloads](http://img.shields.io/npm/dm/koa-prometheus.svg?style=flat-square)](https://www.npmjs.com/package/koa-prometheus)
[![Build Status](http://img.shields.io/travis/prayerslayer/koa-prometheus/master.svg?style=flat-square)](https://travis-ci.org/prayerslayer/koa-prometheus)
[![Coverage Status](https://img.shields.io/coveralls/prayerslayer/koa-prometheus.svg?style=flat-square)](https://coveralls.io/prayerslayer/koa-prometheus)
[![Dependency Status](http://img.shields.io/david/prayerslayer/koa-prometheus.svg?style=flat-square)](https://david-dm.org/prayerslayer/koa-prometheus)

> Koa middleware to collect some metrics than you can output in prometheus format. Works with koa-router!

## How to Install

```sh
$ npm install koa-prometheus
```

## Getting Started

First use the `koa-prometheus` middleware like this:

~~~ javascript
import Koa from 'koa';
import Router from 'koa-router';
import metricsMiddleware from 'koa-prometheus';

// create your router
const router = Router();
/* more router configuration */

// create your app
const app = new Koa();

// configure middleware
// this ignores requests for static assets
app.use(metricsMiddleware(router, { ignore: [/\.js$/, /\.css$/] });
~~~

It will collect two simple metrics for every request: How often it was requested and how long it took to respond. You can now output this in prometheus format on a different endpoint:

~~~ javascript
import {getMetrics} from 'koa-prometheus';
function metrics(router) {
  return router.get('/metrics', ctx => ctx.body = getMetrics());
}
~~~

This endpoint you can now use in combination with other prometheus-compatible tooling.

## Dev stuff

### How to Test

Run one, or a combination of the following commands to lint and test your code:

```sh
$ npm run lint          # Lint the source code with ESLint
$ npm test              # Run unit tests with Mocha
$ npm run test:watch    # Run unit tests with Mocha, and watch files for changes
$ npm run test:cover    # Run unit tests with code coverage by Istanbul
```

### License

MIT © 2016 Nikolaus Piccolotto
