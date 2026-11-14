import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    checks: ['rate>0.95'],
  },
};

function normalizeBaseUrl(raw) {
  const value = (raw || '').trim();
  if (!value) {
    throw new Error('BACKEND_BASE_URL must be configured');
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
}

const baseUrl = normalizeBaseUrl(__ENV.BACKEND_BASE_URL);
const healthEndpoint = `${baseUrl.replace(/\/$/, '')}/actuator/health`;

export function setup() {
  const res = http.get(healthEndpoint);
  console.log(`health status=${res.status}`);
}

export default function () {
  const response = http.get(healthEndpoint, { tags: { scenario: 'login-smoke' } });
  check(response, {
    'status 200': (res) => res.status === 200,
    'body not empty': (res) => (res.body || '').length > 0,
  });
  sleep(1);
}
