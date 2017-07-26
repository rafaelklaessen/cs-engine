export default class Key {
   static up = {}
   static down = {}
   static held = {}
   static events = {}

   static updateDown = Key.updateDown.bind(Key)
   static updateUp = Key.updateUp.bind(Key)

   static addEvent(keyCode, eventType) {
      const num = this.events.length
      this.events[num] = {
         event: eventType,
         key: keyCode
      }
   }

   static execute() {
      for (let e of Object.values(this.events)) {
         this.processEvent(e.key, e.event)
      }

      this.events = []
   }

   static processEvent(keyCode, type) {
      if (type == 'up') {
         this.up[keyCode] = true
         return
      }

     this.down[keyCode] = true
     this.held[keyCode] = true
   }

   static updateDown(keyEvent) {
      keyEvent.preventDefault()
      if (!keyEvent.repeat) {
         this.virtualDown(keyEvent.keyCode)
      }
   }

   static updateUp(keyEvent) {
      this.virtualUp(keyEvent.keyCode)
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
      for (let tmp in this.down) {
          this.down[tmp] = false
          if (this.up[tmp]) {
             this.held[tmp] = false
          }
          this.up[tmp] = false
      }
   }
}
