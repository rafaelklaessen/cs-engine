import cs from './scr_core'
import Sprite from './Sprite'
import Input from './Input'
import Surface from './Surface'

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

   static getCanvas() {
      return this.canvas
   }

   static getSurface(surfaceName) {
      return this.surfaces[surfaceName]
   }

   static createSurface(info) {
      const surface = new Surface(info)

      this.surfaces[surface.getName()] = surface
      this.addSurfaceOrder(surface)
      this.resize()

      return surface
   }

   static addSurfaceOrder(surface) {
      // Find Place to put it!
      let i = 0
      for (i = 0; i < this.surfaceOrder.length; i++) {
         if (this.surfaceOrder[i].getZIndex() <= surface.getZIndex())
            break
      }

      this.surfaceOrder.splice(i, 0, surface)
   }

   static clearSurfaces() {
      cs.view.ctx.clearRect(0, 0, cs.view.width, cs.view.height)
      for (let surface of this.surfaceOrder) {
         if (surface.getAutoClear() || surface.getClearRequest()) {
            let clearRect = {
               x: surface.getRaw() ? 0 : cs.camera.getX(),
               y: surface.getRaw() ? 0 : cs.camera.getY(),
               width: surface.getRaw() ? surface.getCanvas().width : cs.camera.getWidth(),
               height: surface.getRaw() ? surface.getCanvas().height : cs.camera.getHeight(),
            }
            if (surface.getClearRequest()) clearRect = surface.getClearRequest()
            surface.getCtx().clearRect(clearRect.x, clearRect.y, clearRect.width, clearRect.height)
            surface.setClearRequest(undefined)
            surface.setClear(true)
         }
      }
   }

   static clearSurface(options) {
      const surface = this.getSurface([options.name])
      surface.clear(options)
   }

   static displaySurfaces() {
      let i = this.surfaceOrder.length
      while (i--) {
         this.surfaceOrder[i].display()
      }
   }

   static displaySurface(surfaceName) {
      const surface = this.getSurface(surfaceName)
      surface.display()
   }

   static resetSurfaces() {
      for (let surface of this.surfaceOrder) {
         surface.setClear(false)
      }
   }

   static checkResize() {
      const rect = cs.view.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const o = screen.orientation
      if (w !== this.w || h !== this.h || o !== this.o) {
          this.w = w
          this.h = h
          this.o = o
          Input.resize()
          this.resize()
      }
   }

   static resize() {
      const viewSize = cs.view.getBoundingClientRect()

      const w = viewSize.width
      const h = viewSize.height
      const ratioHeight = w / h // How many h = w
      const ratioWidth = h / w // how man w = a h

      let nw = cs.camera.getMaxWidth() - (cs.camera.getMaxWidth() % ratioWidth)
      let nh = nw * ratioWidth
      if (nh >= cs.camera.getMaxHeight()) {
         nh = cs.camera.getMaxHeight() - (cs.camera.getMaxHeight() % ratioHeight)
         nw = nh * ratioHeight
      }
      cs.view.width = w
      cs.view.height = h
      this.ctxImageSmoothing(cs.view.ctx)

      for (let surface of this.surfaceOrder) {
         surface.resize(w, h)
      }

      cs.camera.setWidth(Math.ceil(nw))
      cs.camera.setHeight(Math.ceil(nh))
      cs.camera.setScale(w / nw)
   }

   static sprite(options) {
      const sprite = Sprite.getSprite(options.spr)
      const info = sprite.getInfo(options)

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
      this.ctx.rotate(options.angle * Math.PI / 180)
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
      const cx = 0 - ((this.ctx.lineWidth % 2 == 0) ? 0 : 0.50)
      const cy = 0 - ((this.ctx.lineWidth % 2 == 0) ? 0 : 0.50)

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
      const lineWidth = this.ctx.lineWidth > 1 ? this.ctx.lineWidth : 0
      const lineWidthAdjust = (this.ctx.lineWidth % 2 ? -0.50 : 0) + Math.floor(this.ctx.lineWidth / 2)
      const rect = {
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
      this.ctx.closePath();
      (fill)
          ? this.ctx.fill()
          : this.ctx.stroke()
      this.reset()
   }

   static circleGradient(x, y, radius, c1, c2) {
      // Draw a circle
      const g = this.ctx.createRadialGradient(x, y, 0, x, y, radius)
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
      this.surface = this.getSurface(name)
      this.canvas = this.surface.getCanvas()
      this.ctx = this.surface.getCtx()
      this.raw = this.surface.getRaw()
      this.skip = this.surface.getSkip()
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
