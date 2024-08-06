export const randomInt = (a, b) => {
  return parseInt(Math.random() * (b - a) + a);
};
export function loadImgProssse(_canvas, _url) {
  return new Promise((resolve, reject) => {
    // let seal = _canvas.createImage()
    // seal.src = _url
    var seal = new Image();
    seal.src = _url;
    seal.onload = () => {
      resolve(seal);
    };
  });
}
export function fitString(ctx, str, maxWidth) {
  var width = ctx.measureText(str).width,
    ellipsis = "...",
    ellipsisWidth = ctx.measureText(ellipsis).width;

  if (width <= maxWidth || width <= ellipsisWidth) {
    return str;
  } else {
    var len = str.length;
    while (width >= maxWidth - ellipsisWidth && len-- > 0) {
      str = str.substring(0, len);
      width = ctx.measureText(str).width;
    }
    return str + ellipsis;
  }
}
export function uuid() {
  var u = "",
    i = 0;
  while (i++ < 4) {
    var c = "xxxx"[i - 1],
      r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    u += c == "-" || c == "4" ? c : v.toString(16);
  }
  return u;
}
export function fillCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fill();
  return this;
}
export function fillEdgeCircle(ctx, x, y, w) {
  ctx.fillStyle = "rgba(255, 255, 255 , 1)";
  fillCircle(ctx, x + 5, y + 5, 2);
  fillCircle(ctx, x + 5, y + 10, 2);
  fillCircle(ctx, x + 5, y + 15, 2);
  fillCircle(ctx, x + w - 5, y + 5, 2);
  fillCircle(ctx, x + w - 5, y + 10, 2);
  fillCircle(ctx, x + w - 5, y + 15, 2);
  return this;
}
export function drawDoubleLine(ctx, a, b, c, d, _strokeStyle) {
  ctx.lineWidth = "1";
  ctx.strokeStyle = _strokeStyle;
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(a + 4, b);
  ctx.lineTo(c + 4, d);
  ctx.stroke();
}
export function drawScale(ctx) {
  for (var i = 0; i < 200; i++) {
    if (i % 2 == 0) {
      drawLine(ctx, i * 50 + 20, 0, i * 50 + 20, 10, "white", 1);
      ctx.fillStyle = "rgba(255, 255, 255 , 1)";
      ctx.font = "12px Arial";
      ctx.fillText(secondTrans(i), i * 50 + 6, 25);
    } else {
      drawLine(ctx, i * 50 + 20, 0, i * 50 + 20, 10, "white", 1);
    }
  }
}
function secondTrans(_s) {
  return new Date(_s * 1000).toISOString().substring(14, 19);
}
export function drawLine(ctx, a, b, c, d, _color = "purple", _lineWidth = 1) {
  ctx.lineWidth = _lineWidth;
  ctx.strokeStyle = _color;
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
}
export function drawRoundedRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = Math.abs(w / 2);
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  return this;
}
