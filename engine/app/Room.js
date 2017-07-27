import cs from './scr_core'
import Draw from './Draw'
import Obj from './Obj'
import Sound from './Sound'

export default class Room {
   constructor(info) {
      this.transition = false
      this.width = info.width || 1000
      this.height = info.height || 400
      Draw.setBackground(info.background || '#000')
      this.rect = {
         x: 0,
         y: 0,
         width: this.width,
         height: this.height
      }
   }

   getWidth = () => this.width
   getHeight = () => this.height
   setRestarting = (restarting) => this.restarting = restarting

   /**
    * Room.restart
    * Sets room to be restarting
    */
   restart() {
      this.restarting = true
   }

   /**
    * Room.reset
    * Resets room and object list
    */
   reset() {
      Obj.reset()
      cs.global = {}
      cs.start()
      Sound.reset()
      this.restarting = false
   }

   /**
    * Room.outside
    * Checks whether given rect is outside the room or not
    * @param {object} rect
    * @return {boolean} Wether rect is outside room or not
    */
   outside(rect) {
      if (typeof rect.width == 'undefined') rect.width = 0
      if (typeof rect.height == 'undefined') rect.height = 0

      return (rect.x < 0 || rect.x + rect.width > this.width
           || rect.y < 0 || rect.y + rect.height > this.height)
   }
}
