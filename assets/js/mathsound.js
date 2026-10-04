/*
 * Shared sound engine for the interactive figures. Nothing makes a sound
 * until a visitor turns it on with a button (browsers require a gesture).
 *
 * MathSound.toggleButton(onChange)  -> a speaker toggle <button>
 * MathSound.pluck(freq, opts)       -> a bell-like note
 * MathSound.drone()                 -> { setChord(freqs, pans), setBrightness(0..1) }
 * MathSound.degree(i)               -> frequency of step i of D major pentatonic
 */
(function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  var ac = null, master, dry, verb, users = 0;
  var SCALE = [0, 2, 4, 7, 9];

  function impulse(sec) {
    var n = Math.round(ac.sampleRate * sec), buf = ac.createBuffer(2, n, ac.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    }
    return buf;
  }

  function build() {
    if (ac) return;
    ac = new AC();
    var comp = ac.createDynamicsCompressor();
    comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = 0; master.connect(comp);
    dry = ac.createGain(); dry.gain.value = 0.7; dry.connect(master);
    verb = ac.createConvolver(); verb.buffer = impulse(3.2);
    var wet = ac.createGain(); wet.gain.value = 0.5;
    verb.connect(wet); wet.connect(master);
  }

  function setActive(on) {
    build();
    users = Math.max(0, users + (on ? 1 : -1));
    var t = ac.currentTime;
    master.gain.cancelScheduledValues(t);
    if (users > 0) {
      ac.resume();
      master.gain.setTargetAtTime(0.9, t, 0.5);
    } else {
      master.gain.setTargetAtTime(0, t, 0.25);
      setTimeout(function () { if (!users) ac.suspend(); }, 1200);
    }
  }

  function running() { return !!ac && ac.state === "running" && users > 0; }

  function out(node, pan) {
    var o = node;
    if (pan !== undefined && ac.createStereoPanner) {
      var p = ac.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(p); o = p;
    }
    o.connect(dry); o.connect(verb);
  }

  var MS = {
    supported: !!AC,

    degree: function (i) {
      var oct = Math.floor(i / 5), s = SCALE[((i % 5) + 5) % 5] + 12 * oct;
      return 146.83 * Math.pow(2, s / 12);   // step 0 = D3
    },

    pluck: function (freq, opts) {
      if (!running()) return;
      opts = opts || {};
      var now = ac.currentTime, len = opts.decay || 1.8, peak = opts.gain || 0.07;
      var env = ac.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(peak, now + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, now + len);
      var o1 = ac.createOscillator(), o2 = ac.createOscillator(), g2 = ac.createGain();
      o1.type = "sine"; o1.frequency.value = freq;
      o2.type = "triangle"; o2.frequency.value = freq * 2; g2.gain.value = opts.bright || 0.18;
      o1.connect(env); o2.connect(g2); g2.connect(env);
      out(env, opts.pan);
      o1.start(now); o2.start(now); o1.stop(now + len + 0.1); o2.stop(now + len + 0.1);
    },

    // A sustained chord whose voices glide when the chord changes.
    drone: function () {
      var voices = [], filter = null, gain = null;
      function ensure(n) {
        build();
        if (!filter) {
          filter = ac.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 600; filter.Q.value = 0.7;
          gain = ac.createGain(); gain.gain.value = 0.03;
          filter.connect(gain); out(gain);
        }
        while (voices.length < n) {
          var o = ac.createOscillator(), g = ac.createGain(), p = ac.createStereoPanner ? ac.createStereoPanner() : null;
          o.type = voices.length % 2 ? "triangle" : "sine";
          o.detune.value = voices.length % 2 ? 4 : -4;
          g.gain.value = 0;
          o.connect(g);
          if (p) { g.connect(p); p.connect(filter); } else g.connect(filter);
          o.start();
          voices.push({ o: o, g: g, p: p });
        }
      }
      return {
        setChord: function (freqs, pans, glide) {
          ensure(freqs.length);
          var t = ac.currentTime, k = glide === undefined ? 0.6 : glide;
          voices.forEach(function (v, i) {
            if (i < freqs.length) {
              v.o.frequency.setTargetAtTime(freqs[i], t, k);
              v.g.gain.setTargetAtTime(1 / (1 + i * 0.5), t, 0.3);
              if (v.p && pans) v.p.pan.setTargetAtTime(Math.max(-1, Math.min(1, pans[i] || 0)), t, 0.1);
            } else {
              v.g.gain.setTargetAtTime(0, t, 0.3);
            }
          });
        },
        setBrightness: function (b) {
          if (!filter) return;
          filter.frequency.setTargetAtTime(300 + 1800 * Math.max(0, Math.min(1, b)), ac.currentTime, 0.4);
        },
      };
    },

    running: running,

    // A speaker toggle. onChange(on) is called after the engine switches.
    toggleButton: function (onChange) {
      var OFF =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>' +
        '<path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
      var ON =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>' +
        '<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mathfig__sound";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "Sound");
      function paint(on) { b.innerHTML = (on ? ON : OFF) + "<span>" + (on ? "Sound on" : "Sound") + "</span>"; }
      paint(false);
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", String(on));
        paint(on);
        setActive(on);
        if (onChange) onChange(on);
      });
      return b;
    },

    // Pause audio while a figure is off screen; resume when it returns.
    setVisible: function (visible) {
      if (!ac || !users) return;
      if (visible && ac.state === "suspended") ac.resume();
      else if (!visible && ac.state === "running") ac.suspend();
    },
  };

  window.MathSound = MS;
})();
