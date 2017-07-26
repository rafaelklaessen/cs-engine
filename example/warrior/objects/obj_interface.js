cs.objects['obj_interface'] = {
    create: function(){
       cs.Obj.addObjs([
          new cs.Obj({ type: 'obj_joystick', x:0, y:0 }),
          new cs.Obj({ type:'obj_buttons', x:0, y:0 })
       ])
    },
    step: function(){

    }
}

cs.objects['obj_buttons'] = {
	create: function(){
		this.width = 30;
	   this.height = 30;
	   this.surface = 'gui';
		this.cx = 0;
		this.cy = 0;
	},
	step: function(){
      var btnRect = {
		   x: cs.Draw.canvas.width - 50,
		   y: cs.Draw.canvas.height - 50,
         width: this.width,
         height: this.height
      }

		this.touch.check(btnRect);
		if(this.touch.down){
			//console.log('open');
			cs.Key.virtualPress(32);
		}

		var text = cs.Input.return(this.id);
		if(text !== ''){
			console.log('Button 1 Says: ' + text);
		}

		if(this.touch.held) cs.Draw.setAlpha(0.5)
		cs.Draw.fillRect(btnRect);
		cs.Draw.setColor("white");
		//cs.Draw.strokeRect(btnRect);
	}
}

cs.objects['obj_joystick'] = {
   create: function(){
      this.width = 64;
      this.height = 64;
      this.surface = 'gui';
      this.tx = 0;
      this.ty = 0;
      this.jw = this.width/2;
      this.jh = this.height/2;
    },
    step: function(){
      this.x = 10; this.y = cs.Draw.canvas.height - this.height - 10;
      this.touch.check({ x:this.x, y:this.y, width:this.width, height:this.height });

      this.tx = this.x + (this.width/2) - (this.jw/2);
      this.ty = this.y + (this.width/2) - (this.jh/2);

      if(this.touch.held){
          this.tx = this.touch.x-(this.jw/2);
          if(this.tx < this.x){
             this.tx = this.x;
             //left key
             cs.Key.virtualDown(37);
          } else {cs.Key.virtualUp(37)}
          if(this.tx + this.jw > this.x + this.width){
             this.tx = this.x+this.width-this.jw;
             //right key
             cs.Key.virtualDown(39);
          } else {cs.Key.virtualUp(39)}
          this.ty = this.touch.y-(this.jh/2);
          if(this.ty < this.y){
             this.ty = this.y;
             //up key
             cs.Key.virtualDown(38);
          } else {cs.Key.virtualUp(38);}
          if(this.ty + this.jw > this.y + this.height){
             this.ty = this.y+this.height-this.jh;
          }
      } else {
       if(this.touch.up){
          if(cs.Key.held[37]){
             cs.Key.virtualUp(37);
          }
          if(cs.Key.held[38]){
             cs.Key.virtualUp(38);
          }
          if(cs.Key.held[39]){
             cs.Key.virtualUp(39);
          }
       }
      }

      cs.Draw.setAlpha(0.25);
      cs.Draw.setColor('#000000')
      cs.Draw.fillRect({ x:this.x, y:this.y, width:this.width, height:this.height });
      cs.Draw.setColor('#fff');
      cs.Draw.strokeRect({ x:this.tx, y:this.ty, width:this.jw, height:this.jh });

      cs.Draw.text(1, 0, 'FPS Step: ' + cs.Fps.rate);
      cs.Draw.text(1, 30, 'Scale: ' + cs.camera.scale);


      //cs.Draw.fillRect({ x: 0, y: cs.Draw.canvas.height-this.height, width: 50, height: 50})
   }
}
