module.exports = function(server){

	var io = require('socket.io').listen(server);
    console.log('Server started');
	
	var games = {};
	
	io.sockets.on('connection', function(socket){
		
		//player joins a game
		socket.on('join', function(data){
			var username = data.name;
			var room = data.token;
			
			//if player is first to join
			if(!(room in games)){
				var rows = data.rows;
				var cols = data.cols;
				var minPlayers = data.minPlayers;
				var freezeTime = data.freezeTime;
				var color = randomColour();
				var players = [{
					socket : socket,
					name : username,
					status : 'joined',
					score : 0,
					color : color
				}];
				games[room] = {
					room : room,
					creator : socket,
					status : 'waiting',
					rows : rows,
					cols : cols,
					minPlayers : minPlayers,
					freezeTime : freezeTime,
					createdAt : Date.now(),
					players : players,
					colors : [color],
					blocksDone : 0,
					root : username
				};
				
				socket.join(room);
				//emit wait status to all players
				socket.emit('wait',{
					'display_data' : '<h2>Your Game token is : <b style="color: red;">'+data.token+'</b><br><em>Waiting for other players to join...</em></h2>'
				});
				return;
			}
			//There are already other players
			var game = games[room];
			//Game already started
			if(game.status == 'ready'){
				socket.emit('missed',{
					'display_data' : '<h2>Sorry...Game has already been started, please join the other room or create a new room by click <a href="/">here</a></h2>'
				});
				return;
			}
			
			socket.join(room);
			var player = {};
			player.name = username;
			player.socket = socket;
			player.status = 'joined';
			player.score = 0;
			//assign color to him --- Make sure it is UNIQUE
			var color = randomColour();
			while(color in game.colors){
				color = randomColour();
			}
			player.color = color;
			
			game.status = 'waiting';
			game.players.push(player);
			game.colors.push(color);
			
			//emit to all players in the Game
			io.sockets.to(room).emit('player-joined',{
                'display_data' : username+' has joined the game',
                'color' : color
            });
		});
		
		//Game creator started the game
		socket.on('start_game',function(data){
			//generate board and send to all players
			var game = games[data.token];
			
			if(game.players.length < 2){
				socket.emit('no_players',{
					'display_data' : 'There are no other players.<br><em>Wait until at least one player joins.</em><br>Send your token <b>'+data.token+'</b> to friends.',
					'status' : false
				});
				return;
			}
			
			data.players_info = getPlayersInfo(game);
			data.rows = game.rows;
			data.cols = game.cols;
			data.freezeTime = game.freezeTime;
			
			game.status = 'ready';
			//emit to all players with game information
			io.sockets.to(data.token).emit('start', data);
			io.sockets.to(data.token).emit('score_update', data.players_info);
		});
		
		//user clicked a cell
		socket.on('cell_click',function(data){
			var user = data.user;
			var token = data.token;
			var cellId = data.cellId;
			var seqNum = data.seqNum;
			
			var game = games[token];
			
			//prevent another requests here --- IMPORTANT !!
			if(seqNum != game.blocksDone)
				return;
			
			game.blocksDone += 1;
			
			var player = game.players.find(x => x.name === user);
			player.score += 1;
			
			//update scores
			io.sockets.to(token).emit('score_update', getPlayersInfo(game));
			
			//game completed
			if(game.blocksDone == game.rows*game.cols){
				//get player with max score
				var winners = getWinner(game);
				
				io.sockets.to(token).emit('game_done', {
					'display_data' : 'Game completed.<br><strong>You can start a new game <a href="/">here</a></strong>.<br>',
					'winners' : winners
				});
				
				return;
			}
			
			//unfreeze after x seconds
			setTimeout(function(){ 
				io.sockets.to(token).emit('unfreeze', {
					'counter' : game.blocksDone
				});
			}, game.freezeTime*1000);
			
			//emit to all players with game information
			io.sockets.to(token).emit('onClick', data);

		});
		
		//user left the game
		socket.on('disconnect',function(data){
			//search for game and player that left
			for(var token in games){
				var game = games[token];
				for(var i = 0; i < game.players.length; i++){
					var player = game.players[i];
					if(player.socket === socket){
						// Broadcast to all users except to this player
						socket.broadcast.to(token).emit('player-disconnected', {
                            'color': player.color,
                            'display_data': player.name+' disconnected'
                        });
						//remove player from game
						game.players.splice(i,1);
						
						if(game.players.length > 0){
							//if only one guy left --- declare him winner and end the game
							if(game.players.length == 1 && game.status === "ready"){
								console.log("game done");
								socket.broadcast.to(token).emit('abort',{
                                    'display_data': '<h2 class="winner">You are the Winner</h2><h4>Start another Game <a href="/">here</a>.</h4><br />'
                                });
								game.players[0].socket.leave(token);
								delete game;
							}
						}
					}
				}
			}
		});
		
		function randomColour(){
			var colour='#'+Math.floor(Math.random()*16777215).toString(16);
			if(colour.length == 7)
				return colour;
			else
				return colour+'1';
		}
		
		function getPlayersInfo(game){
			players_info = {};
			for(var each in game.players){
				players_info[game.players[each].name] = {
					'score' : game.players[each].score,
					'color' : game.players[each].color
				}
			}
			return players_info;
		}
		
		function getWinner(game){
			var winners = [];
			var max = -1;
			for(var each in game.players){
				console.log(game.players[each].score);
				if(game.players[each].score > max){
					winners = [];
					winners.push({
						'name':game.players[each].name,
						'score':game.players[each].score
					});
					max = game.players[each].score ;
				}
				else if(game.players[each].score == max){
					winners.push({
						'name':game.players[each].name,
						'score':game.players[each].score
					});
				}
			}
			
			return winners;
		}
	});
};