function drawPlot(canvas, seriesArr, opts, t) {
  var ctx = canvas.getContext("2d");
  var width = canvas.width;
  var height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;
  seriesArr.forEach(function(s) {
    s.data.forEach(function(p) {
      if (!isFinite(p.x) || !isFinite(p.y)) return;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
  });
  if (!isFinite(minX) || minX === maxX) {
    minX = 0;
    maxX = 1;
  }
  if (!isFinite(minY) || minY === maxY) {
    minY = 0;
    maxY = 1;
  }
  var margin = 40;
  var sx = (width - 2 * margin) / (maxX - minX || 1);
  var sy = (height - 2 * margin) / (maxY - minY || 1);
  function mapX(x) {
    return margin + (x - minX) * sx;
  }
  function mapY(y) {
    return height - margin - (y - minY) * sy;
  }
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, margin / 2);
  ctx.lineTo(margin, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.stroke();
  if (opts && opts.xLabel) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px system-ui";
    ctx.fillText(opts.xLabel, width - margin + 6, height - margin + 4);
  }
  if (opts && opts.yLabel) {
    ctx.save();
    ctx.translate(margin - 24, margin);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px system-ui";
    ctx.fillText(opts.yLabel, 0, 0);
    ctx.restore();
  }
  seriesArr.forEach(function(s) {
    var color = s.color || "#111827";
    var widthLine = s.width || 2;
    var dash = s.dash || [];
    var points = s.data;
    if (!points.length) return;
    var count = Math.max(1, Math.floor(points.length * t));
    ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = widthLine;
    ctx.beginPath();
    var first = true;
    for (var i = 0; i < count; i++) {
      var p = points[i];
      if (!isFinite(p.x) || !isFinite(p.y)) continue;
      var x = mapX(p.x);
      var y = mapY(p.y);
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  });
  seriesArr.forEach(function(s) {
    if (!s.markers) return;
    var points = s.data;
    if (!points.length) return;
    var count = Math.max(1, Math.floor(points.length * t));
    ctx.fillStyle = s.color || "#111827";
    for (var i = 0; i < count; i++) {
      var p = points[i];
      if (!isFinite(p.x) || !isFinite(p.y)) continue;
      var x = mapX(p.x);
      var y = mapY(p.y);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}

function animatePlot(canvasId, seriesArr, opts) {
  var canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;
  var start = null;
  var duration = 900;
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = (timestamp - start) / duration;
    if (progress > 1) progress = 1;
    drawPlot(canvas, seriesArr, opts, progress);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function beneficio(x, P0, k, cv, cf) {
  var precio = P0 - k * x;
  var ingreso = precio * x;
  var costo = cf + cv * x;
  return ingreso - costo;
}

function biseccion(P0, k, cv, cf, a, b, tol, maxIter) {
  var f = function(x) { return beneficio(x, P0, k, cv, cf); };
  var fa = f(a);
  var fb = f(b);
  if (fa * fb > 0) {
    return { error: true, message: "intervalo sin cambio de signo" };
  }
  var left = a;
  var right = b;
  var table = [];
  var c;
  var fc;
  var kiter;
  for (kiter = 0; kiter < maxIter; kiter++) {
    c = (left + right) / 2;
    var faNow = f(left);
    fc = f(c);
    table.push({ k: kiter, a: left, b: right, c: c, fc: fc });
    if (Math.abs(fc) < tol || (right - left) / 2 < tol) {
      break;
    }
    if (faNow * fc < 0) {
      right = c;
    } else {
      left = c;
    }
  }
  return { error: false, root: c, iterations: kiter + 1, table: table };
}

function falsaPosicion(P0, k, cv, cf, a, b, tol, maxIter) {
  var f = function(x) { return beneficio(x, P0, k, cv, cf); };
  var fa = f(a);
  var fb = f(b);
  if (fa * fb > 0) {
    return { error: true, message: "intervalo sin cambio de signo" };
  }
  var left = a;
  var right = b;
  var table = [];
  var c;
  var fc;
  var kiter;
  for (kiter = 0; kiter < maxIter; kiter++) {
    fa = f(left);
    fb = f(right);
    c = right - fb * (right - left) / (fb - fa);
    fc = f(c);
    table.push({ k: kiter, a: left, b: right, c: c, fc: fc });
    if (Math.abs(fc) < tol) {
      break;
    }
    if (fa * fc < 0) {
      right = c;
    } else {
      left = c;
    }
  }
  return { error: false, root: c, iterations: kiter + 1, table: table };
}

function puntoFijo(P0, k, cv, cf, lambda, x0, tol, maxIter) {
  var f = function(x) { return beneficio(x, P0, k, cv, cf); };
  var g = function(x) { return x - lambda * f(x); };
  var x = x0;
  var table = [];
  var kiter;
  for (kiter = 0; kiter < maxIter; kiter++) {
    var xNext = g(x);
    var fx = f(xNext);
    table.push({ k: kiter, x: x, xNext: xNext, fx: fx });
    if (Math.abs(xNext - x) < tol || Math.abs(fx) < tol) {
      x = xNext;
      break;
    }
    x = xNext;
  }
  return { error: false, root: x, iterations: kiter + 1, table: table };
}

function newton(P0, k, cv, cf, x0, tol, maxIter) {
  var f = function(x) { return beneficio(x, P0, k, cv, cf); };
  var df = function(x) { return P0 - 2 * k * x - cv; };
  var x = x0;
  var table = [];
  var kiter;
  for (kiter = 0; kiter < maxIter; kiter++) {
    var fx = f(x);
    var dfx = df(x);
    table.push({ k: kiter, x: x, fx: fx, dfx: dfx });
    if (dfx === 0) break;
    var xNext = x - fx / dfx;
    if (Math.abs(xNext - x) < tol || Math.abs(fx) < tol) {
      x = xNext;
      break;
    }
    x = xNext;
  }
  return { error: false, root: x, iterations: kiter + 1, table: table };
}

function secante(P0, k, cv, cf, x0, x1, tol, maxIter) {
  var f = function(x) { return beneficio(x, P0, k, cv, cf); };
  var a = x0;
  var b = x1;
  var table = [];
  var kiter;
  for (kiter = 0; kiter < maxIter; kiter++) {
    var fa = f(a);
    var fb = f(b);
    var denom = fb - fa;
    if (denom === 0) {
      table.push({ k: kiter, x0: a, x1: b, xnew: b, f0: fa, f1: fb });
      break;
    }
    var c = b - fb * (b - a) / denom;
    var fc = f(c);
    table.push({ k: kiter, x0: a, x1: b, xnew: c, f0: fa, f1: fb });
    if (Math.abs(c - b) < tol || Math.abs(fc) < tol) {
      b = c;
      break;
    }
    a = b;
    b = c;
  }
  return { error: false, root: b, iterations: kiter + 1, table: table };
}

function raizExacta(P0, k, cv, cf) {
  var a = -k;
  var b = P0 - cv;
  var c = -cf;
  var disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  var r1 = (-b + Math.sqrt(disc)) / (2 * a);
  var r2 = (-b - Math.sqrt(disc)) / (2 * a);
  var cand = [];
  if (isFinite(r1) && r1 > 0) cand.push(r1);
  if (isFinite(r2) && r2 > 0) cand.push(r2);
  if (!cand.length) return null;
  return Math.max.apply(null, cand);
}

function solveAllMethods() {
  var P0 = parseFloat(document.getElementById("P0").value);
  var kdem = parseFloat(document.getElementById("kdem").value);
  var cv = parseFloat(document.getElementById("cv").value);
  var cf = parseFloat(document.getElementById("cf").value);
  var lambdaFP = parseFloat(document.getElementById("lambdaFP").value);
  var aInt = parseFloat(document.getElementById("aInt").value);
  var bInt = parseFloat(document.getElementById("bInt").value);
  var x0pf = parseFloat(document.getElementById("x0pf").value);
  var x0n = parseFloat(document.getElementById("x0n").value);
  var x0sec = parseFloat(document.getElementById("x0sec").value);
  var x1sec = parseFloat(document.getElementById("x1sec").value);
  var tol = parseFloat(document.getElementById("tol").value);
  var maxIter = parseInt(document.getElementById("maxIter").value, 10);
  var div = document.getElementById("resultRoot");
  var mainValue = document.getElementById("mainResultValue");
  var mainSub = document.getElementById("mainResultSub");

  var rex = raizExacta(P0, kdem, cv, cf);
  if (rex === null) {
    div.innerHTML = "<p class=\"danger-text\">El modelo no produce una raiz real positiva con estos datos.</p>";
    mainValue.textContent = "–";
    mainSub.textContent = "Ajuste los parametros para obtener una raiz real positiva.";
    animatePlot("canvasRoot", [], { xLabel: "unidades", yLabel: "beneficio" });
    animatePlot("canvasIter", [], { xLabel: "iteracion", yLabel: "x(k)" });
    return;
  }

  var resBis = biseccion(P0, kdem, cv, cf, aInt, bInt, tol, maxIter);
  if (resBis.error) {
    div.innerHTML = "<p class=\"danger-text\">El intervalo de biseccion no presenta cambio de signo. Ajuste a y b.</p>";
    mainValue.textContent = "–";
    mainSub.textContent = "Seleccione un intervalo donde el beneficio cambie de signo.";
    animatePlot("canvasRoot", [], { xLabel: "unidades", yLabel: "beneficio" });
    animatePlot("canvasIter", [], { xLabel: "iteracion", yLabel: "x(k)" });
    return;
  }

  var resFal = falsaPosicion(P0, kdem, cv, cf, aInt, bInt, tol, maxIter);
  var resFP = puntoFijo(P0, kdem, cv, cf, lambdaFP, x0pf, tol, maxIter);
  var resNew = newton(P0, kdem, cv, cf, x0n, tol, maxIter);
  var resSec = secante(P0, kdem, cv, cf, x0sec, x1sec, tol, maxIter);

  var methods = [
    { name: "Biseccion", result: resBis },
    { name: "Falsa posicion", result: resFal },
    { name: "Punto fijo", result: resFP },
    { name: "Newton", result: resNew },
    { name: "Secante", result: resSec }
  ];
  methods.forEach(function(m) {
    m.errorAbs = Math.abs(m.result.root - rex);
  });

  var bestIndex = 0;
  var bestErr = methods[0].errorAbs;
  for (var i = 1; i < methods.length; i++) {
    if (methods[i].errorAbs < bestErr) {
      bestErr = methods[i].errorAbs;
      bestIndex = i;
    }
  }
  var bestMethod = methods[bestIndex];

  mainValue.textContent = bestMethod.result.root.toFixed(4) + " unidades";
  mainSub.textContent =
    "Metodo mas preciso en esta configuracion: " +
    bestMethod.name +
    " (error abs " +
    bestMethod.errorAbs.toExponential(3) +
    "). La raiz exacta teorica es " +
    rex.toFixed(4) +
    " unidades.";

  var html = "";
  html += "<p>Modelo de beneficio con precio(x) = P0 - k x, donde P0 = " + P0.toFixed(2) + ", k = " + kdem.toFixed(3) + ", cv = " + cv.toFixed(2) + ", cf = " + cf.toFixed(2) + ".</p>";
  html += "<p>Raiz exacta positiva de beneficio(x) = 0: <span class=\"emphasis\">" + rex.toFixed(6) + " unidades</span>.</p>";
  html += "<table class=\"result-table\"><thead><tr><th>Metodo</th><th>Raiz</th><th>Iter</th><th>Error abs</th></tr></thead><tbody>";
  methods.forEach(function(m, idx) {
    var r = m.result;
    var cls = idx === bestIndex ? " class=\"best-row\"" : "";
    html += "<tr" + cls + "><td>" + m.name + "</td><td>" + r.root.toFixed(6) + "</td><td>" + r.iterations + "</td><td>" + m.errorAbs.toExponential(3) + "</td></tr>";
  });
  html += "</tbody></table>";

  var bisRows = resBis.table
    .map(function(r) {
      return "<tr><td>" + r.k + "</td><td>" + r.a.toFixed(4) + "</td><td>" + r.b.toFixed(4) + "</td><td>" + r.c.toFixed(4) + "</td><td>" + r.fc.toExponential(3) + "</td></tr>";
    })
    .join("");
  html += "<p>Iteraciones del metodo de biseccion:</p>";
  html += "<table class=\"result-table\"><thead><tr><th>k</th><th>a(k)</th><th>b(k)</th><th>c(k)</th><th>f(c(k))</th></tr></thead><tbody>" + bisRows + "</tbody></table>";
  div.innerHTML = html;

  var f = function(x) {
    return beneficio(x, P0, kdem, cv, cf);
  };
  var a = aInt;
  var b = bInt;
  var nPlot = 200;
  var funcData = [];
  for (var i = 0; i <= nPlot; i++) {
    var x = a + (b - a) * i / nPlot;
    funcData.push({ x: x, y: f(x) });
  }
  var zeroLine = [
    { x: a, y: 0 },
    { x: b, y: 0 }
  ];
  var pExact = [{ x: rex, y: 0 }];
  var pBis = [{ x: resBis.root, y: 0 }];
  var pFal = [{ x: resFal.root, y: 0 }];
  var pFP = [{ x: resFP.root, y: 0 }];
  var pNew = [{ x: resNew.root, y: 0 }];
  var pSec = [{ x: resSec.root, y: 0 }];

  var seriesRoot = [
    { data: funcData, color: "#00c853", width: 2 },
    { data: zeroLine, color: "#9ca3af", width: 1, dash: [6, 4] },
    { data: pExact, color: "#2563eb", markers: true },
    { data: pBis, color: "#ef4444", markers: true },
    { data: pFal, color: "#7c3aed", markers: true },
    { data: pFP, color: "#f59e0b", markers: true },
    { data: pNew, color: "#e11d48", markers: true },
    { data: pSec, color: "#0d9488", markers: true }
  ];
  animatePlot("canvasRoot", seriesRoot, { xLabel: "unidades", yLabel: "beneficio" });

  var iterBis = resBis.table.map(function(r) { return { x: r.k, y: r.c }; });
  var iterFal = resFal.table.map(function(r) { return { x: r.k, y: r.c }; });
  var iterPF = resFP.table.map(function(r) { return { x: r.k, y: r.xNext }; });
  var iterNew = resNew.table.map(function(r) { return { x: r.k, y: r.x }; });
  var iterSec = resSec.table.map(function(r) {
    return { x: r.k, y: r.xnew !== undefined ? r.xnew : r.x1 };
  });

  var seriesIter = [
    { data: iterBis, color: "#ef4444", width: 2, markers: true },
    { data: iterFal, color: "#7c3aed", width: 2, markers: true },
    { data: iterPF, color: "#f59e0b", width: 2, markers: true },
    { data: iterNew, color: "#e11d48", width: 2, markers: true },
    { data: iterSec, color: "#0d9488", width: 2, markers: true }
  ];
  animatePlot("canvasIter", seriesIter, { xLabel: "iteracion", yLabel: "x(k)" });
}

function loadExample() {
  document.getElementById("P0").value = 100;
  document.getElementById("kdem").value = 0.1;
  document.getElementById("cv").value = 40;
  document.getElementById("cf").value = 1000;
  document.getElementById("lambdaFP").value = 0.005;
  document.getElementById("aInt").value = 0;
  document.getElementById("bInt").value = 200;
  document.getElementById("x0pf").value = 50;
  document.getElementById("x0n").value = 50;
  document.getElementById("x0sec").value = 20;
  document.getElementById("x1sec").value = 150;
  document.getElementById("tol").value = 0.0001;
  document.getElementById("maxIter").value = 50;
  document.getElementById("resultRoot").innerHTML =
    "<p>Parametros de ejemplo cargados. Presione <span class=\"highlight\">Calcular todos los metodos</span> para ver la comparacion en tabla y graficas.</p>";
  var mainValue = document.getElementById("mainResultValue");
  var mainSub = document.getElementById("mainResultSub");
  mainValue.textContent = "–";
  mainSub.textContent = "Ejecute el calculo para ver el punto de equilibrio y el metodo mas preciso.";
  animatePlot("canvasRoot", [], { xLabel: "unidades", yLabel: "beneficio" });
  animatePlot("canvasIter", [], { xLabel: "iteracion", yLabel: "x(k)" });
}

loadExample();
