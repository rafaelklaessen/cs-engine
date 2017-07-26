cs.Obj.registerObj('obj_block', {
	create: function(){
		this.width = 16;
    	this.height = 16;
	},
	step: function(){
		cs.Draw.sprite({ spr:'spr_block', x:this.x, y:this.y });
	}
})
