/**
 * Created by Joseph on 4/30/2015.
 */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    txid: {
        type: String,
        required: 'Need a transaction id'
    },
    address: {
        type:String,
        required: 'Need an address'
    },
    cryptotype: {
        type: String,
        required: 'Need a cryptotype'
    },
    confirmations: {
        type: Number,
        min: 0
    },
    balance_change: {
        type: Number,
        required: 'Need a balance change #'
    }
});

mongoose.model('Transaction', TransactionSchema);