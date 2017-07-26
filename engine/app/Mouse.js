import Touch from './Touch'
import Draw from './Draw'

export default class Mouse {
   static x = undefined
   static y = undefined

   static pos() {
      var convert = Touch.convertToGameCords(this.x, this.y)
      return (Draw.raw)
         ? {x: this.x, y: this.y}
         : {x: convert.x, y: convert.y}
   }

   static move(e) {
      var pos = Touch.updatePos(-1, e.clientX, e.clientY)
      this.x = (pos) ? pos.x : 0
      this.y = (pos) ? pos.y : 0
   }

   static down(e) {
      Touch.add(-1)
      Touch.updatePos(-1, e.clientX, e.clientY)
   }

   static up(e) {
      Touch.remove(-1)
   }
}
