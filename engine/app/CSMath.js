export default class CSMath {
   static sign(number) {
      return (number >= 0) ? 1 : -1
   }

   static iRandomRange(min, max) {
      return Math.round(min + Math.random() * (max - min))
   }

   static choose(array) {
      return array[this.iRandomRange(0, array.length - 1)]
   }
}
