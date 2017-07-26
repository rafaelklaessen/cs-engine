cs.objects['obj_interface'] = {
	zIndex: 30,
	create: function(){
		this.width = 30;
	   this.height = 30;
	   this.backgroundPlaying = undefined;
		this.surface = 'gui'
		cs.Sound.toggleMute(true)
	},
	step: function(){
        //Handling Touch
        this.touch.check({ x:0, y:0, width:cs.Draw.canvas.width, height:cs.Draw.canvas.height})
        //Sound
        if(this.touch.down && this.touch.within({ x:0, y:0, width:14*3, height: 14*3})){
            cs.Sound.toggleMute(!cs.Sound.mute)
            return;
        }
        var soundSprite = 'sound_on';
        if(cs.Sound.mute)
            soundSprite = 'sound_off';
				cs.Draw.sprite({
					spr: soundSprite,
					x: 0, y: 0,
					scale: 3 })

		  var btnHeightMax = 200;
		  var btnHeightMin = 50;
		  var btnSpace = 20;
		  var bw = 300;
		  var bx = cs.Draw.canvas.width/2-bw/2

        switch(cs.save.state){
            case 'START':
					cs.script.interface.drawButtons(['Please tap to start'])
               if(this.touch.down)
                  cs.save.state = 'TAPTOFLAP';
               break;
            case 'TAPTOFLAP':
               if(!this.backgroundPlaying)
            		this.backgroundPlaying = cs.Sound.getSound('background').play({ loop: true });
					cs.script.interface.drawButtons(['Tap to flap!', 'Your Best Score: ' + cs.save.topScore])
                if(this.touch.down){
                    cs.save.state = 'PLAYING'
                    cs.global.flap = true
                }
                break;

            case 'PLAYING':
					var text = 'Score: ' + cs.global.score;
					cs.Draw.setFont("20px Arial")
					var tw = cs.Draw.textSize(text).width;
					cs.Draw.setAlpha(0.5);
					var rect = { x: cs.Draw.canvas.width-100, y: 0, width:100, height:60 }
					cs.Draw.fillRect(rect);
					cs.Draw.strokeRect(rect);
					cs.Draw.setColor('#FFFFFF');
					cs.Draw.setFont("20px Arial")
					cs.Draw.text({
						x: cs.Draw.canvas.width - tw-10,
						y: this.y+5,
						text: 'Score: ' + cs.global.score
					})
					cs.Draw.setColor('#FFFFFF');
					cs.Draw.setFont("20px Arial")
					cs.Draw.text({
						x: cs.Draw.canvas.width - tw-10,
						y: this.y+30,
						text: 'Best: ' + cs.save.topScore
					})
					if(this.touch.down)
					  	cs.global.flap = true;
					break;

            case 'WRECKED':
				   cs.script.interface.drawButtons(['Replay!', 'Your Best Score: ' + cs.save.topScore])
               if(cs.global.score > cs.save.topScore)
        				cs.save.topScore = cs.global.score;

               if(this.touch.down){
                    cs.save.state = 'TAPTOFLAP';
                    cs.room.restart();
               }
               break;
        }
    }
}
