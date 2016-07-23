/**
 * koa-prometheus
 *
 * Copyright © 2016 Nikolaus Piccolotto. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { Summary, Counter, register } from 'prom-client';

const ResponseTime = new Summary(
  'response_time_ms', 'ms to handle a request',
  ['method', 'path']);
const RequestRate = new Counter(
  'request_rate', 'number of requests to a route',
  ['method', 'path']);

export function getMetrics() {
  return register.metrics();
}

/**
 * Middleware-generating function. Call this during app.use().
 * Will track request duration and number of requests for every route.
 *
 * @param router The instance of your koa-router.
 * @param opts Options to provide for the middleware. Currently takes only `ignore`,
 * an array of regexes that will be
 * matched against every URL to decide if they should not be measured with prometheus
 * @returns {function} Prometheus middleware
 */
export default function generatePrometheusMiddleware(router, opts = {
  ResponseTime,
  RequestRate,
  ignore: [],
}) {
  const ROUTES = router.stack.map(({ regexp, path }) => ({ regexp, path }));

  /**
   * Maps a relative URL that was requested to a route.
   *
   * @param {string} url URL requested
   * @returns {string} Route matched or the URL without query parameters
   */
  function mapToRoute(url) {
    const urlWithoutParams = url.replace(/\?.*$/, ''); // strip query params, who cares
    const matchingRoutes = ROUTES.filter(route => new RegExp(route.regexp).test(urlWithoutParams));
    return matchingRoutes.length === 0 ? urlWithoutParams : matchingRoutes[0].path;
  }

  /**
   * Takes a relative URL requested and decides if it should be measured.
   *
   * @param url URL requested
   * @returns {boolean} False if metrics will be collected
   */
  function shouldIgnoreRequest(url) {
    return Array.isArray(opts.ignore) ? opts.ignore.some(regex => regex.test(url)) : false;
  }

  return async function prometheus(ctx, next) {
    const { method, url } = ctx.request;
    const ignore = shouldIgnoreRequest(url);
    if (ignore) {
      // if it should not be tracked, just call next
      await next();
    } else {
      // otherwise map to route
      const path = mapToRoute(url);
      // track request rate
      opts.RequestRate.inc({ method, path }, 1);

      // track time to respond
      const start = Date.now();
      await next();
      const duration = Date.now() - start;
      opts.ResponseTime.observe({ method, path }, duration);
    }
  };
}
