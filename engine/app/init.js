import cs from './scr_core'
import Camera from './Camera'
import CSMath from './CSMath'
import Draw from './Draw'
import Fps from './Fps'
import Input from './Input'
import Key from './Key'
import Loop from './Loop';
import Mouse from './Mouse'
import Network from './Network'
import Obj from './Obj'
import Particle from './Particle'
import Room from './Room'
import Sound from './Sound'
import Sprite from './Sprite'
import Storage from './Storage'
import Surface from './Surface'
import Touch from './Touch'

// Inits the engine by binding all classes to the window object
export default function initEngine() {
   window.cs = cs
   window.cs.Camera = Camera
   window.cs.Math = CSMath
   window.cs.Draw = Draw
   window.cs.Fps = Fps
   window.cs.Input = Input
   window.cs.Key = Key
   window.cs.Loop = Loop
   window.cs.Mouse = Mouse
   window.cs.Network = Network
   window.cs.Obj = Obj
   window.cs.Particle = Particle
   window.cs.Room = Room
   window.cs.Sound = Sound
   window.cs.Sprite = Sprite
   window.cs.Storage = Storage
   window.cs.Surface = Surface
   window.cs.Touch = Touch
}
