cs.Obj.registerObj('obj_background', {
	create: function(){
		this.timer = 0;
	},
	step: function(){
		this.timer -= 1;
		if(this.timer == -1){
			for(var i = 0; i < 10; i++){
				cs.Obj.addObj(
				 	new cs.Obj({ type: 'obj_bgPart', x:cs.Math.iRandomRange(0, cs.room.width), y:0 })
			 	)
			}
			this.timer = 0;
		}
		if(this.timer == 0){
			cs.Obj.addObj(
				new cs.Obj({ type:'obj_bgPart', x:cs.room.width, y:0 })
			)
			this.timer = cs.Math.iRandomRange(40, 120);
		}
	}
})

cs.Obj.registerObj('obj_bgPart', {
	zIndex: 10,
	create: function(){
		this.timer = 600;
		this.bgType = cs.Math.choose(['mountain', 'cloud']);

		cs.script.setSprite(this, cs.Math.choose([
			'cloud1',
			'cloud2',
			'cloud3'
		]));

		//Cloud
		this.y = cs.Math.iRandomRange(0, cs.room.height-this.height*2);
		this.hspeed = cs.global.speed+cs.Math.choose([0, 1]);
		//Mountain
		if(this.bgType == 'mountain'){
			cs.script.setSprite(this,cs.Math.choose([
				'mountain1',
				'mountain2'
			]));
			this.hspeed = cs.global.speed;
			this.y = cs.room.height-this.height;
		}
	},
	step: function(){
		if(cs.save.state !== 'WRECKED' || this.bgType == 'cloud')
			this.x -= this.hspeed;

		if(this.x < -this.width){
			this.destroy()
		}

		cs.Draw.sprite({ spr:this.sprite, x:this.x, y:this.y });
	}
})
