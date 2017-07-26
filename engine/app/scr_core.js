import Loop from './Loop'
import Key from './Key'
import Mouse from './Mouse'
import Touch from './Touch'
import Input from './Input'
import Draw from './Draw'
import Sound from './Sound'

// Name Space
export default class cs {
   static global = {}
   static script = {}
   static save = {}
   static objects = {}
   static sprites = {}
   static _loading = 0

   static set loading(loading) {
      this._loading = loading
      if (this._loading == 0) cs.start()
   }

   static get loading() {
      return this._loading
   }

   static init(canvasId, room, camera) {
      // Listen for Errors
      window.onerror = function(errorMsg, url, lineNumber) { Loop.run = false }

      // Initiate Inputs
      this.view = document.getElementById(canvasId)
      this.view.ctx = this.view.getContext('2d')
      this.view.tabIndex = 1000
      this.view.addEventListener('keydown', Key.updateDown)
      this.view.addEventListener('keyup', Key.updateUp)
      this.view.addEventListener('mousemove', Mouse.move)
      this.view.addEventListener('mousedown', Mouse.down)
      this.view.addEventListener('mouseup', Mouse.up)
      this.view.addEventListener('touchstart', Touch.down, false)
      this.view.addEventListener('touchend', Touch.up, false)
      this.view.addEventListener('touchcancel', Touch.up, false)
      this.view.addEventListener('touchmove', Touch.move, false)
      Input.create()

      this.room = room
      this.camera = camera

      // View, Game and GUI surfaces
      Draw.createSurface({ name: 'gui', raw: true, zIndex: 100 })
      Draw.createSurface({ name: 'game', raw: false })

      // Camera/View Size
      Draw.resize()
      Input.resize()

      // Sound
      Sound.active = Sound.init()
      window.onfocus = function() { Sound.toggleActive(true) }
      window.onblur = function() { Sound.toggleActive(false) }

      // Start your engines!
      Loop.step()
   }
}
