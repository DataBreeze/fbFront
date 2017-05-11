$(document).ready( function(){
	$('#fbMap').css({'display':'block'});
	initGlobal();
	initJQG();
	initMap();
	JRJ.map.obj = new MapApp();
	JRJ.map.obj.display();
	window.name = 'map';
    });

function initMap(){
    paramInitMap();
}

function jrjLoadMap(){
    actMap();
}

function paramInitMap(){
    // process parameters
    var mParam = getURLParameters();
    var mPath = getURLAction();
    var act1 = mPath[0];
    var act2 = mPath[1];
    if(mParam){
	if( mParam['rid'] && mParam['rcode']){
	    ownerResetFinal(mParam);
	}else if(act1){
	    if((act1 == 'friStat') && mParam['username'] ){
		if(userValid()){
		    friendStatus(mParam['username']);
		    JRJ.map.initDisplay = false;
		}else{
		    ownerLogin();
		}
	    }else if((act1 == 'userInfo') && mParam['username'] ){
		actDetail({'key':'user','id':mParam['username']});
	    }else if(act1 == 'mailManage'){
		if(userValid()){
		    ownerEditEmail();
		}
	    }else if( (act1 == 'mailStop') && mParam['email'] ){
		ownerEmailStop(mParam['email']);
	    }else if(act2){
		if( (act1 == 'p') && (act2.match(/^(\d+)$/)) ){
		    actOne({'key':'photo','id':act2});
		    JRJ.map.initDisplay = false;
		}else if( (act1 == 'c') && (act2.match(/^(\d+)$/)) ){
		    actOne({'key':'catch','id':act2});
		    JRJ.map.initDisplay = false;
		}else if( (act1 == 'r') && (act2.match(/^(\d+)$/)) ){
		    actOne({'key':'report','id':act2});
		    JRJ.map.initDisplay = false;
		}else if( (act1 == 's') && (act2.match(/^(\d+)$/)) ){
		    actOne({'key':'spot','id':act2});
		    JRJ.map.initDisplay = false;
		}else if( (act1 == 'd') && (act2.match(/^(\d+)$/)) ){
		    actOne({'key':'disc','id':act2});
		    JRJ.map.initDisplay = false;
		}else if( (act1 == 'g') && (act2.match(/^(\d+)$/)) ){
		    actOne({'key':'group','id':act2});
		    JRJ.map.initDisplay = false;
		}else if( (act1 == 'u') && (act2.match(/^[\w\s\d\-\_]+$/)) ){
		    actOne({'key':'user','id':act2});
		    JRJ.map.initDisplay = false;
		}
	    }
	}
    }
}
