import cs from './scr_core'
import Touch from './Touch'

export default class Obj {
   static list = []
   static types = {}
   static objGroups = {}
   static unique = 0

   constructor(options) {
      var object = cs.objects[options.type]
      var zIndex = cs.objects[options.type].zIndex || 0

      // Create the object
      this.zIndex = zIndex
      this.live = true
      this.type = options.type
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
      if (!Obj.objGroups[options.type]) Obj.objGroups[options.type] = []
      Obj.objGroups[options.type].push(this)
   }

   setLive = (live) => this.live = live

   destroy() {
      var type = this.type
      this.live = false

      Obj.objGroups[type] = Obj.objGroups[type].filter(function(obj) { return obj.live })
   }

   static addObj(obj) {
      var pos = this.findPosition(obj.zIndex)
      this.list.splice(pos, 0, obj)
   }

   static addObjs(objArr) {
      for (var obj of objArr) {
         this.addObj(obj)
      }
   }

   static destroy(destroyObj) {
      if (typeof destroyObj === 'object') {
         destroyObj.destroy()
      } else {
         for (var obj of this.list) {
            if (obj.id === destroyObj) {
               obj.setLive(false)
               var type = obj.type
            }
         }
         this.objGroups[type] = this.objGroups[type].filter(function(obj) { return obj.live })
      }
   }

   static findPosition(zIndex) {
      for (var i = 0; i < this.list.length; i++) {
         if (zIndex >= this.list[i].zIndex)
            return i
      }
      return i
   }

   all(type) {
      return this.list.filter(function(obj) {
         return (obj.type == type && obj.live)
      })
   }

   find(type) {
      return this.list.find(function(obj) {
         return (obj.type == type && obj.live)
      })
   }

   count(type) {
      return this.objGroups[type]
         ? this.objGroups[type].length
         : 0
   }
}
