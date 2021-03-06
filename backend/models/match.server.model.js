'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Match Schema
 */
var MatchSchema = new Schema({
	//user that created this match
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},

  /******** Properties that should be defined on match creation *******************/
  //When the match starts
  matchStartTime: {
    type: Date,
    required: 'Date required!'
  },
  //Name of the tourney (maybe needs to be an ID?)
  tourneyName: {
    type: String,
    required:'Tournament Name Required!'
  },
  //Name of the game (maybe needs to be an ID?)
  gameName: {
    type: String,
    required:'Game Name Required!'
  },
  //Name of outcomes.
  outcomeNames: {
    type: [String]
  },

  /********* Properties that are set automatically and can be referneced *******/

  //When this object was created.
  created: {
    type: Date,
    default: Date.now
  },

  //Total amount of money inside the match. probably could do an aggregate later
  //TODO: aggregate bets instead of summing this
  betPot: {
    type: [Number]
  },
	//-1 if not done yet, then array index if a winner has been chosen
	result: {
		type: Number,
		default: -1
	},
  //mailchimp segment identifier
  mailChimpSegmentId: {
    type: String
  },
	/*Status of match.
	0: "Blind Betting". Match is created. Bets should be blind, but get doubled stake.
	1: "Regular Betting". 24 hours before match. Bets are shown.
	2: "Match in Progress". Match is under way. No more bets allowed.
	3: "Match Resolving". Match is finished, and we're paying the match out.
	4: "Match Done". We're done paying the winners.
	5: "Match Cancelled". Because of any reason, we're refunding the bets for this match.
	*/
	status: {
		type: Number,
		default: 0
	}


});

mongoose.model('Match', MatchSchema);
