// Name Space
var cs = {}
// ---------------------------------------------------------------------------------------------//
// -----------------------------| Global Variables and Scripts |--------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.global = {}
cs.script = {}
cs.save = {}
cs.objects = {}
cs.sprites = {}
cs.loading = 0
// ---------------------------------------------------------------------------------------------//
// --------------------------------| Performance Monitoring |-----------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.fps = {
    rate: 0,
    frame: 0,
    check: Date.now(),
    update: function() {
        if (Date.now() - this.check > 1000) {
            this.check = Date.now()
            this.rate = this.frame
            this.frame = 0
        } else {
            this.frame++
        }
    }
}
// ---------------------------------------------------------------------------------------------//
// ----------------------------------| Global Functions |---------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.init = function(canvasId, room, camera) {
   // Listen for Errors
   window.onerror = function(errorMsg, url, lineNumber) { cs.loop.run = false }

   // Initiate Inputs
   cs.view = document.getElementById(canvasId)
   cs.view.ctx = cs.view.getContext('2d')
   cs.view.tabIndex = 1000
   cs.view.addEventListener('keydown', cs.key.updateDown)
   cs.view.addEventListener('keyup', cs.key.updateUp)
   cs.view.addEventListener('mousemove', cs.mouse.move)
   cs.view.addEventListener('mousedown', cs.mouse.down)
   cs.view.addEventListener('mouseup', cs.mouse.up)
   cs.view.addEventListener('touchstart', cs.touch.down, false)
   cs.view.addEventListener('touchend', cs.touch.up, false)
   cs.view.addEventListener('touchcancel', cs.touch.up, false)
   cs.view.addEventListener('touchmove', cs.touch.move, false)
   cs.input.create()

   cs.room = room
   cs.camera = camera

   // View, Game and GUI surfaces
   cs.draw.createSurface({ name: 'gui', raw: true, zIndex: 100 })
   cs.draw.createSurface({ name: 'game', raw: false })

   // Camera/View Size
   cs.draw.resize()
   cs.input.resize()

   // Sound
   cs.sound.active = cs.sound.init()
   window.onfocus = function() { cs.sound.toggleActive(true) }
   window.onblur = function() { cs.sound.toggleActive(false) }

   // Start your engines!
   cs.loop.step()
}
cs.loop = {
   run: true,
   step: function() {
      if (cs.loop.run) {
         setTimeout(function() { cs.loop.step() }, 1000/60)
      }

      cs.fps.update()
      cs.key.execute()
      cs.draw.debugReset()
      cs.camera.update()
      cs.draw.clearSurfaces()

      var i = cs.obj.list.length
      while (i--) {
         if (cs.obj.list[i].live) {
            var obj = cs.obj.list[i]
            cs.draw.setSurface(obj.surface)

            cs.particle.settings = obj.particle.settings
            cs.particle.obj = obj
            var step = cs.objects[obj.type].step
            step.call(obj)
         }
      }

      cs.draw.resetSurfaces()
      cs.key.reset()
      cs.touch.reset()

      // Resize Canvas
      cs.draw.checkResize()
      cs.draw.displaySurfaces()
      if (cs.room.restarting === true) {
         cs.room.reset()
      }
   }
}
// ---------------------------------------------------------------------------------------------//
// -----------------------------------| Object Functions |--------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.Obj = function(options) {
   var object = cs.objects[options.type]
   var zIndex = cs.objects[options.type].zIndex || 0

   // Create the object
   this.zIndex = zIndex
   this.live = true
   this.type = options.type
   this.id = cs.obj.unique
   this.core = object.core || false
   this.surface = 'game'
   this.particle = { list : [], settings : {} }
   this.touch = cs.touch.create()
   this.x = options.x || 0
   this.y = options.y || 0
   this.width = object.width
   this.height = object.height
   this.sprite = object.sprite

   // Run Create event
   object.create.call(this)

   // Add the object to the list
   cs.obj.unique++

   // Object Grouping
   if (!cs.obj.objGroups[options.type]) cs.obj.objGroups[options.type] = []
   cs.obj.objGroups[options.type].push(this)
   return this
}

cs.Obj.prototype.setLive = function(isLive) {
   this.live = isLive
}

cs.Obj.prototype.destroy = function() {
   var type = this.type
   this.live = false

   cs.obj.objGroups[type] = cs.obj.objGroups[type].filter(function(obj) { return obj.live })
}

cs.obj = {
   list: [],
   types: {},
   objGroups: {},
   unique: 0,
   addObj: function(obj) {
      var pos = this.findPosition(obj.zIndex)
      this.list.splice(pos, 0, obj)
   },
   addObjs: function(objArr) {
      for (var obj of objArr) {
         this.addObj(obj)
      }
   },
   destroy: function(destroyObj) {
      if (typeof destroyObj === 'object') {
         destroyObj.destroy()
      } else {
         for (var obj of cs.obj.list) {
            if (obj.id === destroyObj) {
               obj.setLive(false)
               var type = obj.type
            }
         }
         this.objGroups[type] = this.objGroups[type].filter(function(obj) { return obj.live })
      }
   },
   findPosition: function(zIndex) {
      for (var i = 0; i < this.list.length; i++) {
         if (zIndex >= this.list[i].zIndex)
            return i
      }
      return i
   },
   all: function(type) {
      return this.list.filter(function(obj) {
         return (obj.type == type && obj.live)
      })
   },
   find: function(type) {
      return this.list.find(function(obj) {
         return (obj.type == type && obj.live)
      })
   },
   count: function(type) {
      return this.objGroups[type]
         ? this.objGroups[type].length
         : 0
   }
}
// ---------------------------------------------------------------------------------------------//
// -----------------------------------| Sprite Functions |--------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.Sprite = function(options) {
   cs.loading++
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
      var dx = 0, dy = 0
      while (dx < this.width && dy < this.height) {
         var frame = {}
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

      for (var surface of cs.draw.surfaceOrder) {
         surface.clear = false
      }

      // Sprites Loaded Start Engine
      cs.loading -= 1
      if (cs.loading == 0) {
         cs.start()
      }
   }
}

cs.Sprite.prototype.getName = function() {
   return this.name
}

cs.Sprite.prototype.getFrames = function() {
   return this.img.frames
}

cs.Sprite.prototype.getFwidth = function() {
   return this.img.fwidth
}

cs.Sprite.prototype.getFheight = function() {
   return this.img.fheight
}

cs.Sprite.prototype.getXoff = function() {
   return this.img.xoff
}

cs.Sprite.prototype.getYoff = function() {
   return this.img.yoff
}

cs.Sprite.prototype.texture = function(width, height) {
   this.img.frames[0].width = width
   this.img.frames[0].height = height
   this.img.fwidth = width
   this.img.fheight = height
   this.img.frames[0].ctx.clearRect(0, 0, width, height)
   var x = 0
   while (x < width) {
      var y = 0
      while (y < height) {
         this.frames[0].ctx.drawImage(sprite, x, y)
         y += this.height
      }
      x += this.width
   }
}

cs.Sprite.prototype.info = function(options) {
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

cs.Sprite.prototype.getInfo = cs.Sprite.prototype.info

cs.Sprite.prototype.draw = function(options) {
   options.spr = this.getName()
   cs.draw.sprite(options)
}

cs.sprite = {
   list: {},
   texture: function(spriteName, width, height) {
      this.list[options.spr].texture(width, height)
   },
   info: function(options) {
      return this.list[options.spr].getInfo(options)
   },
   getSprite: function(spriteName) {
      return this.list[spriteName]
   },
   addSprite: function(sprite) {
      this.list[sprite.getName()] = sprite
   },
   addSprites: function(spriteArr) {
      for (sprite of spriteArr) {
         this.addSprite(sprite)
      }
   }
}
// ---------------------------------------------------------------------------------------------//
// ----------------------------------| Drawing Functions |--------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.draw = {
   view: { ctx: undefined, canvas : undefined },
   surfaces: {},
   surfaceOrder: [],
   ctx: undefined,
   canvas: {width: 0, height: 0},
   alpha: 1,
   raw: false,
   height: 0,
   width: 0,
   fontSize: 12,
   background: '#465',
   debug: {},
   w: 0,
   h: 0,
   o: 0,
   debugReset: function() {
      this.debug = {
         skippedSprites: 0,
         drawnSprites: 0
      }
   },
   ctxImageSmoothing: function(ctx) {
      ctx.webkitImageSmoothingEnabled = false
      ctx.mozImageSmoothingEnabled = false
      ctx.msImageSmoothingEnabled = false
      ctx.imageSmoothingEnabled = false
   },
   createSurface: function(info) {
      var num = cs.draw.surfaces.length
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
      cs.draw.resize()

      // Return the element
      return this.surfaces[info.name]
   },
   addSurfaceOrder: function(surface) {
      // Find Place to put it!
      for (var i = 0; i < this.surfaceOrder.length; i++) {
         if (this.surfaceOrder[i].zIndex <= surface.zIndex)
            break
      }

      this.surfaceOrder.splice(i, 0, surface)
   },
   clearSurfaces: function() {
      cs.view.ctx.clearRect(0, 0, cs.view.width, cs.view.height)
      for (var surface of this.surfaceOrder) {
         if (surface.autoClear || surface.clearRequest) {
            clearRect = {
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
   },
   clearSurface: function(options) {
      var surface = this.surfaces[options.name]
      surface.clearRequest = {
         x: options.x || 0,
         y: options.y || 0,
         width: options.width || surface.canvas.width,
         height: options.height || surface.canvas.height
      }
   },
   displaySurfaces: function() {
      var i = this.surfaceOrder.length
      while (i--) {
         this.displaySurface(this.surfaceOrder[i].name)
      }
   },
   displaySurface: function(surfaceName) {
      var surface = this.surfaces[surfaceName]
      sx = surface.raw ? 0 : cs.camera.getX(),
      sy = surface.raw ? 0 : cs.camera.getY(),
      sWidth = surface.raw ? surface.canvas.width : cs.camera.getWidth(),
      sHeight = surface.raw ? surface.canvas.height : cs.camera.getHeight(),

      // We will have to scale the X over becuse safari doesnt act like chrome
      dx = sx < 0 ? Math.floor(cs.camera.getScale() * (cs.camera.getX() * -1)) : 0,
      dy = sy < 0 ? Math.floor(cs.camera.getScale() * (cs.camera.getY() * -1)) : 0,
      dWidth = sWidth <= surface.canvas.width
         ? cs.view.width
         : cs.view.width - Math.floor(cs.camera.getScale() * ((cs.camera.getWidth()) - surface.canvas.width)),
      dHeight = sHeight <= surface.canvas.height
         ? cs.view.height
         : cs.view.height - Math.floor(cs.camera.getScale() * ((cs.camera.getHeight()) - surface.canvas.height))

      if (sx < 0) sx = 0; sWidth += sx * -1
      if (sy < 0) sy = 0; sHeight += sy * -1
      if (sWidth > surface.canvas.width) sWidth = surface.canvas.width
      if (sHeight > surface.canvas.height) sWidth = surface.canvas.height

      cs.view.ctx.drawImage(surface.canvas,
         sx, sy, sWidth, sHeight,
         dx, dy, dWidth, dHeight)
   },
   resetSurfaces: function() {
      for (var surface of cs.draw.surfaceOrder) {
         surface.clear = false
      }
   },
   checkResize: function() {
      var rect = cs.view.getBoundingClientRect()
      var w = rect.width
      var h = rect.height
      var o = screen.orientation
      if (w !== cs.draw.w || h !== cs.draw.h || o !== cs.draw.o) {
          cs.draw.w = w
          cs.draw.h = h
          cs.draw.o = o
          cs.input.resize()
          this.resize()
      }
   },
   resize: function() {
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
   },
   sprite: function(options) {
      var sprite = cs.sprite.getSprite(options.spr)
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

      cs.draw.reset()
   },
   text: function(options) {
      this.ctx.fillText(options.text, options.x, options.y)
      cs.draw.reset()
   },
   textSize: function(str) {
      return this.ctx.measureText(str)
   },
   line: function(options) {
      var cx = 0 - ((this.ctx.lineWidth % 2 == 0) ? 0 : 0.50)
      var cy = 0 - ((this.ctx.lineWidth % 2 == 0) ? 0 : 0.50)

      this.ctx.beginPath()
      this.ctx.moveTo(options.x1 - cx, options.y1 - cy)
      this.ctx.lineTo(options.x2 - cx, options.y2 - cy)
      this.ctx.stroke()
      cs.draw.reset()
   },
   fillRect: function(args) {
      if (typeof args.width == 'undefined') args.width = args.size || 0
      if (typeof args.height == 'undefined') args.height = args.size || 0

      this.ctx.fillRect(args.x, args.y, args.width, args.height)
      cs.draw.reset()
   },
   strokeRect: function(args) {
      var lineWidth = this.ctx.lineWidth > 1 ? this.ctx.lineWidth : 0
      var lineWidthAdjust = (this.ctx.lineWidth % 2 ? -0.50 : 0) + Math.floor(this.ctx.lineWidth / 2)
      var rect = {
         x: args.x + lineWidthAdjust,
         y: args.y + lineWidthAdjust,
         width: (args.width ? args.width : args.size) - lineWidth,
         height: (args.height ? args.height : args.size) - lineWidth
      }
      this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
      cs.draw.reset()
   },
   circle: function(x, y, rad, fill) {
      if (typeof fill == 'undefined') fill = true
      cs.draw.ctx.beginPath()
      cs.draw.ctx.arc(x, y, rad, 0, Math.PI * 2, true)
      cs.draw.ctx.closePath()
      (fill)
          ? cs.draw.ctx.fill()
          : cs.draw.ctx.stroke()
      cs.draw.reset()
   },
   circleGradient: function(x, y, radius, c1, c2) {
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
      cs.draw.reset()
   },
   fixPosition: function(args) {
      x = Math.floor(args.x); y = Math.floor(args.y)
      width = Math.floor(args.width)
      height = Math.floor(args.height)

      return { x, y, width, height }
   },
   setColor: function(color) {
      this.ctx.fillStyle = color
      this.ctx.strokeStyle = color
   },
   setAlpha: function(alpha) {
      this.ctx.globalAlpha = alpha
   },
   setWidth: function(width) {
      this.ctx.lineWidth = width
   },
   setFont: function(font) {
      this.ctx.font = font
   },
   setTextAlign: function(alignment) {
      this.ctx.textAlign = alignment
   },
   setTextBaseline: function(alignment) {
      this.ctx.textBaseline = alignment
   },
   setTextCenter: function() {
      this.setTextAlign('center')
      this.setTextBaseline('middle')
   },
   setOperation: function(operation) {
      this.ctx.globalCompositeOperation = operation
   },
   setSurface: function(name) {
      this.surface = this.surfaces[name]
      this.canvas = this.surface.canvas
      this.ctx = this.surface.ctx
      this.raw = this.surface.raw
      this.skip = this.surface.skip
   },
   reset: function() {
      cs.draw.setAlpha(1)
      cs.draw.setWidth(1)
      cs.draw.setFont(this.fontSize + 'px Trebuchet MS')
      cs.draw.setTextAlign('start')
      cs.draw.setTextBaseline('top')
      cs.draw.setColor('#000')
      cs.draw.setOperation('source-over')
   }
}
// ---------------------------------------------------------------------------------------------//
// ----------------------------------| Camera Functions |---------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.Camera = function(options) {
   this.scale = 1
   this.x = 0
   this.y = 0
   this.followX = 0
   this.followY = 0
   this.width = options.width || 200
   this.height = options.height || 400
   this.maxWidth = options.maxWidth || this.width
   this.maxHeight = options.maxHeight || this.height
}

cs.Camera.prototype.setScale = function(scale) {
   this.scale = scale
}

cs.Camera.prototype.getScale = function() {
   return this.scale
}

cs.Camera.prototype.setX = function(x) {
   this.x = x
}

cs.Camera.prototype.getX = function() {
   return this.x
}

cs.Camera.prototype.setY = function(y) {
   this.y = y
}

cs.Camera.prototype.getY = function() {
   return this.y
}

cs.Camera.prototype.setWidth = function(width) {
   this.width = width
}

cs.Camera.prototype.getWidth = function() {
   return this.width;
}

cs.Camera.prototype.setHeight = function(height) {
   this.height = height
}

cs.Camera.prototype.getHeight = function() {
   return this.height
}

cs.Camera.prototype.setMaxWidth = function(maxWidth) {
   this.maxWidth = maxWidth
}

cs.Camera.prototype.getMaxWidth = function() {
   return this.maxWidth
}

cs.Camera.prototype.setMaxHeight = function(maxHeight) {
   this.maxHeight = maxHeight
}

cs.Camera.prototype.getMaxHeight = function() {
   return this.maxHeight
}

cs.Camera.prototype.follow = function(obj) {
   this.followX = obj.x
   this.followY = obj.y
   this.followWidth = obj.width
   this.followHeight = obj.height
}

cs.Camera.prototype.update = function() {
   this.x = (this.followX + this.followWidth / 2) - this.width / 2
   this.y = (this.followY + this.followHeight / 2) - this.height / 2

   if (this.x < 0) this.x = 0
   if (this.y < 0) this.y = 0

   if (this.x+this.width > cs.room.getWidth())
      this.x = (cs.room.getWidth() - this.width) / (cs.room.getWidth() < this.width ? 2 : 1)

   if (this.y + this.height > cs.room.getHeight())
      this.y = (cs.room.getHeight() - this.height) / (cs.room.getHeight() < this.height ? 2 : 1)

   // console.log(cs.room.getHeight()-cs.camera.getHeight())
}

cs.Camera.prototype.zoomOut = function() {}
cs.Camera.prototype.zoomIn = function() {}
// ---------------------------------------------------------------------------------------------//
// -----------------------------------| Room Functions |----------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.Room = function(info) {
   this.transition = false
   this.width = info.width || 1000
   this.height = info.height || 400
   cs.draw.background = info.background || '#000'
   this.rect = {x: 0, y: 0, width: this.width, height: this.height}
}

cs.Room.prototype.getWidth = function() {
   return this.width
}

cs.Room.prototype.getHeight = function() {
   return this.height
}

cs.Room.prototype.setRestarting = function(isRestarting) {
   this.restarting = isRestarting
}

cs.Room.prototype.restart = function() {
   this.restarting = true
}

cs.Room.prototype.reset = function() {
   cs.obj.list = []
   cs.global = {}
   cs.start()
   cs.sound.reset()
   this.restarting = false
}

cs.Room.prototype.outside = function(rect) {
   if (typeof rect.width == 'undefined') rect.width = 0
   if (typeof rect.height == 'undefined') rect.height = 0

   return (rect.x < 0 || rect.x + rect.width > this.width
        || rect.y < 0 || rect.y + rect.height > this.height)
}
// ---------------------------------------------------------------------------------------------//
// ------------------------------| Text Input Functions |---------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.input = {
    state: 0,
    openBy: 0,
    text: '',
    form: undefined,
    input: undefined,
    button: undefined,
    create: function() {
        var form = document.createElement('form')
        form.id = 'textInputForm'
        form.setAttribute('onsubmit', 'cs.input.close() return false')
        form.setAttribute('autocomplete', 'off')
        var input = document.createElement('input')
        input.id = 'textInputText'
        input.setAttribute('autocomplete', 'off')
        input.type = 'text'

        var button = document.createElement('button')
        button.type = 'submit'
        button.innerHTML = 'Enter'

        form.appendChild(input)
        form.appendChild(button)
        document.body.appendChild(form)

        this.form = form
        this.input = input
        this.button = button
    },
    open: function(id) {
        if (this.form.style.display !== 'block') {
            this.openBy = id
            this.form.style.display = 'block'
            this.input.click()
            this.input.focus()
        }
    },
    close: function() {
        if (this.form.style.display == 'block') {
            this.form.style.display = 'none'
            this.text = this.input.value
            document.getElementById('view').click()
            document.getElementById('view').focus()
            this.input.value = ''
        }
        return false
    },
    return: function(id) {
        var text = this.text
        if (this.openBy == id && text !== '') {
            this.text = ''
            return text
        }
        return ''
    },
    resize: function() {
        var winWidth = window.innerWidth
        var winHeight = window.innerHeight

        var border = 2
        var cont = this.form
        var input = this.input
        var button = this.button
        var h = 50
        var nw = winWidth

        var bw = 100
        var iw = nw - bw
        // Width
        cont.style.width = nw + 'px'
        input.style.width = iw + 'px'
        button.style.width = bw + 'px'
        // Height
        input.style.height = h + 'px'
        button.style.height = h + 'px'
        button.style.lineHeight = (h - border * 2) + 'px'

        button.style.border = border + 'px solid black'
        input.style.border = border + 'px solid black'
    }
}
// ---------------------------------------------------------------------------------------------//
// ---------------------------------| Key Input Functions |-------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.key = {
    up: {},
    down: {},
    held: {},
    events: [],
    addEvent: function(keyCode, eventType) {
        var num = cs.key.events.length
        cs.key.events[num] = {
            event : eventType,
            key : keyCode
        }
    },
    execute: function() {
        for (var i = 0; i < cs.key.events.length; i++) {
            var event = cs.key.events[i].event
            var key = cs.key.events[i].key
            cs.key.processEvent(key, event)
        }
        cs.key.events = []
    },
    processEvent: function(keyCode, type) {
       if (type == 'up') {
          if (!cs.key.up[keyCode])
            cs.key.up[keyCode] = true
          return
       }

      cs.key.down[keyCode] = true
      cs.key.held[keyCode] = true
    },
    updateDown: function(keyEvent) {
        keyEvent.preventDefault()
        if (!keyEvent.repeat) {
            var key = keyEvent.keyCode
            cs.key.virtualDown(key)
        }
    },
    updateUp: function(keyEvent) {
        var key = keyEvent.keyCode
        cs.key.virtualUp(key)
    },
    virtualDown: function(keyCode) {
        cs.key.addEvent(keyCode, 'down')
    },
    virtualUp: function(keyCode) {
        cs.key.addEvent(keyCode, 'up')
    },
    virtualPress: function(key) {
        this.virtualDown(key)
        this.virtualUp(key)
    },
    reset: function() {
        for (var tmp in cs.key.down) {
            cs.key.down[tmp] = false
            if (cs.key.up[tmp]) {
                cs.key.held[tmp] = false
            }
            cs.key.up[tmp] = false
        }
    }
}
// ---------------------------------------------------------------------------------------------//
// -------------------------------| Mouse Input Functions |-------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.mouse = {
   x: undefined, y: undefined,
   pos: function() {
      var convert = cs.touch.convertToGameCords(cs.mouse.x, cs.mouse.y)
      return (cs.draw.raw)
         ? {x: cs.mouse.x, y: cs.mouse.y}
         : {x: convert.x, y: convert.y}
   },
   move: function(e) {
      var pos = cs.touch.updatePos(-1, e.clientX, e.clientY)
      cs.mouse.x = (pos) ? pos.x : 0
      cs.mouse.y = (pos) ? pos.y : 0
   },
   down: function(e) {
      cs.touch.add(-1)
      cs.touch.updatePos(-1, e.clientX, e.clientY)
   },
   up: function(e) {
      cs.touch.remove(-1)
   }
}
// ---------------------------------------------------------------------------------------------//
// -------------------------------| Touch Input Functions |-------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.touch = {
   list: [],
   add: function(id) {
      cs.sound.enable()
      for (var i = 0; i < cs.touch.list.length; i++)
         if (cs.touch.list[i].used === false) break

      cs.touch.list[i] = {}
      cs.touch.list[i].used = false
      cs.touch.list[i].down = true
      cs.touch.list[i].up = false
      cs.touch.list[i].x = 0
      cs.touch.list[i].y = 0
      cs.touch.list[i].id = id
   },
   remove: function(id) {
      for (var i = 0; i < cs.touch.list.length; i++) {
         if (cs.touch.list[i].id == id) {
            cs.touch.list[i].used = false
            cs.touch.list[i].down = false
            cs.touch.list[i].up = true
         }
      }
   },
   down: function(e) {
      cs.touch.add(e.changedTouches[0].identifier)
      cs.touch.move(e)
   },
   up: function(e) {
      var id = e.changedTouches[0].identifier
      cs.touch.remove(id)
   },
   updatePos: function(id, x, y) {
      for (var i = 0; i < cs.touch.list.length; i++) {
         var touch = cs.touch.list[i]
         if (touch.id == id) {
             touch.x = x
             touch.y = y
             return { x: touch.x, y: touch.y }
         }
      }
   },
   move: function(e) {
      e.preventDefault()
      for (var i = 0; i < e.changedTouches.length; i++) {
         var etouch = e.changedTouches[i]
         cs.touch.updatePos(etouch.identifier, etouch.clientX, etouch.clientY)
      }
   },
   create: function(raw) {
      return {
         down: false,
         held: false,
         up: false,
         x: 0,
         y: 0,
         off_x: 0,
         off_y: 0,
         id: -1,
         within: function(arg) {
            if (typeof arg.width == 'undefined') arg.width = arg.size || 0
            if (typeof arg.height == 'undefined') arg.height = arg.size || 0
            return (this.x > arg.x && this.x < arg.x+arg.width
                 && this.y > arg.y && this.y < arg.y+arg.height)
         },
         check: function(arg) {
            if (this.id !== -1) {
               // We have an id attached up or down
               var touch = cs.touch.list[this.id]
               this.x = touch.x
               this.y = touch.y
               if (!cs.draw.raw) {
                  convert = cs.touch.convertToGameCords(this.x, this.y)
                  this.x = convert.x; this.y = convert.y
               }
               this.down = touch.down
               this.held = touch.held
               this.up = touch.up
               if (this.up) {
                  touch.used = false
                  this.held = false
                  this.id = -1
               }
            } else {
               this.up = false
               for (var i = 0; i < cs.touch.list.length; i++) {
                  var ctouch = cs.touch.list[i]

                  this.x = ctouch.x
                  this.y = ctouch.y

                  if (!cs.draw.raw) {
                     convert = cs.touch.convertToGameCords(this.x, this.y)
                     this.x = convert.x; this.y = convert.y
                  }

                  if (ctouch.down === true && ctouch.used === false) {
                     if (this.x > arg.x && this.x < arg.x+arg.width
                        && this.y > arg.y && this.y < arg.y+arg.height) {
                        // Being Touched
                        ctouch.used = true
                        this.down = true
                        this.id = i

                        this.off_x = this.x-arg.x
                        this.off_y = this.y-arg.y
                     }
                  }
               }
            }
         }
      }
   },
   reset: function() {
      for (var i = 0; i < cs.touch.list.length; i++) {
         if (cs.touch.list[i].down === true) {
            cs.touch.list[i].down = false
            cs.touch.list[i].held = true
         }
         cs.touch.list[i].up = false
      }
   },
   convertToGameCords(x, y) {
      var rect = cs.view.getBoundingClientRect()

      var physicalViewWidth = (rect.right-rect.left)
      var physicalViewHeight = (rect.bottom-rect.top)
      var hortPercent = (x - rect.left)/physicalViewWidth
      var vertPercent = (y - rect.top)/physicalViewHeight
      var gamex = Math.round(hortPercent * cs.camera.getWidth())
      var gamey = Math.round(vertPercent * cs.camera.getHeight())
      gamex = (gamex) + cs.camera.getX()
      gamey = (gamey) + cs.camera.getY()
      return { x: gamex, y: gamey }
   }
}
// ---------------------------------------------------------------------------------------------//
// -----------------------------------| Sound Functions |---------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.Sound = function(options) {
   var pathSplit = options.path.split('/')
   this.name = pathSplit.pop()
   var path = pathSplit.toString('/')
   var types = (options.extension ? options.extension : 'wav').split(',')

   for (var i in types) {
      var type = types[i].trim()
      this[type] = {
         loaded: false,
         path: path
         + '/' + this.name
         + '.' + type,
         buffer: null,
         request: new XMLHttpRequest()
      }

      this[type].request.csData = { name: name, type: type }
      this[type].request.open('GET', this[type].path, true)
      this[type].request.responseType = 'arraybuffer'

      var that = this
      this[type].request.onload = function() {
         var name = this.csData.name
         var type = this.csData.type
         cs.sound.context.decodeAudioData(this.response, function(buffer) {
            that[type].buffer = buffer
            that[type].loaded = true
         })
      }
      this[type].request.send()
   }
}

cs.Sound.prototype.getName = function() {
   return this.name
}

cs.Sound.prototype.play = function(options) {
   if (this['wav'].loaded === true) {
      cs.sound.playList.forEach(function(audioObj) {
         if (audioObj.name == this.name) {
            // console.log('Reuse this sound')
         }
      })
      var csAudioObj = cs.sound.context.createBufferSource()
      csAudioObj.name = this.name
      csAudioObj.buffer = this['wav'].buffer
      for (var opt in options) { csAudioObj[opt] = options[opt] }
      csAudioObj.gainNode = cs.sound.context.createGain()
      csAudioObj.connect(csAudioObj.gainNode)
      csAudioObj.gainNode.connect(cs.sound.context.destination)
      csAudioObj.gainNode.gain.value = cs.sound.mute ? 0 : 1
      csAudioObj.start(0)
      cs.sound.playList.push(csAudioObj)
      return csAudioObj
   }
   return undefined
}

cs.sound = {
   list: {},
   playList: [],
   context: null,
   canPlayAudio: false,
   mute: false,
   active: true,
   volume: undefined,
   enable: function() {
      if (this.canPlayAudio === true || !this.context) return

      var source = this.context.createBufferSource()
      source.buffer = this.context.createBuffer(1, 1, 22050)
      source.connect(this.context.destination)
      source.start(0)
      this.canPlayAudio = true
   },
   init: function() {
      this.list = {}
      try {
         window.AudioContext =
         window.AudioContext || window.webkitAudioContext
         this.context = new AudioContext()
      } catch (e) {
         this.context = undefined
         this.canPlayAudio = false
         alert('Web Audio API is not supported in this browser')
      }
   },
   getSound: function(name) {
      return this.list[name]
   },
   addSound: function(sound) {
      this.list[sound.getName()] = sound
   },
   addSounds: function(soundArr) {
      for (sound of soundArr) {
         this.addSound(sound)
      }
   },
   reset: function() {
      for (var sound in this.playList) {
         // TODO there is an error here take a look in a second I got to go wash my cloths~!!!
         if (!this.playList) return
         this.playList[sound].stop()
         this.playList[sound].disconnect()
      }
   },
   toggleMute: function(bool) {
      this.mute = bool;
      (bool) ? this.setGain(0) : this.setGain(1)
   },
   setGain: function(gainValue) {
      console.log('GainValue: ' + gainValue)
      for (var audioObj in this.playList) {
         console.log('Muting...', audioObj)
         this.playList[audioObj].gainNode.gain.value = gainValue
      }
   },
   toggleActive: function(bool) {
      if (this.context !== undefined) {
         (bool) ? this.context.resume() : this.context.suspend()
      }
   }
}
// ---------------------------------------------------------------------------------------------//
// -----------------------------| Particle Engine Functions |-----------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.particle = {
    settings: {},
    obj: {},
    burst: function(x, y, w, h, qty) {
       if (typeof qty == 'undefined') qty = 0
        var num = qty
        if (num === 0) {
            num = this.settings.particlesPerStep
        }
        if (num < 0) {
            num = (Math.floor(Math.random() * Math.abs(num)) === 1)
        }
        for (var i = 0; i < num; i++) {
            var c1 = cs.particle.rgbFromHex(this.settings.colorEnd)
            var c2 = cs.particle.rgbFromHex(this.settings.colorStart)
            var life = cs.math.iRandomRange(this.settings.lifeMin, this.settings.lifeMax)
            var dir = cs.math.iRandomRange(this.settings.dirMin, this.settings.dirMax)
            var speed = cs.math.iRandomRange(this.settings.speedMin, this.settings.speedMax)
            var speedX = Math.cos(dir*Math.PI/180)
            var speedY = Math.sin(dir*Math.PI/180)
            var new_part = {
                shape      : this.settings.shape,
                c_r        : c1.r,
                c_g        : c1.g,
                c_b        : c1.b,
                c_sr       : (c2.r - c1.r) / life,
                c_sg       : (c2.g - c1.g) / life,
                c_sb       : (c2.b - c1.b) / life,
                alpha      : this.settings.alpha,
                fade       : this.settings.fade,
                size       : this.settings.size,
                grow       : this.settings.grow,
                speed      : speed / 10,
                speedX     : speedX,
                speedY     : speedY,
                dir        : dir,
                accel      : this.settings.accel / 10,
                accelRate  : this.settings.accel / 100,
                gravity    : this.settings.gravity / 10,
                gravityRate : this.settings.gravity / 100,
                life       : life,
                x          : cs.math.iRandomRange(x, x + w),
                y          : cs.math.iRandomRange(y, y + h),
                wobbleX    : cs.math.iRandomRange(-this.settings.wobbleX, this.settings.wobbleX),
                wobbleSetX : this.settings.wobbleX,
                wobbleY    : cs.math.iRandomRange(-this.settings.wobbleY, this.settings.wobbleY),
                wobbleSetY : this.settings.wobbleY,
            }
            var len = this.obj.particle.list.length
            this.obj.particle.list[len] = new_part
        }
    },
    step: function() {
        var tempParticles = []
        for (var i = 0; i < this.obj.particle.list.length; i++) {
            var particle = this.obj.particle.list[i]
            particle.life--
            particle.size = particle.size + particle.grow / 100
            particle.alpha = particle.alpha - particle.fade / 10
            if (particle.life > 0 && particle.alpha > 0 && particle.size > 0) {
                // Accelleration
                particle.accel += particle.accelRate
                particle.gravity -= particle.gravityRate

                // Wobble
                if (particle.wobbleSetX !== 0) {
                    if (particle.wobbleX > 0) {
                        particle.wobbleX -= 1; particle.x -= 1
                        if (particle.wobbleX === 0) particle.wobbleX = -particle.wobbleSetX
                    } else {
                        particle.wobbleX++; particle.x++
                        if (particle.wobbleX === 0) particle.wobbleX = particle.wobbleSetX
                    }
                }
                if (particle.wobbleSetY !== 0) {
                    if (particle.wobbleY > 0) {
                        particle.wobbleY -= 1; particle.y -= 4
                        if (particle.wobbleY === 0) particle.wobbleY = -particle.wobbleSetY
                    } else {
                        particle.wobbleY++; particle.y += 4
                        if (particle.wobbleY === 0) particle.wobbleY = particle.wobbleSetY
                    }
                }

                // Position Particle?
                var speed = particle.speed + particle.accel
                particle.x += particle.speedX * speed
                particle.y += particle.speedY * (speed + particle.gravity)

                // Draw Particle
                cs.draw.setAlpha(particle.alpha / 100)
                var r = Math.round(particle.c_r + particle.c_sr * particle.life)
                var g = Math.round(particle.c_g + particle.c_sg * particle.life)
                var b = Math.round(particle.c_b + particle.c_sb * particle.life)
                cs.draw.setColor(cs.particle.hexFromRgb(r, g, b))
                var cx = particle.x
                var cy = particle.y
                if (particle.shape == 'square') {
                    cx = cx - (particle.size/2)
                    cy = cy - (particle.size/2)

                    cs.draw.fillRect({ x: cx, y: cy, width: particle.size, height: particle.size })
                } else {
                    cs.draw.circle(cx, cy, particle.size)
                }
                tempParticles[tempParticles.length] = particle
            }
        }
        // Reset Particles with only live parts
        this.obj.particle.list = tempParticles
    },
    rgbFromHex: function(hex) {
        return {
           r: parseInt('0x' + hex.slice(1,3)),
           g: parseInt('0x' + hex.slice(3,5)),
           b: parseInt('0x' + hex.slice(5,7))
        }
    },
    hexFromRgb: function(r, g, b) {
        r = r.toString(16); g = g.toString(16); b = b.toString(16)
        return '#' +
            (r.length == 1 ? '0' + r : r) +
            (g.length == 1 ? '0' + g : g) +
            (b.length == 1 ? '0' + b : b)
    }
}
// ---------------------------------------------------------------------------------------------//
// ----------------------------------| Storage Functions |--------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.storage = {
   load: function(info) {
      var that = this
      var name = info.path.split('/').pop()
      var ajax = new XMLHttpRequest()
      cs.loading++
      ajax.onreadystatechange = function() {
         if (this.readyState == 4) {
            var data = JSON.parse(this.responseText)
            if (info.group && !that[info.group]) that[info.group] = {}

            info.group
               ? that[info.group][info.name] = data
               : that[info.name] = data

            cs.loading -= 1
            if (cs.loading == 0) {
               cs.start()
            }
         }
      }
      ajax.open('POST', `./${info.path}.json`, true)
      ajax.send()
   },
   cache: function() {
      // we could cache something to local storage here
   }
}
// ---------------------------------------------------------------------------------------------//
// ------------------------------------| Math Functions |---------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.math = {
    sign: function(number) {
        return (number >= 0) ? 1 : -1
    },
    iRandomRange: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    choose: function(array) {
        return array[this.iRandomRange(0, array.length-1)]
    }
}
// ---------------------------------------------------------------------------------------------//
// ------------------------------------| Networking |-------------------------------------------//
// ---------------------------------------------------------------------------------------------//
cs.network = {
    ws: {},
    status: false,
    connect: function(options) {
        var host = options.host || window.location.host
        if (options.ssl == undefined || options.ssl == false) {
            var url = 'ws:// ' + host + ':' + options.port
        } else {
            var url = 'wss:// ' + host + ':' + options.port
        }
        var ws = new WebSocket(url)
        ws.onopen = function() { cs.network.onconnect(); cs.network.status = true }
        ws.onclose = function() { cs.network.ondisconnect() }
        ws.onmessage =  function(event) { cs.network.onmessage(event.data) }
        cs.network.ws = ws
    },
    send: function(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data)
        }
        cs.network.ws.send(data)
    },
    onconnect: function() {},
    ondisconnect: function() {},
    onmessage: function(message) {}
}
