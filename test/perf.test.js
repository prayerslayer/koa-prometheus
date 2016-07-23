import sinon from 'sinon';
import Progress from 'progress';
import { expect } from 'chai';
import prometheus from '../src/prometheus';
import { MOCK_ROUTER, Counter, Summary, buildRequest, sleep } from './utils';

const minus = x => y => y - x;

describe('koa-prometheus', () => {
  describe('perf', () => {
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

    [[10000, 10], [1000, 100], [100, 1000]]
      .forEach(([count, pause]) => {
        it(`Perf: ${count} calls of ${pause} ms duration`, async function test(done) {
          this.timeout(2 * pause * count);
          try {
            const bar = new Progress(`${count} calls, ${pause} ms duration: ` +
              ':bar :percent :elapsed s elapsed, :eta s remaining', {
                total: count,
                complete: '#',
                incomplete: '_',
                width: 100,
              });
            for (let i = 0; i < count; i++) {
              await middleware(buildRequest('/bundle.js'), () => sleep(pause));
              bar.tick();
            }
            // get average request time
            const delta = minus(pause);
            const overhead = responseTime.observe.args
              .map(args => args[1])
              .reduce((s, t) => s + delta(t), 0);
            const avgOverhead = overhead / count;
            expect(avgOverhead).to.be.below(5);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
  });

});
