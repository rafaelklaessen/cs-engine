import Touch from './Touch'
import Draw from './Draw'

export default class Mouse {
   static x = undefined
   static y = undefined

   /**
    * Mouse.pos
    * Returns the current mouse position
    * @return {object}
    */
   static pos() {
      const convert = Touch.convertToGameCords(this.x, this.y)
      return (Draw.raw)
         ? { x: this.x, y: this.y }
         : { x: convert.x, y: convert.y }
   }

   /**
    * Mouse.move
    * @param {MouseEvent} e
    */
   static move(e) {
      const pos = Touch.updatePos(-1, e.clientX, e.clientY)
      this.x = (pos) ? pos.x : 0
      this.y = (pos) ? pos.y : 0
   }

   /**
    * Mouse.down
    * @param {MouseEvent} e
    */
   static down(e) {
      Touch.add(-1)
      Touch.updatePos(-1, e.clientX, e.clientY)
   }

   /**
    * Mouse.up
    * @param {MouseEvent} e
    */
   static up(e) {
      Touch.remove(-1)
   }
}
