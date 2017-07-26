import cs from './scr_core'
import Sprite from './Sprite'
import Input from './Input'

export default class Draw {
   static view = {
      ctx: undefined,
      canvas: undefined
   }

   static surfaces = {}
   static surfaceOrder = []
   static ctx = undefined
   static canvas = {
      width: 0,
      height: 0
   }

   static alpha = 1
   static raw = false
   static height = 0
   static width = 0
   static fontSize = 12
   static background = '#456'
   static debug = {}
   static w = 0
   static h = 0
   static o = 0

   static debugReset() {
      this.debug = {
         skippedSprited: 0,
         drawnSprites: 0
      }
   }

   static ctxImageSmoothing(ctx) {
      ctx.webkitImageSmoothingEnabled = false
      ctx.mozImageSmoothingEnabled = false
      ctx.msImageSmoothingEnabled = false
      ctx.imageSmoothingEnabled = false
   }

   static createSurface(info) {
      var num = this.surfaces.length
      var canvas = document.createElement('canvas')

      this.surfaces[info.name] = {
         name: info.name,
         canvas: canvas,
         ctx: canvas.getContext('2d'),
         zIndex: info.zIndex || 0,
         width: info.width,
         height: info.height,
         raw: info.raw,
         draw: true,
         skip: info.skip,
         drawOutside: info.drawOutside || false,
         autoClear: info.autoClear == undefined ? true : info.autoClear,
         append: info.append,
         clearRequest: false,
         clear: false
      }

      // Add and fix size
      this.addSurfaceOrder(this.surfaces[info.name])
      this.resize()

      // Return the element
      return this.surfaces[info.name]
   }

   static addSurfaceOrder(surface) {
      // Find Place to put it!
      for (var i = 0; i < this.surfaceOrder.length; i++) {
         if (this.surfaceOrder[i].zIndex <= surface.zIndex)
            break
      }

      this.surfaceOrder.splice(i, 0, surface)
   }

   static clearSurfaces() {
      cs.view.ctx.clearRect(0, 0, cs.view.width, cs.view.height)
      for (var surface of this.surfaceOrder) {
         if (surface.autoClear || surface.clearRequest) {
            let clearRect = {
               x: surface.raw ? 0 : cs.camera.getX(),
               y: surface.raw ? 0 : cs.camera.getY(),
               width: surface.raw ? surface.canvas.width : cs.camera.getWidth(),
               height: surface.raw ? surface.canvas.height : cs.camera.getHeight(),
            }
            if (surface.clearRequest) clearRect = surface.clearRequest
            surface.ctx.clearRect(clearRect.x, clearRect.y, clearRect.width, clearRect.height)
            surface.clearRequest = undefined
            surface.clear = true
         }
      }
   }

   static clearSurface(options) {
      var surface = this.surfaces[options.name]
      surface.clearRequest = {
         x: options.x || 0,
         y: options.y || 0,
         width: options.width || surface.canvas.width,
         height: options.height || surface.canvas.height
      }
   }

   static displaySurfaces() {
      var i = this.surfaceOrder.length
      while (i--) {
         this.displaySurface(this.surfaceOrder[i].name)
      }
   }

   static displaySurface(surfaceName) {
      var surface = this.surfaces[surfaceName]
      let sx = surface.raw ? 0 : cs.camera.getX()
      let sy = surface.raw ? 0 : cs.camera.getY()
      let sWidth = surface.raw ? surface.canvas.width : cs.camera.getWidth()
      let sHeight = surface.raw ? surface.canvas.height : cs.camera.getHeight()

      // We will have to scale the X over becuse safari doesnt act like chrome
      let dx = sx < 0 ? Math.floor(cs.camera.getScale() * (cs.camera.getX() * -1)) : 0
      let dy = sy < 0 ? Math.floor(cs.camera.getScale() * (cs.camera.getY() * -1)) : 0
      let dWidth = sWidth <= surface.canvas.width
         ? cs.view.width
         : cs.view.width - Math.floor(cs.camera.getScale() * ((cs.camera.getWidth()) - surface.canvas.width))
      let dHeight = sHeight <= surface.canvas.height
         ? cs.view.height
         : cs.view.height - Math.floor(cs.camera.getScale() * ((cs.camera.getHeight()) - surface.canvas.height))

      if (sx < 0) sx = 0; sWidth += sx * -1
      if (sy < 0) sy = 0; sHeight += sy * -1
      if (sWidth > surface.canvas.width) sWidth = surface.canvas.width
      if (sHeight > surface.canvas.height) sWidth = surface.canvas.height

      cs.view.ctx.drawImage(surface.canvas,
         sx, sy, sWidth, sHeight,
         dx, dy, dWidth, dHeight)
   }

   static resetSurfaces() {
      for (var surface of this.surfaceOrder) {
         surface.clear = false
      }
   }

   static checkResize() {
      var rect = cs.view.getBoundingClientRect()
      var w = rect.width
      var h = rect.height
      var o = screen.orientation
      if (w !== this.w || h !== this.h || o !== this.o) {
          this.w = w
          this.h = h
          this.o = o
          Input.resize()
          this.resize()
      }
   }

   static resize() {
      var viewSize = cs.view.getBoundingClientRect()

      var w = viewSize.width
      var h = viewSize.height
      var ratioHeight = w / h // How many h = w
      var ratioWidth = h / w // how man w = a h

      var nw = cs.camera.getMaxWidth() - (cs.camera.getMaxWidth() % ratioWidth)
      var nh = nw * ratioWidth
      if (nh >= cs.camera.getMaxHeight()) {
         nh = cs.camera.getMaxHeight() - (cs.camera.getMaxHeight() % ratioHeight)
         nw = nh * ratioHeight
      }
      cs.view.width = w
      cs.view.height = h
      this.ctxImageSmoothing(cs.view.ctx)

      for (var surface of this.surfaceOrder) {
         var img = surface.ctx.getImageData(0, 0, surface.canvas.width, surface.canvas.height)
         surface.canvas.width = surface.raw ? w : cs.room.getWidth()
         surface.canvas.height = surface.raw ? h : cs.room.getHeight()
         surface.ctx.putImageData(img, 0, 0)
         this.ctxImageSmoothing(surface.ctx)
      }

      cs.camera.setWidth(Math.ceil(nw))
      cs.camera.setHeight(Math.ceil(nh))
      cs.camera.setScale(w / nw)
   }

   static sprite(options) {
      var sprite = Sprite.getSprite(options.spr)
      var info = sprite.getInfo(options)

      this.debug.drawnSprites++
      if (!this.raw && !this.skip) {
         // If outside camera skip
         if (options.x + sprite.getFwidth() < cs.camera.getX() || options.x  > cs.camera.getX() + cs.camera.getWidth()
         || options.y + sprite.getFheight() < cs.camera.getY() || options.y  > cs.camera.getY() + cs.camera.getHeight()) {
            this.debug.skippedSprites++
            return
         }
      }

      this.ctx.save()
      this.ctx.translate(Math.floor(options.x), Math.floor(options.y))
      this.ctx.rotate(options.angle * Math.PI/180)
      this.ctx.scale(info.scaleX + 0.001, info.scaleY + 0.001)
      this.ctx.drawImage(sprite.getFrames()[info.frame], -sprite.getXoff(), -sprite.getYoff())
      this.ctx.restore()

      this.reset()
   }

   static text(options) {
      this.ctx.fillText(options.text, options.x, options.y)
      this.reset()
   }

   static textSize(str) {
      return this.ctx.measureText(str)
   }

   static line(options) {
      var cx = 0 - ((this.ctx.lineWidth % 2 == 0) ? 0 : 0.50)
      var cy = 0 - ((this.ctx.lineWidth % 2 == 0) ? 0 : 0.50)

      this.ctx.beginPath()
      this.ctx.moveTo(options.x1 - cx, options.y1 - cy)
      this.ctx.lineTo(options.x2 - cx, options.y2 - cy)
      this.ctx.stroke()
      this.reset()
   }

   static fillRect(args) {
      if (typeof args.width == 'undefined') args.width = args.size || 0
      if (typeof args.height == 'undefined') args.height = args.size || 0

      this.ctx.fillRect(args.x, args.y, args.width, args.height)
      this.reset()
   }

   static strokeRect(args) {
      var lineWidth = this.ctx.lineWidth > 1 ? this.ctx.lineWidth : 0
      var lineWidthAdjust = (this.ctx.lineWidth % 2 ? -0.50 : 0) + Math.floor(this.ctx.lineWidth / 2)
      var rect = {
         x: args.x + lineWidthAdjust,
         y: args.y + lineWidthAdjust,
         width: (args.width ? args.width : args.size) - lineWidth,
         height: (args.height ? args.height : args.size) - lineWidth
      }
      this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
      this.reset()
   }

   static circle(x, y, rad, fill) {
      if (typeof fill == 'undefined') fill = true
      this.ctx.beginPath()
      this.ctx.arc(x, y, rad, 0, Math.PI * 2, true)
      this.ctx.closePath()
      (fill)
          ? this.ctx.fill()
          : this.ctx.stroke()
      this.reset()
   }

   static circleGradient(x, y, radius, c1, c2) {
      // Draw a circle
      var g = this.ctx.createRadialGradient(x, y, 0, x, y, radius)
      g.addColorStop(1, c2)
      g.addColorStop(0, c1)
      this.ctx.fillStyle = g
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, 0, Math.PI * 2, true)
      this.ctx.closePath()
      // Fill
      this.ctx.fill()
      this.reset()
   }

   static fixPosition(args) {
      const x = Math.floor(args.x)
      const y = Math.floor(args.y)
      const width = Math.floor(args.width)
      const height = Math.floor(args.height)

      return { x, y, width, height }
   }

   static setColor(color) {
      this.ctx.fillStyle = color
      this.ctx.strokeStyle = color
   }

   static setAlpha(alpha) {
      this.ctx.globalAlpha = alpha
   }

   static setWidth(width) {
      this.ctx.lineWidth = width
   }

   static setFont(font) {
      this.ctx.font = font
   }

   static setTextAlign(alignment) {
      this.ctx.textAlign = alignment
   }

   static setTextBaseline(alignment) {
      this.ctx.textBaseline = alignment
   }

   static setTextCenter() {
      this.setTextAlign('center')
      this.setTextBaseline('middle')
   }

   static setBackground(background) {
      this.background = background
   }

   static setOperation(operation) {
      this.ctx.globalCompositeOperation = operation
   }

   static setSurface(name) {
      this.surface = this.surfaces[name]
      this.canvas = this.surface.canvas
      this.ctx = this.surface.ctx
      this.raw = this.surface.raw
      this.skip = this.surface.skip
   }

   static reset() {
      this.setAlpha(1)
      this.setWidth(1)
      this.setFont(this.fontSize + 'px Trebuchet MS')
      this.setTextAlign('start')
      this.setTextBaseline('top')
      this.setColor('#000')
      this.setOperation('source-over')
   }
}
