var ToolTip = ['$compile', function($compile){

	var parent = angular.element(document.getElementsByTagName('body')[0])

	var tooltip = function(scope, element, attr, ctrls){			

			var ele 			
			var style = 'position:fixed;background-color:#fff;padding:.5em;border:1px solid;border-radius:6px;';
			scope.tip = attr.tooltip			
			

			var show = function(e){
			    if(!ele){
			    	ele = $compile('<div style="'+ style + ";top:" + e.y + 'px;left:'  + e.x + 'px' + '">{{tip}}</div>')(scope)				
			    	scope.$apply()
					parent.append(ele)
			    }				 				
			}

			element.on('mouseover', function(e){							
				show(e)				
			})

			element.on('mouseout', function(){
				ele.remove()
				ele = null
			});


			 scope.$watch(function(){return element.attr('tooltip')}, function(n){
			 	 scope.tip = n
			 })
			
		}

	return {
		restrict: "A",
		scope:true,
		link: tooltip		
	}

}]