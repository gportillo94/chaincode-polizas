'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Hyperledger Fabric Sample Query Program
 */

var hfc = require('fabric-client');
var path = require('path');

var optionsQuery = {
    wallet_path: path.join(__dirname, './creds'),
    user_id: 'PeerAdmin',
    channel_id: 'mychannel',
    chaincode_id: 'fabcar',
    network_url: 'grpc://localhost:7051',
};

var channel = {};
var client = null;

function query(nombreFuncion, argumentos) {
	Promise.resolve().then(() => {
	    console.log("Create a client and set the wallet location");
	    client = new hfc();
	    return hfc.newDefaultKeyValueStore({ path: optionsQuery.wallet_path });
	}).then((wallet) => {
	    console.log("Set wallet path, and associate user ", optionsQuery.user_id, " with application");
	    client.setStateStore(wallet);
	    return client.getUserContext(optionsQuery.user_id, true);
	}).then((user) => {
	    console.log("Check user is enrolled, and set a query URL in the network");
	    if (user === undefined || user.isEnrolled() === false) {
	        console.error("User not defined, or not enrolled - error");
	    }
	    channel = client.newChannel(optionsQuery.channel_id);
	    channel.addPeer(client.newPeer(optionsQuery.network_url));
	    return;
	}).then(() => {
	    console.log("Make query");
	    var transaction_id = client.newTransactionID();
	    console.log("Assigning transaction_id: ", transaction_id._transaction_id);
	    const request = {
	        chaincodeId: optionsQuery.chaincode_id,
	        txId: transaction_id,
	        fcn: nombreFuncion,
	        args: argumentos
	    };
	    return channel.queryByChaincode(request);
	}).then((query_responses) => {
	    console.log("returned from query");
	    if (!query_responses.length) {
	        console.log("No payloads were returned from query");
	    } else {
	        console.log("Query result count = ", query_responses.length)
	    }
	    if (query_responses[0] instanceof Error) {
	        console.error("error from query = ", query_responses[0]);
	    }
	    console.log("Response is ", query_responses[0].toString());
	}).catch((err) => {
	    console.error("Caught Error", err);
	});
}
exports.query = query; 

//query("polizaPorId", ["123"]);
//query("todasPolizas", []);