cs.script.networkSendMovement = function(obj){
    if(!cs.Network.status) return;

	cs.Network.send({
		type: 'movement',
		keys: obj.old_keys,
		x: obj.x,
		y: obj.y,
		hspeed: obj.hspeed,
		vspeed: obj.vspeed
	});
}
