import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function parseArgs(argv) {
  const args = {
    url: "http://127.0.0.1:8000/zh/game/play",
    outDir: "output/web-game/full-run",
    headless: true,
    maxSteps: 220,
    pauseMs: 180,
    locale: "zh",
    strategy: "balanced",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--url" && value) {
      args.url = value;
      i += 1;
    } else if (key === "--out-dir" && value) {
      args.outDir = value;
      i += 1;
    } else if (key === "--headless" && value) {
      args.headless = value !== "0" && value !== "false";
      i += 1;
    } else if (key === "--max-steps" && value) {
      args.maxSteps = Math.max(20, Number.parseInt(value, 10) || 220);
      i += 1;
    } else if (key === "--pause-ms" && value) {
      args.pauseMs = Math.max(50, Number.parseInt(value, 10) || 180);
      i += 1;
    } else if (key === "--locale" && value) {
      args.locale = value;
      i += 1;
    } else if (key === "--strategy" && value) {
      args.strategy = value;
      i += 1;
    }
  }

  return args;
}

function normalizeStrategy(raw) {
  const next = String(raw || "").toLowerCase().trim();
  if (["growth-first", "ecology-first", "policy-first", "balanced"].includes(next)) {
    return next;
  }
  return "balanced";
}

async function loadPlaywrightChromium() {
  try {
    const mod = await import("playwright");
    return mod.chromium;
  } catch {
    const codexHome = process.env.CODEX_HOME
      || (process.env.HOME ? path.join(process.env.HOME, ".codex") : "")
      || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, ".codex") : "");
    const fallbackBase = path.join(codexHome, "skills", "develop-web-game", "node_modules", "playwright");
    const candidates = [
      path.join(fallbackBase, "index.mjs"),
      path.join(fallbackBase, "index.js"),
    ];
    const fallback = candidates.find((candidate) => fs.existsSync(candidate));
    if (!fallback) {
      throw new Error(`Playwright module not found in fallback path: ${fallbackBase}`);
    }
    const mod = await import(pathToFileUrl(fallback));
    return mod.chromium;
  }
}

function pathToFileUrl(filePath) {
  return pathToFileURL(filePath).href;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function nowId() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readState(page) {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text === "function") {
      return window.render_game_to_text();
    }
    return "";
  });
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { error: `state_json_parse_failed: ${String(raw).slice(0, 120)}` };
  }
}

async function readSessionId(page) {
  return page.evaluate(() => window.sessionStorage.getItem("game:lastSessionId") || "");
}

async function capture(page, runDir, label, state, timeline) {
  const safe = label.replace(/[^a-zA-Z0-9_-]/g, "_");
  const shotPath = path.join(runDir, `${safe}.png`);
  const statePath = path.join(runDir, `${safe}.json`);
  await page.screenshot({ path: shotPath, fullPage: true });
  fs.writeFileSync(statePath, JSON.stringify(state || null, null, 2));
  timeline.push({
    at: new Date().toISOString(),
    label,
    shot: path.basename(shotPath),
    state: path.basename(statePath),
    turn: state?.turn ?? null,
    mode: state?.mode ?? null,
    ending: state?.ending?.id ?? null,
  });
}

async function dismissOverlayIfNeeded(page, state) {
  if (!state) {
    return false;
  }

  if (state.mode === "settlement") {
    const continueBtn = page.getByRole("button", { name: /^(Continue|Continue Planning|继续|继续规划)$/i });
    if ((await continueBtn.count()) > 0) {
      await continueBtn.first().click();
      return true;
    }
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      for (const button of buttons) {
        const label = (button.getAttribute("aria-label") || button.textContent || "").trim();
        if (/continue|继续/i.test(label) && !button.disabled) {
          button.click();
          return true;
        }
      }
      return false;
    });
    if (clicked) {
      return true;
    }
  }

  const eventAlertClose = page.locator('[data-tutorial-id="event-alert-close"]').first();
  if ((await eventAlertClose.count()) > 0 && await eventAlertClose.isVisible() && await eventAlertClose.isEnabled()) {
    await eventAlertClose.click();
    return true;
  }

  const errorRetry = page.locator('[data-tutorial-id="error-retry-connection"]').first();
  if ((await errorRetry.count()) > 0 && await errorRetry.isVisible() && await errorRetry.isEnabled()) {
    await errorRetry.click();
    return true;
  }

  const errorAck = page.locator('[data-tutorial-id="error-acknowledge"]').first();
  if ((await errorAck.count()) > 0 && await errorAck.isVisible() && await errorAck.isEnabled()) {
    await errorAck.click();
    return true;
  }

  const tradeHelpClose = page.locator('[data-tutorial-id="trade-help-close"]').first();
  if ((await tradeHelpClose.count()) > 0 && await tradeHelpClose.isVisible() && await tradeHelpClose.isEnabled()) {
    await tradeHelpClose.click();
    return true;
  }

  const tradeModalClose = await page.evaluate(() => {
    const button = document.querySelector('[data-tutorial-id="trade-modal-close"]');
    if (!(button instanceof HTMLButtonElement) || button.disabled) {
      return false;
    }
    button.click();
    return true;
  });
  if (tradeModalClose) {
    return true;
  }

  if (state.mode === "onboarding") {
    const skip = page.getByRole("button", { name: /^(Skip|跳过)$/ });
    if ((await skip.count()) > 0) {
      await skip.first().click();
      return true;
    }
  }

  const closed = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    for (const button of buttons) {
      const label = (button.textContent || button.getAttribute("title") || "").trim();
      if (!label) {
        continue;
      }
      if (/^(Close|关闭|Acknowledge|知道了)$/i.test(label) && !button.disabled) {
        const isInsideOverlay = Boolean(
          button.closest('[role="dialog"]')
          || button.closest('[class*="fixed"]')
          || button.closest('[class*="modal"]'),
        );
        if (!isInsideOverlay) {
          continue;
        }
        button.click();
        return true;
      }
    }
    return false;
  });
  if (closed) {
    return true;
  }

  if (state.error) {
    const ack = page.getByRole("button", { name: /^(Acknowledge|确认|知道了)$/i });
    if ((await ack.count()) > 0) {
      await ack.first().click();
      return true;
    }
  }

  const discardBanner = page.getByText(/Discard Mode Active|弃牌/);
  if ((await discardBanner.count()) > 0) {
    const discardedCore = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("button[draggable]"));
      if (!cards.length) {
        return false;
      }
      cards[0].click();
      return true;
    });
    if (discardedCore) {
      return true;
    }
    const discardedPolicy = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("button")).filter((node) => /Policy/i.test(node.textContent || ""));
      if (!cards.length) {
        return false;
      }
      cards[0].click();
      return true;
    });
    if (discardedPolicy) {
      return true;
    }
  }

  return false;
}

function scoreCoreByStrategy(card, strategy) {
  const industry = Number(card?.coreContinuousIndustryDelta || card?.coreImmediateIndustryDelta || 0);
  const tech = Number(card?.coreContinuousTechDelta || card?.coreImmediateTechDelta || 0);
  const population = Number(card?.coreContinuousPopulationDelta || card?.coreImmediatePopulationDelta || 0);
  const green = Number(card?.coreContinuousGreenDelta || card?.coreImmediateGreenDelta || 0);
  const carbon = Number(card?.coreContinuousCarbonDelta || card?.coreImmediateCarbonDelta || 0);
  const satisfaction = Number(card?.coreContinuousSatisfactionDelta || card?.coreImmediateSatisfactionDelta || 0);
  const lowCarbon = Number(card?.coreContinuousLowCarbonDelta || 0);
  const star = Number(card?.star || 1);

  if (strategy === "growth-first") {
    return (industry * 1.6) + (tech * 1.4) + (population * 1.2) + (satisfaction * 0.8) + (green * 0.2) - (carbon * 1.1) + (lowCarbon * 0.5) + (star * 0.1);
  }
  if (strategy === "ecology-first") {
    return (green * 2.0) - (carbon * 1.8) + (satisfaction * 1.0) + (tech * 0.4) + (industry * 0.2) + (lowCarbon * 0.8);
  }
  if (strategy === "policy-first") {
    const domainBonus = card?.domain === "science" || card?.domain === "society" ? 1.5 : 0;
    return (lowCarbon * 1.2) + (green * 0.9) - (carbon * 1.0) + (satisfaction * 0.8) + (tech * 0.8) + domainBonus;
  }
  return (industry + tech + population + green + satisfaction + lowCarbon) - (carbon * 1.2);
}

function chooseAffordableCoreIndex(state, cardCostMap, cardMetaMap, strategy, excludedCardIds = new Set()) {
  const hand = Array.isArray(state?.hand?.core) ? state.hand.core : [];
  if (!hand.length) {
    return -1;
  }
  const resources = state?.resources || {};
  let bestIndex = -1;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < hand.length; i += 1) {
    if (excludedCardIds.has(hand[i])) {
      continue;
    }
    const cost = cardCostMap.get(hand[i]);
    const cardMeta = cardMetaMap.get(hand[i]);
    if (!cost) {
      const score = scoreCoreByStrategy(cardMeta, strategy);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
      continue;
    }
    const can = (resources.industry ?? 0) >= (cost.industry ?? 0)
      && (resources.tech ?? 0) >= (cost.tech ?? 0)
      && (resources.population ?? 0) >= (cost.population ?? 0)
      && (resources.green ?? 0) >= (cost.green ?? 0);
    if (can) {
      const score = scoreCoreByStrategy(cardMeta, strategy);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
  }
  if (bestIndex >= 0) {
    return bestIndex;
  }
  return -1;
}

function chooseTileKey(state, excluded = new Set()) {
  const placeable = Array.isArray(state?.board?.placeableTiles) ? state.board.placeableTiles : [];
  for (const tile of placeable) {
    if (tile && !excluded.has(tile)) {
      return tile;
    }
  }

  if (state?.board?.recommendedTile) {
    if (!excluded.has(state.board.recommendedTile)) {
      return state.board.recommendedTile;
    }
  }

  const size = Number(state?.board?.size || 0);
  const occupied = new Set((state?.board?.occupied || []).map((item) => item.tile));
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const key = `${row},${col}`;
      if (!occupied.has(key) && !excluded.has(key)) {
        return key;
      }
    }
  }
  return "";
}

async function clickBoardTile(page, tileKey) {
  if (!tileKey) {
    return false;
  }
  const byKey = page.locator(`button[data-board-key="${tileKey}"]`).first();
  if ((await byKey.count()) > 0 && await byKey.isVisible() && await byKey.isEnabled()) {
    try {
      await byKey.click({ timeout: 1500 });
      return true;
    } catch {
      return false;
    }
  }

  const firstPlaceable = page.locator('button[data-tutorial-role="planning-slot"][data-tutorial-placeable="1"]').first();
  if ((await firstPlaceable.count()) > 0 && await firstPlaceable.isVisible() && await firstPlaceable.isEnabled()) {
    try {
      await firstPlaceable.click({ timeout: 1500 });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

async function clickCoreCardByIndex(page, index) {
  if (index < 0) {
    return false;
  }
  return page.evaluate((targetIndex) => {
    const cards = Array.from(document.querySelectorAll("button[draggable]")).filter((node) => node.offsetParent !== null);
    const target = cards[targetIndex];
    if (!target) {
      return false;
    }
    target.click();
    return true;
  }, index);
}

async function clickPolicyCardByIndex(page, index) {
  if (index < 0) {
    return false;
  }
  return page.evaluate((targetIndex) => {
    const cards = Array.from(document.querySelectorAll("button")).filter((node) => {
      return node.offsetParent !== null && /Policy/i.test(node.textContent || "");
    });
    const target = cards[targetIndex];
    if (!target) {
      return false;
    }
    target.click();
    return true;
  }, index);
}

async function clickDiscardCard(page, handType) {
  return page.evaluate((type) => {
    const selector = type === "policy" ? 'button[data-tutorial-role="policy-card"]' : 'button[data-tutorial-role="core-card"]';
    const cards = Array.from(document.querySelectorAll(selector)).filter((node) => node instanceof HTMLButtonElement);
    if (!cards.length) {
      return false;
    }
    (cards[0]).click();
    return true;
  }, handType);
}

async function clickPrimaryAction(page) {
  return page.evaluate(() => {
    function clickFirst(patterns) {
      const buttons = Array.from(document.querySelectorAll("button"));
      for (const button of buttons) {
        const label = (button.textContent || "").trim();
        const visible = button.offsetParent !== null;
        if (!visible || button.disabled) {
          continue;
        }
        if (patterns.some((regex) => regex.test(label))) {
          button.click();
          return true;
        }
      }
      return false;
    }

    if (clickFirst([/^DEPLOY$/i])) {
      return "deploy";
    }
    if (clickFirst([/^EXECUTE$/i])) {
      return "execute";
    }
    if (clickFirst([/^End Turn$/i, /^结束回合$/])) {
      return "end_turn";
    }
    return "none";
  });
}

function decideTradeType(strategy, state) {
  const quota = Number(state?.trade?.quota || 0);
  const price = Number(state?.trade?.price || 0);
  const carbon = Number(state?.metrics?.carbon || 0);
  const profit = Number(state?.trade?.profit || 0);
  if (strategy === "ecology-first") {
    return carbon > 90 || quota < 8 ? "buy" : "sell";
  }
  if (strategy === "growth-first") {
    if (profit < -35) {
      return "sell";
    }
    return price >= 2.0 ? "sell" : "buy";
  }
  if (strategy === "policy-first") {
    return quota < 10 ? "buy" : "sell";
  }
  return quota > 5 ? "sell" : "buy";
}

function decideTradeAmount(strategy, state) {
  const quota = Number(state?.trade?.quota || 0);
  const profit = Number(state?.trade?.profit || 0);
  if (strategy === "growth-first") {
    if (profit < -35) {
      return quota > 6 ? 3 : 1;
    }
    return quota > 10 ? 2 : 1;
  }
  if (strategy === "ecology-first") {
    return 1;
  }
  if (strategy === "policy-first") {
    return quota > 15 ? 2 : 1;
  }
  return quota > 8 ? 2 : 1;
}

async function maybeTrade(page, state, strategy) {
  if (!state?.trade?.windowOpened) {
    return false;
  }

  const closeTradeHelpOverlay = async () => page.evaluate(() => {
    const button = document.querySelector('[data-tutorial-id="trade-help-close"]');
    if (!(button instanceof HTMLButtonElement) || button.disabled) {
      return false;
    }
    button.click();
    return true;
  });
  if (await closeTradeHelpOverlay()) {
    await wait(80);
  }

  const run = page.getByRole("button", { name: /^(Execute Trade|执行交易)$/i });
  if ((await run.count()) === 0 || !(await run.first().isVisible())) {
    const openTrade = page.locator('[data-tutorial-id="trade-button"]').first();
    if ((await openTrade.count()) > 0 && await openTrade.isVisible() && await openTrade.isEnabled()) {
      await openTrade.click();
      await wait(120);
    }
  }
  if (await closeTradeHelpOverlay()) {
    await wait(80);
  }

  const selectedType = decideTradeType(strategy, state);
  const amount = decideTradeAmount(strategy, state);
  const tradeTypeName = selectedType === "sell" ? /^(Sell Quota|卖出配额)$/ : /^(Buy Quota|买入配额)$/;
  const tradeTypeBtn = page.getByRole("button", { name: tradeTypeName });
  if ((await tradeTypeBtn.count()) > 0) {
    await tradeTypeBtn.first().click();
  }

  const input = page.locator('input[type="number"]').first();
  if ((await input.count()) > 0) {
    await input.fill(String(amount));
  }

  if ((await run.count()) > 0 && await run.first().isEnabled()) {
    await run.first().click();
    return true;
  }
  return false;
}

async function fetchCardCatalog(page, locale) {
  return page.evaluate(async (nextLocale) => {
    try {
      const response = await fetch("/api/v1/game/cards?includePolicy=true", {
        method: "GET",
        headers: { "Accept-Language": nextLocale || "zh" },
      });
      const text = await response.text();
      const json = JSON.parse(text);
      return json?.data?.items || [];
    } catch {
      return [];
    }
  }, locale);
}

async function fetchSessionStateById(page, sessionId) {
  if (!sessionId) {
    return null;
  }
  return page.evaluate(async (id) => {
    try {
      const response = await fetch(`/api/v1/game/sessions/${id}`, {
        method: "GET",
        headers: { "Accept-Language": "zh" },
      });
      const text = await response.text();
      const json = JSON.parse(text);
      return json?.data || null;
    } catch {
      return null;
    }
  }, sessionId);
}

function choosePolicyIndex(state, cardMetaMap, strategy) {
  const hand = Array.isArray(state?.hand?.policy) ? state.hand.policy : [];
  if (!hand.length) {
    return -1;
  }

  if (Array.isArray(state?.activeNegativeEvents) && state.activeNegativeEvents.length > 0) {
    const firstEvent = String(state.activeNegativeEvents[0]?.eventType || "");
    const preferred = {
      flood: ["card063", "card064"],
      sea_level_rise: ["card062", "card066"],
      citizen_protest: ["card067", "card068"],
    };
    const targets = preferred[firstEvent] || [];
    for (const id of targets) {
      const idx = hand.indexOf(id);
      if (idx >= 0) {
        return idx;
      }
    }
  }

  if (strategy === "policy-first") {
    return 0;
  }

  let bestIndex = 0;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < hand.length; i += 1) {
    const card = cardMetaMap.get(hand[i]);
    const green = Number(card?.policyImmediateGreenDelta || 0);
    const carbon = Number(card?.policyImmediateCarbonDelta || 0);
    const satisfaction = Number(card?.policyImmediateSatisfactionDelta || 0);
    const quota = Number(card?.policyImmediateQuotaDelta || 0);
    const score = (green * 1.2) - (carbon * 1.3) + (satisfaction * 0.9) + (quota * 0.7);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function shouldUsePolicyNow(state, strategy) {
  const turn = Number(state?.turn || 1);
  const hasPolicy = Array.isArray(state?.hand?.policy) && state.hand.policy.length > 0;
  if (!hasPolicy) {
    return false;
  }
  if (Array.isArray(state?.activeNegativeEvents) && state.activeNegativeEvents.length > 0) {
    return true;
  }
  if (strategy === "policy-first") {
    return turn >= 4;
  }
  if (strategy === "balanced") {
    return turn >= 8 && turn % 4 === 0;
  }
  if (strategy === "ecology-first") {
    return turn >= 10 && turn % 5 === 0;
  }
  return false;
}

function buildGameplayKpi(finalState, sessionData) {
  const pondState = sessionData?.pondState || {};
  const policyHistory = Array.isArray(pondState.policyHistory) ? pondState.policyHistory : [];
  const uniquePoliciesUsed = new Set(
    policyHistory
      .map((item) => String(item.cardId || item.policyId || item.id || ""))
      .filter(Boolean),
  ).size;
  const eventStats = pondState.eventStats || {};
  const tradeHistory = Array.isArray(pondState.tradeHistory)
    ? pondState.tradeHistory
    : (Array.isArray(pondState?.carbonTrade?.history) ? pondState.carbonTrade.history : []);
  const tradeActions = tradeHistory.filter((item) => {
    const action = String(item.action || "").toLowerCase();
    return action === "buy" || action === "sell";
  }).length;
  const placedCoreCount = Array.isArray(pondState.placedCore) ? pondState.placedCore.length : 0;
  const settlementTurns = Array.isArray(pondState.settlementHistory) ? pondState.settlementHistory.length : 0;
  const resolvedEvents = Number(eventStats.negativeResolved || 0);
  const triggeredEvents = Number(eventStats.negativeTriggered || 0);
  const eventResolveRate = Number(eventStats.resolveRate || 0);
  const tradeProfit = Number(finalState?.trade?.profit || pondState?.carbonTrade?.profit || 0);
  const finalTurn = Number(finalState?.turn || pondState?.turn || 0);
  const lowCarbonScore = Number(pondState?.metrics?.lowCarbonScore || 0);
  const lowCarbonTarget = Number(pondState?.lowCarbonScoreBreakdown?.target || 0);
  const lowCarbonGap = Number(pondState?.lowCarbonScoreBreakdown?.gapToTarget || 0);

  return {
    finalTurn,
    placedCoreCount,
    settlementTurns,
    policiesUsed: policyHistory.length,
    uniquePoliciesUsed,
    tradeActions,
    tradeProfit,
    triggeredEvents,
    resolvedEvents,
    eventResolveRate,
    lowCarbonScore,
    lowCarbonTarget,
    lowCarbonGap,
  };
}

function shouldIgnoreConsoleError(text) {
  const normalized = String(text || "").toLowerCase();
  return normalized.includes("net::err_connection_closed")
    || normalized.includes("net::err_network_changed");
}

async function main() {
  const args = parseArgs(process.argv);
  const strategy = normalizeStrategy(args.strategy);
  const runId = nowId();
  const runDir = path.join(args.outDir, runId);
  ensureDir(runDir);

  const chromium = await loadPlaywrightChromium();
  const browser = await chromium.launch({
    headless: args.headless,
    args: ["--use-gl=angle", "--use-angle=swiftshader"],
  });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!shouldIgnoreConsoleError(text)) {
        consoleErrors.push({ type: "console.error", text, at: new Date().toISOString() });
      }
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push({ type: "pageerror", text: String(err), at: new Date().toISOString() });
  });
  page.on("response", async (response) => {
    const status = response.status();
    if (status < 500) {
      return;
    }
    const url = response.url();
    if (!/\/api\//.test(url)) {
      return;
    }
    consoleErrors.push({
      type: "http.error",
      status,
      url,
      at: new Date().toISOString(),
    });
  });

  await page.goto(args.url, { waitUntil: "domcontentloaded" });
  await wait(900);

  const cardCatalog = await fetchCardCatalog(page, args.locale);
  const cardCostMap = new Map(cardCatalog.filter((card) => card.cardType === "core").map((card) => [card.cardId, card.unlockCost || {}]));
  const cardMetaMap = new Map(cardCatalog.map((card) => [card.cardId, card]));
  const timeline = [];

  let state = await readState(page);
  await capture(page, runDir, "step-000-init", state, timeline);

  let steps = 0;
  let guardNoTurnChange = 0;
  let lastTurn = Number(state?.turn || 0);
  const rejectedTiles = new Map();
  let rejectedCoreIds = new Set();

  while (steps < args.maxSteps) {
    steps += 1;
    const currentUrl = page.url();
    if (!currentUrl.includes("/game/play")) {
      await page.goto(args.url, { waitUntil: "domcontentloaded" });
      await wait(Math.max(500, args.pauseMs));
    }
    state = await readState(page);
    if (!state) {
      await wait(args.pauseMs);
      continue;
    }

    if (state.ending) {
      await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-ending`, state, timeline);
      break;
    }

    const overlayHandled = await dismissOverlayIfNeeded(page, state);
    if (overlayHandled) {
      await wait(args.pauseMs);
      await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-overlay`, await readState(page), timeline);
      continue;
    }
    if (state.mode === "settlement") {
      await wait(args.pauseMs);
      await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-settlement-wait`, await readState(page), timeline);
      continue;
    }

    if (state?.pendingDiscard?.active) {
      const policyRequired = Math.max(0, Number(state.pendingDiscard.policyRequired || 0));
      const coreRequired = Math.max(0, Number(state.pendingDiscard.coreRequired || 0));
      const hasPolicy = Array.isArray(state?.hand?.policy) && state.hand.policy.length > 0;
      const hasCore = Array.isArray(state?.hand?.core) && state.hand.core.length > 0;
      let discarded = false;
      if (policyRequired > 0 && hasPolicy) {
        discarded = await clickDiscardCard(page, "policy");
      } else if (coreRequired > 0 && hasCore) {
        discarded = await clickDiscardCard(page, "core");
      } else if (hasPolicy) {
        discarded = await clickDiscardCard(page, "policy");
      } else if (hasCore) {
        discarded = await clickDiscardCard(page, "core");
      }
      if (discarded) {
        await wait(args.pauseMs);
        await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-discard`, await readState(page), timeline);
        continue;
      }
    }

    if (!state.selectedCoreId && !state.selectedPolicyId && Array.isArray(state?.hand?.policy) && state.hand.policy.length > 0) {
      const shouldTryPolicy = shouldUsePolicyNow(state, strategy);
      if (shouldTryPolicy) {
        const index = choosePolicyIndex(state, cardMetaMap, strategy);
        if (await clickPolicyCardByIndex(page, index)) {
          await wait(args.pauseMs);
          await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-select-policy`, await readState(page), timeline);
          continue;
        }
      }
    }

    const corePlacedThisTurn = Boolean(state?.actionFlags?.corePlacedThisTurn);
    if (!corePlacedThisTurn && !state.selectedCoreId && Array.isArray(state?.hand?.core) && state.hand.core.length > 0) {
      const targetIndex = chooseAffordableCoreIndex(state, cardCostMap, cardMetaMap, strategy, rejectedCoreIds);
      if (await clickCoreCardByIndex(page, targetIndex)) {
        await wait(args.pauseMs);
        await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-select-core`, await readState(page), timeline);
        continue;
      }
    }

    if (!corePlacedThisTurn && state.selectedCoreId && !state.selectedTile) {
      const placeableTiles = Array.isArray(state?.board?.placeableTiles) ? state.board.placeableTiles : [];
      if (!placeableTiles.length) {
        rejectedCoreIds.add(String(state.selectedCoreId));
        const selectedIndex = Array.isArray(state?.hand?.core) ? state.hand.core.indexOf(String(state.selectedCoreId)) : -1;
        if (selectedIndex >= 0 && await clickCoreCardByIndex(page, selectedIndex)) {
          await wait(args.pauseMs);
          await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-deselect-core`, await readState(page), timeline);
          continue;
        }
      }
      const excluded = rejectedTiles.get(String(state.selectedCoreId)) || new Set();
      const tileKey = chooseTileKey(state, excluded);
      if (tileKey) {
        const clicked = await clickBoardTile(page, tileKey);
        if (clicked) {
          await wait(args.pauseMs);
          await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-select-tile`, await readState(page), timeline);
          continue;
        }
      }
    }

    const activeEventCount = Array.isArray(state?.activeNegativeEvents) ? state.activeNegativeEvents.length : 0;
    const allowTradeBeforePolicy = strategy === "policy-first" && activeEventCount === 0;
    const shouldPrioritizeCardAction = Boolean(state?.selectedCoreId && state?.selectedTile)
      || (Boolean(state?.selectedPolicyId) && !allowTradeBeforePolicy);
    if (!shouldPrioritizeCardAction) {
      await maybeTrade(page, state, strategy);
    }
    const action = await clickPrimaryAction(page);

    if (action === "none" && state.selectedCoreId && state.selectedTile) {
      const key = String(state.selectedCoreId);
      if (!rejectedTiles.has(key)) {
        rejectedTiles.set(key, new Set());
      }
      rejectedTiles.get(key).add(String(state.selectedTile));
      const nextTile = chooseTileKey(state, rejectedTiles.get(key));
      if (nextTile) {
        await clickBoardTile(page, nextTile);
      }
    }

    await wait(args.pauseMs);
    const nextState = await readState(page);
    await capture(page, runDir, `step-${String(steps).padStart(3, "0")}-${action}`, nextState, timeline);

    const sameTurn = Number(nextState?.turn || 0) === Number(state?.turn || 0);
    const sameCore = String(nextState?.selectedCoreId || "") === String(state?.selectedCoreId || "");
    const sameTile = String(nextState?.selectedTile || "") === String(state?.selectedTile || "");
    const placementBlocked = action === "deploy"
      && sameTurn
      && sameCore
      && sameTile
      && typeof nextState?.error === "string"
      && (nextState.error.includes("不可放置") || nextState.error.includes("adjacent") || nextState.error.includes("must") || nextState.error.includes("资源不足"));

    if (placementBlocked && nextState?.selectedCoreId && nextState?.selectedTile) {
      const key = String(nextState.selectedCoreId);
      if (!rejectedTiles.has(key)) {
        rejectedTiles.set(key, new Set());
      }
      rejectedTiles.get(key).add(String(nextState.selectedTile));
      const nextTile = chooseTileKey(nextState, rejectedTiles.get(key));
      if (nextTile) {
        await clickBoardTile(page, nextTile);
      }
    }

    const nextTurn = Number(nextState?.turn || 0);
    if (nextTurn === lastTurn) {
      guardNoTurnChange += 1;
    } else {
      guardNoTurnChange = 0;
      lastTurn = nextTurn;
      rejectedCoreIds = new Set();
    }

    if (guardNoTurnChange >= 18) {
      break;
    }
  }

  const finalState = await readState(page);
  await capture(page, runDir, "step-final", finalState, timeline);

  const sessionId = await readSessionId(page);
  const sessionData = await fetchSessionStateById(page, sessionId);
  const gameplayKpi = buildGameplayKpi(finalState, sessionData);

  fs.writeFileSync(path.join(runDir, "timeline.json"), JSON.stringify(timeline, null, 2));
  fs.writeFileSync(path.join(runDir, "console-errors.json"), JSON.stringify(consoleErrors, null, 2));
  fs.writeFileSync(
    path.join(runDir, "summary.json"),
    JSON.stringify(
      {
        runId,
        url: args.url,
        strategy,
        sessionId,
        finalTurn: finalState?.turn ?? null,
        maxTurn: finalState?.maxTurn ?? null,
        ending: finalState?.ending ?? null,
        finalMode: finalState?.mode ?? null,
        finalError: finalState?.error ?? null,
        lastMessage: finalState?.lastMessage ?? "",
        consoleErrorCount: consoleErrors.length,
        steps,
        gameplayKpi,
      },
      null,
      2,
    ),
  );

  await browser.close();
  process.stdout.write(`${runDir}\n`);
}

main().catch((err) => {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
});
