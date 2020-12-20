import Phaser from 'phaser'

// UI
import ScoreLabel from '../ui/ScoreLabel'

// Logic
import BombSpawner from './BombSpawner'

// Assets
import Sky from '../assets/sky.png'
import Platform from '../assets/platform.png'
import Star from '../assets/star.png'
import Bomb from '../assets/bomb.png'
import Dude from '../assets/dude.png'


export default class GameScene extends Phaser.Scene
{
	constructor()
	{
		super('game-scene')

		this.player = undefined
        this.cursors = undefined
        this.scoreLabel = undefined
        this.stars = undefined
        this.bombSpawner = undefined
        this.bombs = undefined
        this.platforms = undefined

        this.gameOver = false
	}

	preload()
	{
		this.load.image('sky', Sky)
		this.load.image('ground', Platform)
		this.load.image('star', Star)
		this.load.image('bomb', Bomb)

		this.load.spritesheet('dude', 
			Dude,
			{ frameWidth: 32, frameHeight: 48 }
		)
	}

	create()
	{
        this.add.image(400, 300, 'sky')

        this.platforms = this.createPlatforms()
        this.player = this.createPlayer()
        this.stars = this.createStars()
        
        this.scoreLabel = this.createScoreLabel(16, 16, 0)

        this.bombSpawner = new BombSpawner(this, 'bomb')
        this.bombs = this.bombSpawner.group

        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.collider(this.stars, this.platforms)
        this.physics.add.collider(this.bombs, this.platforms)
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this)
        
		this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)
        
		this.cursors = this.input.keyboard.createCursorKeys()
    }

    collectStar(player, star)
	{
        star.disableBody(true, true)
        
        this.scoreLabel.add(10)
        
        if (this.stars.countActive(true) === 0)
		{
			//  A new batch of stars to collect
			this.stars.children.iterate((child) => {
				child.enableBody(true, child.x, 0, true, true)
			})
        }
        
        this.bombSpawner.spawn(player.x)
    }

    
	hitBomb(player, bomb)
	{
		this.physics.pause()

		player.setTint(0xff0000)

		player.anims.play('turn')

        this.gameOver = true
        
        this.time.addEvent({
            delay: 1000,
            loop: false,
            callback: () => {
                this.gameOver = false
                this.scene.restart();
            }
        })
	}
    
    createScoreLabel(x, y, score)
	{
		const style = { fontSize: '32px', fill: '#000' }
		const label = new ScoreLabel(this, x, y, score, style)

		this.add.existing(label)

		return label
	}
    
    createPlatforms()
	{
		const platforms = this.physics.add.staticGroup()

		platforms.create(400, 568, 'ground').setScale(2).refreshBody()
	
		platforms.create(600, 400, 'ground')
		platforms.create(50, 250, 'ground')
        platforms.create(750, 220, 'ground')
        
        return platforms
    }
    
    createPlayer()
	{
		const player = this.physics.add.sprite(100, 450, 'dude')
		player.setBounce(0.2)
		player.setCollideWorldBounds(true)

		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		})
		
		this.anims.create({
			key: 'turn',
			frames: [ { key: 'dude', frame: 4 } ],
			frameRate: 20
		})
		
		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
		})

		return player
    }
    
    createStars()
	{
		const stars = this.physics.add.group({
			key: 'star',
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 }
		})
		
		stars.children.iterate((child) => {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
		})

		return stars
    }

    update()
	{
        if (this.gameOver)
		{
			return
        }
        
		if (this.cursors.left.isDown)
		{
			this.player.setVelocityX(-160)

			this.player.anims.play('left', true)
		}
		else if (this.cursors.right.isDown)
		{
			this.player.setVelocityX(160)

			this.player.anims.play('right', true)
		}
		else
		{
			this.player.setVelocityX(0)

			this.player.anims.play('turn')
		}

		if (this.cursors.up.isDown && this.player.body.touching.down)
		{
			this.player.setVelocityY(-330)
		}
	}
}