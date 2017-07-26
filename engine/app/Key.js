export default class Key {
   static up = {}
   static down = {}
   static held = {}
   static events = {}

   static addEvent(keyCode, eventType) {
      var num = this.events.length
      this.events[num] = {
          event : eventType,
          key : keyCode
      }
   }

   static execute() {
      for (var i = 0; i < this.events.length; i++) {
          var event = this.events[i].event
          var key = this.events[i].key
          this.processEvent(key, event)
      }
      this.events = []
   }

   static processEvent(keyCode, type) {
      if (type == 'up') {
         if (!this.up[keyCode])
           this.up[keyCode] = true
         return
      }

     this.down[keyCode] = true
     this.held[keyCode] = true
   }

   static updateDown(keyEvent) {
      keyEvent.preventDefault()
      if (!keyEvent.repeat) {
          var key = keyEvent.keyCode
          this.virtualDown(key)
      }
   }

   static updateUp(keyEvent) {
      var key = keyEvent.keyCode
      this.virtualUp(key)
   }

   static virtualDown(keyCode) {
      this.addEvent(keyCode, 'down')
   }

   static virtualUp(keyCode) {
      this.addEvent(keyCode, 'up')
   }

   static virtualPress(key) {
      this.virtualDown(key)
      this.virtualUp(key)
   }

   static reset() {
      for (var tmp in this.down) {
          this.down[tmp] = false
          if (this.up[tmp]) {
             this.held[tmp] = false
          }
          this.up[tmp] = false
      }
   }
}
