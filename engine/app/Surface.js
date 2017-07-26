export default class Surface {
   constructor(options) {
      this.name = options.name
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
      this.zIndex = options.zIndex || 0
      this.width = options.width
      this.height = options.height
      this.raw = options.raw
      this.draw = true
      this.skip = options.skip
      this.drawOutside = options.drawOutside || false
      this.autoClear = options.autoClear || true
      this.append = options.append
      this.clearRequest = false
      this.clear = false
   }

   getName = () => this.name
   getCanvas = () => this.canvas
   getCtx = () => this.ctx
   getZIndex = () => this.zIndex
   getRaw = () => this.raw
   getSkip = () => this.skip
   getAutoClear = () => this.autoClear
   setClearRequest = (clearRequest) => this.clearReuest = clearRequest
   getClearRequest = () => this.clearRequest
   setClear = (clear) => this.clear = clear
   getClear = () => this.clear

   clear(options) {
      this.clearRequest = {
         x: options.x || 0,
         y: options.y || 0,
         width: options.width || this.width,
         height: options.height || this.height
      }
   }

   display() {
      let sx = this.raw ? 0 : cs.camera.getX()
      let sy = this.raw ? 0 : cs.camera.getY()
      let sWidth = this.raw ? this.canvas.width : cs.camera.getWidth()
      let sHeight = this.raw ? this.canvas.height : cs.camera.getHeight()

      // We will have to scale the X over becuse safari doesnt act like chrome
      const dx = sx < 0 ? Math.floor(cs.camera.getScale() * (cs.camera.getX() * -1)) : 0
      const dy = sy < 0 ? Math.floor(cs.camera.getScale() * (cs.camera.getY() * -1)) : 0
      const dWidth = sWidth <= this.canvas.width
         ? cs.view.width
         : cs.view.width - Math.floor(cs.camera.getScale() * ((cs.camera.getWidth()) - this.canvas.width))
      const dHeight = sHeight <= this.canvas.height
         ? cs.view.height
         : cs.view.height - Math.floor(cs.camera.getScale() * ((cs.camera.getHeight()) - this.canvas.height))

      if (sx < 0) {
         sx = 0
         sWidth += sx * -1
      }
      if (sy < 0) {
         sy = 0
         sHeight += sy * -1
      }
      if (sWidth > this.canvas.width) sWidth = this.canvas.width
      if (sHeight > this.canvas.height) sWidth = this.canvas.height

      cs.view.ctx.drawImage(this.canvas,
         sx, sy, sWidth, sHeight,
         dx, dy, dWidth, dHeight)
   }

   resize(width, height) {
      const img = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      this.canvas.width = this.raw ? width : cs.room.getWidth()
      this.canvas.height = this.raw ? height : cs.room.getHeight()
      this.ctx.putImageData(img, 0, 0)
      this.ctxImageSmoothing()
   }

   ctxImageSmoothing() {
      this.ctx.webkitImageSmoothingEnabled = false
      this.ctx.mozImageSmoothingEnabled = false
      this.ctx.msImageSmoothingEnabled = false
      this.ctx.imageSmoothingEnabled = false
   }
}
