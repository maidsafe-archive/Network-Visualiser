var constants = {
  mongoCon: 'mongodb://localhost:27017/maidsafe_logs',
  projectRootDir: __dirname,
  authPath: '../../../auth/master/gauth.json',
  sanityCheckerDir: '../../../testnet_status_monitor/master',
  paging: { max: 200 },
  serverPort: 8080,
  socketPort: 8081,
  vaultLogsCount: 3,
  minLengthForDecode: 6,
  naPersonaId: 10,
  networkHealthActionId: '17',
  nextBranchConfig: {
    serverPort: 9080,
    socketPort: 9081,
    authPath: '../../../auth/next/gauth.json',
    sanityCheckerDir: '../../../testnet_status_monitor/next'
  }
};
if (process.env.PORT === constants.nextBranchConfig.serverPort.toString()) {
  constants.mongoCon += '_next';
  for (var key in constants.nextBranchConfig) {
    if (!constants.nextBranchConfig[key]) {
      constants[key] = constants.nextBranchConfig[key];
    }
  }
}
exports.Constants = constants;
