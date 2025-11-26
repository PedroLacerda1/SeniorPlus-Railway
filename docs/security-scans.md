# Security scans

The CI job `tests/security/dependency-scan.sh` now has two stages:

1. `mvn -pl backend -am org.owasp:dependency-check-maven:${OWASP_DC_VERSION:-11.1.1}:check -DskipTests=true` keeps the backend dependencies
   patched. We recently bumped `mysql-connector-j` to `8.4.0` and added an explicit `commons-lang3` dependency at `3.19.0` to satisfy the
   latest CVE alerts. The environment variable `OWASP_DC_VERSION` lets us pin Dependency-Check to a stable release to avoid upstream
   regressions (currently 11.1.1 because >=12.1.0 tenta baixar `jackson-datatype-jsr310:2.20.1`, que ainda não existe no Maven Central).
2. `npm audit --production --audit-level=high --json | node ../tests/security/filter-audit.js` checks the frontend dependency graph.
   The helper script fails the build only when a high/critical advisory has a non-breaking fix (as reported by `npm audit`).
   Vulnerabilities that currently require a full Create React App toolchain replacement are surfaced in the logs but will not block
   the pipeline. When we eventually migrate away from CRA (e.g., Vite or custom webpack), we can drop the filter.

To fail the build for an advisory that is currently ignored, update `tests/security/filter-audit.js` so that the condition for treating
an issue as "actionable" matches your new policy.
