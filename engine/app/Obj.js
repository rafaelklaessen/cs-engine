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

   /**
    * Obj.destroy
    * Destroys given object
    */
   destroy() {
      const type = this.type
      this.live = false

      Obj.objGroups[type] = Obj.objGroups[type].filter((obj) => obj.getLive())
   }

   /**
    * Obj.addObj
    * Adds given object to object list
    * @param {Obj} obj
    */
   static addObj(obj) {
      const pos = this.findPosition(obj.getZIndex())
      this.list.splice(pos, 0, obj)
   }

   /**
    * Obj.addObjs
    * Adds an array of objects to object list
    * @param {Array.<Obj>} objArr
    */
   static addObjs(objArr) {
      for (let obj of objArr) this.addObj(obj)
   }

   /**
    * Obj.destroyById
    * Destroys all objects in objects list that match given id
    * @param {Number} id
    */
   static destroyById(id) {
      for (let obj of this.list) {
         if (obj.getId() === destroyObj) obj.destroy()
      }
   }

   /**
    * Obj.findPosition
    * Finds the position where and object should be placed based on zIndex
    * @param {Number} zIndex
    * @return {Number}
    */
   static findPosition(zIndex) {
      let i = 0
      for (i = 0; i < this.list.length; i++) {
         if (zIndex >= this.list[i].zIndex) return i
      }
      return i
   }

   /**
    * Obj.all
    * Gets all live objects by given type from object list
    * @param {string} type
    * @return {Array.<Obj>}
    */
   static all(type) {
      return this.list.filter((obj) =>
         (obj.getType() == type && obj.getLive())
      )
   }

   /**
    * Obj.find
    * Finds live object by given type in object list
    * @param {string} type
    * @return {Obj}
    */
   static find(type) {
      return this.list.find((obj) =>
         (obj.getType() == type && obj.getLive())
      )
   }

   /**
    * Obj.count
    * Counts all object that match given type
    * @param {string} type
    * @return {Number}
    */
   static count(type) {
      return this.objGroups[type]
         ? this.objGroups[type].length
         : 0
   }

   /**
    * Obj.registerObj
    * Registers given object to cs.objects
    * @param {string} name
    * @param {object} obj
    */
   static registerObj(name, obj) {
      cs.objects[name] = obj
   }

   /**
    * Obj.reset
    * Resets object list
    */
   static reset() {
      this.list = []
   }
}
