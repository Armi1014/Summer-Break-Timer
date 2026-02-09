const timeZone = "Europe/Budapest";

const schoolYearStart = {
  year: 2025,
  month: 9,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
};

const lastTeachingDay = {
  year: 2026,
  month: 6,
  day: 19,
  hour: 0,
  minute: 0,
  second: 0,
};

const summerBreakStart = {
  year: 2026,
  month: 6,
  day: 20,
  hour: 0,
  minute: 0,
  second: 0,
};

const otherBreaks = [
  {
    id: "autumn",
    start: { year: 2025, month: 10, day: 23 },
    end: { year: 2025, month: 11, day: 2 },
  },
  {
    id: "winter",
    start: { year: 2025, month: 12, day: 20 },
    end: { year: 2026, month: 1, day: 4 },
  },
  {
    id: "spring",
    start: { year: 2026, month: 4, day: 2 },
    end: { year: 2026, month: 4, day: 12 },
  },
];

const dtfCache = new Map();

const elements = {
  root: document.documentElement,
  wrap: document.querySelector(".wrap"),
  badge: document.getElementById("badge"),
  headline: document.getElementById("headline"),
  intro: document.getElementById("intro"),
  lastTeachingLabel: document.getElementById("lastTeachingLabel"),
  summerBreakLabel: document.getElementById("summerBreakLabel"),
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  daysLabel: document.getElementById("daysLabel"),
  hoursLabel: document.getElementById("hoursLabel"),
  minutesLabel: document.getElementById("minutesLabel"),
  secondsLabel: document.getElementById("secondsLabel"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  progressBar: document.querySelector(".progress-bar"),
  budapestClock: document.getElementById("budapestClock"),
  lastTeachingDay: document.getElementById("lastTeachingDay"),
  summerBreakStart: document.getElementById("summerBreakStart"),
  status: document.getElementById("status"),
  note: document.getElementById("note"),
  languageButtons: document.querySelectorAll("[data-lang]"),
  themeToggle: document.getElementById("themeToggle"),
  breaksToggle: document.getElementById("breaksToggle"),
  breaksPanel: document.getElementById("breaksPanel"),
  breaksTitle: document.getElementById("breaksTitle"),
  breaksList: document.getElementById("breaksList"),
  breaksCountdowns: document.getElementById("breaksCountdowns"),
  survivedLabel: document.getElementById("survivedLabel"),
  survivedDays: document.getElementById("survivedDays"),
  remainingTeachingDays: document.getElementById("remainingTeachingDays"),
  countdownA11y: document.getElementById("countdownA11y"),
};

const prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canAnimate = typeof window.anime === "function" && !prefersReducedMotion;
const lastValues = {
  days: null,
  hours: null,
  minutes: null,
  seconds: null,
};

let breakCountdownNodes = [];
let lastAccessibleCountdown = "";

const translations = {
  hu: {
    locale: "hu-HU",
    htmlLang: "hu",
    pageTitle: "Nyári szünet visszaszámláló",
    badge: "Magyar tanév 2025/2026",
    headline: "Nyári szünet visszaszámláló",
    intro:
      "Színes, pontos és Budapest-időre hangolt visszaszámlálás a magyar iskolák nyári szünetéig.",
    lastTeachingLabel: "Utolsó tanítási nap",
    summerBreakLabel: "Nyári szünet kezdete",
    daysLabel: "nap",
    hoursLabel: "óra",
    minutesLabel: "perc",
    secondsLabel: "másodperc",
    survivedLabel: "Teljesített tanítási napok",
    survivedDaysValue: "{completed} / {total} nap kész",
    remainingTeachingDays: "Hátra: {remaining} tanítási nap",
    progressLabel: "Tanév haladása: {percent}%",
    budapestTimeLabel: "Budapest idő: {time}",
    statusDefault: "Minden nap közelebb a nyárhoz.",
    statusDone: "Itt a nyár! Jó pihenést!",
    weekendWish: "Kellemes hétvégét!",
    otherBreaksButton: "További szünetek",
    otherBreaksTitle: "További tanítási szünetek",
    breakCountdownTitle: "{break} visszaszámláló",
    breakDaysLeftLine: "Hétköznapok hátra: {weekdays} · Hétvégi napok hátra: {weekendDays}",
    otherBreakLabels: {
      autumn: "Őszi szünet",
      winter: "Téli szünet",
      spring: "Tavaszi szünet",
    },
    countdownAria: "Hátralévő idő a nyári szünetig: {days} nap, {hours} óra, {minutes} perc.",
    quotes: [
      "Ma is tettél valamit, ami közelebb visz a céljaidhoz.",
      "Egy apró lépés ma, nagy lendület holnap.",
      "A kitartásod építi a nyarad emlékeit.",
      "Minden nap egy új esély a fejlődésre.",
      "A pihenés akkor a legédesebb, ha megdolgoztál érte.",
      "Légy büszke magadra: haladsz.",
      "A nap fénye ma is veled van.",
      "Tarts ki, a legjobb pillanatok úton vannak.",
      "A türelem ma is meghozza a gyümölcsét.",
      "Csak így tovább: jó úton jársz.",
    ],
    themeToggleDark: "Sötét mód bekapcsolása",
    themeToggleLight: "Világos mód bekapcsolása",
    note:
      "Az időpontok a 2025/2026-os tanév hivatalos rendje alapján vannak beállítva. A visszaszámlálás a budapesti időzónát használja. Forrás: 27/2025. (VII. 24.) BM rendelet.",
  },
  en: {
    locale: "en-US",
    htmlLang: "en-US",
    pageTitle: "Summer break countdown",
    badge: "Hungarian school year 2025/2026",
    headline: "Summer break countdown",
    intro:
      "A colorful, accurate countdown to the Hungarian school summer break, aligned to Budapest time.",
    lastTeachingLabel: "Last teaching day",
    summerBreakLabel: "Summer break starts",
    daysLabel: "days",
    hoursLabel: "hours",
    minutesLabel: "minutes",
    secondsLabel: "seconds",
    survivedLabel: "Teaching days completed",
    survivedDaysValue: "{completed} / {total} days done",
    remainingTeachingDays: "{remaining} teaching days left",
    progressLabel: "School year progress: {percent}%",
    budapestTimeLabel: "Budapest time: {time}",
    statusDefault: "Every day closer to summer.",
    statusDone: "Summer is here! Enjoy your break!",
    weekendWish: "Have a great weekend!",
    otherBreaksButton: "Other breaks",
    otherBreaksTitle: "Other school breaks",
    breakCountdownTitle: "{break} countdown",
    breakDaysLeftLine: "Weekdays left: {weekdays} · Weekend days left: {weekendDays}",
    otherBreakLabels: {
      autumn: "Autumn break",
      winter: "Winter break",
      spring: "Spring break",
    },
    countdownAria:
      "Time left until summer break: {days} days, {hours} hours, {minutes} minutes.",
    quotes: [
      "A small step today sets up a brighter tomorrow.",
      "Your effort today is future relaxation.",
      "Keep going — the finish line is closer than you think.",
      "Progress is progress, no matter the size.",
      "Stay steady; great days are on the way.",
      "You’re building something good, one day at a time.",
      "Show up today, thank yourself tomorrow.",
      "Momentum grows with every little win.",
      "Your consistency is your superpower.",
      "You’ve got this. Keep the pace.",
    ],
    themeToggleDark: "Switch to dark mode",
    themeToggleLight: "Switch to light mode",
    note:
      "Dates follow the official 2025/2026 Hungarian school year schedule. The countdown uses the Budapest time zone. Source: 27/2025. (VII. 24.) BM decree.",
  },
};

let currentLanguage = "hu";
let currentTheme = "light";

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Ignore storage failures (private mode / blocked storage).
  }
}

function getFormatter(locale, options) {
  const key = JSON.stringify({ locale, options });
  if (!dtfCache.has(key)) {
    dtfCache.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return dtfCache.get(key);
}

function getTimeZoneOffset(date, zone) {
  const formatter = getFormatter("en-GB", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const values = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
  return asUtc - date.getTime();
}

function zonedTimeToUtcMs({ year, month, day, hour = 0, minute = 0, second = 0 }, zone) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = getTimeZoneOffset(new Date(utcGuess), zone);
  return utcGuess - offset;
}

function formatDateTime(localDate, options) {
  const locale = translations[currentLanguage].locale;
  const utcMs = zonedTimeToUtcMs(localDate, timeZone);
  return getFormatter(locale, { timeZone, ...options }).format(new Date(utcMs));
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat(translations[currentLanguage].locale).format(value);
}

function getDateKeyForZone(zone) {
  const parts = getFormatter("en-GB", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }
  return `${values.year}-${values.month}-${values.day}`;
}

function getDatePartsForZone(date, zone) {
  const parts = getFormatter("en-GB", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function partsToUtcMs({ year, month, day }) {
  return Date.UTC(year, month - 1, day);
}

function addDays(parts, days) {
  const ms = partsToUtcMs(parts) + days * 86400000;
  const date = new Date(ms);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function compareParts(a, b) {
  return partsToUtcMs(a) - partsToUtcMs(b);
}

function isWeekendDate(parts, zone) {
  const weekday = getFormatter("en-GB", {
    timeZone: zone,
    weekday: "short",
  }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12)));
  return weekday === "Sat" || weekday === "Sun";
}

function countWeekdayWeekendUntil(targetParts) {
  const todayParts = getDatePartsForZone(new Date(), timeZone);
  if (compareParts(todayParts, targetParts) >= 0) {
    return { weekdays: 0, weekendDays: 0 };
  }
  let cursor = addDays(todayParts, 1);
  let weekdays = 0;
  let weekendDays = 0;

  while (compareParts(cursor, targetParts) < 0) {
    if (isWeekendDate(cursor, timeZone)) {
      weekendDays += 1;
    } else {
      weekdays += 1;
    }
    cursor = addDays(cursor, 1);
  }

  return { weekdays, weekendDays };
}

function getLocalDateParts(localDate) {
  return {
    year: localDate.year,
    month: localDate.month,
    day: localDate.day,
  };
}

function isDateWithinRange(parts, startParts, endParts) {
  return compareParts(parts, startParts) >= 0 && compareParts(parts, endParts) <= 0;
}

const schoolYearStartParts = getLocalDateParts(schoolYearStart);
const lastTeachingDayParts = getLocalDateParts(lastTeachingDay);
const breakRanges = otherBreaks.map((breakItem) => ({
  start: getLocalDateParts(breakItem.start),
  end: getLocalDateParts(breakItem.end),
}));

function isInSchoolBreak(parts) {
  return breakRanges.some((range) => isDateWithinRange(parts, range.start, range.end));
}

function isTeachingDay(parts) {
  if (compareParts(parts, schoolYearStartParts) < 0) return false;
  if (compareParts(parts, lastTeachingDayParts) > 0) return false;
  if (isWeekendDate(parts, timeZone)) return false;
  return !isInSchoolBreak(parts);
}

function buildTeachingDayTimeline() {
  const timeline = [];
  let cursor = { ...schoolYearStartParts };

  while (compareParts(cursor, lastTeachingDayParts) <= 0) {
    if (isTeachingDay(cursor)) {
      timeline.push(partsToUtcMs(cursor));
    }
    cursor = addDays(cursor, 1);
  }

  return timeline;
}

const teachingDayTimeline = buildTeachingDayTimeline();
const totalTeachingDays = teachingDayTimeline.length;

function countTeachingDaysBefore(dayMs) {
  let low = 0;
  let high = teachingDayTimeline.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (teachingDayTimeline[mid] < dayMs) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

function getTeachingDaySnapshot(now = new Date()) {
  const todayParts = getDatePartsForZone(now, timeZone);
  const todayMs = partsToUtcMs(todayParts);
  const completed = clamp(countTeachingDaysBefore(todayMs), 0, totalTeachingDays);

  return {
    completed,
    total: totalTeachingDays,
    remaining: clamp(totalTeachingDays - completed, 0, totalTeachingDays),
  };
}

function updateMotivationStats(t, now = new Date()) {
  const { completed, total, remaining } = getTeachingDaySnapshot(now);

  const survivedValue = formatTemplate(t.survivedDaysValue, {
    completed: formatNumber(completed),
    total: formatNumber(total),
  });
  const remainingValue = formatTemplate(t.remainingTeachingDays, {
    remaining: formatNumber(remaining),
  });

  if (elements.survivedLabel) elements.survivedLabel.textContent = t.survivedLabel;
  if (elements.survivedDays) elements.survivedDays.textContent = survivedValue;
  if (elements.remainingTeachingDays) elements.remainingTeachingDays.textContent = remainingValue;
}

function getDailyQuote(t) {
  const quotes = Array.isArray(t.quotes) ? t.quotes : [];
  if (!quotes.length) return t.statusDefault;
  const key = getDateKeyForZone(timeZone);
  let hash = 0;
  for (const char of key) {
    hash = (hash + char.charCodeAt(0)) % 100000;
  }
  return quotes[hash % quotes.length];
}

function isWeekendInZone(zone) {
  const weekday = getFormatter("en-GB", { timeZone: zone, weekday: "short" }).format(new Date());
  return weekday === "Sat" || weekday === "Sun";
}

function updateThemeToggleLabel() {
  if (!elements.themeToggle) return;
  const t = translations[currentLanguage];
  const label = currentTheme === "dark" ? t.themeToggleLight : t.themeToggleDark;
  elements.themeToggle.setAttribute("aria-label", label);
  elements.themeToggle.setAttribute("title", label);
  elements.themeToggle.setAttribute("aria-pressed", currentTheme === "dark" ? "true" : "false");
}

function applyTheme(theme, persist = true) {
  currentTheme = theme === "dark" ? "dark" : "light";
  elements.root.dataset.theme = currentTheme;
  updateThemeToggleLabel();
  if (persist) {
    writeStorage("theme", currentTheme);
  }
}

function updateCountdownA11y(t, days, hours, minutes) {
  if (!elements.countdownA11y) return;
  const text = formatTemplate(t.countdownAria, {
    days: formatNumber(days),
    hours: formatNumber(hours),
    minutes: formatNumber(minutes),
  });
  if (text !== lastAccessibleCountdown) {
    elements.countdownA11y.textContent = text;
    lastAccessibleCountdown = text;
  }
}

function syncViewportFit() {
  if (!elements.root || !elements.wrap || !document.body) return;

  if (elements.root.classList.contains("breaks-open")) {
    elements.root.classList.remove("layout-overflowing");
    document.body.classList.remove("layout-overflowing");
    return;
  }

  const styles = window.getComputedStyle(document.body);
  const paddingY =
    (Number.parseFloat(styles.paddingTop) || 0) + (Number.parseFloat(styles.paddingBottom) || 0);
  const requiredHeight = elements.wrap.scrollHeight + paddingY;
  const shouldScroll = requiredHeight > window.innerHeight + 1;

  elements.root.classList.toggle("layout-overflowing", shouldScroll);
  document.body.classList.toggle("layout-overflowing", shouldScroll);
}

function runIntroAnimations() {
  if (!canAnimate) return;

  anime
    .timeline({ easing: "easeOutExpo" })
    .add({
      targets: ".hero",
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 800,
    })
    .add(
      {
        targets: ".countdown-card",
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 800,
      },
      "-=520"
    )
    .add(
      {
        targets: ".note",
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 800,
      },
      "-=620"
    );

  anime({
    targets: ".meta-card, .unit",
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 650,
    delay: anime.stagger(80, { start: 200 }),
    easing: "easeOutCubic",
  });

  anime({
    targets: ".sun",
    scale: [0.88, 1],
    opacity: [0, 1],
    duration: 1200,
    easing: "easeOutExpo",
  });
}

const targetMs = zonedTimeToUtcMs(summerBreakStart, timeZone);
const startMs = zonedTimeToUtcMs(schoolYearStart, timeZone);

function updateDateTexts() {
  const lastTeachingDayText = formatDateTime(lastTeachingDay, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const summerBreakStartText = formatDateTime(summerBreakStart, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  elements.lastTeachingDay.textContent = lastTeachingDayText;
  elements.summerBreakStart.textContent = `${summerBreakStartText} (Budapest)`;
}

function renderOtherBreaksList() {
  if (!elements.breaksList) return;
  const t = translations[currentLanguage];
  elements.breaksList.innerHTML = "";

  otherBreaks.forEach((breakItem) => {
    const item = document.createElement("li");
    item.className = "break-item";

    const name = document.createElement("span");
    name.className = "break-name";
    name.textContent = t.otherBreakLabels?.[breakItem.id] ?? breakItem.id;

    const dates = document.createElement("span");
    dates.className = "break-dates";
    const startText = formatDateTime(breakItem.start, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endText = formatDateTime(breakItem.end, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    dates.textContent = `${startText} – ${endText}`;

    item.append(name, dates);
    elements.breaksList.append(item);
  });
}

function renderBreakCountdowns() {
  if (!elements.breaksCountdowns) return;
  const t = translations[currentLanguage];
  elements.breaksCountdowns.innerHTML = "";
  breakCountdownNodes = [];

  otherBreaks.forEach((breakItem) => {
    const section = document.createElement("section");
    section.className = "countdown-card break-countdown";
    section.dataset.breakId = breakItem.id;

    const title = document.createElement("h3");
    title.className = "break-countdown-title";
    const breakName = t.otherBreakLabels?.[breakItem.id] ?? breakItem.id;
    title.textContent = formatTemplate(t.breakCountdownTitle, { break: breakName });

    const grid = document.createElement("div");
    grid.className = "countdown-grid";

    const unitDefs = [
      { key: "days", label: t.daysLabel },
      { key: "hours", label: t.hoursLabel },
      { key: "minutes", label: t.minutesLabel },
      { key: "seconds", label: t.secondsLabel },
    ];

    const unitElements = {};
    unitDefs.forEach((unit) => {
      const unitWrap = document.createElement("div");
      unitWrap.className = "unit";

      const value = document.createElement("span");
      value.className = "value";
      value.textContent = unit.key === "days" ? "0" : "00";

      const label = document.createElement("span");
      label.className = "label";
      label.textContent = unit.label;

      unitWrap.append(value, label);
      grid.append(unitWrap);
      unitElements[unit.key] = value;
    });

    const meta = document.createElement("div");
    meta.className = "break-count-meta";
    meta.textContent = formatTemplate(t.breakDaysLeftLine, {
      weekdays: "0",
      weekendDays: "0",
    });

    section.append(title, grid, meta);
    elements.breaksCountdowns.append(section);
    breakCountdownNodes.push({
      id: breakItem.id,
      start: breakItem.start,
      elements: unitElements,
      title,
      meta,
      targetParts: {
        year: breakItem.start.year,
        month: breakItem.start.month,
        day: breakItem.start.day,
      },
    });
  });
}

function updateBreakCountdowns() {
  if (!breakCountdownNodes.length) return;
  const t = translations[currentLanguage];
  const nowMs = Date.now();

  breakCountdownNodes.forEach((breakItem) => {
    const targetMs = zonedTimeToUtcMs(breakItem.start, timeZone);
    const diffMs = targetMs - nowMs;
    const safeDiff = Math.max(0, diffMs);
    const totalSeconds = Math.floor(safeDiff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const displayValues = {
      days: String(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    };

    Object.entries(displayValues).forEach(([key, value]) => {
      const element = breakItem.elements[key];
      if (!element) return;
      element.textContent = value;
    });

    if (breakItem.meta) {
      const { weekdays, weekendDays } = countWeekdayWeekendUntil(breakItem.targetParts);
      breakItem.meta.textContent = formatTemplate(t.breakDaysLeftLine, {
        weekdays: String(weekdays),
        weekendDays: String(weekendDays),
      });
    }
  });
}

function setLanguage(lang, persist = true) {
  if (!translations[lang]) return;
  currentLanguage = lang;
  const t = translations[lang];

  elements.root.setAttribute("lang", t.htmlLang);
  document.title = t.pageTitle;
  if (elements.badge) elements.badge.textContent = t.badge;
  if (elements.headline) elements.headline.textContent = t.headline;
  if (elements.intro) elements.intro.textContent = t.intro;
  if (elements.lastTeachingLabel) elements.lastTeachingLabel.textContent = t.lastTeachingLabel;
  if (elements.summerBreakLabel) elements.summerBreakLabel.textContent = t.summerBreakLabel;
  if (elements.daysLabel) elements.daysLabel.textContent = t.daysLabel;
  if (elements.hoursLabel) elements.hoursLabel.textContent = t.hoursLabel;
  if (elements.minutesLabel) elements.minutesLabel.textContent = t.minutesLabel;
  if (elements.secondsLabel) elements.secondsLabel.textContent = t.secondsLabel;
  if (elements.note) elements.note.textContent = t.note;
  if (elements.breaksToggle) {
    elements.breaksToggle.textContent = t.otherBreaksButton;
    elements.breaksToggle.setAttribute("title", t.otherBreaksButton);
  }
  if (elements.breaksTitle) elements.breaksTitle.textContent = t.otherBreaksTitle;

  elements.languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  updateDateTexts();
  renderOtherBreaksList();
  renderBreakCountdowns();
  updateCountdown();
  updateThemeToggleLabel();

  if (persist) {
    writeStorage("language", lang);
  }

  syncViewportFit();
}

function updateCountdown() {
  const t = translations[currentLanguage];
  updateBreakCountdowns();
  const now = new Date();
  const nowMs = now.getTime();
  const diffMs = targetMs - nowMs;

  const clock = getFormatter(t.locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(now);

  if (elements.budapestClock) {
    elements.budapestClock.textContent = formatTemplate(t.budapestTimeLabel, { time: clock });
  }

  updateMotivationStats(t, now);

  if (diffMs <= 0) {
    elements.days.textContent = "0";
    elements.hours.textContent = "00";
    elements.minutes.textContent = "00";
    elements.seconds.textContent = "00";
    elements.status.textContent = t.statusDone;
    elements.progressFill.style.width = "100%";
    if (elements.progressBar) {
      elements.progressBar.setAttribute("aria-valuenow", "100");
    }
    elements.progressText.textContent = formatTemplate(t.progressLabel, { percent: "100" });
    elements.progressBar?.setAttribute(
      "aria-valuetext",
      formatTemplate(t.progressLabel, { percent: "100" })
    );
    updateCountdownA11y(t, 0, 0, 0);
    return;
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const displayValues = {
    days: String(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };

  for (const [key, value] of Object.entries(displayValues)) {
    const element = elements[key];
    if (!element) continue;
    element.textContent = value;
    if (lastValues[key] !== value) {
      lastValues[key] = value;
      if (canAnimate) {
        anime({
          targets: element,
          scale: [1.12, 1],
          opacity: [0.65, 1],
          duration: 360,
          easing: "easeOutExpo",
        });
      }
    }
  }
  updateCountdownA11y(t, days, hours, minutes);

  const totalMs = targetMs - startMs;
  const elapsedMs = nowMs - startMs;
  const progress = clamp(elapsedMs / totalMs, 0, 1);
  const progressValue = (progress * 100).toFixed(1);
  elements.progressFill.style.width = `${progressValue}%`;
  elements.progressText.textContent = formatTemplate(t.progressLabel, { percent: progressValue });
  if (elements.progressBar) {
    elements.progressBar.setAttribute("aria-valuenow", progressValue);
    elements.progressBar.setAttribute(
      "aria-valuetext",
      formatTemplate(t.progressLabel, { percent: progressValue })
    );
  }
  elements.status.textContent = isWeekendInZone(timeZone)
    ? t.weekendWish
    : getDailyQuote(t);
}

function setBreaksPanelOpen(isOpen) {
  if (!elements.breaksPanel || !elements.breaksToggle) return;
  elements.root.classList.toggle("breaks-open", isOpen);
  document.body.classList.toggle("breaks-open", isOpen);
  if (isOpen) {
    elements.breaksPanel.removeAttribute("hidden");
    elements.breaksToggle.setAttribute("aria-expanded", "true");
  } else {
    elements.breaksPanel.setAttribute("hidden", "");
    elements.breaksToggle.setAttribute("aria-expanded", "false");
  }
  syncViewportFit();
}

elements.languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

if (elements.themeToggle) {
  elements.themeToggle.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

if (elements.breaksToggle && elements.breaksPanel) {
  elements.breaksToggle.addEventListener("click", () => {
    const isHidden = elements.breaksPanel.hasAttribute("hidden");
    setBreaksPanelOpen(isHidden);
  });
}

const savedTheme = readStorage("theme");
const prefersDark =
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"), false);

const savedLanguage = readStorage("language");
setLanguage(savedLanguage || "hu", false);
setBreaksPanelOpen(false);
runIntroAnimations();
setInterval(updateCountdown, 1000);

window.addEventListener("pageshow", () => {
  setBreaksPanelOpen(false);
});

window.addEventListener("resize", syncViewportFit, { passive: true });
window.addEventListener("load", syncViewportFit);
