import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const args = {
    strategies: ["balanced", "growth-first", "ecology-first", "policy-first"],
    outDir: path.join("output", "web-game", "strategy-suite"),
    headless: true,
    maxSteps: 240,
    pauseMs: 160,
    minTurn: 20,
    requireEnding: true,
    maxConsoleErrors: 0,
    minPoliciesUsed: 1,
    minResolvedEvents: 1,
    minTradeActions: 1,
    minTradeProfit: -20,
    requireResolvedWhenTriggered: true,
    runsPerStrategy: 3,
    minPassRatePerStrategy: 0.67,
    useStrategyKpiProfiles: true,
    profileFile: path.join("scripts", "game", "strategy-kpi-profiles.json"),
    allowFailures: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!value) {
      continue;
    }
    if (key === "--strategies") {
      args.strategies = value.split(",").map((item) => item.trim()).filter(Boolean);
      i += 1;
    } else if (key === "--out-dir") {
      args.outDir = value;
      i += 1;
    } else if (key === "--headless") {
      args.headless = value !== "0" && value !== "false";
      i += 1;
    } else if (key === "--max-steps") {
      args.maxSteps = Math.max(30, Number.parseInt(value, 10) || 240);
      i += 1;
    } else if (key === "--pause-ms") {
      args.pauseMs = Math.max(50, Number.parseInt(value, 10) || 160);
      i += 1;
    } else if (key === "--min-turn") {
      args.minTurn = Math.max(1, Number.parseInt(value, 10) || 20);
      i += 1;
    } else if (key === "--require-ending") {
      args.requireEnding = value !== "0" && value !== "false";
      i += 1;
    } else if (key === "--max-console-errors") {
      args.maxConsoleErrors = Math.max(0, Number.parseInt(value, 10) || 0);
      i += 1;
    } else if (key === "--min-policies-used") {
      const parsed = Number.parseInt(value, 10);
      args.minPoliciesUsed = Number.isFinite(parsed) ? Math.max(0, parsed) : 1;
      i += 1;
    } else if (key === "--min-resolved-events") {
      const parsed = Number.parseInt(value, 10);
      args.minResolvedEvents = Number.isFinite(parsed) ? Math.max(0, parsed) : 1;
      i += 1;
    } else if (key === "--min-trade-actions") {
      const parsed = Number.parseInt(value, 10);
      args.minTradeActions = Number.isFinite(parsed) ? Math.max(0, parsed) : 1;
      i += 1;
    } else if (key === "--min-trade-profit") {
      const parsed = Number.parseFloat(value);
      args.minTradeProfit = Number.isFinite(parsed) ? parsed : -20;
      i += 1;
    } else if (key === "--require-resolved-events-when-triggered") {
      args.requireResolvedWhenTriggered = value !== "0" && value !== "false";
      i += 1;
    } else if (key === "--runs-per-strategy") {
      args.runsPerStrategy = Math.max(1, Number.parseInt(value, 10) || 3);
      i += 1;
    } else if (key === "--min-pass-rate-per-strategy") {
      const parsed = Number.parseFloat(value);
      args.minPassRatePerStrategy = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.67;
      i += 1;
    } else if (key === "--use-strategy-kpi-profiles") {
      args.useStrategyKpiProfiles = value !== "0" && value !== "false";
      i += 1;
    } else if (key === "--profile-file") {
      args.profileFile = value;
      i += 1;
    } else if (key === "--allow-failures") {
      args.allowFailures = value !== "0" && value !== "false";
      i += 1;
    }
  }

  return args;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function nowId() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function runNode(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function parseRunDir(stdoutText) {
  const lines = String(stdoutText || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.length ? lines[lines.length - 1] : "";
}

function parseJsonStdout(stdoutText) {
  try {
    return JSON.parse(String(stdoutText || "").trim());
  } catch {
    return null;
  }
}

function summarizeSamples(samples) {
  const checks = samples.filter((item) => item.stage === "check" && item.check?.summary);
  const total = samples.length;
  const passed = samples.filter((item) => item.ok).length;
  const passRate = total > 0 ? Number((passed / total).toFixed(3)) : 0;
  const aggregate = {
    avgFinalTurn: 0,
    avgPlacedCoreCount: 0,
    avgPoliciesUsed: 0,
    avgTriggeredEvents: 0,
    avgResolvedEvents: 0,
    avgTradeActions: 0,
    avgTradeProfit: 0,
  };
  if (checks.length > 0) {
    const sums = {
      finalTurn: 0,
      placedCoreCount: 0,
      policiesUsed: 0,
      triggeredEvents: 0,
      resolvedEvents: 0,
      tradeActions: 0,
      tradeProfit: 0,
    };
    for (const item of checks) {
      const kpi = item.check.summary.gameplayKpi || {};
      sums.finalTurn += Number(item.check.summary.finalTurn || 0);
      sums.placedCoreCount += Number(kpi.placedCoreCount || 0);
      sums.policiesUsed += Number(kpi.policiesUsed || 0);
      sums.triggeredEvents += Number(kpi.triggeredEvents || 0);
      sums.resolvedEvents += Number(kpi.resolvedEvents || 0);
      sums.tradeActions += Number(kpi.tradeActions || 0);
      sums.tradeProfit += Number(kpi.tradeProfit || 0);
    }
    const n = checks.length;
    aggregate.avgFinalTurn = Number((sums.finalTurn / n).toFixed(2));
    aggregate.avgPlacedCoreCount = Number((sums.placedCoreCount / n).toFixed(2));
    aggregate.avgPoliciesUsed = Number((sums.policiesUsed / n).toFixed(2));
    aggregate.avgTriggeredEvents = Number((sums.triggeredEvents / n).toFixed(2));
    aggregate.avgResolvedEvents = Number((sums.resolvedEvents / n).toFixed(2));
    aggregate.avgTradeActions = Number((sums.tradeActions / n).toFixed(2));
    aggregate.avgTradeProfit = Number((sums.tradeProfit / n).toFixed(2));
  }
  return { total, passed, failed: total - passed, passRate, aggregate };
}

function loadProfiles(profileFilePath) {
  try {
    const raw = fs.readFileSync(profileFilePath, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // fallback below
  }
  return { default: {} };
}

function buildEffectiveConstraints(args, strategy, profiles) {
  const base = {
    minTurn: args.minTurn,
    requireEnding: args.requireEnding,
    maxConsoleErrors: args.maxConsoleErrors,
    minPoliciesUsed: args.minPoliciesUsed,
    minResolvedEvents: args.minResolvedEvents,
    requireResolvedWhenTriggered: args.requireResolvedWhenTriggered,
    minTradeActions: args.minTradeActions,
    minTradeProfit: args.minTradeProfit,
  };
  if (!args.useStrategyKpiProfiles) {
    return base;
  }
  const defaultProfile = profiles?.default && typeof profiles.default === "object" ? profiles.default : {};
  const strategyProfile = profiles?.[strategy] && typeof profiles[strategy] === "object" ? profiles[strategy] : {};
  return {
    ...base,
    ...defaultProfile,
    ...strategyProfile,
  };
}

function computeCoverage(runResults) {
  const checks = runResults.filter((item) => item.stage === "check" && item.check?.summary);
  const map = {
    endingReached: false,
    policyUsed: false,
    tradeAction: false,
    eventTriggered: false,
    eventResolved: false,
    boardProgress: false,
    longRun: false,
  };

  for (const item of checks) {
    const summary = item.check.summary || {};
    const kpi = summary.gameplayKpi || {};
    if (summary.ending) {
      map.endingReached = true;
    }
    if (Number(kpi.policiesUsed || 0) > 0) {
      map.policyUsed = true;
    }
    if (Number(kpi.tradeActions || 0) > 0) {
      map.tradeAction = true;
    }
    if (Number(kpi.triggeredEvents || 0) > 0) {
      map.eventTriggered = true;
    }
    if (Number(kpi.resolvedEvents || 0) > 0) {
      map.eventResolved = true;
    }
    if (Number(kpi.placedCoreCount || 0) >= 5) {
      map.boardProgress = true;
    }
    if (Number(summary.finalTurn || 0) >= 20) {
      map.longRun = true;
    }
  }

  const total = Object.keys(map).length;
  const covered = Object.values(map).filter(Boolean).length;
  return {
    indicators: map,
    covered,
    total,
    coverageRate: total > 0 ? Number((covered / total).toFixed(3)) : 0,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const suiteId = nowId();
  const suiteDir = path.join(args.outDir, suiteId);
  const runsBase = path.join(suiteDir, "runs");
  ensureDir(runsBase);
  const profiles = loadProfiles(args.profileFile);

  const strategySummaries = [];
  const runResults = [];

  for (const strategy of args.strategies) {
    const effectiveConstraints = buildEffectiveConstraints(args, strategy, profiles);
    const overrideMaxSteps = Number(effectiveConstraints.maxSteps || 0);
    const effectiveMaxSteps = overrideMaxSteps > 0
      ? Math.max(args.maxSteps, overrideMaxSteps)
      : args.maxSteps;

    const samples = [];
    for (let sampleIndex = 1; sampleIndex <= args.runsPerStrategy; sampleIndex += 1) {
      const fullRun = runNode(path.join("scripts", "game", "full-run.mjs"), [
        "--strategy", strategy,
        "--out-dir", runsBase,
        "--headless", args.headless ? "true" : "false",
        "--max-steps", String(effectiveMaxSteps),
        "--pause-ms", String(args.pauseMs),
      ]);

      const runDir = parseRunDir(fullRun.stdout);
      if (fullRun.status !== 0 || !runDir) {
        const failedItem = {
          strategy,
          sampleIndex,
          ok: false,
          stage: "full-run",
          runDir,
          stderr: String(fullRun.stderr || ""),
        };
        samples.push(failedItem);
        runResults.push(failedItem);
        continue;
      }

      const checkRun = runNode(path.join("scripts", "game", "check-full-run.mjs"), [
        "--run-dir", runDir,
        "--min-turn", String(effectiveConstraints.minTurn),
        "--require-ending", effectiveConstraints.requireEnding ? "true" : "false",
        "--max-console-errors", String(effectiveConstraints.maxConsoleErrors),
        "--min-policies-used", String(effectiveConstraints.minPoliciesUsed),
        "--min-resolved-events", String(effectiveConstraints.minResolvedEvents),
        "--min-trade-actions", String(effectiveConstraints.minTradeActions),
        "--min-trade-profit", String(effectiveConstraints.minTradeProfit),
        "--require-resolved-events-when-triggered", effectiveConstraints.requireResolvedWhenTriggered ? "true" : "false",
      ]);

      const checkPayload = parseJsonStdout(checkRun.stdout);
      const item = {
        strategy,
        sampleIndex,
        ok: checkRun.status === 0,
        stage: "check",
        runDir,
        check: checkPayload,
        stderr: String(checkRun.stderr || ""),
      };
      samples.push(item);
      runResults.push(item);
    }

    const sampleSummary = summarizeSamples(samples);
    strategySummaries.push({
      strategy,
      runsPerStrategy: args.runsPerStrategy,
      minPassRatePerStrategy: args.minPassRatePerStrategy,
      effectiveConstraints,
      ok: sampleSummary.passRate >= args.minPassRatePerStrategy,
      ...sampleSummary,
      samples,
    });
  }

  const passedStrategies = strategySummaries.filter((item) => item.ok).length;
  const totalRuns = runResults.length;
  const passedRuns = runResults.filter((item) => item.ok).length;
  const coverage = computeCoverage(runResults);
  const suiteSummary = {
    suiteId,
    suiteDir,
    totalStrategies: strategySummaries.length,
    passedStrategies,
    failedStrategies: strategySummaries.length - passedStrategies,
    strategyPassRate: strategySummaries.length > 0 ? Number((passedStrategies / strategySummaries.length).toFixed(3)) : 0,
    totalRuns,
    passedRuns,
    failedRuns: totalRuns - passedRuns,
    runPassRate: totalRuns > 0 ? Number((passedRuns / totalRuns).toFixed(3)) : 0,
    coverage,
    constraints: {
      minTurn: args.minTurn,
      requireEnding: args.requireEnding,
      maxConsoleErrors: args.maxConsoleErrors,
      minPoliciesUsed: args.minPoliciesUsed,
      minResolvedEvents: args.minResolvedEvents,
      requireResolvedWhenTriggered: args.requireResolvedWhenTriggered,
      minTradeActions: args.minTradeActions,
      minTradeProfit: args.minTradeProfit,
      useStrategyKpiProfiles: args.useStrategyKpiProfiles,
      profileFile: args.profileFile,
      runsPerStrategy: args.runsPerStrategy,
      minPassRatePerStrategy: args.minPassRatePerStrategy,
    },
    strategies: strategySummaries,
    results: runResults,
  };

  fs.writeFileSync(path.join(suiteDir, "suite-summary.json"), JSON.stringify(suiteSummary, null, 2));
  process.stdout.write(JSON.stringify(suiteSummary, null, 2) + "\n");

  if (!args.allowFailures && passedStrategies !== strategySummaries.length) {
    process.exit(1);
  }
}

main();
