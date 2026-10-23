document.querySelectorAll('.copy').forEach(function (b) {
  b.addEventListener('click', function () {
    var el = document.getElementById(b.dataset.copy);
    var text = el.textContent.trim();
    var done = function () { b.setAttribute('data-done', ''); b.textContent = 'Copiato'; setTimeout(function () { b.removeAttribute('data-done'); b.textContent = 'Copia'; }, 1800); };
    var select = function () { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selezionato'; };
    try { navigator.clipboard.writeText(text).then(done, select); } catch (e) { select(); }
  });
});
