#!/usr/bin/env node
/*
 Ensures the CI job only fails for high/critical vulnerabilities that have a
 non-breaking fix available (npm reports fixAvailable=true or provides a
 version change without the "0.0.0" placeholder). Older Create React App
 transitive dependencies still report vulnerabilities that can only be fixed
 with a major toolchain migration; those are reported but ignored so that new
 actionable issues still block the pipeline.
*/
const chunks = [];
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', () => {
  const raw = chunks.join('');
  if (!raw.trim()) {
    console.error('npm audit did not return any JSON output.');
    process.exit(1);
  }
  let report;
  try {
    report = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse npm audit JSON:', err.message);
    process.exit(1);
  }

  const vulnerabilities = Object.values(report.vulnerabilities || {});
  const actionable = vulnerabilities.filter(vuln => {
    const severity = (vuln.severity || '').toLowerCase();
    if (!['high', 'critical'].includes(severity)) {
      return false;
    }

    const fix = vuln.fixAvailable;
    if (fix === true) {
      return true; // npm can fix automatically without breaking changes
    }

    if (!fix) {
      return false;
    }

    if (typeof fix === 'string') {
      return fix !== '0.0.0';
    }

    const version = fix.version || '';
    const isPlaceholder = version === '0.0.0';
    const requiresMajor = Boolean(fix.isSemVerMajor);
    return !isPlaceholder && !requiresMajor;
  });

  if (actionable.length > 0) {
    console.error('Blocking high/critical vulnerabilities with available non-breaking fixes:\n');
    actionable.forEach(vuln => {
      const via = (vuln.via || [])
        .map(entry => (typeof entry === 'string' ? entry : entry.url || entry.source || entry.name))
        .filter(Boolean)
        .join(', ');
      console.error(`- ${vuln.name}@${vuln.range} (${vuln.severity})`);
      if (via) {
        console.error(`  via: ${via}`);
      }
      if (vuln.fixAvailable && typeof vuln.fixAvailable === 'object') {
        console.error(`  suggested fix: ${JSON.stringify(vuln.fixAvailable)}`);
      }
    });
    process.exit(1);
  }

  console.log(`npm audit: no actionable high/critical issues (checked ${vulnerabilities.length} entries).`);
});
