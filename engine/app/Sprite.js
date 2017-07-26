import cs from './scr_core'
import Draw from './Draw'

export default class Sprite {
   static list = {}

   constructor(options) {
      cs.loading += 1
      this.name = options.path.split('/').pop()

      // Set up
      this.img = new Image()
      this.img.src = options.path + '.png'
      this.img.frames = []

      // Frame Width/Height/Tile
      this.img.texture = options.texture
      this.img.frames = options.frames || 1
      this.img.fwidth = options.fwidth | 0
      this.img.fheight = options.fheight || 0
      this.img.xoff = options.xoff || 0
      this.img.yoff = options.yoff || 0

      this.img.onload = function() {
         // Set up
         if (this.fwidth == 0) {
            this.fwidth = this.width
         }
         if (this.fheight == 0) {
            this.fheight = this.height
         }

         // Create Frames
         this.frames = []
         let dx = 0
         let dy = 0
         while (dx < this.width && dy < this.height) {
            const frame = {}
            frame.canvas = document.createElement('canvas')
            frame.canvas.width = this.fwidth
            frame.canvas.height = this.fheight
            frame.canvas.ctx = frame.canvas.getContext('2d')

            frame.canvas.ctx.drawImage(this, dx, dy, this.fwidth, this.fheight,
               0, 0, this.fwidth, this.fheight)
            this.frames.push(frame.canvas)
            dx += this.fwidth
            if (dx === this.width) {
               dx = 0, dy+= this.fwidth
            }
         }

         for (let surface of Draw.surfaceOrder) {
            surface.clear = false
         }

         // Sprites Loaded Start Engine
         cs.loading -= 1
      }
   }

   getName = () => this.name
   getFrames = () => this.img.frames
   getFwidth = () => this.img.fwidth
   getFheight = () => this.img.fheight
   getXoff = () => this.img.xoff
   getYoff = () => this.img.yoff

   texture(width, height) {
      this.img.frames[0].width = width
      this.img.frames[0].height = height
      this.img.fwidth = width
      this.img.fheight = height
      this.img.frames[0].ctx.clearRect(0, 0, width, height)
      let x = 0
      while (x < width) {
         let y = 0
         while (y < height) {
            this.frames[0].ctx.drawImage(sprite, x, y)
            y += this.height
         }
         x += this.width
      }
   }

   getInfo(options) {
      // We need something to return info on sprites based on scale etc
      if (typeof options.frame == 'undefined') options.frame = 0
      if (typeof options.scaleX == 'undefined') options.scaleX = 1
      if (typeof options.scaleY == 'undefined') options.scaleY = 1
      if (options.scale) {
         options.scaleX = options.scale
         options.scaleY = options.scale
      }
      // Scaling with width/height
      if (options.width) {
         options.scaleX = options.width / this.fwidth
      }
      if (options.height) {
         options.scaleY = options.height / this.fheight
      }

      // Locking aspect ratio
      if (options.aspectLock) {
         (options.scaleX !== 1)
            ? options.scaleY = options.scaleX
            : options.scaleX = options.scaleY
      }

      return {
         width: this.img.fwidth * options.scaleX,
         height: this.img.fheight * options.scaleY,
         scaleX: options.scaleX,
         scaleY: options.scaleY,
         frames: this.img.frames,
         frame: options.frame
      }
   }

   draw(options) {
      options.spr = this.getName()
      Draw.sprite(options)
   }

   static texture(spriteName, width, height) {
      this.list[options.spr].texture(width, height)
   }

   static info(options) {
      return this.list[options.spr].getInfo(options)
   }

   static getSprite(spriteName) {
      return this.list[spriteName]
   }

   static addSprite(sprite) {
      this.list[sprite.getName()] = sprite
   }

   static addSprites(spriteArr) {
      for (let sprite of spriteArr) {
         this.addSprite(sprite)
      }
   }
}
