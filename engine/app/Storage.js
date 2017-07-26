import cs from './scr_core'

export default class Storage {
   static load(info) {
      const name = info.path.split('/').pop()
      let cache = localStorage.getItem(name)
      if (info.group) {
         cache = JSON.parse(localStorage.getItem(info.group)) || {}
         cache = cache[name]
      }
      const hasCache = !!cache

      if (hasCache) {
         if (info.group && !this[info.group]) this[info.group] = {}

         info.group
            ? this[info.group][info.name] = cache
            : this[info.name] = cache
      } else {
         this.loadWithoutCache(info)
      }
   }

   static loadWithoutCache(info) {
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

   static cache(name, groupName) {
      if (groupName) {
         if (!this[groupName] || !this[groupName][name]) return

         const groupCache = JSON.parse(localStorage.getItem(groupName)) || {}
         groupCache[name] = this[groupName][name]
         localStorage.setItem(groupName, JSON.stringify(groupCache))
      } else {
         if (!this[name]) return

         localStorage.setItem(name, this[name])
      }
   }

   static cacheGroup(groupName) {
      if (!this[groupName]) return

      const groupCache = JSON.parse(localStorage.getItem(groupName)) || {}
      for (let name in this[groupName]) {
         groupCache[name] = this[groupName][name]
      }

      localStorage.setItem(groupName, JSON.stringify(groupCache))
   }
}
