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
     Lightbox gallery — для снимки от сектор "Зад кулисите"
     Позволява увеличение на снимките при клик
     ============================================================ */
  function initLightbox() {
    var processStrip = document.querySelector(".process-strip");
    if (!processStrip) return;

    var processCards = processStrip.querySelectorAll(".process-card");
    if (processCards.length === 0) return;

    // Създаваме модален прозорец
    var modal = document.createElement("div");
    modal.id = "lightboxModal";
    modal.className = "lightbox-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Увеличен преглед на снимка");

    modal.innerHTML = 
      '<div class="lightbox-content">' +
        '<div class="lightbox-image-wrap">' +
          '<img id="lightboxImage" src="" alt="" />' +
        '</div>' +
        '<div class="lightbox-caption" id="lightboxCaption"></div>' +
        '<button class="lightbox-close" id="lightboxClose" aria-label="Затвори">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
          '</svg>' +
        '</button>' +
        '<button class="lightbox-nav lightbox-prev" id="lightboxPrev" aria-label="Предишна снимка">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<polyline points="15 18 9 12 15 6"></polyline>' +
          '</svg>' +
        '</button>' +
        '<button class="lightbox-nav lightbox-next" id="lightboxNext" aria-label="Следваща снимка">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<polyline points="9 18 15 12 9 6"></polyline>' +
          '</svg>' +
        '</button>' +
        '<div class="lightbox-counter" id="lightboxCounter"></div>' +
      '</div>';

    document.body.appendChild(modal);

    var currentIndex = 0;
    var images = [];

    // Събираме всички снимки от process cards
    processCards.forEach(function (card, index) {
      var img = card.querySelector("img");
      var caption = card.querySelector("figcaption");
      if (img) {
        images.push({
          src: img.src,
          alt: img.alt,
          caption: caption ? caption.textContent : "",
          index: index
        });
      }
    });

    function openLightbox(index) {
      currentIndex = Math.max(0, Math.min(index, images.length - 1));
      var image = images[currentIndex];
      document.getElementById("lightboxImage").src = image.src;
      document.getElementById("lightboxImage").alt = image.alt;
      document.getElementById("lightboxCaption").textContent = image.caption;
      document.getElementById("lightboxCounter").textContent = 
        (currentIndex + 1) + " / " + images.length;
      
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      document.getElementById("lightboxImage").focus();
    }

    function closeLightbox() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    // Event listeners
    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightboxPrev").addEventListener("click", function () {
      openLightbox(currentIndex - 1);
    });
    document.getElementById("lightboxNext").addEventListener("click", function () {
      openLightbox(currentIndex + 1);
    });

    // Затваряне при клик на фона
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") openLightbox(currentIndex - 1);
      if (e.key === "ArrowRight") openLightbox(currentIndex + 1);
    });

    // Отваряме lightbox при клик на снимка
    processCards.forEach(function (card, index) {
      var img = card.querySelector("img");
      if (img) {
        img.style.cursor = "pointer";
        img.addEventListener("click", function () {
          openLightbox(index);
        });
      }
    });
  }

  initLightbox();

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
})();
