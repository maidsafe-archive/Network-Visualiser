var constants = {
  mongoCon: 'mongodb://localhost:27017/maidsafe_logs',
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
  nextBranchConfig : {
    serverPort : 9080,
    socketPort : 9081,
    authPath: '../../../auth/next/gauth.json',
    sanityCheckerDir: '../../../testnet_status_monitor/next'
  }
};

exports.updateConstantsForNextBranch = function() {
  constants.mongoCon += '_next';
  for(var key in constants.nextBranchConfig) {
    constants[key] = constants.nextBranchConfig[key];
  }
};

exports.Constants = constants;