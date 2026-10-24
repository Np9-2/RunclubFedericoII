/* Mappa del percorso: linea sul lungomare, partenza dal ritrovo, un segno a ogni km.
   Per cambiare percorso basta sostituire i punti qui sotto ([latitudine, longitudine]). */
(function () {
  var box = document.getElementById('mappa');
  if (!box || !window.L) return;

  var PUNTI = [[40.84402,14.25771],[40.84391,14.25775],[40.84358,14.25811],[40.84329,14.25774],[40.84298,14.25734],[40.84266,14.25685],[40.84258,14.25676],[40.84247,14.25682],[40.84232,14.25705],[40.84192,14.25681],[40.84141,14.25644],[40.84092,14.25609],[40.84082,14.25601],[40.84040,14.25568],[40.84016,14.25550],[40.83980,14.25521],[40.83973,14.25535],[40.83965,14.25553],[40.83940,14.25535],[40.83907,14.25511],[40.83892,14.25500],[40.83880,14.25491],[40.83865,14.25481],[40.83871,14.25497],[40.83873,14.25513],[40.83864,14.25536],[40.83840,14.25526],[40.83859,14.25533],[40.83872,14.25514],[40.83871,14.25497],[40.83865,14.25481],[40.83847,14.25468],[40.83852,14.25455],[40.83857,14.25442],[40.83773,14.25390],[40.83756,14.25379],[40.83708,14.25352],[40.83677,14.25277],[40.83674,14.25261],[40.83652,14.25208],[40.83640,14.25216],[40.83628,14.25198],[40.83620,14.25178],[40.83592,14.25124],[40.83583,14.25108],[40.83572,14.25091],[40.83543,14.25046],[40.83532,14.25038],[40.83520,14.25043],[40.83424,14.25136],[40.83426,14.25119],[40.83414,14.25134],[40.83417,14.25116],[40.83404,14.25102],[40.83400,14.25082],[40.83364,14.25037],[40.83345,14.25013],[40.83293,14.24948],[40.83259,14.24912],[40.83245,14.24904],[40.83229,14.24896],[40.83201,14.24890],[40.83187,14.24887],[40.83162,14.24882],[40.83138,14.24883],[40.83125,14.24884],[40.83101,14.24883],[40.83055,14.24881],[40.83043,14.24881],[40.83035,14.24868],[40.82993,14.24865],[40.82988,14.24803],[40.82983,14.24790],[40.82957,14.24783],[40.82930,14.24776],[40.82895,14.24767],[40.82881,14.24764],[40.82865,14.24790],[40.82850,14.24795],[40.82828,14.24811],[40.82792,14.24839],[40.82828,14.24811],[40.82847,14.24796],[40.82860,14.24793],[40.82878,14.24763],[40.82895,14.24767],[40.82930,14.24776],[40.82957,14.24783],[40.82979,14.24789],[40.82988,14.24803],[40.82986,14.24870],[40.83035,14.24868],[40.83043,14.24881],[40.83055,14.24881],[40.83101,14.24883],[40.83125,14.24884],[40.83137,14.24883],[40.83162,14.24882],[40.83187,14.24887],[40.83197,14.24889],[40.83229,14.24896],[40.83241,14.24902],[40.83259,14.24912],[40.83288,14.24942],[40.83339,14.25006],[40.83364,14.25037],[40.83400,14.25082],[40.83402,14.25098],[40.83410,14.25111],[40.83409,14.25126],[40.83422,14.25124],[40.83431,14.25115],[40.83422,14.25124],[40.83414,14.25134],[40.83516,14.25047],[40.83528,14.25039],[40.83540,14.25042],[40.83568,14.25084],[40.83583,14.25108],[40.83592,14.25124],[40.83615,14.25170],[40.83628,14.25198],[40.83635,14.25220],[40.83648,14.25211],[40.83670,14.25252],[40.83676,14.25265],[40.83704,14.25344],[40.83751,14.25376],[40.83767,14.25384],[40.83857,14.25442],[40.83852,14.25455],[40.83847,14.25468],[40.83865,14.25481],[40.83871,14.25497],[40.83873,14.25513],[40.83864,14.25536],[40.83840,14.25526],[40.83859,14.25533],[40.83872,14.25514],[40.83871,14.25497],[40.83865,14.25481],[40.83880,14.25491],[40.83891,14.25499],[40.83907,14.25511],[40.83939,14.25534],[40.83965,14.25553],[40.83971,14.25539],[40.83980,14.25521],[40.84011,14.25546],[40.84040,14.25568],[40.84082,14.25601],[40.84092,14.25609],[40.84134,14.25639],[40.84183,14.25674],[40.84224,14.25704],[40.84243,14.25688],[40.84256,14.25672],[40.84267,14.25679],[40.84292,14.25725],[40.84329,14.25774],[40.84358,14.25811],[40.84389,14.25777],[40.84402,14.25771]];

  // tile chiare o scure in base al tema, come il resto del sito
  var dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)');
  function isDark() {
    var t = document.documentElement.dataset.theme;
    return t ? t === 'dark' : !!(dark && dark.matches);
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  var map = L.map(box, { scrollWheelZoom: false, zoomSnap: 0.25, attributionControl: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  // nel tema scuro la mappa viene scurita con un filtro (vedi .map-dark in style.css)
  function setTiles() { box.classList.toggle('map-dark', isDark()); }

  // linea con un bordo del colore della superficie, così si legge su strade e mare
  var bordo = L.polyline(PUNTI, { weight: 9, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(map);
  var linea = L.polyline(PUNTI, { weight: 5, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(map);
  function setColors() {
    bordo.setStyle({ color: css('--surface-raised'), opacity: 1 });
    linea.setStyle({ color: css('--accent'), opacity: 1 });
  }

  // partenza e arrivo coincidono: un solo segnaposto con le due barre del club
  var start = L.marker(PUNTI[0], {
    icon: L.divIcon({ className: 'map-start', html: '<svg class="bars" aria-hidden="true"><use href="#ii"/></svg>', iconSize: [36, 36], iconAnchor: [18, 18] }),
    title: 'Ritrovo: partenza e arrivo', keyboard: false
  }).addTo(map);
  start.bindTooltip('Partenza e arrivo', { direction: 'top', offset: [0, -16] });

  // un segno a ogni chilometro dell'andata (al ritorno si ripassa sulla stessa strada)
  var tot = 0, lungo = 0;
  for (var j = 1; j < PUNTI.length; j++) lungo += L.latLng(PUNTI[j - 1]).distanceTo(PUNTI[j]);
  for (var i = 1, km = 1; i < PUNTI.length; i++) {
    var a = L.latLng(PUNTI[i - 1]), b = L.latLng(PUNTI[i]), d = a.distanceTo(b);
    while (tot + d >= km * 1000 && km * 1000 <= lungo / 2) {
      var f = (km * 1000 - tot) / d;
      L.marker([a.lat + (b.lat - a.lat) * f, a.lng + (b.lng - a.lng) * f], {
        icon: L.divIcon({ className: 'map-km', html: km, iconSize: [26, 26], iconAnchor: [13, 13] }),
        interactive: false, keyboard: false
      }).addTo(map);
      km++;
    }
    tot += d;
  }
  var kmOut = document.getElementById('percorso-km');
  if (kmOut) kmOut.textContent = (tot / 1000).toFixed(1).replace('.', ',') + ' km';

  function fit() { map.invalidateSize(); map.fitBounds(linea.getBounds(), { padding: [28, 28] }); }
  setTiles(); setColors(); fit();
  // se il riquadro cambia misura (rotazione del telefono, finestra), il percorso torna tutto in vista
  if (window.ResizeObserver) new ResizeObserver(fit).observe(box);

  // se cambia il tema, cambiano tile e colori della linea
  function retheme() { setTiles(); setColors(); }
  if (dark && dark.addEventListener) dark.addEventListener('change', retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  var reset = document.getElementById('mappa-reset');
  if (reset) reset.addEventListener('click', fit);
})();
