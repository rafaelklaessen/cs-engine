import cs from './scr_core'
import Fps from './Fps'
import Key from './Key'
import Draw from './Draw'
import Obj from './Obj'
import Particle from './Particle'
import Touch from './Touch'

export default class Loop {
   static run = true

   /**
    * Loop.step
    * Updates the game
    */
   static step() {
      if (this.run) {
         setTimeout(() => Loop.step(), 1000 / 60)
      }

      Fps.update()
      Key.execute()
      Draw.debugReset()
      cs.camera.update()
      Draw.clearSurfaces()

      let i = Obj.list.length
      while (i--) {
         if (Obj.list[i].getLive()) {
            const obj = Obj.list[i]
            Draw.setSurface(obj.getSurface())

            Particle.setSettings(obj.getParticle().settings)
            Particle.setObj(obj)
            cs.objects[obj.getType()].step.call(obj)
         }
      }

      Draw.resetSurfaces()
      Key.reset()
      Touch.reset()

      // Resize Canvas
      Draw.checkResize()
      Draw.displaySurfaces()
      if (cs.room.restarting) {
         cs.room.reset()
      }
   }

   /**
    * Loop.stop
    * Stops the loop
    */
   static stop() {
      this.run = false
   }
}
