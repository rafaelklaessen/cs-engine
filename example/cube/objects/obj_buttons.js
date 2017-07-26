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
			x:cs.Draw.canvas.width - 50,
			y:cs.Draw.canvas.height - 50,
			width:this.width,
			height:this.height
		}

		this.touch.check(btnRect);
		if(this.touch.down){
			//console.log('open');
			cs.Key.virtualPress(38);
		}

		var text = cs.Input.return(this.id);
		if(text !== ''){
			console.log('Button 1 Says: ' + text);
		}

		if(this.touch.held){
			cs.Draw.setAlpha(0.5);
		}
		cs.Draw.fillRect(btnRect)
		cs.Draw.setColor("white")
		cs.Draw.strokeRect(btnRect)
	}
}
