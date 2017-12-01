(function(){
	$(document).ready(function(){
		
		var socket = io();
		
		var seqNum;
		
		var token,user,color,isHost;
		token = $('#mainScreen').attr('data-token'); 
		user = $('#mainScreen').attr('data-user');
		isHost = $('#mainScreen').attr('data-host');
		
		//bind startGame
		$('#startGame').click(startGame);
		
		//join the game
		if(isHost){
			rows = $('#gameInfo').attr('data-rows');
			cols = $('#gameInfo').attr('data-cols');
			minPlayers = $('#gameInfo').attr('data-minPlayers');
			freezeTime = $('#gameInfo').attr('data-freezeTime');
			
			socket.emit('join',{
				'name' : user,
				'token' : token,
				'rows' : rows,
				'cols' : cols,
				'minPlayers' : minPlayers,
				'freezeTime' : freezeTime
			});
		}
		else{
			socket.emit('join',{
				'name' : user,
				'token' : token
			});
		}
		
		//waiting for other users to join
		socket.on('wait',function(data){
			displayData(data);
		});
		
		//if user missed the game
		socket.on('missed',function(data){
			displayData(data);
		});
		
		//if another player joined
		socket.on('player-joined',function(data){
			displayDataScreenR(data);
		});
		
		//if no other players are there
		socket.on('no_players',function(data){
			displayData(data);
		});
		
		//start the game
		socket.on('start',function(data){
			var players_info = data.players_info;
			var rows = data.rows;
			var cols = data.cols;
			var freezeTime = data.freezeTime;

			var listPhepTinh = data.listPhepTinh;
			var listRequest = data.listRequest;
			
			seqNum = 0;

			var stt = 0;
			
			var color = players_info[user].color;
			$('#mainScreen').html('<h1 data-result="' + listPhepTinh[stt].ketQua + '" id="ket-qua">' + listPhepTinh[stt].phepTinh + ' = ???</h1>');


			socket.on('request_true',function(data){
				stt++;
				$('#ket-qua').attr('data-result', listPhepTinh[stt].ketQua);
				$('#ket-qua').text(listPhepTinh[stt].phepTinh);

			});
			
			//disable start button
			$('#startGame').hide();
			
			//generate grid
			$('#mainScreen').append('<table class="table table-bordered"><tbody class="table-game"></tbody></table>');
			var count = 1;
			var sttRequest = 0;
			for(var i=0;i<rows;i++){
				$('#mainScreen > table > tbody').append('<tr id="'+i+'-tr"><tr/>');
				for(var j=0;j<cols;j++){

					$('#mainScreen > table > tbody > #'+i+'-tr').append('<td class="grid_cell" data-i="'+i+'" data-j="'+j+
						'" data-request="'+

						listRequest[sttRequest].ketQua

						+'" id="'+i+'-'+j+'">' + listRequest[sttRequest].ketQua + '</td>');
					sttRequest++;
				}
			}
			
			$('.grid_cell').hover(
				function(e){
					var cellId = e.target.id;
					if(!$('#'+cellId).hasClass("done")){
						socket.emit('cell_hoverOn',{
							'token' : token,
							'cellId' : cellId,
							'color' : color
						});
					}
				},
				function(e){
					var cellId = e.target.id;
					if(!$('#'+cellId).hasClass("done")){
						socket.emit('cell_hoverOff',{
							'token' : token,
							'cellId' : cellId,
							'color' : color
						});
					}
				}
			);
			
			$('.grid_cell').click(function(e){
				var cellId = e.target.id;

				var request = $(this).attr('data-request'); 
				var result = $('#ket-qua').attr('data-result'); 

				if(!$('#'+cellId).hasClass("done")){
					socket.emit('cell_click',{
						'token' : token,
						'user' : user,
						'color' : color,
						'cellId' : cellId,
						'seqNum' : seqNum,
						'result' : result,
						'request' : request,

					});
				}
			});
		});
		
		//unfreeze the screen
		socket.on('unfreeze',function(data){
			seqNum = data.counter;
		});
		
		//onClick
		socket.on('onClick',function(data){
			var cellId = data.cellId;
			$('#'+cellId).css("background-color",data.color);
			$('#'+cellId).addClass("done");
		});
		
		//display scores
		socket.on('score_update',function(data){
			displayDataScreenL(data);
		});
		
		//game completed
		socket.on('game_done',function(data){
			gameDone(data);
		});
		
		//player disconnected
		socket.on('player-disconnected',function(data){
			displayDataScreenR(data);
		});
		//end game --- if only one player left
		socket.on('abort',function(data){
			displayData(data);
		});
		
		function startGame(){
			socket.emit('start_game',{
				'token' : token
			});
		}
		
		function displayData(data){
			if('display_data' in data){
				$('#mainScreen').html(data.display_data);
			}
		}
		
		function displayDataScreenR(data){
			if('display_data' in data){
				$('#sideScreenR').append('<li class="list-group-item"><font color="'+(("color"in data)? data.color : color)+'">'+data.display_data+'</font></li>');
			}
		}

		function pad(number) {
		    return (number < 10) ? '0' + number.toString() : number.toString();
		}
		
		function displayDataScreenL(data){
			var html = '<ul class="list-group">';
			for(var player in data){
				html += '<li class="list-group-item"><span class="badge">'+pad(data[player].score)+'</span><b>'+player+'</b><div class="color" style="width:20px;height:20px;background-color:'+data[player].color+';display: inline-block;float: right;margin-right: 10px;"></div></li>';
			}
			html += '</ul>';
			$('#sideScreenL').html(html);
		}
		
		function gameDone(data){
			$("#overlay").hide();
			displayData(data);
			var html = '<p class="winner"><b>Winners :</b></p>';

			for(var i=0;i<data.winners.length;i++){
				html += '<p class="champion">@'+data.winners[i].name+' : '+data.winners[i].score+'</p>';
			}

			$('#mainScreen').append(html);
		}
		
	});
})();