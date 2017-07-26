import cs from './scr_core'

export default class Storage {
   static load(info) {
      const name = info.path.split('/').pop()
      const ajax = new XMLHttpRequest()
      cs.loading++
      ajax.onreadystatechange = (e) => {
         if (e.target.readyState == 4) {
            const data = JSON.parse(e.target.responseText)
            if (info.group && !this[info.group]) this[info.group] = {}

            info.group
               ? this[info.group][info.name] = data
               : this[info.name] = data

            cs.loading -= 1
         }
      }
      ajax.open('POST', `./${info.path}.json`, true)
      ajax.send()
   }

   static cache() {
      // We could cache something to local storage here
   }
}
