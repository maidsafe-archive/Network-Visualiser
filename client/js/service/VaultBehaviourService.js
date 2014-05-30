var VaultBehaviourService = [function(){
	
	this.personas = {
			0:'NA', 1 : 'MaidNode', 2 :'MpidNode', 3:'DataGetter', 
			4:'MaidManager', 5:'DataManager', 6:'PmidManager', 7:'PmidNode', 
			8:'MpidManager', 9:'VersionHandler'
		}

	this.actions = {
					0:'Vault Started', 1:'Increases count to', 2:'Decreases count to',
					3:'Blocked Delete Request',	4:'Account Transfer', 5:'Got Account Transferred',
					6:'Increase Subscribers', 7:'Decrease Subscribers',	8:'Move Chunk',
					9:'Marking Node up', 10:'Marking Node Down', 11:'Joining PMID Node',
					12:'Dropping PMID Node', 13:'Storing Chunk', 14:'Deleting Chunk',
					15:'Update Version', 16:'Remove Account', 17:'Network Health changed',
					18:'Vault Stopping'
				}


	this.icons = {
		0:{account:'hexagon', chunk:'circle', subscriber:'square', counter:'rhombus'},
		1:{account:'hexagon', chunk:'circle', subscriber:'square', counter:'rhombus-green'},
		2:{account:'hexagon', chunk:'circle', subscriber:'square', counter:'rhombus-red'},
		3:{account:'hexagon', chunk:'blocked-delete-request', subscriber:'square', counter:'rhombus'},
		4:{account:'account-transferred', chunk:'circle', subscriber:'square', counter:'rhombus'},
		5:{account:'transfer-account', chunk:'circle', subscriber:'square', counter:'rhombus'},
		6:{account:'hexagon', chunk:'circle', subscriber:'square-green', counter:'rhombus'},
		7:{account:'hexagon', chunk:'circle', subscriber:'square-red', counter:'rhombus'},
		8:{account:'hexagon', chunk:'move-data', subscriber:'square', counter:'rhombus'},
		9:{account:'marking-node-up', chunk:'circle', subscriber:'square', counter:'rhombus'},
		10:{account:'marking-node-down', chunk:'circle', subscriber:'square', counter:'rhombus'},
		11:{account:'joining-pmid-node', chunk:'circle', subscriber:'square', counter:'rhombus'},
		12:{account:'dropping-pmid-node', chunk:'circle', subscriber:'square', counter:'rhombus'},
		13:{account:'hexagon', chunk:'storing-data', subscriber:'square', counter:'rhombus'},
		14:{account:'hexagon', chunk:'deleting-data', subscriber:'square', counter:'rhombus'},
		15:{account:'hexagon', chunk:'update-data-version', subscriber:'square', counter:'rhombus'},
		16:{account:'remove-account', chunk:'circle', subscriber:'square', counter:'rhombus'},
		17:{account:'hexagon', chunk:'circle', subscriber:'square', counter:'rhombus'},
		18:{account:'hexagon', chunk:'circle', subscriber:'square', counter:'rhombus'}
	}		

}]