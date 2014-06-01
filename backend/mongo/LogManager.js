var mongoose = require('mongoose');

var LogManager = function(dbConnConnection){
	var dbConn, LOG_SCHEMA, HIDE_FIELDS;	
	dbConn = dbConnConnection;
	
	HIDE_FIELDS = {_id:0, __v:0}


	var searchAllCollections = function(criteria, promise){
									var results = {}				
									dbConn.db.collectionNames(function(e, colls){
										var fetched = 0   	   	
								   		for(i in colls){	   			
								   			if(colls[i].name.indexOf('system.index')<0){
								   				dbConn.db.collection(colls[i].name.replace( dbConn.name + '.',''), function(err, col){
								   					col.find(criteria, HIDE_FIELDS).toArray(function(err, docs){	  	   											   						
								   						fetched++
								   						if(docs.length>0)
								   							results[docs[0].vault_id] = docs
								   						if(fetched == colls.length-1)
								   							promise.complete(results)
								   					});
								   				});
								   			}	   			
								   		}	   		
							  		});  		
								}


	var vaultHistory =  function(vaultId, page, max, promise){		
							dbConn.db.collection(vaultId, function(err, coll){
								var q = coll.find({}, HIDE_FIELDS).sort([['ts', 'descending']]).skip(page * max).limit(max)
								q.toArray(function(err, data){
									err?promise.error(err):promise.complete(data)
								})
							});						
						}



	this.save = function(data, callback){	
					var promise = new mongoose.Promise;	
					if(callback) promise.addBack(callback);
					dbConn.db.collection(data.vault_id, function(err, coll){
						coll.save(data, function(err, docs){
							err?promise.error(err):promise.complete(data)
						})
					});
					return promise
				}



	this.search = 	function(criteria, callback){		
						var promise = new mongoose.Promise;	
						if(callback) promise.addBack(callback);		
						searchAllCollections(criteria, promise)
						return promise;
					}

	this.history = 	function(vaultId, page, max, callback){
						var promise = new mongoose.Promise;	
						if(callback) promise.addBack(callback);		
						vaultHistory(vaultId, page, max, promise)
						return promise;
					}

	return this;
};

exports.getManager = LogManager