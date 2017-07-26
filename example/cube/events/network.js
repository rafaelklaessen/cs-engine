cs.Network.onconnect = function(){
	console.log('event override connected!');
}

cs.Network.ondisconnect = function(){
	console.log('Disconnected! :(');
}

cs.Network.onmessage = function(data){
	cs.script.networkReceivedMessage(data);
}
