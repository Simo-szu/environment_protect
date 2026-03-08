import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    suiteSummary: "",
    maxConsoleErrors: 0,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!value) {
      continue;
    }
    if (key === "--suite-summary") {
      args.suiteSummary = value;
      i += 1;
    } else if (key === "--max-console-errors") {
      args.maxConsoleErrors = Math.max(0, Number.parseInt(value, 10) || 0);
      i += 1;
    }
  }

  return args;
}

function latestSuiteSummaryPath(baseDir) {
  if (!fs.existsSync(baseDir)) {
    return "";
  }
  const entries = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (entries.length === 0) {
    return "";
  }
  return path.join(baseDir, entries[entries.length - 1], "suite-summary.json");
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function collectViolations(suiteSummary, maxConsoleErrors) {
  const rows = Array.isArray(suiteSummary.results) ? suiteSummary.results : [];
  const violations = [];

  for (const row of rows) {
    const summary = row?.check?.summary;
    if (!summary || typeof summary !== "object") {
      continue;
    }
    const count = Number(summary.consoleErrorCount || 0);
    if (count > maxConsoleErrors) {
      violations.push({
        strategy: String(row.strategy || ""),
        runDir: String(row.runDir || ""),
        consoleErrorCount: count,
        maxConsoleErrors,
      });
    }
  }

  return violations;
}

function main() {
  const args = parseArgs(process.argv);
  const suiteSummaryPath = args.suiteSummary || latestSuiteSummaryPath(path.join("output", "web-game", "strategy-suite"));
  if (!suiteSummaryPath) {
    fail("No suite summary found. Run strategy-suite first or pass --suite-summary.");
  }
  if (!fs.existsSync(suiteSummaryPath)) {
    fail(`Suite summary not found: ${suiteSummaryPath}`);
  }

  const summary = readJson(suiteSummaryPath);
  const violations = collectViolations(summary, args.maxConsoleErrors);
  const payload = {
    ok: violations.length === 0,
    suiteSummaryPath,
    suiteId: String(summary.suiteId || ""),
    maxConsoleErrors: args.maxConsoleErrors,
    totalRuns: Number(summary.totalRuns || 0),
    violations,
  };

  process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  if (violations.length > 0) {
    process.exit(1);
  }
}

main();
