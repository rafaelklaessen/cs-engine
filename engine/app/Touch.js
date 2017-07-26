import cs from './scr_core'
import Sound from './Sound'
import Draw from './Draw'

export default class Touch {
   static list = []

   static add(id) {
      Sound.enable()
      let i = 0
      for (i = 0; i < this.list.length; i++)
         if (this.list[i].used === false) break

      this.list[i] = {}
      this.list[i].used = false
      this.list[i].down = true
      this.list[i].up = false
      this.list[i].x = 0
      this.list[i].y = 0
      this.list[i].id = id
   }

   static remove(id) {
      for (let i = 0; i < this.list.length; i++) {
         if (this.list[i].id == id) {
            this.list[i].used = false
            this.list[i].down = false
            this.list[i].up = true
         }
      }
   }

   static down(e) {
      this.add(e.changedTouches[0].identifier)
      this.move(e)
   }

   static up(e) {
      const id = e.changedTouches[0].identifier
      this.remove(id)
   }

   static updatePos(id, x, y) {
      for (let touch of this.list) {
         if (touch.id == id) {
             touch.x = x
             touch.y = y
             return { x, y }
         }
      }
   }

   static move(e) {
      e.preventDefault()
      for (let etouch of e.changedTouches) {
         this.updatePos(etouch.identifier, etouch.clientX, etouch.clientY)
      }
   }

   static create(raw) {
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
               const touch = Touch.list[this.id]
               this.x = touch.x
               this.y = touch.y
               if (!Draw.raw) {
                  const convert = this.convertToGameCords(this.x, this.y)
                  this.x = convert.x
                  this.y = convert.y
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
               for (let i = 0; i < Touch.list.length; i++) {
                  const ctouch = Touch.list[i]

                  this.x = ctouch.x
                  this.y = ctouch.y

                  if (!Draw.raw) {
                     const convert = Touch.convertToGameCords(this.x, this.y)
                     this.x = convert.x
                     this.y = convert.y
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
   }

   static reset() {
      for (let i = 0; i < this.list.length; i++) {
         if (this.list[i].down === true) {
            this.list[i].down = false
            this.list[i].held = true
         }
         this.list[i].up = false
      }
   }

   static convertToGameCords(x, y) {
      const rect = cs.view.getBoundingClientRect()

      const physicalViewWidth = (rect.right-rect.left)
      const physicalViewHeight = (rect.bottom-rect.top)
      const hortPercent = (x - rect.left) / physicalViewWidth
      const vertPercent = (y - rect.top) / physicalViewHeight
      let gamex = Math.round(hortPercent * cs.camera.getWidth())
      let gamey = Math.round(vertPercent * cs.camera.getHeight())
      gamex = gamex + cs.camera.getX()
      gamey = gamey + cs.camera.getY()
      return { x: gamex, y: gamey }
   }
}
