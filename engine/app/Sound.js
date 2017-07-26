export default class Sound {
   static list = {}
   static playList = []
   static context = null
   static canPlayAudio = false
   static mute = false
   static active = false
   static volume = undefined

   constructor(options) {
      const pathSplit = options.path.split('/')
      this.name = pathSplit.pop()
      const path = pathSplit.toString('/')
      const types = (options.extension ? options.extension : 'wav').split(',')

      for (let i in types) {
         const type = types[i].trim()
         this[type] = {
            loaded: false,
            path: `${path}/${this.name}.${type}`,
            buffer: null,
            request: new XMLHttpRequest()
         }

         this[type].request.csData = { name: this.name, type }
         this[type].request.open('GET', this[type].path, true)
         this[type].request.responseType = 'arraybuffer'

         this[type].request.onload = (e) => {
            Sound.context.decodeAudioData(e.target.response, (buffer) => {
               this[type].buffer = buffer
               this[type].loaded = true
            })
         }

         this[type].request.send()
      }
   }

   getName = () => this.name

   play(options) {
      if (this['wav'].loaded === true) {
         Sound.playList.forEach((audioObj) => {
            if (audioObj.name == this.name) {
               // console.log('Reuse this sound')
            }
         })
         const csAudioObj = Sound.context.createBufferSource()
         csAudioObj.name = this.name
         csAudioObj.buffer = this['wav'].buffer
         for (let opt in options) { csAudioObj[opt] = options[opt] }
         csAudioObj.gainNode = Sound.context.createGain()
         csAudioObj.connect(csAudioObj.gainNode)
         csAudioObj.gainNode.connect(Sound.context.destination)
         csAudioObj.gainNode.gain.value = Sound.mute ? 0 : 1
         csAudioObj.start(0)
         Sound.playList.push(csAudioObj)
         return csAudioObj
      }
      return undefined
   }

   static enable() {
      if (this.canPlayAudio === true || !this.context) return

      const source = this.context.createBufferSource()
      source.buffer = this.context.createBuffer(1, 1, 22050)
      source.connect(this.context.destination)
      source.start(0)
      this.canPlayAudio = true
   }

   static init() {
      this.list = {}
      try {
         window.AudioContext =
         window.AudioContext || window.webkitAudioContext
         this.context = new AudioContext()
      } catch (e) {
         this.context = undefined
         this.canPlayAudio = false
         alert('Web Audio API is not supported in this browser')
      }
   }

   static getSound(name) {
      return this.list[name]
   }

   static addSound(sound) {
      this.list[sound.getName()] = sound
   }

   static addSounds(soundArr) {
      for (let sound of soundArr) {
         this.addSound(sound)
      }
   }

   static reset() {
      for (var sound in this.playList) {
         // TODO there is an error here take a look in a second I got to go wash my cloths~!!!
         if (!this.playList) return
         this.playList[sound].stop()
         this.playList[sound].disconnect()
      }
   }

   static toggleMute(bool) {
      this.mute = bool;
      (bool) ? this.setGain(0) : this.setGain(1)
   }

   static setGain(gainValue) {
      for (var audioObj in this.playList) {
         this.playList[audioObj].gainNode.gain.value = gainValue
      }
   }

   static toggleActive(bool) {
      if (this.context !== undefined) {
         (bool) ? this.context.resume() : this.context.suspend()
      }
   }
}
