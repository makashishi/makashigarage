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

  /* Nav phone dropdown — same behavior as the sticky call button */
  var navPhoneBtn = document.getElementById("navPhoneBtn");
  var navPhoneMenu = document.getElementById("navPhoneMenu");
  var navPhoneWrap = navPhoneBtn ? navPhoneBtn.closest(".nav-phone-wrap") : null;
  if (navPhoneBtn && navPhoneWrap) {
    navPhoneBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      navPhoneWrap.classList.toggle("is-open");
    });
    document.addEventListener("click", function (e) {
      if (!navPhoneWrap.contains(e.target)) {
        navPhoneWrap.classList.remove("is-open");
      }
    });
  }

  /* ============================================================
     Cookie consent — Google Maps and Facebook widget stay unloaded
     (no third-party requests, no cookies set) until the person
     explicitly consents, either globally via the banner or locally
     via the per-section "Приемам и зареди" button.
     ============================================================ */
  var CONSENT_KEY = "makashi_cookie_consent";

  function loadFacebookWidget() {
    var gate = document.getElementById("fbConsentGate");
    var page = document.getElementById("fbPageEl");
    if (gate) gate.classList.add("is-hidden");
    if (page) page.style.display = "";
    if (!document.getElementById("fb-sdk-script")) {
      var s = document.createElement("script");
      s.id = "fb-sdk-script";
      s.async = true;
      s.defer = true;
      s.crossOrigin = "anonymous";
      s.src = "https://connect.facebook.net/bg_BG/sdk.js#xfbml=1&version=v19.0";
      document.body.appendChild(s);
    } else if (window.FB) {
      window.FB.XFBML.parse();
    }
  }

  function loadMapEmbed() {
    var gate = document.getElementById("mapConsentGate");
    var iframe = document.getElementById("mapIframe");
    if (gate) gate.classList.add("is-hidden");
    if (iframe && !iframe.src) {
      iframe.src = iframe.getAttribute("data-src");
      iframe.style.display = "";
    }
  }

  function acceptAllConsent() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    loadFacebookWidget();
    loadMapEmbed();
    hideBanner();
  }

  function declineConsent() {
    localStorage.setItem(CONSENT_KEY, "declined");
    hideBanner();
  }

  function hideBanner() {
    var banner = document.getElementById("cookieBanner");
    if (banner) banner.classList.remove("is-visible");
  }

  var cookieBanner = document.getElementById("cookieBanner");
  if (cookieBanner) {
    var existingConsent = localStorage.getItem(CONSENT_KEY);
    if (existingConsent === "accepted") {
      loadFacebookWidget();
      loadMapEmbed();
    } else if (!existingConsent) {
      cookieBanner.classList.add("is-visible");
    }
    var acceptBtn = document.getElementById("cookieAccept");
    var declineBtn = document.getElementById("cookieDecline");
    if (acceptBtn) acceptBtn.addEventListener("click", acceptAllConsent);
    if (declineBtn) declineBtn.addEventListener("click", declineConsent);
  }

  var fbConsentBtn = document.getElementById("fbConsentBtn");
  if (fbConsentBtn) fbConsentBtn.addEventListener("click", function () {
    localStorage.setItem(CONSENT_KEY, "accepted");
    loadFacebookWidget();
    hideBanner();
  });
  var mapConsentBtn = document.getElementById("mapConsentBtn");
  if (mapConsentBtn) mapConsentBtn.addEventListener("click", function () {
    localStorage.setItem(CONSENT_KEY, "accepted");
    loadMapEmbed();
    hideBanner();
  });

  /* Back to top */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    function toggleBackToTop() {
      if (window.scrollY > window.innerHeight * 0.8) backToTop.classList.add("is-visible");
      else backToTop.classList.remove("is-visible");
    }
    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Services accordion — only meaningfully collapses on mobile via CSS,
     but the toggle class is harmless to add at any width. */
  document.querySelectorAll(".service-card").forEach(function (card) {
    card.addEventListener("click", function () {
      card.classList.toggle("is-open");
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

  /* Click on REF labels in Before/After cards to open the corresponding image in modal */
  var baItems = Array.prototype.slice.call(document.querySelectorAll("#predi-sled .ba-item"));
  if (baItems.length && typeof openLightbox === "function") {
    baItems.forEach(function (item, index) {
      var refEl = item.querySelector(".ba-caption span");
      if (!refEl) return;
      refEl.style.cursor = "pointer";
      refEl.setAttribute("role", "button");
      refEl.setAttribute("tabindex", "0");
      refEl.setAttribute("aria-label", "Отвори снимка " + refEl.textContent.trim());

      refEl.addEventListener("click", function (e) {
        e.stopPropagation();
        openLightbox(index);
      });

      refEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });
  }

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

  /* Lightbox gallery for "Зад кулисите" */
  var lbItems = Array.prototype.map.call(
    document.querySelectorAll("#processGrid [data-lightbox]"),
    function (fig) {
      var img = fig.querySelector("img");
      var cap = fig.querySelector("figcaption");
      return { src: img.getAttribute("src"), alt: img.getAttribute("alt"), caption: cap ? cap.textContent : "" };
    }
  );

  /* If there are no process items, fallback to Before/After section so REF labels can still open modal */
  if (!lbItems.length) {
    lbItems = Array.prototype.map.call(
      document.querySelectorAll("#predi-sled .ba-item"),
      function (fig) {
        var afterImg = fig.querySelector(".ba-after");
        var title = fig.querySelector(".ba-caption h4");
        var ref = fig.querySelector(".ba-caption span");
        return {
          src: afterImg ? afterImg.getAttribute("src") : "",
          alt: afterImg ? afterImg.getAttribute("alt") : "",
          caption: (title ? title.textContent : "") + (ref ? " · " + ref.textContent : "")
        };
      }
    );
  }

  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightboxImg");
  var lbCaption = document.getElementById("lightboxCaption");
  var lbCounter = document.getElementById("lightboxCounter");
  var lbCurrent = 0;

  function openLightbox(index) {
    if (!lightbox || !lbItems.length) return;
    lbCurrent = index;
    showLightboxItem();
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function showLightboxItem() {
    var item = lbItems[lbCurrent];
    lbImg.setAttribute("src", item.src);
    lbImg.setAttribute("alt", item.alt);
    lbCaption.textContent = item.caption;
    if (lbCounter) lbCounter.textContent = (lbCurrent + 1) + " / " + lbItems.length;
  }
  function nextLightbox() { lbCurrent = (lbCurrent + 1) % lbItems.length; showLightboxItem(); }
  function prevLightbox() { lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length; showLightboxItem(); }

  document.querySelectorAll("#processGrid [data-lightbox]").forEach(function (fig, i) {
    fig.addEventListener("click", function () { openLightbox(i); });
  });
  var lbCloseBtn = document.getElementById("lightboxClose");
  var lbPrevBtn = document.getElementById("lightboxPrev");
  var lbNextBtn = document.getElementById("lightboxNext");
  if (lbCloseBtn) lbCloseBtn.addEventListener("click", closeLightbox);
  if (lbPrevBtn) lbPrevBtn.addEventListener("click", prevLightbox);
  if (lbNextBtn) lbNextBtn.addEventListener("click", nextLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextLightbox();
    if (e.key === "ArrowLeft") prevLightbox();
  });

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
