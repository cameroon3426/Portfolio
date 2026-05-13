/* lightbox.js — self-contained image zoom, no external dependencies */
(function() {
  var css = '.training-img{cursor:zoom-in;transition:opacity 0.15s;}.training-img:hover{opacity:0.9;}.lbx{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.94);display:flex;align-items:center;justify-content:center;z-index:9999;animation:lbxIn 0.18s ease;}.lbx-img{max-width:92vw;max-height:90vh;border:2px solid #db6006;border-radius:6px;object-fit:contain;cursor:default;box-shadow:0 8px 40px rgba(0,0,0,0.8);}.lbx-close{position:fixed;top:18px;right:24px;color:#f0f4f6;font-size:26px;cursor:pointer;background:rgba(0,0,0,0.5);border:1px solid #3a4a52;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;line-height:1;}.lbx-close:hover{background:rgba(219,96,6,0.3);border-color:#db6006;}.lbx-hint{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);font-size:12px;color:#7a9099;background:rgba(0,0,0,0.5);padding:4px 12px;border-radius:4px;}@keyframes lbxIn{from{opacity:0;}to{opacity:1;}}';
  var s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);

  function openLbx(src, alt) {
    var overlay = document.createElement('div');
    overlay.className = 'lbx';
    var img = document.createElement('img');
    img.src = src; img.alt = alt || ''; img.className = 'lbx-img';
    var btn = document.createElement('button');
    btn.className = 'lbx-close'; btn.textContent = '✕'; btn.title = 'Close (Esc)';
    var hint = document.createElement('div');
    hint.className = 'lbx-hint'; hint.textContent = 'Click outside or press Esc to close';
    btn.onclick = function(e) { e.stopPropagation(); closeLbx(); };
    img.onclick = function(e) { e.stopPropagation(); };
    overlay.onclick = closeLbx;
    overlay.appendChild(img);
    overlay.appendChild(btn);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);
    document._lbx = overlay;
    document.body.style.overflow = 'hidden';
  }

  function closeLbx() {
    if (document._lbx) {
      document.body.removeChild(document._lbx);
      document._lbx = null;
      document.body.style.overflow = '';
    }
  }

  /* Event delegation — catches both static and JS-rendered images */
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('training-img')) { openLbx(e.target.src, e.target.alt); }
  });

  /* Set title on static images at load; quiz.js sets title on dynamically rendered ones */
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.training-img').forEach(function(img) { img.title = 'Click to enlarge'; });
  });

  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLbx(); });
})();
