var gwMap;
$(document).ready( function(){
	//$('#fbMap').css({'display':'block','height':'100%','width':'100%'});
	initGlobal();
	initJQG();
	JRJ.map.obj = new MapGate();
	JRJ.map.obj.display();
	initGate();
	drawChart();
	window.name = 'www';
    });

function jrjLoadMap(){
    actMap();
}

function initGate(){
    var $mBox = $('#jrjMapToggle');
    var $mBut = $(document.createElement('button')).addClass(fbActButClass + ' mapTogBut').bind('click',function(){ mapOff(); });
    var $mSpan = $(document.createElement('span')).addClass('ui-icon ui-icon-circle-close floatLeft');
    $mBut.append($mSpan);
    $mBut.append(document.createTextNode('Shrink Map'));
    $mBox.append($mBut);
    $mBox.buttonset();
    //    $('#actOneChildBox').accordion({autoHeight:false});
    if(fbCfg.pageType){
	if(fbCfg.pageType == 'one'){
	    if(fbCfg.actName){
		if(fbCfg.rec_id){
		    actOneGW(fbCfg.actName,fbCfg.rec_id);
		    if(fbCfg.actName == 'user'){
			JRJ.obj.activityGW.fieldByName('friendStatus')['readShow'] = false;
		    }else if(fbCfg.actName == 'photo'){
			JRJ.obj.activityGW.fieldByName('friendStatus')['readShow'] = false;
		    }
		}else if(fbCfg.actName == 'user'){
		    if(fbCfg['jrjInitSub']){
			fbCfg['jrjInitSub']();
		    }
		}
	    }
	}
    }
    if(fbCfg.pageName){
	if(fbCfg.pageName == 'home'){
	    fbRegionMapActive = true;
	    JRJ.map.initDisplay = false;
	    google.setOnLoadCallback(drawRegionMap);
	    $('#stateSelect').bind('change',function(){ if( $(this).val() ){ redirectToState($(this).val()); }; return false; } );
	}else if(fbCfg.pageName == 'state'){
	    $('#fbMap').css({'display':'block','height':'250px','width':'290px'});
	}
    }
}

google.load('visualization', '1', {packages:['imagelinechart']});
