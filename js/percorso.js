/* Mappa del percorso: linea sul lungomare, partenza dal ritrovo, un segno a ogni km.
   Per cambiare percorso basta sostituire i punti qui sotto ([latitudine, longitudine]). */
(function () {
  var box = document.getElementById('mappa');
  if (!box || !window.L) return;

  var PUNTI = [[40.84917,14.25006],[40.84896,14.24995],[40.84881,14.24993],[40.84868,14.24990],[40.84842,14.24973],[40.84822,14.24962],[40.84770,14.24945],[40.84743,14.24941],[40.84684,14.24933],[40.84643,14.24928],[40.84554,14.24918],[40.84484,14.24910],[40.84468,14.24909],[40.84407,14.24906],[40.84393,14.24904],[40.84356,14.24900],[40.84310,14.24894],[40.84281,14.24891],[40.84253,14.24887],[40.84235,14.24885],[40.84224,14.24883],[40.84199,14.24880],[40.84180,14.24877],[40.84161,14.24874],[40.84139,14.24871],[40.84115,14.24868],[40.84084,14.24863],[40.84061,14.24860],[40.84039,14.24857],[40.84010,14.24853],[40.83974,14.24847],[40.83939,14.24841],[40.83925,14.24839],[40.83896,14.24839],[40.83880,14.24838],[40.83849,14.24838],[40.83813,14.24841],[40.83762,14.24841],[40.83696,14.24860],[40.83688,14.24844],[40.83684,14.24826],[40.83681,14.24802],[40.83674,14.24745],[40.83671,14.24730],[40.83662,14.24688],[40.83658,14.24669],[40.83651,14.24650],[40.83620,14.24577],[40.83610,14.24553],[40.83596,14.24519],[40.83589,14.24501],[40.83583,14.24483],[40.83579,14.24464],[40.83577,14.24443],[40.83577,14.24426],[40.83579,14.24356],[40.83579,14.24338],[40.83579,14.24323],[40.83570,14.24310],[40.83534,14.24259],[40.83462,14.24201],[40.83445,14.24184],[40.83432,14.24172],[40.83400,14.24142],[40.83395,14.24128],[40.83392,14.24045],[40.83385,14.23946],[40.83384,14.23912],[40.83392,14.23899],[40.83388,14.23843],[40.83388,14.23786],[40.83389,14.23735],[40.83389,14.23694],[40.83398,14.23683],[40.83418,14.23675],[40.83418,14.23637],[40.83417,14.23604],[40.83394,14.23603],[40.83358,14.23595],[40.83361,14.23577],[40.83347,14.23564],[40.83350,14.23530],[40.83363,14.23353],[40.83364,14.23334],[40.83364,14.23319],[40.83362,14.23269],[40.83361,14.23243],[40.83361,14.23223],[40.83361,14.23205],[40.83361,14.23184],[40.83360,14.23158],[40.83357,14.23100],[40.83355,14.23072],[40.83354,14.23054],[40.83347,14.23016],[40.83337,14.22976],[40.83324,14.22922],[40.83299,14.22822],[40.83289,14.22782],[40.83277,14.22734],[40.83268,14.22692],[40.83263,14.22673],[40.83251,14.22627],[40.83245,14.22601],[40.83232,14.22543],[40.83226,14.22519],[40.83219,14.22485],[40.83176,14.22654],[40.83196,14.22682],[40.83208,14.22729],[40.83225,14.22800],[40.83232,14.22839],[40.83235,14.22855],[40.83242,14.22896],[40.83248,14.22940],[40.83252,14.22975],[40.83255,14.23005],[40.83257,14.23026],[40.83260,14.23059],[40.83261,14.23084],[40.83262,14.23122],[40.83263,14.23182],[40.83263,14.23201],[40.83262,14.23215],[40.83260,14.23238],[40.83257,14.23259],[40.83253,14.23278],[40.83248,14.23296],[40.83244,14.23313],[40.83236,14.23350],[40.83226,14.23400],[40.83221,14.23435],[40.83219,14.23451],[40.83207,14.23583],[40.83187,14.23820],[40.83185,14.23839],[40.83165,14.24064],[40.83163,14.24083],[40.83158,14.24154],[40.83156,14.24179],[40.83154,14.24202],[40.83146,14.24282],[40.83143,14.24299],[40.83139,14.24324],[40.83135,14.24342],[40.83131,14.24360],[40.83127,14.24376],[40.83122,14.24389],[40.83115,14.24404],[40.83104,14.24418],[40.83092,14.24429],[40.83044,14.24468],[40.83006,14.24500],[40.82998,14.24511],[40.82994,14.24599],[40.82983,14.24644],[40.82979,14.24789],[40.82978,14.24803],[40.82976,14.24879],[40.82974,14.24933],[40.82973,14.24970],[40.82984,14.24970],[40.82992,14.24982],[40.82999,14.24996],[40.83011,14.25004],[40.83035,14.25013],[40.83045,14.25019],[40.83082,14.25044],[40.83102,14.25063],[40.83120,14.25073],[40.83159,14.25110],[40.83168,14.25123],[40.83177,14.25132],[40.83190,14.25126],[40.83203,14.25133],[40.83306,14.25191],[40.83313,14.25170],[40.83362,14.25136],[40.83402,14.25098],[40.83415,14.25092],[40.83471,14.25040],[40.83535,14.24976],[40.83546,14.24971],[40.83608,14.24922],[40.83613,14.24918]];

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

  // partenza (il ritrovo) e arrivo: due segnaposto diversi
  function pin(punto, classe, icona, testo) {
    L.marker(punto, {
      icon: L.divIcon({ className: classe, html: icona, iconSize: [36, 36], iconAnchor: [18, 18] }),
      title: testo, keyboard: false
    }).addTo(map).bindTooltip(testo, { direction: 'top', offset: [0, -16] });
  }
  pin(PUNTI[0], 'map-start', '<svg class="bars" aria-hidden="true"><use href="#ii"/></svg>', 'Partenza: punto di ritrovo');
  pin(PUNTI[PUNTI.length - 1], 'map-end', '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 1.5v13M4 2.5h8.5l-2 3 2 3H4"/></svg>', 'Arrivo');

  // un segno a ogni chilometro dell'andata (al ritorno si ripassa sulla stessa strada)
  var tot = 0, lungo = 0;
  for (var j = 1; j < PUNTI.length; j++) lungo += L.latLng(PUNTI[j - 1]).distanceTo(PUNTI[j]);
  for (var i = 1, km = 1; i < PUNTI.length; i++) {
    var a = L.latLng(PUNTI[i - 1]), b = L.latLng(PUNTI[i]), d = a.distanceTo(b);
    while (tot + d >= km * 1000 && km * 1000 < lungo) {
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
