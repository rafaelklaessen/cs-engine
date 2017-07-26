cs.objects['obj_blob'] = {
   sprite: 'spr_blob',
   width: 16,
   height: 16,
   create: function(){
      this.hspeed = 0;
      this.vspeed = 0;
      this.speed = 2;
      this.gravity = 2;
      this.dir = 1;
      this.jump = false;
      this.health = {
         value: 10,
         max: 10
      }
      this.hit = {
         timer: 0,
         timerLength: 0
      }
   },
   step: function(){
      //Horizontal Movement
      pcol = cs.script.collide(this, 'obj_player',{
         x: this.x-50,
         y: this.y-100,
         width: this.width+100,
         height: this.height+100
      })

      //This is going to be a little weird but trust me! :]
      if(pcol && (pcol.x > this.x+this.width || pcol.x + pcol.width < this.x)){
         if(pcol.x > this.x){
            if(this.hspeed < 1)
               this.hspeed += 0.1
            this.dir = 1
         } else {
            if(this.hspeed > -1){ this.hspeed -= 0.1 }
            this.dir = -1
         }
      } else {
         //Slowing down
         this.hspeed -= (this.hspeed*0.5)
      }

      this.h_col = cs.script.collide(this, 'obj_block', {vspeed:0})
      if(this.h_col || (this.x+this.hspeed) <= 0 || (this.x+this.hspeed) + this.width >= cs.room.width)
         this.hspeed = 0;

      this.x += this.hspeed

      //Vertical Movement
      if(this.vspeed < this.gravity)
         this.vspeed += 1

      this.v_col = cs.script.collide(this, 'obj_block');
      if(this.v_col){
         this.vspeed = 0;
         if(this.jump && this.v_col.y > this.y)
            this.vspeed = -this.jump;
      }
      this.y += this.vspeed;

      //Draw the Sprite draw less opacity is just took damage
      if(this.hit.timer > 0)
         cs.Draw.setAlpha(0.25 + (1 - this.hit.timer / this.hit.timerLength))

      cs.Draw.sprite({
        spr:'spr_blob',
        x:this.x+((this.dir < 0) ? this.width : 0),
        y:this.y, scaleX:this.dir
      })
   }
}
