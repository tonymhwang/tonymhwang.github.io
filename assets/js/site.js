/* Progressive enhancements; every page reads fine without this file. */
(function () {
  "use strict";
  var doc = document;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* Mobile navigation */
  var toggle = doc.querySelector(".nav-toggle");
  var nav = doc.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
  }

  /* About: English / 中文 switch */
  var langSwitch = doc.querySelector(".lang-switch");
  var panels = doc.querySelectorAll(".lang-panel");
  if (langSwitch && panels.length > 1) {
    var buttons = langSwitch.querySelectorAll("button");
    var pick = function (lang, remember) {
      each(panels, function (p) { p.hidden = p.getAttribute("lang") !== lang; });
      each(buttons, function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-lang") === lang)); });
      if (remember) { try { localStorage.setItem("lang", lang); } catch (e) {} }
    };
    var saved = null;
    try { saved = localStorage.getItem("lang"); } catch (e) {}
    var browserZh = (navigator.language || "").toLowerCase().indexOf("zh") === 0;
    langSwitch.hidden = false;
    each(buttons, function (b) {
      b.addEventListener("click", function () { pick(b.getAttribute("data-lang"), true); });
    });
    pick(saved === "en" || saved === "zh-Hant" ? saved : (browserZh ? "zh-Hant" : "en"), false);
  }

  /* Publications: emphasise the site owner's name, turn index notes into tags */
  var NAME = /Ming-Hung Wang|王銘宏/g;
  each(doc.querySelectorAll(".pub-list li"), function (li) {
    var walker = doc.createTreeWalker(li, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (!n.parentNode.closest("strong, em, a") && NAME.test(n.nodeValue)) { nodes.push(n); }
      NAME.lastIndex = 0;
    }
    each(nodes, function (n) {
      var frag = doc.createDocumentFragment();
      var parts = n.nodeValue.split(/(Ming-Hung Wang|王銘宏)/);
      each(parts, function (part) {
        if (part === "Ming-Hung Wang" || part === "王銘宏") {
          var s = doc.createElement("span");
          s.className = "me";
          s.textContent = part;
          frag.appendChild(s);
        } else if (part) {
          frag.appendChild(doc.createTextNode(part));
        }
      });
      n.parentNode.replaceChild(frag, n);
    });

    var em = li.querySelector("em");
    each(li.querySelectorAll("em"), function (e) { if (/[㐀-鿿]/.test(e.textContent)) { e.classList.add("cjk"); } });
    var m = em && em.textContent.match(/^(.*?)\.?\s*\(([^()]*\b(?:SCI|SSCI|ESCI)\b[^()]*)\)\s*$/);
    if (m) {
      em.textContent = m[1] + ".";
      var anchor = em;
      each(m[2].split(/\s*,\s*/), function (label) {
        var t = doc.createElement("span");
        t.className = "tag";
        t.textContent = label.replace(/^IF:\s*/, "IF ");
        anchor.parentNode.insertBefore(t, anchor.nextSibling);
        anchor = t;
      });
    }
  });

  /* Section counts for publication lists */
  each(doc.querySelectorAll(".page-content h2"), function (h) {
    var list = h.nextElementSibling;
    if (list && list.classList.contains("pub-list")) {
      var c = doc.createElement("span");
      c.className = "count";
      c.textContent = list.children.length;
      h.appendChild(c);
    }
  });

  /* Experience: mark ongoing roles */
  each(doc.querySelectorAll(".cv-list li"), function (li) {
    var date = li.querySelector(".cv-date");
    var title = li.querySelector(".cv-zh");
    if (date && title && /[–-]\s*$/.test(date.textContent)) {
      li.classList.add("current");
      var badge = doc.createElement("span");
      badge.className = "now";
      badge.textContent = "現任";
      title.appendChild(badge);
    }
  });

  /* Service lists: soften the role before the first comma */
  each(doc.querySelectorAll(".plain-list li"), function (li) {
    if (li.children.length) { return; }
    var m = li.textContent.match(/^(Co-organizer|Program Co-chair|Program Chair|Program Committee|Publication Chair|Keynote Speaker|Invited Speaker|Guest Editor), (.+)$/);
    if (m) {
      li.textContent = "";
      var r = doc.createElement("span");
      r.className = "role";
      r.textContent = m[1] + " · ";
      li.appendChild(r);
      li.appendChild(doc.createTextNode(m[2]));
    }
  });

  /* Honours: group consecutive identical years */
  each(doc.querySelectorAll(".year-list"), function (list) {
    var prev = null;
    each(list.children, function (li) {
      var y = li.querySelector(".yr");
      var year = y ? y.textContent.trim() : null;
      if (year && year === prev) { li.classList.add("same-year"); }
      prev = year;
    });
  });

  /* On-this-page navigation */
  var toc = doc.querySelector(".toc");
  var heads = doc.querySelectorAll(".page-content h2");
  if (toc && heads.length > 1) {
    var ol = toc.querySelector("ol");
    var links = [];
    each(heads, function (h, i) {
      if (!h.id) { h.id = "section-" + (i + 1); }
      var label = h.childNodes[0] ? h.childNodes[0].textContent.trim() : h.textContent.trim();
      var li = doc.createElement("li");
      var a = doc.createElement("a");
      a.href = "#" + h.id;
      a.textContent = label;
      li.appendChild(a);
      ol.appendChild(li);
      links.push(a);
    });
    toc.hidden = false;
    var ticking = false;
    var update = function () {
      ticking = false;
      var current = 0;
      each(heads, function (h, i) { if (h.getBoundingClientRect().top < 140) { current = i; } });
      each(links, function (a, i) { a.classList.toggle("active", i === current); });
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();
