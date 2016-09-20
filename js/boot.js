var bootState = {
	preload: function(){
		//load the image
		game.load.image('progressBar', 'assets/progressBar.png');
	},
	create: function(){
		game.stage.backgroundColor = "#0400ff";
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.renderer.renderSession.roundPixels = true;

		game.state.start('load');
	}
};
