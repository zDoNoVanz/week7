var playState = {
	create: function () {
		this.player = game.add.sprite(game.width / 2, game.height / 2, "player");
		this.player.anchor.setTo(0.5, 0.5);
		game.physics.arcade.enable(this.player);
		this.player.tint = 0x000000 ;
		//gravity of player
		this.player.body.gravity.y = 500;
		this.cursor = game.input.keyboard.createCursorKeys();
		//Create a group
		this.walls = game.add.group();
		this.enemies = game.add.group();
		//add physics to the gruop
		this.walls.enableBody = true;
		this.enemies.enableBody = true;
		//Create enemies
		this.enemies.createMultiple(20, 'enemy');
		//call 'addEnemy' in ... milisecond
		game.time.events.loop(2200, this.addEnemy, this);
		//Create 2 walls in the group
		game.add.sprite(0, 0, 'wallV', 0, this.walls);
		game.add.sprite(480, 0, 'wallV', 0, this.walls);
		//horizontal walls
		game.add.sprite(0, 0, 'wallH', 0, this.walls); //Top left
		game.add.sprite(300, 0, 'wallH', 0, this.walls); // Top right
		game.add.sprite(0, 320, 'wallH', 0, this.walls); // Bottom left
		game.add.sprite(300, 320, 'wallH', 0, this.walls); // Bottom right
		game.add.sprite(-100, 160, 'wallH', 0, this.walls); // Middle left
		game.add.sprite(400, 160, 'wallH', 0, this.walls); // Middle right
		var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
		middleTop.scale.setTo(1.5, 1);
		var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
		middleBottom.scale.setTo(1.5, 1);
		//Set all the wall to be moveable
		this.walls.setAll('body.immovable', true);
		//add coin
		this.coin = game.add.sprite(60, 140, 'coin');
		//add physics to the coin
		game.physics.arcade.enable(this.coin);
		//set the anchor point to it center
		this.coin.anchor.setTo(0.5, 0.5);
		//add text
		this.scoreLabel = game.add.text(30, 30, 'score: 0', {
			font: '18px Arial',
			fill: '#ffffff'
		});
		game.global.score = 0;
		game.add.text();
		//add sound
		this.jumpSound = game.add.audio('jump');
		this.coinSound = game.add.audio('coin');
		this.deadSound = game.add.audio('dead');
		this.bgMusic = game.add.audio('bg');
		this.bgMusic.loop = true;
		this.bgMusic.play();
		//add frames
		this.player.animations.add('right', [1, 2], 8, true);
		this.player.animations.add('left', [3, 4], 8, true);
		//add particles
		this.emitter = game.add.emitter(0, 0, 15);
		this.emitter.makeParticles('pixel');
		this.emitter.setYSpeed(-150, 150);
		this.emitter.setXSpeed(-150, 150);
		this.emitter.setScale(2, 0, 2, 0, 800);
		this.emitter.gravity = 0;
	},

	update: function () {
		game.physics.arcade.collide(this.player, this.walls);
		game.physics.arcade.collide(this.enemies, this.walls);
		game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
		game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
		if(!this.player.alive) {
			return;
		}
		this.movePlayer();
		if (!this.player.inWorld) {
			this.playerDie();
		}
	},

	movePlayer: function () {
		if (this.cursor.left.isDown) {
			this.player.body.velocity.x = -200;
			this.player.animations.play('left');
		} else if (this.cursor.right.isDown) {
			this.player.body.velocity.x = 200;
			this.player.animations.play('right');
		} else {
			this.player.body.velocity.x = 0;
			this.player.animations.stop();
			this.player.frame = 0;
		}
		if (this.cursor.up.isDown && this.player.body.touching.down) {
			this.jumpSound.play();
			this.player.body.velocity.y = -320;
		}
	},

	playerDie: function () {
		this.deadSound.play();
		this.emitter.x = this.player.x;
		this.emitter.y = this.player.y;
		this.emitter.start(true, 800, null, 15);
		this.bgMusic.stop();
		this.player.kill();
		game.camera.flash(0xffffff, 300);
		game.camera.shake(0.02, 300);
		game.time.events.add(1000, this.startMenu, this);
	},

	startMenu: function() {
		game.state.start('menu');
	},

	takeCoin: function () {
		//		this.coin.kill();
		this.coin.scale.setTo(0, 0);
		game.add.tween(this.coin.scale).to({x:1, y:1}, 500).start();
		game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();
		game.global.score += 5;
		this.scoreLabel.text = 'score: ' + game.global.score;
		this.updateCoinPosition();
		this.coinSound.play();
	},

	updateCoinPosition: function () {
		var coinPosition = [
			{
				x: 140,
				y: 60
			}, {
				x: 360,
				y: 60
			},
			{
				x: 50,
				y: 140
			}, {
				x: 440,
				y: 140
			},
			{
				x: 130,
				y: 300
			}, {
				x: 170,
				y: 300
			}
		];
		//get rid of current position
		for (var i = 0; i < coinPosition.length; i++) {
			if (coinPosition[i].x == this.coin.x) {
				coinPosition.splice(i, 1);
			}
		}
		//random pick from array
		var newPosition = game.rnd.pick(coinPosition);
		//set new position
		this.coin.reset(newPosition.x, newPosition.y);
	},

	addEnemy: function () {
		var enemy = this.enemies.getFirstDead();
		if (!enemy) {
			return;
		}
		if (!game.rnd.pick([0, 1])) {
			enemy.anchor.setTo(0.5, 1);
			enemy.reset(game.width / 2, game.height);
			enemy.body.gravity.y = -500;
		} else {
			enemy.anchor.setTo(0.5, 1);
			enemy.reset(game.width / 2, 0);
			enemy.body.gravity.y = 500;
		}
		enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
		enemy.body.bounce.x = 1;
		enemy.checkWorldBounds = true;
		enemy.outOfBoundsKill = true;
	}
};
