/* Omino del logo: all'apertura compare sotto la pista, corre su per la II
   lasciando le orme e si ferma nella sua posizione nel logo.
   Clic sull'omino: rifà la corsa. */
(function () {
  var root = document.documentElement;
  var runner = document.getElementById('rc-runner');
  if (!runner) { root.classList.remove('rc-intro'); return; }
  window.__rcStarted = true;

  var bob = document.getElementById('rc-bob');
  var flip = document.getElementById('rc-flip');
  var prints = Array.prototype.slice.call(document.querySelectorAll('.rc-print'));
  var px = +runner.dataset.px, py = +runner.dataset.py, cx = +runner.dataset.cx, footY = +runner.dataset.foot;

  // direzione della pista (inclinata come il corsivo, 9,4°) verso l'alto
  var A = 9.4 * Math.PI / 180, DX = Math.sin(A), DY = -Math.cos(A);
  var DIST = 250;        // quanto parte più in basso, in unità del logo
  var STEPS = 10;        // passi della corsa (numero pari: finisce sulla posa del logo)
  var DUR = 2300;        // durata in millisecondi
  var START_SCALE = 1.28;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = 0;

  function setPose(p, phase, alpha) {
    var rest = 1 - p;
    var dx = -rest * DIST * DX, dy = -rest * DIST * DY;
    var k = 1 + (START_SCALE - 1) * rest;
    runner.setAttribute('transform',
      'translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ') translate(' + px + ' ' + py + ') scale(' + k.toFixed(4) + ') translate(' + (-px) + ' ' + (-py) + ')');
    // falcata: immagine e immagine specchiata si alternano a ogni passo
    var odd = Math.floor(phase) % 2 === 1;
    flip.setAttribute('transform', odd ? 'translate(' + (2 * cx) + ' 0) scale(-1 1)' : '');
    // rimbalzo: si alza a metà passo, tocca terra all'inizio di ogni passo
    var lift = 3.2 * Math.abs(Math.sin(Math.PI * phase)) * Math.min(1, rest * 4);
    bob.setAttribute('transform', 'translate(0 ' + (-lift).toFixed(2) + ')');
    runner.style.opacity = alpha;
    // le orme compaiono quando il piede ci passa sopra
    var foot = footY + dy;
    prints.forEach(function (el) { if (foot < +el.dataset.y + 4) el.classList.add('rc-on'); });
  }

  function finish() {
    setPose(1, STEPS, 1);
    bob.removeAttribute('transform');
    flip.removeAttribute('transform');
    runner.removeAttribute('transform');
    runner.style.opacity = '';
    prints.forEach(function (el) { el.classList.add('rc-on'); });
    root.classList.remove('rc-intro');
  }

  function run() {
    cancelAnimationFrame(raf);
    if (reduce) { finish(); return; }
    root.classList.add('rc-intro');
    prints.forEach(function (el) { el.classList.remove('rc-on'); });
    var t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var t = Math.min(1, (now - t0) / DUR);
      // velocità costante e poi frenata dolce sull'arrivo
      var p = t < 0.6 ? t * 1.25 : 0.75 + 0.25 * (1 - Math.pow(1 - (t - 0.6) / 0.4, 2));
      var alpha = Math.min(1, t / 0.12);
      setPose(p, p * STEPS, alpha);
      if (t < 1) raf = requestAnimationFrame(frame); else finish();
    }
    raf = requestAnimationFrame(frame);
  }

  runner.addEventListener('click', run);

  // parte quando l'immagine dell'omino è pronta (al massimo dopo 1,5 s)
  var started = false;
  function go() { if (!started) { started = true; setTimeout(run, 250); } }
  var img = new Image();
  img.onload = img.onerror = go;
  img.src = runner.querySelector('image').getAttribute('href');
  setTimeout(go, 1500);
})();
