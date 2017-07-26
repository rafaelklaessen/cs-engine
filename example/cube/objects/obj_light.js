cs.objects['obj_light'] = {
    create: function(){
        this.width = 30;
        this.height = 30;

        //Create New Layer
        cs.Draw.createSurface({ name: 'light', raw: false, zIndex: 10 })
        this.surface = 'light'

        //Create Global Variable
        cs.global.lightList = [];

    },
    step: function(){
        cs.Draw.fillRect({ x:0, y:0, width:cs.room.width, height:cs.room.height });
        for(var i = 0; i < cs.global.lightList.length; i++){
            var light = cs.global.lightList[i];

            var obj = light.obj;
            cs.Draw.setOperation('xor');

            cs.Draw.circleGradient(obj.x+light.xoff, obj.y+light.yoff, light.size, '#FFF', 'rgba(255, 255, 255, 0)');

            cs.Draw.setAlpha(0.075);
            cs.Draw.setColor(cs.global.lightList[i].color);
            cs.Draw.circle(obj.x+light.xoff, obj.y+light.yoff, light.size);
        }
    }
}
