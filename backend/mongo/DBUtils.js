var mongoose = require('mongoose');
//var Zip = require('adm-zip')
var exec = require('child_process').exec	


var DBUtil = function(dbConnection){
	var dbConn = dbConnection


	var ExportHandler = function(promise){
		var fetched = 0			
		var max = 0
		var _folderPath

		this.setTotalCount = function(count){
			max = count
		}

		this.setOutFolder = function(folderPath){
			_folderPath = folderPath
		}

		this.callback = function(err, stdout, stderr){
			fetched++;
			if(!err && !stderr){

			}else{

			}
			if(fetched == max){
				//zip
				promise.complete('done')
			}
		}

		return this
	}


	this.exportLogs = function(){
		var promise = new mongoose.Promise
		var handler = new ExportHandler(promise)

		dbConn.db.collectionNames(function(e, colls){
			handler.setTotalCount(colls.length-1)		
			for(i in colls){				
				if(colls[i].name.indexOf('system.index') < 0){

					if(colls[i].name.indexOf('vaultStatus') > 0){
						console.log('vaultStatus')
					}else{
						console.log(colls[i].name.replace( dbConn.name + '.',''))
					}
'"' ' " -db maidsafe_logs -c vaultStatus -o d:\\dd3.csv --fields vault_id,status,key --csv'
					//exec("", handler.callback)					
					handler.callback(null, '', null)
				}					   		
			}	
			promise.complete('hi')   		
		});
		return promise
	}

	return this;
}



exports.getDBUtil = DBUtil