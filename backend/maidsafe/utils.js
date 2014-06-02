var config = require('./../../Config.js')

exports.isValid = 	function(log){
	return (log.vault_id && log.action_id && log.persona_id)
}


exports.formatDate = function(log){
	if(log.ts){
		if(log.ts.indexOf('GMT')<0)
			log.ts += 'GMT'
		log.ts = new Date(log.ts).toUTCString()
	} else{
		log.ts = new Date().toUTCString()	
	} 
}

exports.isEmptyObject = function(object){
	for(var i in object){
		return true
	}
	return false
}


exports.isPageRequestValid = function(criteria){
	if(criteria.vault_id){		
		if(criteria.page){
			try{
				criteria.page = parseInt(criteria.page)
			}catch(e){
				criteria.page = 0	
			}
		}else{
			criteria.page = 0
		}

		if(criteria.max){
			try{
				criteria.max = parseInt(criteria.max)
			}catch(e){
				criteria.max = config.Constants.paging.max	
			}
		}else{
			criteria.max = config.Constants.paging.max	
		}
		return true;
	}
	return false
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
