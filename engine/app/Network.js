export default class Network {
   static ws = {}
   static status = false

   /**
    * Network.connect
    * Connects to websocket based on options
    * @param {object} options
    */
   static connect(options) {
      const host = options.host || window.location.host

      const protocol = options.ssl ? 'wss' : 'ws'
      const url = `${protocol}://${host}:${options.port}`

      const ws = new WebSocket(url)
      ws.onopen = () => {
         this.onconnect()
         this.status = true
      }
      ws.onclose = this.ondisconnect()
      ws.onmessage = (event) => this.onmessage(event.data)

      this.ws = ws
   }

   static send(data) {
      if (typeof data !== 'string') {
          data = JSON.stringify(data)
      }
      this.ws.send(data)
   }

   // These methods should be overriden by user
   static onconnect() {}
   static ondisconnect() {}
   static onmessage() {}
}
