import cs from './scr_core'
import Fps from './Fps'
import Key from './Key'
import Draw from './Draw'
import Obj from './Obj'
import Particle from './Particle'
import Touch from './Touch'

export default class Loop {
   static run = true

   static step() {
      if (this.run) {
         setTimeout(function() { Loop.step() }, 1000/60)
      }

      Fps.update()
      Key.execute()
      Draw.debugReset()
      cs.camera.update()
      Draw.clearSurfaces()

      var i = Obj.list.length
      while (i--) {
         if (Obj.list[i].live) {
            var obj = Obj.list[i]
            Draw.setSurface(obj.surface)

            Particle.settings = obj.particle.settings
            Particle.obj = obj
            var step = cs.objects[obj.type].step
            step.call(obj)
         }
      }

      Draw.resetSurfaces()
      Key.reset()
      Touch.reset()

      // Resize Canvas
      Draw.checkResize()
      Draw.displaySurfaces()
      if (cs.room.restarting === true) {
         cs.room.reset()
      }
   }
}
