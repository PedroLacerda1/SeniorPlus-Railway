import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    checks: ['rate>0.95'],
  },
};

const DEFAULT_BASE_URL = 'https://seniorplus-backend.up.railway.app';

function normalizeBaseUrl(raw) {
  const value = (raw || '').trim();
  if (!value) {
    return DEFAULT_BASE_URL;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
}

const baseUrl = normalizeBaseUrl(__ENV.BACKEND_BASE_URL);
const healthEndpoint = `${baseUrl.replace(/\/$/, '')}/health`;

export default function () {
  const response = http.get(healthEndpoint, { tags: { scenario: 'login-smoke' } });
  check(response, {
    'status 200': (res) => res.status === 200,
    'body not empty': (res) => (res.body || '').length > 0,
  });
  sleep(1);
}
