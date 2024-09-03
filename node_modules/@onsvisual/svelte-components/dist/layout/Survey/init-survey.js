function initSurveyA() {
  "use strict";
  (function () {
    var e = document.querySelector("#feedback-form-page-container");
    if (e) {
      var t = document.referrer,
        n = "/feedback/thanks",
        r = document.querySelector("#feedback-form-url");
      r && (r.value = t),
        e.addEventListener("submit", function (t) {
          t.preventDefault(),
            document
              .querySelectorAll("#feedback-form-page-container .feedback-form-control__error")
              .forEach((e) => {
                e.classList.remove("feedback-form-control__error");
              }),
            document
              .querySelectorAll("#feedback-form-page-container .feedback-form-error")
              .forEach((e) => {
                e.remove();
              });
          var r = document.querySelector("#email-field"),
            i = document.querySelector("#description-field"),
            o = !1;
          if (i && "" === i.value) {
            var s = document.createElement("span");
            if (
              ((s.className = "feedback-form-error"),
              (s.textContent = "Write some feedback"),
              s.setAttribute("role", "alert"),
              !document.querySelector("#description-field-label .feedback-form-error"))
            )
              document.querySelector("#feedback-description-field").insertBefore(s, i);
            i.classList.add("feedback-form-control__error"), i.focus(), (o = !0);
          }
          if (r && "" !== r.value) {
            var a = document.createElement("span");
            (a.className = "feedback-form-error"),
              a.setAttribute("role", "alert"),
              (a.textContent = "This is not a valid email address, correct it or delete it.");
            if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/g.test(r.value)) {
              if (!document.querySelector("#email-field-label .feedback-form-error"))
                document.querySelector("#reply-request").insertBefore(a, r);
              r.classList.add("feedback-form-control__error"), (o = !0);
            }
          }
          if (!o) {
            var u,
              l,
              c,
              d = document.querySelector("#page-url-field").value,
              h = d ? n + "?returnTo=" + d : n,
              f = {
                method: "POST",
                body: ((u = e), (l = new FormData(u)), (c = new URLSearchParams(l).toString()), c),
                headers: new Headers({
                  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                }),
              };
            return fetch(h, f)
              .then((e) => {
                if (!e.ok) throw e;
                return (window.location.href = h), e.text();
              })
              .then((e) => e)
              .catch((e) => Promise.reject(e));
          }
          document.querySelector(".feedback-btn").blur();
        });
    }
  })();
}

function initSurveyB() {
  "use strict";

  function r(e, t, n, r, i, o) {
    var s = (function (e) {
        var t = new FormData(e);
        return new URLSearchParams(t).toString();
      })(e),
      a = new XMLHttpRequest();
    return (
      a.open("POST", t, !0),
      a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"),
      (a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
          var e = a.status;
          if (o) return;
          n.innerHTML = 0 === e || (e >= 200 && e < 400) ? r : i;
        }
      }),
      {
        request: a,
        serializedData: s,
      }
    );
  }

  function i(e, t, n, r, i, o) {
    var s = {
      method: "POST",
      body: r,
      headers: new Headers({
        "Content-Type": "application/json; charset=UTF-8",
      }),
    };
    fetch(t, s)
      .then((e) => {
        if (!e.ok) throw e;
      })
      .then((e) => {
        n.innerHTML = o;
      })
      .catch((e) => {
        n.innerHTML = i;
      });
  }
  (function () {
    var e = window.location.href,
      t = "/feedback",
      n = "".concat(t, "/thanks"),
      o = document.querySelector("#feedback-form-header"),
      s =
        '<span id="feedback-form-confirmation">Thank you. Your feedback will help us as we continue to improve the service.</span>',
      a =
        '<span id="feedback-form-error role="alert"">Something went wrong, try using our <a href="/feedback">feedback form</a>.</span>',
      u = !1,
      l = document.querySelector("#feedback-api-enabled"),
      c = document.querySelector("#feedback-api-url"),
      d = document.querySelector("#feedback-form-url");
    d && (d.value = e);
    var h = document.querySelectorAll("a.js-toggle");
    h &&
      h.forEach((e) => {
        e.addEventListener("click", function (t) {
          t.preventDefault();
          var n = document.querySelector("#feedback-form");
          if (
            (n && n.classList.toggle("js-hidden"),
            o && o.classList.toggle("js-hidden"),
            "feedback-form-close" !== e.id)
          ) {
            var r = document.querySelector("#description-field");
            r && r.focus();
          }
        });
      });
    var f = document.querySelector("#feedback-form-yes");
    f &&
      o &&
      f.addEventListener("click", function (t) {
        (u = !0), t.preventDefault();
        var d = document.querySelector("#feedback-form-container");
        if (l && "true" === l.value && c) {
          var h = {
              is_page_useful: !0,
              is_general_feedback: !1,
              ons_url: e,
            },
            f = JSON.stringify(h);
          i(d, c.value, o, f, a, s);
        } else {
          var { request: p, serializedData: v } = r(d, n, o, s, a, u);
          (o.innerHTML = s), p.send(v);
        }
      });
    var p = document.querySelector("#feedback-form-container");
    p &&
      p.addEventListener("submit", function (n) {
        n.preventDefault(),
          document
            .querySelectorAll("#feedback-form-container .form-control__error")
            .forEach((e) => {
              e.classList.remove("form-control__error");
            }),
          document.querySelectorAll("#feedback-form-container .form-error").forEach((e) => {
            e.remove();
          });
        var d = document.querySelector("#email-field"),
          h = document.querySelector("#description-field"),
          f = document.querySelector("#name-field"),
          v = !1;
        if (h && "" === h.value) {
          if (!document.querySelector("#description-field-label .form-error"))
            document
              .querySelector("#description-field-label")
              .insertAdjacentHTML(
                "beforeend",
                '<span class="form-error" role="alert">Write some feedback</span>'
              );
          h.classList.add("form-control__error"), (v = !0);
        }
        if (d && "" !== d.value) {
          var m = "";
          m = v
            ? '<span class="form-error" role="alert" aria-live="polite">This is not a valid email address, correct it or delete it</span>'
            : '<span class="form-error" role="alert">This is not a valid email address, correct it or delete it</span>';
          if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/g.test(d.value)) {
            if (!document.querySelector("#email-field-label .form-error"))
              document.querySelector("#email-field-label").insertAdjacentHTML("beforeend", m);
            v = !0;
          }
        }
        if (!v)
          if (l && "true" === l.value && c) {
            var g = {
                is_page_useful: !1,
                is_general_feedback: !1,
                ons_url: e,
                name: f.value,
                email_address: d.value,
              },
              b = JSON.stringify(g);
            i(p, c.value, o, b, a, s);
          } else {
            var { request: y, serializedData: _ } = r(p, t, o, s, a, u),
              w = document.querySelector("#feedback-form");
            w && w.classList.add("js-hidden"), y.send(_);
            var aa = document.getElementById("feedback-form-header");
            aa && aa.classList.remove("js-hidden");
          }
      });
  })();
}

export default function initSurvey() {
  initSurveyA();
  initSurveyB();
}
