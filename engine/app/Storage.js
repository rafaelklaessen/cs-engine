import cs from './scr_core'

export default class Storage {
   static load(info) {
      var that = this
      var name = info.path.split('/').pop()
      var ajax = new XMLHttpRequest()
      cs.loading++
      ajax.onreadystatechange = function() {
         if (this.readyState == 4) {
            var data = JSON.parse(this.responseText)
            if (info.group && !that[info.group]) that[info.group] = {}

            info.group
               ? that[info.group][info.name] = data
               : that[info.name] = data

            cs.loading -= 1
            if (cs.loading == 0) {
               cs.start()
            }
         }
      }
      ajax.open('POST', `./${info.path}.json`, true)
      ajax.send()
   }

   static cache() {
      // We could cache something to local storage here
   }
}
