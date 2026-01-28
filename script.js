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

const dtfCache = new Map();

const elements = {
  root: document.documentElement,
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
    progressLabel: "Tanév haladása: {percent}%",
    budapestTimeLabel: "Budapest idő: {time}",
    statusDefault: "Minden nap közelebb a nyárhoz.",
    statusDone: "Itt a nyár! Jó pihenést!",
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
    progressLabel: "School year progress: {percent}%",
    budapestTimeLabel: "Budapest time: {time}",
    statusDefault: "Every day closer to summer.",
    statusDone: "Summer is here! Enjoy your break!",
    note:
      "Dates follow the official 2025/2026 Hungarian school year schedule. The countdown uses the Budapest time zone. Source: 27/2025. (VII. 24.) BM decree.",
  },
};

let currentLanguage = "hu";

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

  elements.languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  updateDateTexts();
  updateCountdown();

  if (persist) {
    localStorage.setItem("language", lang);
  }
}

function updateCountdown() {
  const t = translations[currentLanguage];
  const nowMs = Date.now();
  const diffMs = targetMs - nowMs;

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

  const clock = getFormatter(t.locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

  elements.budapestClock.textContent = formatTemplate(t.budapestTimeLabel, { time: clock });
  elements.status.textContent = t.statusDefault;
}

elements.languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

const savedLanguage = localStorage.getItem("language");
setLanguage(savedLanguage || "hu", false);
runIntroAnimations();
setInterval(updateCountdown, 1000);
