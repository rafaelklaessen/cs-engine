cs.objects['obj_block'] = {
   sprite: 'spr_block',
   width:16,
   height: 16,
   create: function(){
   },
   step: function(){
      cs.Draw.sprite({ spr:this.sprite, x:this.x, y:this.y })
   }
}
