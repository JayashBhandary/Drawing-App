const $force = document.querySelectorAll('#force')[0]
const $touches = document.querySelectorAll('#touches')[0]
const canvas = document.querySelectorAll('canvas')[0]
const context = canvas.getContext('2d')
const display = document.getElementById('display')
const download = document.getElementById('download');
let lineWidth = 0
let strokeWidth = 50
let isMousedown = false
let points = []

let draw_color = 'black'

let start_background_color = "white";
context.fillStyle = start_background_color;
context.fillRect(0, 0, canvas.width, canvas.height);


canvas.width = window.innerWidth * 2
canvas.height = window.innerHeight * 2

const strokeHistory = []

const requestIdleCallback = window.requestIdleCallback || function (fn) { setTimeout(fn, 1) };

window.addEventListener('load', function(event){
  context.fillStyle = start_background_color;
  context.fillRect(0, 0, canvas.width, canvas.height);
})

function drawOnCanvas (stroke) {
    context.strokeStyle = draw_color;
    context.lineCap = 'round'
    context.lineJoin = 'round'
  
    const l = stroke.length - 1
    if (stroke.length >= 6) {
      const xc = (stroke[l].x + stroke[l - 1].x) / 2
      const yc = (stroke[l].y + stroke[l - 1].y) / 2
      context.lineWidth = stroke[l - 1].lineWidth
      context.quadraticCurveTo(stroke[l - 1].x, stroke[l - 1].y, xc, yc)
      context.stroke()
      context.beginPath()
      context.moveTo(xc, yc)
    } else {
      const point = stroke[l];
      context.lineWidth = point.lineWidth
      context.strokeStyle = point.color
      context.beginPath()
      context.moveTo(point.x, point.y)
      context.stroke()
    }
  }
  
  /**
   * Remove the previous stroke from history and repaint the entire canvas based on history
   * @return {void}
   */
  function undoDraw () {
    strokeHistory.pop()
    context.clearRect(0, 0, canvas.width, canvas.height)
  
    strokeHistory.map(function (stroke) {
      if (strokeHistory.length === 0) return
  
      context.beginPath()
  
      let strokePath = [];
      stroke.map(function (point) {
        strokePath.push(point)
        drawOnCanvas(strokePath)
      })
    })
  }
  
  for (const ev of ["touchstart", "mousedown"]) {
    canvas.addEventListener(ev, function (e) {
      let pressure = 0.1;
      let x, y;
      if(e.touches.length > 1) {
        undoDraw()
      }else {
        
      }
      if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
        if (e.touches[0]["force"] > 0) {
          pressure = e.touches[0]["force"] * strokeWidth
        }
        x = e.touches[0].pageX * 1
        y = e.touches[0].pageY * 1
      } else {
        pressure = strokeWidth
        x = e.pageX * 1
        y = e.pageY * 1
      }
  
      isMousedown = true
  
      lineWidth = Math.log(pressure + 1) * 40
      context.lineWidth = lineWidth// pressure * 50;
  
      points.push({ x, y, lineWidth })
      drawOnCanvas(points)
    })
  }
  
  for (const ev of ['touchmove', 'mousemove']) {
    canvas.addEventListener(ev, function (e) {
      if (!isMousedown) return
      e.preventDefault()
  
      let pressure = 0.1
      let x, y
      if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
        if (e.touches[0]["force"] > 0) {
          pressure = e.touches[0]["force"] * strokeWidth * lineWidth
        }
        x = e.touches[0].pageX * 2
        y = e.touches[0].pageY * 2
      } else {
        pressure = strokeWidth
        x = e.pageX * 2
        y = e.pageY * 2
      }
  
      // smoothen line width
      lineWidth = (Math.log(pressure + 1) * 40 * 0.2 + strokeWidth * 0.8)
      points.push({ x, y, lineWidth })
  
      drawOnCanvas(points);

    })
  }
  
  for (const ev of ['touchend', 'touchleave', 'mouseup']) {
    canvas.addEventListener(ev, function (e) {
      let pressure = 0.1;
      let x, y;
  
      if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
        if (e.touches[0]["force"] > 0) {
          pressure = e.touches[0]["force"] * strokeWidth
        }
        x = e.touches[0].pageX * 2
        y = e.touches[0].pageY * 2
      } else {
        pressure = strokeWidth
        x = e.pageX * 2
        y = e.pageY * 2
      }
  
      isMousedown = false
  
      requestIdleCallback(function () { strokeHistory.push([...points]); points = []})
  
      lineWidth = 0
    })
  };

  display.addEventListener('click', function(){
      const dataURI = canvas.toDataURL("image/jpg");
      console.log(dataURI);
  })

  download.addEventListener("click",function(){
      if(window.navigator.msSaveBlob){
          window.navigator.msSaveBlob(canvas.msToBlob(), "canvas-image");
      }else {
          const a = document.createElement("a");

          document.body.appendChild(a);
          a.href = canvas.toDataURL("image/jpg", 0.1);
          a.download = "canvas-image";
          a.click();
          document.body.removeChild(a);
      }
  })


/*
let start_background_color = "white";
context.fillStyle = start_background_color;
context.fillRect(0, 0, canvas.width, canvas.height);

let draw_color = "black";
let draw_width = "10";
let is_drawing = false;

let restore_array = [];
let index = -1;

function change_color(element) {
    draw_color = element.style.background;
}*/