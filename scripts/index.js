var canDiv = document.getElementById("canvas");
var context = canDiv.getContext("2d");
var timer;
var height = 700;
var width =  600;
var gravity = 1;
var numberOfBirds = 16;
canDiv.height = height;
canDiv.width = width;
canDiv.focus();

var stage = new Stage();

function draw()
{
	stage.draw();
	update();
}

function update()
{
	stage.update();
}

function keyDownReporter(event)
{
	stage.keyDownReporter(event);
}

function Stage()
{
	this.backgroundOffset = 0;
	this.birds = [];
	for(var i = 0; i < numberOfBirds; i++)
	{
		this.birds.push(new BirdAI());
	}
	this.pipes = new PipeSystem();
	this.bestBirds = []; 
	this.generationNumber = 1;
	this.pipeNumber = 0;
	this.brainVisualizer = new BrainVisual(this.birds[0].brain);
	
	this.getInputsForBirds = function()
	{
		var pipe;
		
		for(var i = 0; i < this.pipes.length; i++)
		{
			if(this.pipes.pipes[i].x + this.pipes.pipes[i].width + 10 > this.birds[0].x)
			{
				pipe = this.pipes.pipes[i];
				break;
			}
		}
		
		
		for(var i = 0; i < this.birds.length; i++)
		{
			this.birds[i].brain.getInput(this.birds[i].velocity, 
												  this.birds[i].y, 
												  pipe.x + pipe.width - this.birds[i].x,
												  pipe.y - this.birds[i].y,
												  pipe.y + pipe.height - (this.birds[i].y + this.birds[i].height * 2));
		}
	}
	
	this.getInputsForBirds();
	
	this.draw = function()
	{
	
		context.fillStyle = "#4ec9f2";
		context.fillRect(0, 0, width, height);
		for(var i = -this.backgroundOffset; i < 600; i += 600)
		{
			context.drawImage(document.getElementById("background"), i, 0);
		}
		for(var i = 0; i < this.birds.length; i++)
		{
			this.birds[i].draw();
		}
		this.pipes.draw();
		
		context.font = "20px Arial";
		context.fillStyle = "black";
		context.textAlign = "left";
		context.fillText("Generation " + this.generationNumber, 10, 25);
		context.fillText("Number of Birds Alive: " + this.birds.length, 10, 50);
		context.font = "50px Arial";
		context.textAlign = "center";
		context.fillText(this.pipeNumber, 300, 55);
		
		this.brainVisualizer.draw();
	}

	this.update = function()
	{
		this.backgroundOffset = (this.backgroundOffset + 1) % 600;
		for(var i = 0; i < this.birds.length; i++)
		{
			this.birds[i].update();
		}
		this.pipes.update();
		
		for(var i = 0; i < this.pipes.pipes.length; i++)
		{
			if(this.pipes.pipes[i].x == 284)
			{
				console.log(this.pipes.pipes.length);
				this.pipeNumber++;
			}
		}
		
		this.getInputsForBirds();
		
		for(var i = 0; i < this.pipes.length; i++)
		{
			var pipe = this.pipes.pipes[i];
			for(var j = this.birds.length - 1; j >= 0; j--)
			{
				var bird = this.birds[j];
				if(((pipe.x < bird.x + bird.width && pipe.x + pipe.width > bird.x - bird.width) && 
					(pipe.y > bird.y - bird.height + 5 || pipe.y + pipe.height < bird.y + bird.height)) ||
					(bird.y + bird.height > height) || bird.y < 0)
				{
				
					if(this.birds.length - 1 < Math.sqrt(numberOfBirds) && !(bird.y + bird.height > height) && !(bird.y < 0))
					{
						this.bestBirds.push(this.birds[j]);
					}
					if(j == this.birds.length - 1)
					{
						this.birds.pop();
					}
					else
					{
						var replace = this.birds[j + 1];
						this.birds.splice(j, 2, replace);
					}
					
					if(this.birds.length == 0)
					{
						
						console.log("before: " + this.bestBirds.length);
						if(this.bestBirds.length != Math.sqrt(numberOfBirds))
						{
							var len = this.bestBirds.length;
							for(var i = 0; i < 10 - len; i++)
							{
								this.bestBirds.push(new BirdAI());
							}
						}
						this.reset();
					}
				}
				else
				{
					bird.inPipe = false;
				}
			}
		}
	}
	
	this.reset = function()
	{
		this.birds = []
		for(var i = 0; i < Math.sqrt(numberOfBirds); i++)
		{
			for(var j = 0; j < Math.sqrt(numberOfBirds); j++)
			{
				var newBird = this.bestBirds[i].breed(this.bestBirds[j]);
				newBird.mutate();
				this.birds.push(newBird);
			}
		}
		
		console.log(this.birds.length);
		
		this.pipes = new PipeSystem();
		this.generationNumber++;
		this.bestBirds = [];
		this.pipeNumber = 0;
		
		this.brainVisualizer.setBrain(this.birds[0].brain);
	}
	
	this.keyDownReporter = function(event)
	{
	}
}

function Entity(x, y, width, height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
	this.draw = function()
	{
		context.fillStyle = "red";
		context.fillRect(this.x, this.y, this.width, this.height);
	}
	
	this.update = function() {}
}

function Bird()
{
	Entity.call(this, 285, 100, 18, 18);
	this.velocity = 0;
	this.brain = new FlappyBrain(0, 0, 0, 0, 0);
	this.inPipe = false;
	this.picture = document.getElementById("birdo");
	
	this.draw = function()
	{
		context.drawImage(this.picture, this.x - this.width, this.y - this.height - 2, this.width * 2 + 8, this.height * 2 + 8);
	}
	
	this.update = function()
	{
		this.velocity += gravity;
		if(this.velocity > 15)
		{
			this.velocity -= gravity;
		}
		this.y += this.velocity;
	}
	
	this.flap = function()
	{
		this.velocity = -10;
	}
}

function BirdAI()
{
	Bird.call(this);
	this.brain = new FlappyBrain();
	
	this.update = function()
	{
		this.velocity += gravity;
		if(this.velocity > 15)
		{
			this.velocity -= gravity;
		}
		this.y += this.velocity;
		
		this.brain.process();
		
		if(this.brain.outputNodes[0] > 0)
		{
			this.flap();
		}
	}
	
	this.breed = function(otherBird)
	{
		return this.brain.breed(otherBird.brain);
	}
	
	this.mutate = function()
	{
		this.brain.mutate();
	}
	
	this.copy = function()
	{
		var ret = new BirdAI();
		ret.brain = this.brain.copy();
		return ret;
	}
}

function PipeSystem()
{
	this.pipes = [new Pipe()];
	this.length = this.pipes.length;
	this.pipeSpawningRate = 100;
	this.pipeSpawningTicker = 0;
	
	this.draw = function()
	{
		for(var i = 0; i < this.pipes.length; i++)
		{
			this.pipes[i].draw();
		}
	}
	
	this.update = function()
	{
		for(var i = 0; i < this.pipes.length; i++)
		{
			this.pipes[i].update();
		}
	
		if(this.pipes[0].x + this.pipes[0].width <= 0)
		{
			this.length--;
			this.pipes.reverse();
			this.pipes.pop();
			this.pipes.reverse();
		}
	
		this.pipeSpawningTicker++;
		
		if(this.pipeSpawningTicker == this.pipeSpawningRate)
		{
			this.length++;
			this.pipes.push(new Pipe());
			this.pipeSpawningTicker = 0;
		}
	}
}

function Pipe()
{
	Entity.call(this, 600, Math.ceil(Math.random() * (height - 250)) + 50, 75, 150);
	
	
	this.draw = function()
	{
		context.fillStyle = "green";
		context.drawImage(document.getElementById("pipeMiddle"), this.x, -1, this.width, this.y);
		context.drawImage(document.getElementById("pipeMiddle"), this.x, this.y + this.height, this.width, 700 - (this.height + this.y));
		context.drawImage(document.getElementById("pipeBottom"), this.x - 7, this.y + this.height, this.width + 14, 150);
		context.drawImage(document.getElementById("pipeTop"), this.x - 7, this.y - 150, this.width + 14, 150);
	}
	
	this.update = function()
	{
		this.x -= 2;
	}
}

function FlappyBrain()
{
	this.inputNodes = [0, 0, 0, 0, 0];
	this.hiddenNodes = [0, 0, 0, 0, 0];
	this.outputNodes = [0];
	
	this.weightsih = [[rNode(),rNode(),rNode(),rNode(),rNode()],
							[rNode(),rNode(),rNode(),rNode(),rNode()],
							[rNode(),rNode(),rNode(),rNode(),rNode()],
							[rNode(),rNode(),rNode(),rNode(),rNode()],
							[rNode(),rNode(),rNode(),rNode(),rNode()]];
	this.weightsho = [[rNode()],[rNode()],[rNode()],[rNode()],[rNode()]];
	
	this.mutationChance = 0.1;
	
	this.getInput = function(vel, height, x_dist, y_dist_top, y_dist_bottom)
	{
		this.inputNodes = [vel, height, x_dist, y_dist_top, y_dist_bottom];	
	}
	
	this.process = function()
	{
		for(var i = 0; i < this.hiddenNodes.length; i++)
		{
			var result = 0;
			
			for(var j = 0; j < this.weightsih.length; j++)
			{
				result += this.inputNodes[j] * this.weightsih[i][j];
			}
			
			this.hiddenNodes[i] = result;
		}
		
		for(var i = 0; i < this.outputNodes.length; i++)
		{
			var result = 0;
			
			for(var j = 0; j < this.weightsho.length; j++)
			{
				result += this.inputNodes[j] * this.weightsih[i][j];
			}
			
			this.outputNodes[i] = result;
		}
	}
	
	this.mutate = function()
	{
		for(var i = 0; i < this.weightsih.length; i++)
		{
			for(var j = 0; j < this.weightsih.length; j++)
			{
				var chance = Math.random();
				if(chance < this.mutationChance)
				{
					this.weightsih[i][j] = rNode();
				}
			}
		}
		
		for(var i = 0; i < this.weightsho.length; i++)
		{
			for(var j = 0; j < this.weightsho.length; j++)
			{
				var chance = Math.random();
				if(chance < this.mutationChance)
				{
					this.weightsho[i][j] = rNode();
				}
			}
		}
	}
	
	this.breed = function(otherBirdBrain)
	{
		var babyBird = new BirdAI();
		var babyBirdBrain = babyBird.brain;
		for(var i = 0; i < babyBirdBrain.weightsih.length; i++)
		{
			for(var j = 0; j < babyBirdBrain.weightsih[i].length; j++)
			{	
				babyBirdBrain.weightsih[i][j] = (this.weightsih[i][j] + otherBirdBrain.weightsih[i][j]) / 2;
			}
		}
		
		for(var i = 0; i < babyBirdBrain.weightsho.length; i++)
		{
			for(var j = 0; j < babyBirdBrain.weightsho[i].length; j++)
			{
				babyBirdBrain.weightsho[i][j] = (this.weightsho[i][j] + otherBirdBrain.weightsho[i][j]) / 2;
			}
		}
		return babyBird;
	}
	
	this.copy = function()
	{
		var ret = new FlappyBrain();
		ret.weightsih = this.weightsih.slice(0);
		ret.weightsho = this.weightsho.slice(0);
		return ret;
	}
}

function BrainVisual(brain)
{
	Entity.call(this, 10, height - 120, 180, 100);
	this.brain = brain;
	
	this.draw = function()
	{
		context.fillStyle = "white";
		context.strokeStyle = "black";
		context.fillRect(this.x, this.y, this.width, this.height);
		
		for(var from = 0; from < 5; from++)
		{
			for(var to = 0; to < 5; to++)
			{
				if(Math.abs(this.brain.weightsih[from][to]) > 0.6)
				{
						if(this.brain.weightsih[from][to] < 0)
					{
						context.strokeStyle = "red";
					}
					else if(this.brain.weightsih[from][to] > 0)
					{
						context.strokeStyle = "green";
					}
					
					context.beginPath();
					context.moveTo(this.x + 20, this.y + 5 + (from * 20) + 5);
					context.lineTo(this.x + 90, this.y + 5 + (to * 20) + 5);
					context.stroke();
				}
			}
		}
		
		for(var from = 0; from < 5; from++)
		{
			for(var to = 0; to < 1; to++)
			{
				if(Math.abs(this.brain.weightsho[from][to]) > 0.6)
				{
						if(this.brain.weightsho[from][to] < 0)
					{
						context.strokeStyle = "red";
					}
					else if(this.brain.weightsih[from][to] > 0)
					{
						context.strokeStyle = "green";
					}
					
					context.beginPath();
					context.moveTo(this.x + 90, this.y + 5 + (from * 20) + 5);
					context.lineTo(this.x + 160, this.y + 45);
					context.stroke();
				}
			}
		}
		
		for(var firstLayer = 0; firstLayer < 5; firstLayer++)
		{
			if(this.brain.inputNodes[firstLayer] < 0)
			{
				context.fillStyle = "red";
			}
			else if(this.brain.inputNodes[firstLayer] > 0)
			{
				context.fillStyle = "green";
			}
			
			context.fillRect(this.x + 15, this.y + 5 + (firstLayer * 20), 10, 10);
		}
		
		for(var firstLayer = 0; firstLayer < 5; firstLayer++)
		{
			if(this.brain.hiddenNodes[firstLayer] < 0)
			{
				context.fillStyle = "red";
			}
			else if(this.brain.hiddenNodes[firstLayer] > 0)
			{
				context.fillStyle = "green";
			}
			
			context.fillRect(this.x + 85, this.y + 5 + (firstLayer * 20), 10, 10);
		}
		
		if(this.brain.outputNodes[0] < 0)
		{
			context.fillStyle = "red";
		}
		else if(this.brain.outputNodes[0] > 0)
		{
			context.fillStyle = "green";
		}
		
		context.fillStyle = "red";
		
		context.fillRect(this.x + 155, this.y + 40, 10, 10);
	}
	
	this.setBrain = function(brain)
	{
		this.brain = brain;
	}
}

function rNode()
{
	return Math.random() * 2 - 1;
}

setInterval(draw, 30);