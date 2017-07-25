cs.script.setSprite = function(that, spriteName){
    that.sprite = spriteName;
    that.width = cs.sprite.list[spriteName].getFwidth();
    that.height = cs.sprite.list[spriteName].getFheight();
    that.xoff = cs.sprite.list[spriteName].getXoff();
    that.yoff = cs.sprite.list[spriteName].getYoff();
}
