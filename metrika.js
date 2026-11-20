/* Учебный сайт курса веб-аналитики. Счётчик Яндекс Метрики подключён здесь,
   чтобы номер счётчика менять в одном месте. */
var COUNTER_ID = 0; // ← вставить номер счётчика после создания в Метрике

(function (m, e, t, r, i, k, a) {
  m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
  m[i].l = 1 * new Date();
  for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
  k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

if (COUNTER_ID) {
  ym(COUNTER_ID, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true
  });
}

/* Отправка цели типа «JavaScript-событие».
   Имя цели (name) должно совпадать с идентификатором цели в настройках счётчика. */
function sendGoal(name, params) {
  if (COUNTER_ID && window.ym) { ym(COUNTER_ID, "reachGoal", name, params || {}); }
  console.log("[учебный сайт] цель:", name, params || "");
}

/* Любая кнопка или ссылка с атрибутом data-goal отправляет цель при клике. */
document.addEventListener("click", function (ev) {
  var el = ev.target.closest("[data-goal]");
  if (!el) return;
  var params = el.dataset.course ? { course: el.dataset.course } : undefined;
  sendGoal(el.dataset.goal, params);
});
