/* Small enhancements; every page reads fine without this file. */
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

  /* Publications: underline the site owner's name; keep CJK outlet names upright */
  var NAME = /(Ming-Hung Wang|王銘宏)/;
  each(doc.querySelectorAll(".pub-list li"), function (li) {
    var walker = doc.createTreeWalker(li, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (!n.parentNode.closest("strong, em, a") && NAME.test(n.nodeValue)) { nodes.push(n); }
    }
    each(nodes, function (n) {
      var frag = doc.createDocumentFragment();
      each(n.nodeValue.split(NAME), function (part) {
        if (NAME.test(part)) {
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
    each(li.querySelectorAll("em"), function (e) {
      if (/[㐀-鿿]/.test(e.textContent)) { e.classList.add("cjk"); }
    });
  });

  /* Honours: show each year once */
  each(doc.querySelectorAll(".year-list"), function (list) {
    var prev = null;
    each(list.children, function (li) {
      var y = li.querySelector(".yr");
      var year = y ? y.textContent.trim() : null;
      if (year && year === prev) { li.classList.add("same-year"); }
      prev = year;
    });
  });
})();
