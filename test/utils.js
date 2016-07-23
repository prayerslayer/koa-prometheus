export const MOCK_ROUTER = {
  stack: [{
    regexp: /^\/api\/products\/.+$/i,
    path: '/api/products/:id',
  }, {
    regexp: /^\/api\/products$/i,
    path: '/api/products',
  }],
};

export class Counter {
  inc() {}
}

export class Summary {
  observe() {}
}

export function noop() {}

export function buildRequest(url, method = 'GET') {
  return {
    request: {
      url,
      method,
    },
  };
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
