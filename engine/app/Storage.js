import cs from './scr_core'

export default class Storage {
   /**
    * Storage.get
    * Gets file (JSON) from name (and group if a groupName is provided) from
    * Storage class
    * @param {string} name
    * @param {?string} groupName
    * @return {?object} The file (JSON)
    */
   get(name, groupName) {
      if (groupName) {
         if (!this[groupName]) return null

         return this[groupName][name] || null
      } else {
         return this[name] || null
      }
   }

   /**
    * Storage.getGroup
    * Gets group from Storage class
    * @param {string} groupName
    * @return {?object} The group
    */
   getGroup(groupName) {
      return this[groupName] || null
   }

   /**
    * Storage.load
    * Loads given file and stores it into the Storage class (under group if a
    * group is provided). If the file's cached, it loads the file from cache.
    * @param {object} info Contains the path and (optionally) group of the file to load
    */
   static load(info) {
      const name = info.path.split('/').pop()
      let cache = localStorage.getItem(name)
      if (info.group) {
         cache = JSON.parse(localStorage.getItem(info.group)) || {}
         cache = JSON.parse(cache[name])
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

   /**
    * Storage.loadWithoutCache
    * Loads given file via AJAX and stores it into the Storage class (under
    * group if a group is provided). Never uses cache
    * @param {object} info Contains the path and (optionally) group of the file to load
    */
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

   /**
    * Storage.cache
    * Caches given file (JSON) to localStorage (under group if a group is provided)
    * @param {string} name
    * @param {?string} groupName
    */
   static cache(name, groupName) {
      if (groupName) {
         if (!this[groupName] || !this[groupName][name]) return

         const groupCache = JSON.parse(localStorage.getItem(groupName)) || {}
         groupCache[name] = JSON.stringify(this[groupName][name])
         localStorage.setItem(groupName, JSON.stringify(groupCache))
      } else {
         if (!this[name]) return

         localStorage.setItem(name, JSON.stringify(this[name]))
      }
   }

   /**
    * Storage.cacheGroup
    * Caches whole group to storage
    */
   static cacheGroup(groupName) {
      if (!this[groupName]) return

      const groupCache = JSON.parse(localStorage.getItem(groupName)) || {}
      for (let name in this[groupName]) {
         groupCache[name] = JSON.stringify(this[groupName][name])
      }

      localStorage.setItem(groupName, JSON.stringify(groupCache))
   }
}
