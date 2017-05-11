JRJ.paramExtract = function(mUrl){
    var urlObj = $.mobile.path.parseUrl( mUrl );
    var mHash = urlObj.hash.replace( /^\#/, "" );
    if(mHash){
	var mP = {'id':false,'source':false,'param3':false,'mode':false};
	if(mHash.match(/^u\?/)){
	    mP.id = mHash.replace( /^u\?/, '');
	    mP.pageId = 'u';
	}else{
	    mP.pageId = mHash.replace( /\?.*$/, "" );
	    mStr = mHash.replace( /.*\?/, "" );
	    var mArgs = mStr.split('&');
	    // extract source - param1
	    mStr = mArgs[0];
	    var mArr = mStr.split('=');
	    mP.source = mArr[1];
	    if( ! mP.source){
		mP.source = 'all';
	    }
	    // extract key - param2
	    var mStr = mArgs[1];
	    if(mStr){
		mArr = mStr.split('=');
		mP.id = mArr[1];
	    }
	    // param 3
	    var mStr = mArgs[2];
	    if(mStr){
		mArr = mStr.split('=');
		mP.param3 = mArr[1];
	    }
	}
	JRJ.params = mP;
	return true;
    }
    return false;
};

JRJ.initRoute = function(e,data){
    var mP = JRJ.params;
    var mSource = mP.source;
    if(mP.pageId == 'u'){
	mobProfile(mP.id);
	e.preventDefault();
    }else if(mP.pageId == 'mobMenu'){
	if(mSource){
	    if( mSource.match('^(all|photo|catch|report|spot|disc|group|user)$') ){
		actMenuDisplay(mSource);
	    }else{
		mobMenuInit(mSource);
	    }
	    e.preventDefault();
	}
    }else if( mP.pageId == 'mobForm'){
	if(mSource){
	    if( mSource.match(/^(login|feed|userNew|userEdit|userEditPassword|userPhoto|userReq|userEmailStop|loginReset)/) ){
		if( mSource == 'login'){
		    mobLogin();
		}else if( mSource == 'userNew'){
		    mobLoginNew();
		}else if( mSource == 'feed'){
		    mobFeed();
		}else if( mSource == 'loginReset'){
		    mobLoginReset();
		}else if( mSource == 'loginReset2'){
		    mobLoginReset2(mP.id,mVal3);
		}else if( mSource == 'userEdit'){
		    mobUserEdit();
		}else if( mSource == 'userEditPassword'){
		    mobUserEditPassword();
		}else if( mSource == 'userEditEmail'){
		    mobUserEditEmail();
		}else if( mSource == 'userPhoto'){
		    mobUserPhoto();
		}else if( mSource == 'userReq'){
		    mobUserReq(mP.id);
		}else if( mSource == 'userEmailStop'){
		    mobUserEmailStop(mP.id);
		}
		e.preventDefault();
	    }else if( mSource.match('^(photo|catch|report|spot|disc|group|user)$') ){
		if(mP.id){ // this is an edit
		    actEditInit(mSource,mP.id);
		}else{
		    actNewInit(mSource);
		}
		e.preventDefault();
	    }
	}
    }else if( mP.pageId == 'mobDetail'){
	if( mSource == 'userPhoto' ){
	    mobUserPhoto();
	    e.preventDefault();
	}else if( mSource == 'userDetail' ){
	    mobUserDetail();
	    e.preventDefault();
	}else if( mSource.match('^(photo|catch|report|spot|disc|group|user)$') ){
	    actDetailInit(mSource,mP.id);
	    e.preventDefault();
	}
    }else if( mP.pageId == 'mobMap'){
	if( ! mSource.match('^(all|photo|catch|report|spot|disc|group|user)$') ){
	    mSource = 'all';
	}
	actMapInit(mSource);
	e.preventDefault();
    }else if( mP.pageId == 'mobList'){
	if( ! mSource.match('^(all|photo|catch|report|spot|disc|group|user)$') ){
	    mSource = 'all';
	}
	actListInit(mSource);
	e.preventDefault();
    }else if( mP.pageId == 'mobSearchLoc'){
	if( ! mSource.match('^(all|photo|catch|report|spot|disc|group|user)$') ){
	    mSource = 'all';
	}
	actSearchLocInit(mSource);
	e.preventDefault();
    }
    return true;
};

$(document).on("pageinit", function(){
	if(JRJ.map.initialized == false){
	    JRJ.map.initialized = true;
	    JRJ.map.obj = new MapMob();
	    JRJ.map.obj.display();
	}
    });

$(document).on("pageshow", function(){
	var curPage = $.mobile.activePage.selector;
	if(curPage == '#mobMap'){
	    JRJ.map.obj.reload();
	    JRJ.obj.activity.mapDisplay();
	}
    });

$(document).on( "pagebeforechange", function( e, data ) {
	var mUrl = false;
	if(JRJ.initLoad){
	    JRJ.initLoad = false;
	    mUrl = window.location.href;
	}else if ( typeof data.toPage === "string" ) {
	    mUrl = data.toPage;
	}
	if(mUrl){
	    if( JRJ.paramExtract(mUrl) ){
		return JRJ.initRoute(e,data);   
	    }
	}
	return true;
    });
    
