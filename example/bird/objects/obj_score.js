cs.objects['obj_score'] = {
	create: function(){
		this.height = 40;
		this.width = 2;
		this.hspeed = 1;
	},
	step: function(){
		this.x -= this.hspeed;
	}
}

cs.objects['obj_score_text'] = {
	zIndex: 10,
	create: function(){
		this.text = cs.Math.choose([
			'+1 Nice dive!',
			'+1 Daredevil!',
			'+1 Dangerous!',
			'+1 Holy Smokes!'
		]);
		this.timer = 60;
	},
	step: function(){
		this.y -= 1;
		this.x -= cs.global.speed;
		this.timer -= 1;

		cs.Draw.setTextCenter();
		cs.Draw.setColor('#FFFFFF');
		cs.Draw.text({ x:this.x, y:this.y, text:this.text })

		if(this.timer == 0){
			this.destroy()
		}
	}
}
