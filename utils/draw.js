// ============ utils/draw.js ============
// 绘制吉他指板图 — 仅绘制指板+圆点，左标签由 HTML 固定列实现

var FRET_LINE_COLOR = '#999';
var FRET_BOARD_BG = '#FFF8E1';
var STRING_COLORS = ['#AAA', '#888', '#888', '#555', '#555', '#555'];
var FRET_MARKER_COLOR = '#DDD';

function drawFretboard(ctx, options) {
  var width = options.width || 350;
  var height = options.height || 280;
  var maxFret = options.maxFret || 5;
  var fingerings = options.fingerings || [];
  var currentIndex = options.currentIndex || 0;

  var padding = { top: 22, bottom: 18, left: 12, right: 12 };

  var fretboardWidth = width - padding.left - padding.right;
  var fretboardHeight = height - padding.top - padding.bottom;
  var fretSpacing = fretboardWidth / (maxFret + 1);
  var stringSpacing = fretboardHeight / 5;

  var fontSize = maxFret >= 10 ? 9 : 11;
  var dotRadius = maxFret >= 10 ? 5 : 7;
  var markerRadius = maxFret >= 10 ? 3 : 4;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = FRET_BOARD_BG;
  ctx.fillRect(0, 0, width, height);

  // 品丝 (竖线)
  ctx.strokeStyle = FRET_LINE_COLOR;
  ctx.lineWidth = 1.5;
  for (var fIdx = 0; fIdx <= maxFret; fIdx++) {
    var fx2 = padding.left + fIdx * fretSpacing;
    ctx.beginPath();
    ctx.moveTo(fx2, padding.top);
    ctx.lineTo(fx2, padding.top + fretboardHeight);
    ctx.stroke();
  }

  // 琴弦 (横线)
  var stringWeights = [1.5, 2, 2, 3, 3, 4];
  for (var sIdx = 0; sIdx < 6; sIdx++) {
    var revIdx = 5 - sIdx;
    var yPos = padding.top + revIdx * stringSpacing;
    ctx.strokeStyle = STRING_COLORS[sIdx];
    ctx.lineWidth = stringWeights[sIdx];
    ctx.beginPath();
    ctx.moveTo(padding.left, yPos);
    ctx.lineTo(padding.left + maxFret * fretSpacing, yPos);
    ctx.stroke();
  }

  // 琴枕
  ctx.fillStyle = '#333';
  ctx.fillRect(padding.left - 4, padding.top, 4, fretboardHeight);

  // 品格标记圆点
  var markerPositions = [3, 5, 7, 9, 12];
  ctx.fillStyle = FRET_MARKER_COLOR;
  for (var mIdx = 0; mIdx < markerPositions.length; mIdx++) {
    var mf = markerPositions[mIdx];
    if (mf > maxFret) break;
    var mx2 = padding.left + (mf - 0.5) * fretSpacing;
    var my2 = padding.top + fretboardHeight / 2;
    ctx.beginPath();
    ctx.arc(mx2, my2, markerRadius, 0, Math.PI * 2);
    ctx.fill();
    if (mf === 12) {
      ctx.beginPath();
      ctx.arc(mx2, padding.top + fretboardHeight * 0.3, markerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx2, padding.top + fretboardHeight * 0.7, markerRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 品数标记 (底部)
  ctx.fillStyle = '#999';
  ctx.font = (fontSize - 1) + 'px sans-serif';
  ctx.textAlign = 'center';
  for (var fi = 1; fi <= maxFret; fi++) {
    var fx3 = padding.left + (fi - 0.5) * fretSpacing;
    ctx.fillText(String(fi), fx3, padding.top + fretboardHeight + fontSize + 4);
  }

  // 当前指法圆点
  if (fingerings.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('未找到指法', width / 2, height / 2);
    return;
  }

  var fingering = fingerings[currentIndex];
  if (!fingering) return;

  var strings = fingering.strings;
  if (!strings || strings.length !== 6) return;

  for (var si = 0; si < 6; si++) {
    var st = strings[si];
    var revY = 5 - si;
    var sy3 = padding.top + revY * stringSpacing;

    if (st.fret === 'x' || st.fret === 0 || st.fret === '0') {
      continue;
    }
    var fret = parseInt(st.fret, 10);
    var dx = padding.left + fret * fretSpacing;
    var cx = dx - fretSpacing / 2;

    ctx.beginPath();
    ctx.arc(cx, sy3, dotRadius + 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(211, 47, 47, 0.1)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, sy3, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#D32F2F';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx - dotRadius * 0.2, sy3 - dotRadius * 0.2, dotRadius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold ' + (fontSize - 1) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.label, cx, sy3 + 0.5);
  }

  ctx.textBaseline = 'alphabetic';
}

module.exports = { drawFretboard: drawFretboard };
