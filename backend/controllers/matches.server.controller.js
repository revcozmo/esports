'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Match = mongoose.model('Match'),
	Bet = mongoose.model('Bet'),
	_ = require('lodash'),
	request = require('request');

var mailchimp_api_key = '2ce985b55fabca58d3e92f4183993a94-us8';
var mailchimp_endpoint = 'https://z:' + mailchimp_api_key + '@us8.api.mailchimp.com/3.0/';
var mailchimp_list_id = '2456ad2c1a';

/**
 * Create a Match
 */
exports.create = function(req, res) {
	var match = new Match(req.body);
	match.user = req.user;

    //console.log(req.body);

	console.log('team1name:' + match.team1name);
	console.log('team2name:' + match.team2name);
	console.log('tourneyname:' + match.tourneyName);
	console.log('gamename:' + match.gameName);
    console.log('starttime:' + match.matchStartTime);

	match.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(match);
		}
	});
};

/**
 * Show the current Match, along with bets.
 */
exports.read = function(req, res) {

	/* stuff to use  when I can actually use betByMatch middlware.
	 //set bets to be a property of matches. (should be an array)
	 req.match.bets = req.bets;
	 console.log(req.bets);
	 res.jsonp(req.match);
	 */

	var the_result = {};
	the_result.match = req.match;
	//console.log(req.match);

	Bet.find({'match':req.match})
		.sort('-created')
		.populate('user', 'username')
		.exec(function(err, bets) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				the_result.bets = bets;
				res.jsonp(the_result);
			}
		});
};

/*
//Resolving a match without having the match ID in the url.
exports.resolve = function(req, res) {
  var match = req.body.match;
  req.match = match;
};
*/

/** Resolve a match.
 * 1. check if user has permission?
 * 2. count up all the bets on each side.
 * 3.
 */
exports.resolve = function(req, res) {
  var match = req.match ;
	console.log('RESOLVING MATCH:' + match.gameName + " - " + match.tourneyName +
    "(" + match.team1name + " vs " + match.team2name + ")");

  //Winner number
  //TODO: check to see if valid winner number.
  //TODO: wait for X number of people to submit an entry?
  var matchres = req.body.winnerNum;


	var match = req.match ;
	match.result = matchres;
    match.status = 3;
	match.save();

	Bet.find({'match':match})
		.populate('user', 'dogecoinBlioAddress dogeBalance username')
		.exec(function(err, bets) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				////////// BET PAYOUT START ///////////////

				//get the total bet amounts
				var totals = [0, 0];
        var shares = [0, 0];
				for (var i in bets)
				{
					var bet = bets[i];
					if (parseInt(bet.amount) > 0)
					{
						if (bet.prediction === 1) {
              totals[0] += bet.amount;
              shares[0] += bet.stake;
            }
            else if (bet.prediction === 2) {
              totals[1] += bet.amount;
              shares[1] += bet.stake;
            }
					}
				}

				console.log('1 total:' + totals[0]);
				console.log('2 total:' + totals[1]);

				var TEMPTOTAL = 0;

				//Payout to distribute to players.
				var winnertot = 0;
				var payout = 0;
				if (matchres === 1) {
					payout = totals[1];
					winnertot = shares[0];
				}
				else if (matchres === 2) {
					payout = totals[0];
					winnertot = shares[1];
				}

				//Take 5% rake from loser
				payout = Math.ceil(payout * 0.95);

				//for each valid bet, get the ratio
				for (var j in bets)
				{
					var bet2 = bets[j];

					//If a correct bet, and the bet amount is more than 0
					if (bet2.prediction === matchres && parseInt(bet2.amount) > 0)
					{
						var betratio = bet2.stake / winnertot;

						//give player back his bet, and the payout.
						var playerpayout = bet2.amount + Math.ceil(betratio * payout);

						//Save the bet's status
						// Maybe need to change this to += to properly keep track of payouts
						// (in case of server error double spending, etc).
						bet2.status += playerpayout;
						bet2.save();

						console.log(bet2.user.username + ':' + bet2.amount + '->' + playerpayout);

						//Update user by giving him currency.
						bet2.user.dogeBalance += playerpayout;
						bet2.user.save();

						TEMPTOTAL += playerpayout;
					}
				}

				//Printing information about stuff.
				console.log('total payout:' + TEMPTOTAL);
				var TEMPRAKE = totals[0] + totals[1] - TEMPTOTAL;
				console.log('rake:' + TEMPRAKE);
			}
		});

  //Send a mailchimp email out to all people who bet in the match.

  /** 1. create the segment */
  
  /** 2. create the email and send it to the segment we created above. */


  /*
  var mailchimp_data = {
    'status' : 'subscribed',
    'email_address' : user.email,
    'merge_fields' : {
      'FNAME' : user.username
    }};

  var mailchimp_url = mailchimp_endpoint + 'lists/' + mailchimp_list_id + "/members";

  var post_obj = {
    url: mailchimp_url,
    json: mailchimp_data
  };

  request.post(post_obj, function(err, resp, body) {
    console.log('response code: ' + resp.statusCode);
    if (err) {
      console.log('error:' + err);
    }
    else {
      console.log('body: ' + JSON.stringify(body));
    }
  });
  */

    //Redirect adminuser back to matches page.
	res.redirect('/#!/matches/' + match._id);
};

/**
 * Update a Match
 */
exports.update = function(req, res) {
	var match = req.match ;
	console.log('MATCH UPDATING!!!!!!!!!!!!!!!!!');

	match = _.extend(match , req.body);

	match.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(match);
		}
	});
};

/**
 * Delete an Match
 */
exports.delete = function(req, res) {
	var match = req.match ;

	match.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(match);
		}
	});
};

/**
 * List of Matches
 */
exports.list = function(req, res) {

  /*Get:
  5 most recent matches.
  any upcoming matches.
  */
  var oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

	Match.find()

    //All matches have happened one week ago, or after.
    .where('matchStartTime').gte(oneWeekAgo)

    //Sort by match start time
    .sort('+matchStartTime')

    .exec(function(err, matches) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(matches);
		}
	});
};

/**
 * Match middleware
 */
exports.matchByID = function(req, res, next, id) {

	console.log('matchbyid');

	Match.findById(id).
		exec(function(err, match) {
			if (err) return next(err);
			if (! match) return next(new Error('Failed to load Match ' + id));
			req.match = match ;
			next();
		});
};

/**
 * Match authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.match.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
