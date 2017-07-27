import CSMath from './CSMath'
import Draw from './Draw'

export default class Particle {
   static settings = {}
   static obj = {}

   static setSettings(settings) {
      this.settings = settings
   }

   static setObj(obj) {
      this.obj = obj
   }

   /**
    * Particle.burst
    * @param {Number} x
    * @param {Number} y
    * @param {Number} w Width
    * @param {Number} h Height
    * @param {Number} qty Quantity
    */
   static burst(x, y, w, h, qty) {
      if (typeof qty == 'undefined') qty = 0
      let num = qty
      if (num === 0) {
         num = this.settings.particlesPerStep
      }
      if (num < 0) {
         num = (Math.floor(Math.random() * Math.abs(num)) === 1)
      }

      for (let i = 0; i < num; i++) {
         const c1 = this.rgbFromHex(this.settings.colorEnd)
         const c2 = this.rgbFromHex(this.settings.colorStart)
         const life = CSMath.iRandomRange(this.settings.lifeMin, this.settings.lifeMax)
         const dir = CSMath.iRandomRange(this.settings.dirMin, this.settings.dirMax)
         const speed = CSMath.iRandomRange(this.settings.speedMin, this.settings.speedMax)
         const speedX = Math.cos(dir * Math.PI / 180)
         const speedY = Math.sin(dir * Math.PI / 180)
         const new_part = {
             shape      : this.settings.shape,
             c_r        : c1.r,
             c_g        : c1.g,
             c_b        : c1.b,
             c_sr       : (c2.r - c1.r) / life,
             c_sg       : (c2.g - c1.g) / life,
             c_sb       : (c2.b - c1.b) / life,
             alpha      : this.settings.alpha,
             fade       : this.settings.fade,
             size       : this.settings.size,
             grow       : this.settings.grow,
             speed      : speed / 10,
             speedX     : speedX,
             speedY     : speedY,
             dir        : dir,
             accel      : this.settings.accel / 10,
             accelRate  : this.settings.accel / 100,
             gravity    : this.settings.gravity / 10,
             gravityRate : this.settings.gravity / 100,
             life       : life,
             x          : CSMath.iRandomRange(x, x + w),
             y          : CSMath.iRandomRange(y, y + h),
             wobbleX    : CSMath.iRandomRange(-this.settings.wobbleX, this.settings.wobbleX),
             wobbleSetX : this.settings.wobbleX,
             wobbleY    : CSMath.iRandomRange(-this.settings.wobbleY, this.settings.wobbleY),
             wobbleSetY : this.settings.wobbleY,
         }
         const len = this.obj.particle.list.length
         this.obj.particle.list[len] = new_part
      }
   }

   /**
    * Particle.step
    */
   static step() {
      const tempParticles = []
      for (let i = 0; i < this.obj.particle.list.length; i++) {
         const particle = this.obj.particle.list[i]
         particle.life--
         particle.size = particle.size + particle.grow / 100
         particle.alpha = particle.alpha - particle.fade / 10
         if (particle.life > 0 && particle.alpha > 0 && particle.size > 0) {
            // Accelleration
            particle.accel += particle.accelRate
            particle.gravity -= particle.gravityRate

            // Wobble
            if (particle.wobbleSetX !== 0) {
               if (particle.wobbleX > 0) {
                  particle.wobbleX--
                  particle.x--
                  if (particle.wobbleX === 0) particle.wobbleX = -particle.wobbleSetX
               } else {
                  particle.wobbleX++
                  particle.x++
                  if (particle.wobbleX === 0) particle.wobbleX = particle.wobbleSetX
               }
            }
            if (particle.wobbleSetY !== 0) {
               if (particle.wobbleY > 0) {
                  particle.wobbleY--
                  particle.y -= 4
                  if (particle.wobbleY === 0) particle.wobbleY = -particle.wobbleSetY
               } else {
                  particle.wobbleY++
                  particle.y += 4
                  if (particle.wobbleY === 0) particle.wobbleY = particle.wobbleSetY
               }
            }

            // Position Particle?
            const speed = particle.speed + particle.accel
            particle.x += particle.speedX * speed
            particle.y += particle.speedY * (speed + particle.gravity)

            // Draw Particle
            Draw.setAlpha(particle.alpha / 100)
            const r = Math.round(particle.c_r + particle.c_sr * particle.life)
            const g = Math.round(particle.c_g + particle.c_sg * particle.life)
            const b = Math.round(particle.c_b + particle.c_sb * particle.life)
            Draw.setColor(this.hexFromRgb(r, g, b))
            let cx = particle.x
            let cy = particle.y
            if (particle.shape == 'square') {
               cx = cx - (particle.size / 2)
               cy = cy - (particle.size / 2)

               Draw.fillRect({
                  x: cx,
                  y: cy,
                  width: particle.size,
                  height: particle.size
               })
            } else {
               Draw.circle(cx, cy, particle.size)
            }
            tempParticles[tempParticles.length] = particle
         }
      }
      // Reset Particles with only live parts
      this.obj.particle.list = tempParticles
   }

   /**
    * Particle.rgbFromHex
    * Converts given hex to rgb
    * @param {string} hex
    * @return {object} Contains the r, g and b values
    */
   static rgbFromHex(hex) {
      return {
         r: parseInt(`0x${hex.slice(1, 3)}`),
         g: parseInt(`0x${hex.slice(3, 5)}`),
         b: parseInt(`0x${hex.slice(5, 7)}`)
      }
   }

   /**
    * Particle.hexFromRgb
    * Converts given rgb to hex
    * @param {Number} r
    * @param {Number} g
    * @param {Number} b
    * @return {string}
    */
   static hexFromRgb(r, g, b) {
      r = r.toString(16)
      g = g.toString(16)
      b = b.toString(16)
      return '#' +
          (r.length == 1 ? `0${r}` : r) +
          (g.length == 1 ? `0${g}` : g) +
          (b.length == 1 ? `0${b}` : b)
   }
}
