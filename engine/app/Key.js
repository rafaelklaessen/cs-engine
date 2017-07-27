export default class Key {
   static up = {}
   static down = {}
   static held = {}
   static events = {}

   static updateDown = Key.updateDown.bind(Key)
   static updateUp = Key.updateUp.bind(Key)

   /**
    * Key.addEvent
    * Adds given event to event list
    * @param {Number} keyCode
    * @param {string} eventType
    */
   static addEvent(keyCode, eventType) {
      this.events.push({
         event: eventType,
         key: keyCode
      })
   }

   /**
    * Key.execute
    * Executes all events in event list (and resets event list afterwards)
    */
   static execute() {
      for (let e of Object.values(this.events)) {
         this.processEvent(e.key, e.event)
      }

      this.events = []
   }

   /**
    * Key.processEvent
    * Processes given event
    * @param {Number} keyCode
    * @param {string}  type
    */
   static processEvent(keyCode, type) {
      if (type == 'up') {
         this.up[keyCode] = true
         return
      }

     this.down[keyCode] = true
     this.held[keyCode] = true
   }

   /**
    * Key.updateDown
    * @param {KeyboardEvent} keyEvent
    */
   static updateDown(keyEvent) {
      keyEvent.preventDefault()
      if (!keyEvent.repeat) {
         this.virtualDown(keyEvent.keyCode)
      }
   }

   /**
    * Key.updateUp
    * @param {KeyboardEvent} keyEvent
    */
   static updateUp(keyEvent) {
      this.virtualUp(keyEvent.keyCode)
   }

   /**
    * Key.virtualDown
    * @param {Number} keyCode
    */
   static virtualDown(keyCode) {
      this.addEvent(keyCode, 'down')
   }

   /**
    * Key.virtualUp
    * @param {Number} keycode
    */
   static virtualUp(keyCode) {
      this.addEvent(keyCode, 'up')
   }

   /**
    * Key.virtualPress
    * @param {Number} key
    */
   static virtualPress(key) {
      this.virtualDown(key)
      this.virtualUp(key)
   }

   /**
    * Key.reset
    * Resets up, down and held lists
    */
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
