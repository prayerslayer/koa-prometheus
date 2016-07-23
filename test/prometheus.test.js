import sinon from 'sinon';
import { expect } from 'chai';
import prometheus, { getMetrics } from '../src/prometheus';
import { MOCK_ROUTER, Counter, Summary, noop, buildRequest, sleep } from './utils';


describe('koa-prometheus', () => {
  describe('middleware', () => {
    let requestRate;
    let responseTime;
    let middleware;
    beforeEach(() => {
      requestRate = sinon.createStubInstance(Counter);
      responseTime = sinon.createStubInstance(Summary);
      middleware = prometheus(MOCK_ROUTER, {
        RequestRate: requestRate,
        ResponseTime: responseTime,
        ignore: [/\.css$/],
      });
    });

    it('should respect ignore option', async(done) => {
      try {
        await middleware(buildRequest('/styles.css'), noop);
        expect(requestRate.inc.called).to.be.false;
        expect(responseTime.observe.called).to.be.false;
        done();
      } catch (e) {
        done(e);
      }
    });

    it('should track response time and request rate', async(done) => {
      try {
        await middleware(buildRequest('/api/products/1'), () => sleep(500));
        expect(requestRate.inc.calledOnce).to.be.true;
        expect(requestRate.inc.calledWithExactly({
          method: 'GET',
          path: '/api/products/:id',
        }, 1)).to.be.true;
        expect(responseTime.observe.calledOnce).to.be.true;
        const [path, observedTime] = responseTime.observe.firstCall.args;
        expect(path).to.deep.equal({
          method: 'GET',
          path: '/api/products/:id',
        });
        expect(observedTime).to.be.at.least(500);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('should strip query params', async(done) => {
      try {
        await middleware(buildRequest('/api/products?page=1'), noop);
        expect(requestRate.inc.calledWithExactly({
          method: 'GET',
          path: '/api/products',
        }, 1)).to.be.true;
        done();
      } catch (e) {
        done(e);
      }
    });
    it('should use url if no route was found', async(done) => {
      try {
        await middleware(buildRequest('/bundle.js'), noop);
        expect(requestRate.inc.calledWithExactly({
          method: 'GET',
          path: '/bundle.js',
        }, 1)).to.be.true;
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  describe('getMetrics', () => {
    it('should return text', () => {
      const metrics = getMetrics();
      expect(metrics).to.be.a.string;
      expect(metrics.length).to.be.above(0);
    });
  });
});
