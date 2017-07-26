cs.script.interface = {}
cs.script.interface.drawButton = function(bx, by, bw, bh, text){
   cs.Draw.setAlpha(0.6)
   cs.Draw.rect(bx, by, bw, bh, true)
   cs.Draw.setWidth(3)
   cs.Draw.rect(bx-1, by-1, bw+2, bh+2, false)

   cs.Draw.setColor('#FFFFFF');
   cs.Draw.setTextCenter();
   cs.Draw.setFont('18px Arial')
   cs.Draw.text(cs.Draw.canvas.width/2, by+bh/2, text);
}

cs.script.interface.drawButtons = function(btns){
   var btnHeight = 150
   var btnWidth = 300
   var totalHeight = cs.Draw.canvas.height
   var totalButtonHeight = btnHeight * btns.length

   if(totalButtonHeight > totalHeight)
      totalButtonHeight = totalHeight

   var btnHeight = totalButtonHeight/btns.length
   var dy = cs.Draw.canvas.height/2 - (totalButtonHeight)/2
   var dx = cs.Draw.canvas.width/2 - btnWidth/2
   var space = 20
   for(var btn of btns){
      var btnRect = {
         x: dx,
         y: dy+space/2,
         width: btnWidth,
         height: btnHeight-space
      }
      cs.Draw.setColor('#000')
      cs.Draw.setAlpha(0.75)
      cs.Draw.fillRect(btnRect)
      cs.Draw.setColor('#FFF')
      cs.Draw.setWidth(3)
      cs.Draw.strokeRect(btnRect)
      cs.Draw.setTextCenter()
      cs.Draw.setColor('#FFF')
      cs.Draw.setFont('20px Arial')
      cs.Draw.text({
         x: dx+btnWidth/2,
         y: dy+btnHeight/2,
         text: btn
      })
      dy += btnHeight
   }
}
