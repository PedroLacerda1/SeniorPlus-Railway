# Security scans

The CI job `tests/security/dependency-scan.sh` now has two stages:

1. `mvn -pl backend -am org.owasp:dependency-check-maven:${OWASP_DC_VERSION:-12.1.0}:check -DskipTests=true` keeps the backend dependencies
   patched. We recently bumped `mysql-connector-j` to `8.4.0`, forced `commons-lang3` to `3.19.0`, and overrode `org.eclipse.angus`
   artifacts to `2.1.0-M1` to address CVE-2025-7962 (SMTP injection). The environment variable `OWASP_DC_VERSION` lets us pin
   Dependency-Check to a stable release to avoid upstream regressions (at the moment usamos 12.1.0 porque é a primeira versão
   com suporte aos novos valores CVSS v4 como `SAFETY`, que derrubavam o job em 11.1.1). Também incluímos um override explícito para
   `com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.17.2`, pois o projeto upstream já anunciou que poderá migrar para 2.20.x assim
   que estiver disponível; deixar o override evita ficar refém de uma versão inexistente no Maven Central. Não force versões antigas de `open-vulnerability-clients`:
   o cliente padrão incluído pelo plugin já entende CVSS v4 e qualquer downgrade volta a causar erros de parse. Sempre que `NVD_API_KEY` estiver definido no ambiente,
   o script adiciona `-Dnvd.api.key=$NVD_API_KEY` automaticamente para acelerar o download da base. Também desativamos o analisador OSS Index porque o feed anônimo
   está retornando `401/429` intermitentes; reative apenas quando tiver credenciais dedicadas.
2. `npm audit --production --audit-level=high --json | node ../tests/security/filter-audit.js` checks the frontend dependency graph.
   The helper script fails the build only when a high/critical advisory has a non-breaking fix (as reported by `npm audit`).
   Vulnerabilities that currently require a full Create React App toolchain replacement are surfaced in the logs but will not block
   the pipeline. When we eventually migrate away from CRA (e.g., Vite or custom webpack), we can drop the filter.

To fail the build for an advisory that is currently ignored, update `tests/security/filter-audit.js` so that the condition for treating
an issue as "actionable" matches your new policy.
