import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    runDir: "",
    minTurn: 8,
    requireEnding: true,
    maxConsoleErrors: 0,
    minPoliciesUsed: 0,
    minResolvedEvents: 0,
    minTradeActions: 0,
    minTradeProfit: Number.NEGATIVE_INFINITY,
    requireResolvedWhenTriggered: true,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--run-dir" && value) {
      args.runDir = value;
      i += 1;
    } else if (key === "--min-turn" && value) {
      args.minTurn = Math.max(1, Number.parseInt(value, 10) || 8);
      i += 1;
    } else if (key === "--require-ending" && value) {
      args.requireEnding = value !== "0" && value !== "false";
      i += 1;
    } else if (key === "--max-console-errors" && value) {
      args.maxConsoleErrors = Math.max(0, Number.parseInt(value, 10) || 0);
      i += 1;
    } else if (key === "--min-policies-used" && value) {
      args.minPoliciesUsed = Math.max(0, Number.parseInt(value, 10) || 0);
      i += 1;
    } else if (key === "--min-resolved-events" && value) {
      args.minResolvedEvents = Math.max(0, Number.parseInt(value, 10) || 0);
      i += 1;
    } else if (key === "--min-trade-actions" && value) {
      args.minTradeActions = Math.max(0, Number.parseInt(value, 10) || 0);
      i += 1;
    } else if (key === "--min-trade-profit" && value) {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        args.minTradeProfit = parsed;
      }
      i += 1;
    } else if (key === "--require-resolved-events-when-triggered" && value) {
      args.requireResolvedWhenTriggered = value !== "0" && value !== "false";
      i += 1;
    }
  }
  return args;
}

function latestRunDir(baseDir) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (!entries.length) {
    return "";
  }
  return path.join(baseDir, entries[entries.length - 1]);
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

function main() {
  const args = parseArgs(process.argv);
  const base = path.join("output", "web-game", "full-run");
  const runDir = args.runDir || latestRunDir(base);
  if (!runDir) {
    fail("No run directory found. Run full-run.mjs first.");
  }

  const summary = readJson(path.join(runDir, "summary.json"), null);
  const timeline = readJson(path.join(runDir, "timeline.json"), []);
  const errors = readJson(path.join(runDir, "console-errors.json"), []);

  if (!summary) {
    fail(`Missing summary.json in ${runDir}`);
  }

  const reasons = [];

  if ((summary.finalTurn ?? 0) < args.minTurn) {
    reasons.push(`finalTurn ${summary.finalTurn} < minTurn ${args.minTurn}`);
  }
  if (args.requireEnding && !summary.ending) {
    reasons.push("ending was not reached");
  }
  if ((summary.consoleErrorCount ?? errors.length) > args.maxConsoleErrors) {
    reasons.push(`consoleErrorCount ${summary.consoleErrorCount ?? errors.length} > maxConsoleErrors ${args.maxConsoleErrors}`);
  }
  if (summary.finalError) {
    reasons.push(`finalError present: ${summary.finalError}`);
  }
  if (!Array.isArray(timeline) || timeline.length < 3) {
    reasons.push("timeline is too short");
  }

  const kpi = summary.gameplayKpi || {};
  const policiesUsed = Number(kpi.policiesUsed || 0);
  const triggeredEvents = Number(kpi.triggeredEvents || 0);
  const resolvedEvents = Number(kpi.resolvedEvents || 0);
  const tradeActions = Number(kpi.tradeActions || 0);
  const tradeProfit = Number(kpi.tradeProfit || 0);

  if (policiesUsed < args.minPoliciesUsed) {
    reasons.push(`policiesUsed ${policiesUsed} < minPoliciesUsed ${args.minPoliciesUsed}`);
  }
  const shouldCheckResolvedEvents = !args.requireResolvedWhenTriggered || triggeredEvents > 0;
  if (shouldCheckResolvedEvents && resolvedEvents < args.minResolvedEvents) {
    reasons.push(`resolvedEvents ${resolvedEvents} < minResolvedEvents ${args.minResolvedEvents}`);
  }
  if (tradeActions < args.minTradeActions) {
    reasons.push(`tradeActions ${tradeActions} < minTradeActions ${args.minTradeActions}`);
  }
  if (tradeProfit < args.minTradeProfit) {
    reasons.push(`tradeProfit ${tradeProfit} < minTradeProfit ${args.minTradeProfit}`);
  }

  if (reasons.length > 0) {
    process.stdout.write(JSON.stringify({ ok: false, runDir, reasons, summary }, null, 2) + "\n");
    process.exit(1);
  }

  process.stdout.write(JSON.stringify({ ok: true, runDir, summary }, null, 2) + "\n");
}

main();
