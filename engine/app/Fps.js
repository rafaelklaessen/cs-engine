export default class Fps {
   static rate = 0
   static frame = 0
   static check = Date.now()

   /**
    * Fps.update
    * Updates the fps data
    */
   static update() {
      if (Date.now() - this.check > 1000) {
         this.check = Date.now()
         this.rate = this.frame
         this.frame = 0
      } else {
         this.frame++
      }
   }
}
