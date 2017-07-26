import cs from './scr_core'
import Touch from './Touch'

export default class Obj {
   static list = []
   static types = {}
   static objGroups = {}
   static unique = 0

   constructor(options) {
      const type = options.type
      const object = cs.objects[type]
      const zIndex = cs.objects[type].zIndex || 0

      // Create the object
      this.zIndex = zIndex
      this.live = true
      this.type = type
      this.id = Obj.unique
      this.core = object.core || false
      this.surface = 'game'
      this.particle = { list : [], settings : {} }
      this.touch = Touch.create()
      this.x = options.x || 0
      this.y = options.y || 0
      this.width = object.width
      this.height = object.height
      this.sprite = object.sprite

      // Run Create event
      object.create.call(this)

      // Add the object to the list
      Obj.unique++

      // Object Grouping
      if (!Obj.objGroups[type]) Obj.objGroups[type] = []
      Obj.objGroups[type].push(this)
   }

   getZIndex = () => this.zIndex
   setLive = (live) => this.live = live
   getLive = () => this.live
   getType = () => this.type
   getId = () => this.id
   getSurface = () => this.surface
   getParticle = () => this.particle
   getX = () => this.x
   getY = () => this.y
   getWidth = () => this.width
   getHeight = () => this.height

   destroy() {
      const type = this.type
      this.live = false

      Obj.objGroups[type] = Obj.objGroups[type].filter((obj) => obj.getLive())
   }

   static addObj(obj) {
      const pos = this.findPosition(obj.getZIndex())
      this.list.splice(pos, 0, obj)
   }

   static addObjs(objArr) {
      for (let obj of objArr) {
         this.addObj(obj)
      }
   }

   static destroy(destroyObj) {
      if (typeof destroyObj === 'object') {
         destroyObj.destroy()
      } else {
         for (let obj of this.list) {
            if (obj.getId() === destroyObj) {
               obj.destroy()
            }
         }
      }
   }

   static findPosition(zIndex) {
      let i = 0
      for (i = 0; i < this.list.length; i++) {
         if (zIndex >= this.list[i].zIndex) return i
      }
      return i
   }

   static all(type) {
      return this.list.filter((obj) =>
         (obj.getType() == type && obj.getLive())
      )
   }

   static find(type) {
      return this.list.find((obj) =>
         (obj.getType() == type && obj.getLive())
      )
   }

   static count(type) {
      return this.objGroups[type]
         ? this.objGroups[type].length
         : 0
   }

   static registerObj(name, obj) {
      cs.objects[name] = obj
   }
}
