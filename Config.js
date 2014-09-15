var constants = {
  mongo_con: 'mongodb://localhost:27017/maidsafe_logs',
  projectRootDir: __dirname,
  authPath: '../../../auth/master/gauth.json',
  sanityCheckerDir: '../../../testnet_status_monitor/master',
  paging: { max: 200 },
  serverPort: 8080,
  socketPort: 8081,
  vault_logs_count: 3,
  minLengthForDecode: 6,
  persona_na: 10,
  action_network_health: '17',
  nextBranchPort : 9080
}

exports.updateConstantsForNextBranch = function(){
  constants.mongo_con += "_next";
  constants.serverPort =  constants.nextBranchPort;
}

exports.Constants = constants;