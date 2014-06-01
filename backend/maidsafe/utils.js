exports.isValid = 	function(log){//validate request
					return true
				}

exports.transformQuery	= 	function(query){
							for(exports.key in query){
								if(key == 'ts'){
									exports.date = new Date()
									date.setMinutes(date.getMinutes() - parseInt(query[key]))			
									query[key] = {"$gt": date}
								}else{//For like operation on strings
									query[key] = new  RegExp(query[key], "i")
								}		
							}
							return query
						}
