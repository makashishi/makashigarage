(function () {
  "use strict";

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Nav goes solid after scrolling past hero */
  var nav = document.getElementById("siteNav");
  function onScrollNav() {
    if (window.scrollY > 60) nav.classList.add("is-solid");
    else nav.classList.remove("is-solid");
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* Smooth-scroll offset for anchor links (accounts for fixed nav) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ============================================================
     Before / After slider
     Drag (mouse, touch, keyboard) to reveal the "before" image
     clipped over the "after" image underneath.
     ============================================================ */
  function initBaSlider(root) {
    var beforeWrap = root.querySelector(".ba-before-wrap");
    var beforeImg = beforeWrap.querySelector("img");
    var handle = root.querySelector(".ba-handle");
    var dragging = false;

    function setPos(pct) {
      pct = Math.max(2, Math.min(98, pct));
      beforeWrap.style.width = pct + "%";
      handle.style.left = pct + "%";
      // keep the before image visually full-bleed while its wrapper clips
      var rootWidth = root.clientWidth;
      beforeImg.style.width = rootWidth + "px";
      root.setAttribute("aria-valuenow", Math.round(pct));
    }

    function pctFromClientX(clientX) {
      var rect = root.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function start(e) {
      dragging = true;
      move(e);
    }
    function move(e) {
      if (!dragging) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(pctFromClientX(clientX));
    }
    function end() { dragging = false; }

    root.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    root.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchmove", move, { passive: true });
    root.addEventListener("touchend", end);

    /* Keyboard accessibility */
    root.setAttribute("tabindex", "0");
    root.setAttribute("role", "slider");
    root.setAttribute("aria-label", "Плъзгач преди/след");
    root.setAttribute("aria-valuemin", "0");
    root.setAttribute("aria-valuemax", "100");
    var current = 50;
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { current -= 5; setPos(current); }
      if (e.key === "ArrowRight") { current += 5; setPos(current); }
    });

    // init after images have laid out
    window.addEventListener("resize", function () { setPos(current); });
    setPos(50);
  }

  document.querySelectorAll("[data-ba]").forEach(initBaSlider);

  /* ============================================================
     Video play button — swaps poster for playback on demand
     ============================================================ */
  var videoWrap = document.getElementById("videoWrap");
  var videoEl = document.getElementById("shopVideo");
  var playBtn = document.getElementById("videoPlayBtn");
  if (playBtn && videoEl) {
    playBtn.addEventListener("click", function () {
      videoEl.setAttribute("controls", "");
      videoEl.play().catch(function () {
        /* no source available yet — keep poster visible */
      });
      playBtn.style.display = "none";
    });
  }

  /* ============================================================
     Inquiry form — builds a mailto: fallback (no backend attached).
     Replace this handler with a real endpoint (Formspree, own API,
     etc.) when one is available.
     ============================================================ */
  var form = document.getElementById("inquiryForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString();
      var phone = (data.get("phone") || "").toString();
      var car = (data.get("car") || "").toString();
      var service = (data.get("service") || "").toString();
      var message = (data.get("message") || "").toString();

      var subject = "Запитване от сайта — " + name;
      var body =
        "Име: " + name + "\n" +
        "Телефон: " + phone + "\n" +
        "Автомобил: " + car + "\n" +
        "Услуга: " + service + "\n\n" +
        "Съобщение:\n" + message;

      var mailto =
        "mailto:makashigarage@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;
    });
  }

  /* Sticky mobile call button — tap to choose between two named numbers */
  var callBtn = document.getElementById("stickyCallBtn");
  var callMenu = document.getElementById("stickyCallMenu");
  if (callBtn && callMenu) {
    callBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      callMenu.classList.toggle("is-open");
    });
    document.addEventListener("click", function (e) {
      if (!callMenu.contains(e.target) && e.target !== callBtn) {
        callMenu.classList.remove("is-open");
      }
    });
  }
})();
