var express = require('express');

var router = express.Router();

gameList = [];

router.get('/', function(req, res) {
	res.render('partials/index',{
		title: 'Home - ',
    });
});

router.get('/game-tutorial', function(req, res) {
	res.render('partials/game-tutorial',{
		title: 'Game Tutorial - ',
    });
});

router.get('/game/:token/:user', function(req, res) {
	var token = req.params.token;
    var user = req.params.user;
    res.render('partials/game', {
        title: 'Game - ',
        user: user,
        token: token,
        js: 'game.js',
		isHost: req.flash('isHost'),
		rows: req.flash('rows'),
		cols: req.flash('cols'),
		minPlayers: req.flash('minPlayers'),
		freezeTime: req.flash('freezeTime')
	
    });
});

module.exports = router;