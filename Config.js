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
  networkHealthActionId: 17,
  maxActionIdRange: 19,
  connectionMapActionId: 19,
  nextBranchConfig: {
    serverPort: 9080,
    socketPort: 9081,
    authPath: '../../../auth/next/gauth.json',
    sanityCheckerDir: '../../../testnet_status_monitor/next'
  }
};
if (process.env.PORT === constants.nextBranchConfig.serverPort.toString()) {
  constants.mongoCon += '_next';
  var branchConfig = constants.nextBranchConfig;
  for (var key in branchConfig) {
    if (branchConfig[key]) {
      constants[key] = branchConfig[key];
    }
  }
}

var validationMsg = {
  PERSONA_ID_NOT_A_NUMBER: 'PersonId is not a valid number',
  ACTION_ID_NOT_A_NUMBER: 'Action Id is not valid number',
  NETWORK_HEALTH_MUST_BE_INTEGER: 'Network health value must be an integer',
  VAULTID_CANNOT_BE_EMPTY: 'vaultId can not be empty',
  SESSIONID_CANNOT_BE_EMPTY: 'sessionId can not be empty',
  VALUE_ONE_CANNOT_BE_EMPTY: 'value1 can not be empty',
  ACTIONID_NOT_IN_RANGE: 'Action id is not in valid range (0 - ' + constants.maxActionIdRange + ')',
  INVALID_DATE_FORMAT: 'Invalid date format',
  FIELD_MANDATORY: ' field is mandatory',
  VAULT_ADDED_REMOVED_MUST_BE_STRING: 'Vault Added or Removed must be of string type',
  CLOSEST_VAULTS_MUST_BE_ARRAY: 'closeGroupVaults must be an Array'
};

exports.Constants = constants;
exports.ValidationMsg = validationMsg;
