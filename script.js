(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("nav-toggle");

  function closeNav() {
    document.body.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  if (nav) {
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });
  }

  document.addEventListener("click", function (event) {
    if (!document.body.classList.contains("nav-open")) return;
    if (header && header.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNav();
  });

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealItems.forEach(function (el, index) {
      el.style.transitionDelay = (index % 4) * 70 + "ms";
      observer.observe(el);
    });
  }

  var form = document.getElementById("partner-form");
  if (!form) return;

  var success = document.getElementById("form-success");

  function setError(input, message) {
    var field = input.closest(".field");
    if (!field) return;
    var slot = field.querySelector(".error");
    if (slot) slot.textContent = message || "";
    field.classList.toggle("invalid", Boolean(message));
  }

  function validateField(input) {
    var value = input.value.trim();

    if (input.id === "phone") {
      var digits = value.replace(/\D/g, "");
      if (!digits) {
        setError(input, "Please enter your phone number.");
        return false;
      }
      if (digits.length !== 10) {
        setError(input, "Enter a 10-digit mobile number.");
        return false;
      }
      setError(input, "");
      return true;
    }

    if (!value) {
      setError(input, "This field is required.");
      return false;
    }

    if (value.length < 2) {
      setError(input, "Please enter at least 2 characters.");
      return false;
    }

    setError(input, "");
    return true;
  }

  var inputs = form.querySelectorAll("input");

  inputs.forEach(function (input) {
    input.addEventListener("blur", function () {
      if (input.value.trim()) validateField(input);
    });

    input.addEventListener("input", function () {
      var field = input.closest(".field");
      if (field && field.classList.contains("invalid")) validateField(input);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstInvalid = null;
    var allValid = true;

    inputs.forEach(function (input) {
      if (!validateField(input)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (!allValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var data = {};
    inputs.forEach(function (input) { data[input.name] = input.value.trim(); });

    try {
      var stored = JSON.parse(localStorage.getItem("fitday_partners") || "[]");
      stored.push(Object.assign({ submittedAt: new Date().toISOString() }, data));
      localStorage.setItem("fitday_partners", JSON.stringify(stored));
    } catch (err) {
      /* storage unavailable or full — submission still shows success */
    }

    form.reset();
    if (success) {
      success.hidden = false;
      success.focus();
    }
  });
})();