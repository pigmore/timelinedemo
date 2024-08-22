// import axios from 'axios'
// import sharp from 'sharp'
export function clone(instance) {
  return Object.assign(
    Object.create(
      // Set the prototype of the new object to the prototype of the instance.
      // Used to allow new object behave like class instance.
      Object.getPrototypeOf(instance),
    ),
    // Prevent shallow copies of nested structures like arrays, etc
    JSON.parse(JSON.stringify(instance)),
  );
}

export const drawEdgePoint = (ctx, x, y, w, h) => {
  drawCircleIcon(ctx, x, y);
  drawCircleIcon(ctx, x + w, y);
  drawCircleIcon(ctx, x + w, y + h);
  drawCircleIcon(ctx, x, y + h);
  drawCircleIcon(ctx, x + w / 2, y - 30);
};
export const randomInt = (a, b) => {
  return parseInt(Math.random() * (b - a) + a);
};

export function drawCircleIcon(ctx, left, top) {
  ctx.save();
  ctx.translate(left, top);
  // ctx.rotate(util.degreesToRadians(fabricObject.angle))
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.shadowColor = "#333333";
  ctx.shadowBlur = 3;
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

export function loadTextProssse(textName, _url) {
  console.log(_url)
  return new Promise((resolve, reject) => {

    let f = new FontFace(textName, `url(${_url})`);

    f.load().then(() => {
      resolve();
    });

  });
}

export function loadVideoProssse(_canvas, _url) {
  return new Promise(async(resolve, reject) => {
    await fetch(_url)
    .then((response) => response.body)
    .then(async(body) => {
      const reader = body.getReader();
      let buffer = [];
      let videoEl = document.createElement("video")
      while (1) {
          const { value, done } = await reader.read();
          // console.log(reader)
          // console.log(value)
          // console.log(done)
          if (done) {
              const blob = new Blob(buffer);
              const blobUrl = URL.createObjectURL(blob);

              videoEl.src = blobUrl;

              break;

          }

          buffer.push(value);
          console.log('??')
      }
      resolve(videoEl);

    });


  });
}
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
export function loadImgByDom(_id, _url) {
  return new Promise((resolve, reject) => {
    let seal = document.createElement("img");
    seal.setAttribute("id", _id);
    seal.src = _url;
    // document.body.appendChild(seal);
    // var seal = new Image();
    // seal.src = _url;
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
  ctx.stroke();
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
  ctx.closePath();
  ctx.beginPath();
  ctx.moveTo(a + 4, b);
  ctx.lineTo(c + 4, d);
  ctx.closePath();
  ctx.stroke();
}
export function drawFoucsLine(ctx, a, b, c, d, _strokeStyle) {
  ctx.lineWidth = "1";
  ctx.strokeStyle = _strokeStyle;
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
}
export function drawTimePointer(ctx, x, h) {
  drawLine(ctx, x, 0, x, h, "#5297ff", 2);
  ctx.fillStyle = "#5297ff";
  ctx.beginPath();
  ctx.moveTo(x - 5, 0);
  ctx.lineTo(x + 5, 0);
  ctx.lineTo(x + 5, 10);
  ctx.lineTo(x + 0, 15);
  ctx.lineTo(x - 5, 10);
  // ctx.lineTo(x-10, 20);
  ctx.closePath();
  // ctx.stroke();
  ctx.fill();
}
export function drawScale(ctx) {
  for (var i = 0; i < 200; i++) {
    if (window.timelineXScale <= 2) {
      const _x = i * 50 * window.timelineXScale + 20;

      if (i % 2 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i * 5), _x - 16, 25);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    } else if (window.timelineXScale > 2 && window.timelineXScale <= 5) {
      const _x = i * 10 * window.timelineXScale + 20;

      if (i % 5 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i), _x - 16, 25);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    } else if (window.timelineXScale > 5 && window.timelineXScale < 15) {
      const _x = i * 10 * window.timelineXScale + 20;

      if (i % 2 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i), _x - 16, 25);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    } else if (window.timelineXScale >= 15 && window.timelineXScale < 25) {
      const _x = i * 5 * window.timelineXScale + 20;

      if (i % 2 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i / 2), _x - 16, 25);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    } else if (window.timelineXScale >= 25) {
      const _x = i * 2.5 * window.timelineXScale + 20;

      if (i % 4 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i / 4), _x - 16, 25);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
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
export function drawRect(ctx, _square) {
  const p = _square;
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  ctx.lineTo(p[1][0], p[1][1]);
  ctx.lineTo(p[2][0], p[2][1]);
  ctx.lineTo(p[3][0], p[3][1]);
  ctx.closePath();
  // ctx.stroke();
  // ctx.fill();

  return this;
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
