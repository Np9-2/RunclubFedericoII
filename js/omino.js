/* Omino del logo.
   All'apertura c'è solo l'omino che corre sul posto (schermata di caricamento);
   quando il sito è pronto lo sfondo sparisce e l'omino corre fino al suo posto
   sulla II, lasciando le orme. Clic sull'omino: rifà la corsa su per la II. */
(function () {
  var root = document.documentElement;
  var runner = document.getElementById('rc-runner');
  var loader = document.getElementById('rc-loader');
  var fly = document.getElementById('rc-fly');
  function done() { root.classList.remove('rc-intro', 'rc-loading'); }
  if (!runner || !fly) { done(); return; }
  window.__rcStarted = true;

  var body = fly.querySelector('.rc-fly-body');
  var shadow = fly.querySelector('.rc-fly-shadow');
  var svg = runner.ownerSVGElement;
  var img = runner.querySelector('image');
  var prints = Array.prototype.slice.call(document.querySelectorAll('.rc-print')).map(function (el) {
    var m = /translate\(([\d.]+) ([\d.]+)\)/.exec(el.getAttribute('transform'));
    return { el: el, x: +m[1], y: +m[2] };
  });

  // la pista è inclinata come il corsivo della II (9,4°): questa è la direzione verso l'alto
  var RAD = 9.4 * Math.PI / 180, DIR = { x: Math.sin(RAD), y: -Math.cos(RAD) };
  var CADENCE = 2.9 / 1000;  // passi al millisecondo, circa 174 al minuto come una corsetta vera
  var MIN_JOG = 1100;        // l'omino corre sul posto almeno così a lungo
  var MAX_WAIT = 4500;       // oltre questo tempo parte anche se il sito non ha finito di caricare
  var FLY = 1900;            // durata della corsa fino al logo
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = 0, t0 = 0, busy = false;

  function stepsAt(now) { return (now - t0) * CADENCE; }

  /* Una falcata vista dall'alto. Ogni passo ha un appoggio (primo 38%) e un volo:
     in volo l'omino è più vicino a chi guarda, quindi un po' più grande, e l'ombra si stacca;
     in appoggio si abbassa appena. Le gambe si scambiano a metà appoggio (immagine
     specchiata), con una leggera stretta che nasconde il cambio. Spalle e bacino
     oscillano da un lato all'altro ogni due passi. amp va da 0 (fermo) a 1. */
  function stride(steps, amp) {
    var f = steps - Math.floor(steps);
    var air = f < 0.38 ? -0.35 * Math.sin(Math.PI * f / 0.38) : Math.sin(Math.PI * (f - 0.38) / 0.62);
    var flip = Math.floor(steps + 0.8) % 2 === 1;
    var near = Math.abs(f - 0.2), squeeze = near < 0.12 ? 1 - near / 0.12 : 0;
    var side = Math.sin(Math.PI * steps);
    var sc = 1 + 0.045 * air * amp;
    var sx = sc * (1 - 0.1 * squeeze * amp) * (flip ? -1 : 1);
    body.style.transform = 'translateX(' + (1.6 * side * amp).toFixed(2) + '%) rotate(' + (3.5 * side * amp).toFixed(2) + 'deg) scale(' + sx.toFixed(4) + ',' + sc.toFixed(4) + ')';
    var lift = Math.max(0, air) * amp;
    shadow.style.transform = 'translate(' + (6 * lift).toFixed(2) + '%,' + (4 * lift).toFixed(2) + '%) scale(' + (1 - 0.14 * lift).toFixed(3) + ')';
    shadow.style.opacity = (0.16 * (1 - 0.5 * lift)).toFixed(3);
  }

  // punto d'arrivo: centro e misure dell'immagine dell'omino nel logo, in pixel dello schermo
  function target() {
    var m = svg.getScreenCTM(), s = m.a;
    var iw = +img.getAttribute('width'), ih = +img.getAttribute('height');
    var px = +runner.dataset.px, py = +runner.dataset.py;
    var dx = +img.getAttribute('x') + iw / 2 - px, dy = +img.getAttribute('y') + ih / 2 - py;
    var c = Math.cos(RAD), sn = Math.sin(RAD);
    function pt(x, y) { return { x: m.e + s * x, y: m.f + s * y }; }
    var p = pt(px + dx * c - dy * sn, py + dx * sn + dy * c);
    return { x: p.x, y: p.y, w: iw * s, h: ih * s, s: s, prints: prints.map(function (q) { return pt(q.x, q.y); }) };
  }

  // tragitto curvo da "from" all'arrivo: parte nella direzione "head" e finisce allineato alla pista
  function path(from, to, head, tail) {
    var L = Math.hypot(to.x - from.x, to.y - from.y);
    var c1 = { x: from.x + head.x * L * 0.4, y: from.y + head.y * L * 0.4 };
    var c2 = { x: to.x - DIR.x * tail, y: to.y - DIR.y * tail };
    function b(a, p, q, z, u) { var v = 1 - u; return v * v * v * a + 3 * v * v * u * p + 3 * v * u * u * q + u * u * u * z; }
    var pts = [], tot = 0, N = 120;
    for (var i = 0; i <= N; i++) {
      var u = i / N, x = b(from.x, c1.x, c2.x, to.x, u), y = b(from.y, c1.y, c2.y, to.y, u);
      if (i) tot += Math.hypot(x - pts[i - 1].x, y - pts[i - 1].y);
      pts.push({ x: x, y: y, d: tot });
    }
    // fr = frazione di strada percorsa (0–1): posizione e angolo, a velocità uniforme lungo la curva
    return function (fr) {
      var d = fr * tot, i = 1;
      while (i < N && pts[i].d < d) i++;
      var a = pts[i - 1], z = pts[i], k = (d - a.d) / ((z.d - a.d) || 1);
      return { x: a.x + (z.x - a.x) * k, y: a.y + (z.y - a.y) * k, ang: Math.atan2(z.y - a.y, z.x - a.x) * 180 / Math.PI + 90 };
    };
  }

  function place(T, x, y, ang, k) {
    fly.style.transform = 'translate(' + (x - T.w / 2).toFixed(1) + 'px,' + (y - T.h / 2).toFixed(1) + 'px) rotate(' + ang.toFixed(2) + 'deg) scale(' + k.toFixed(4) + ')';
  }

  // arrivo: compare l'omino vero del logo e quello in corsa sparisce sopra di lui
  function land() {
    busy = false;
    prints.forEach(function (q) { q.el.classList.add('rc-on'); });
    done();
    fly.classList.add('rc-gone');
    setTimeout(function () { fly.classList.remove('rc-on', 'rc-js', 'rc-gone'); fly.style.cssText = ''; body.style.transform = ''; }, 300);
  }

  /* Corsa da "from" (centro dello schermo, misura dell'omino in pixel) al posto nel logo.
     La durata si aggiusta per finire su un numero pari di passi: così l'ultima posa
     è proprio quella dell'immagine del logo. */
  function run(from, head, dur) {
    var T = target();
    if (T.y + T.h < 0 || T.y - T.h > innerHeight) {
      // il logo non è sullo schermo (pagina riaperta più in basso): niente corsa
      fly.classList.add('rc-gone'); if (loader) loader.classList.add('rc-out');
      setTimeout(land, 400); return;
    }
    var k0 = from.h / T.h;
    fly.classList.add('rc-on', 'rc-js');
    fly.style.width = T.w + 'px'; fly.style.height = T.h + 'px';
    var go = path(from, T, head, Math.max(140 * T.s, 0.35 * Math.hypot(T.x - from.x, T.y - from.y)));
    var start = performance.now(), s0 = stepsAt(start);
    var sEnd = Math.ceil((s0 + dur * CADENCE) / 2) * 2;
    dur = (sEnd - s0) / CADENCE;
    place(T, from.x, from.y, go(0).ang, k0);

    function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      var e = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);   // parte dolce, frena all'arrivo
      var p = go(e), k = k0 + (1 - k0) * (1 - Math.pow(1 - t, 2));
      place(T, p.x, p.y, p.ang, k);
      stride(t < 1 ? stepsAt(now) : sEnd, Math.min(1, (1 - t) / 0.08));
      // le orme compaiono quando il piede (in fondo all'immagine) ci passa sopra
      if (e > 0.5) {
        var r = p.ang * Math.PI / 180, hb = 0.45 * T.h * k;
        var fx = p.x - hb * Math.sin(r), fy = p.y + hb * Math.cos(r);
        T.prints.forEach(function (q, i) { if ((fx - q.x) * DIR.x + (fy - q.y) * DIR.y > -2) prints[i].el.classList.add('rc-on'); });
      }
      if (t < 1) raf = requestAnimationFrame(frame); else land();
    }
    raf = requestAnimationFrame(frame);
  }

  // schermata di caricamento: l'omino corre sul posto finché il sito è pronto
  function intro() {
    busy = true;
    t0 = performance.now();
    // "pronto" = caratteri e logo caricati: è quello che si vede appena sparisce lo sfondo
    // (la mappa e il resto più in basso possono finire di caricare dopo)
    var ready = false, waits = [];
    if (document.fonts && document.fonts.ready) waits.push(document.fonts.ready);
    Array.prototype.forEach.call(document.querySelectorAll('.hero-logo img'), function (im) {
      if (!im.complete) waits.push(new Promise(function (ok) { im.addEventListener('load', ok); im.addEventListener('error', ok); }));
    });
    Promise.all(waits).then(function () { ready = true; }, function () { ready = true; });
    function jog(now) {
      stride(stepsAt(now), Math.min(1, (now - t0) / 400));
      var waited = now - t0;
      if (waited > MIN_JOG && (ready || waited > MAX_WAIT)) {
        var r = fly.getBoundingClientRect();
        loader.classList.add('rc-out');
        setTimeout(function () { root.classList.remove('rc-loading'); }, 650);
        run({ x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }, { x: 0, y: -1 }, FLY);
      } else raf = requestAnimationFrame(jog);
    }
    raf = requestAnimationFrame(jog);
  }

  // clic sull'omino: riparte da sotto la pista e risale la II, come nel logo
  runner.addEventListener('click', function () {
    if (busy || reduce) return;
    busy = true;
    var T = target(), D = 250 * T.s;
    root.classList.add('rc-intro');
    prints.forEach(function (q) { q.el.classList.remove('rc-on'); });
    t0 = performance.now();
    run({ x: T.x - DIR.x * D, y: T.y - DIR.y * D, h: T.h * 1.28 }, DIR, 1500);
  });

  if (reduce || !loader || !root.classList.contains('rc-loading')) { done(); return; }
  intro();
  // rete di sicurezza: se qualcosa si inceppa, il sito si mostra comunque
  setTimeout(function () { if (root.classList.contains('rc-loading')) { cancelAnimationFrame(raf); land(); if (loader) loader.classList.add('rc-out'); } }, MAX_WAIT + FLY + 3000);
})();
