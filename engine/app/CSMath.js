export default class CSMath {
   /**
    * CSMath.sign
    * Returns the sign of given number
    * @param {Number} number Number to sign
    * @return {Number} The sign of the number
    */
   static sign(number) {
      return (number >= 0) ? 1 : -1
   }

   /**
    * CSMath.iRandomRange
    * Returns a random number in given range
    * @param {Number} min Range start
    * @param {Number} max Range end
    * @return {Number} The random number in given range
    */
   static iRandomRange(min, max) {
      return Math.round(min + Math.random() * (max - min))
   }

   /**
    * CSMath.choose
    * Selects a random element of given array
    * @param {Array.<Any>} array Array to get random element from
    * @return {Any} The random array element
    */
   static choose(array) {
      return array[this.iRandomRange(0, array.length - 1)]
   }
}
