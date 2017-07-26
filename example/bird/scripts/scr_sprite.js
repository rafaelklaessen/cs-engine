cs.script.setSprite = function(that, spriteName){
    that.sprite = spriteName;
    that.width = cs.Sprite.list[spriteName].getFwidth();
    that.height = cs.Sprite.list[spriteName].getFheight();
    that.xoff = cs.Sprite.list[spriteName].getXoff();
    that.yoff = cs.Sprite.list[spriteName].getYoff();
}
