import cs from './scr_core'

export default class Camera {
   constructor(options) {
      this.scale = 1
      this.x = 0
      this.y = 0
      this.followX = 0
      this.followY = 0
      this.width = options.width || 200
      this.height = options.height || 400
      this.maxWidth = options.maxWidth || this.width
      this.maxHeight = options.maxHeight || this.height
   }

   setScale = (scale) => this.scale = scale
   getScale = () => this.scale

   setX = (x) => this.x = x
   getX = () => this.x

   setY = (y) => this.y = y
   getY = () => this.y

   setWidth = (width) => this.width = width
   getWidth = () => this.width

   setHeight = (height) => this.height = height
   getHeight = () => this.height

   setMaxWidth = (maxWidth) => this.maxWidth = maxWidth
   getMaxWidth = () => this.maxWidth

   setMaxHeight = (maxHeight) => this.maxHeight = maxHeight
   getMaxHeight = () => this.maxHeight

   follow(obj) {
      this.followX = obj.x
      this.followY = obj.y
      this.followWidth = obj.width
      this.followHeight = obj.height
   }

   update() {
      this.x = (this.followX + this.followWidth / 2) - this.width / 2
      this.y = (this.followY + this.followHeight / 2) - this.height / 2

      if (this.x < 0) this.x = 0
      if (this.y < 0) this.y = 0

      if (this.x+this.width > cs.room.getWidth())
         this.x = (cs.room.getWidth() - this.width) / (cs.room.getWidth() < this.width ? 2 : 1)

      if (this.y + this.height > cs.room.getHeight())
         this.y = (cs.room.getHeight() - this.height) / (cs.room.getHeight() < this.height ? 2 : 1)
   }

   zoomOut() {}
   zoomIn() {}
}
