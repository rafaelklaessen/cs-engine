export default class CSMath {
   static sign(number) {
      return (number >= 0) ? 1 : -1
   }

   static iRandomRange(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
   }

   static choose(array) {
      return array[this.iRandomRange(0, array.length - 1)]
   }
}
