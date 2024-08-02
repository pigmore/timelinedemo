export const randomInt = (a, b) => {
  return parseInt(Math.random() * (b - a) + a);
};
export function fillCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fill();
  return this;
}
export function fillEdgeCircle(ctx, x, y, w) {
  ctx.fillStyle = 'rgba(220, 220, 220 , 1)';
  fillCircle(ctx, x+5, y +5, 2);
  fillCircle(ctx, x+5, y +10, 2);
  fillCircle(ctx, x+5, y +15, 2);
  fillCircle(ctx, x+w-5, y +5, 2);
  fillCircle(ctx, x+w-5, y +10, 2);
  fillCircle(ctx, x+w-5, y +15, 2);
  return this;
}
export function drawLine(ctx, a, b, c, d) {
  ctx.lineWidth="0.5";
  ctx.strokeStyle="purple";
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
};
export function drawRoundedRect(ctx, x, y, w, h,r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
  // ctx.stroke();
  ctx.fill();

  return this;
}
