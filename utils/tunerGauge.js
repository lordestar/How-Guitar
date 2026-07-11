// ============ utils/tunerGauge.js ============
// v5: clean rewrite after regex corruption

function drawGauge(ctx, pointerAngle, currentAngle, state) {
  const sys = wx.getSystemInfoSync();
  const rpx = sys.windowWidth / 750;
  const W = 520 * rpx;
  const H = 420 * rpx;
  const cx = W / 2;
  const cy = H * 0.50;
  const R = Math.min(W, H) * 0.38;
  const ARC_START = Math.PI;
  const ARC_END = 2 * Math.PI;
  const ARC_MID = 3 * Math.PI / 2;
  const ARC_SPAN = Math.PI;

  ctx.clearRect(0, 0, W, H);

  const target = pointerAngle || 0;
  const updatedAngle = (currentAngle || 0) + (target - (currentAngle || 0)) * 0.18;
  const stateClass = state.statusClass;

  // semi-transparent reference arc
  ctx.beginPath();
  ctx.arc(cx, cy, R + 12 * rpx, ARC_START, ARC_END, false);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 18 * rpx;
  ctx.stroke();

  // gradient arc segments
  const arcSegments = 60;
  for (let i = 0; i < arcSegments; i++) {
    const t = i / arcSegments;
    const nextT = (i + 1) / arcSegments;
    const a1 = ARC_START + t * ARC_SPAN;
    const a2 = ARC_START + nextT * ARC_SPAN;
    const distFromMid = Math.abs(t - 0.5) * 2;
    const r = Math.round(180 + distFromMid * 75);
    const g = Math.round(140 - distFromMid * 100);
    const b = Math.round(120 - distFromMid * 80);
    ctx.beginPath();
    ctx.arc(cx, cy, R, a1, a2, false);
    ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.lineWidth = 10 * rpx;
    ctx.lineCap = 'butt';
    ctx.stroke();
  }

  // tick marks
  for (let ti = 0; ti <= 12; ti++) {
    const t = ti / 12;
    const a = ARC_START + t * ARC_SPAN;
    const isCenter = ti === 6;
    const innerR = R - (isCenter ? 16 : 10) * rpx;
    const outerR = R + (isCenter ? 4 : 1) * rpx;
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(a), cy + innerR * Math.sin(a));
    ctx.lineTo(cx + outerR * Math.cos(a), cy + outerR * Math.sin(a));
    ctx.strokeStyle = isCenter ? '#FFFFFF' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = isCenter ? 2 * rpx : 1 * rpx;
    ctx.stroke();
  }

  // pointer
  const angleClamped = Math.max(-90, Math.min(90, updatedAngle));
  const ptrAngle = ARC_MID + (angleClamped / 90) * (Math.PI / 2);
  const ptrLen = R - 16 * rpx;
  const ptrX = cx + ptrLen * Math.cos(ptrAngle);
  const ptrY = cy + ptrLen * Math.sin(ptrAngle);

  const ptrColor =
    stateClass === 'tuned' ? '#5CBF60'
    : stateClass === 'flat' ? '#E08844'
    : stateClass === 'sharp' ? '#E06666'
    : '#666';

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ptrX, ptrY);
  ctx.strokeStyle = ptrColor;
  ctx.lineWidth = 2.5 * rpx;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(ptrX, ptrY, 4 * rpx, 0, Math.PI * 2);
  ctx.fillStyle = ptrColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, 6 * rpx, 0, Math.PI * 2);
  ctx.fillStyle = stateClass === 'tuned' ? '#5CBF60' : '#555';
  ctx.fill();

  // string info
  ctx.fillStyle = '#706868';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    state.currentInfo.string + '\u5F26 \u00B7 ' + state.currentInfo.frequency + ' Hz',
    cx,
    H - 8 * rpx
  );

  return updatedAngle;
}

module.exports = { drawGauge };
