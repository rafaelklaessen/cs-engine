export default class Network {
   static ws = {}
   static status = false

   static connect(options) {
      var host = options.host || window.location.host
      if (options.ssl == undefined || options.ssl == false) {
          var url = 'ws:// ' + host + ':' + options.port
      } else {
          var url = 'wss:// ' + host + ':' + options.port
      }
      var ws = new WebSocket(url)
      ws.onopen = function() { this.onconnect(); this.status = true }
      ws.onclose = function() { this.ondisconnect() }
      ws.onmessage =  function(event) { this.onmessage(event.data) }
      this.ws = ws
   }

   static send(data) {
      if (typeof data !== 'string') {
          data = JSON.stringify(data)
      }
      cs.network.ws.send(data)
   }

   static onconnect() {}
   static ondisconnect() {}
   static onmessage() {}
}
