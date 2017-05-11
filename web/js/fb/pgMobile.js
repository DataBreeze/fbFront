// copyright 2012 datafree inc

function jrjLoadMap(){
}

function mobSearchSubmit() {
    var $mInput = $('#locInput');
    var address = $mInput.val();
    if(!address){
	alert('Please enter a location to search');
	$mInput.focus();
	return false;
    }
    if (fbGeo == undefined) { fbGeo = new google.maps.Geocoder(); }
    if(fbGeoBlock){ return false; }
    fbGeoBlock = true;
    fbGeo.geocode({ 'address': address},
		  function(results, status) {
		      if(status == google.maps.GeocoderStatus.OK){
			  var mResult = results[0];
			  var mInput = mResult.formatted_address;
			  mInput = mInput.replace(/\,\s*USA$/i,'');
			  if(mInput.match(/[\w\s\-]+\,\s[A-Z][A-Z]\s\d\d\d\d\d/)){
			      mInput = mInput.replace(/\s\d\d\d\d\d$/,'');
			  }
			  $mInput.val(mInput);
			  var geom = mResult.geometry;
			  var geo = {};
			  geo.input = mInput;
			  geo.lat = geom.location.lat();
			  geo.lon = geom.location.lng();
			  geo.bounds = geom.viewport;
			  setCookie('fbInput',mInput);
			  setCookie('fbLat',geo.lat);
			  setCookie('fbLon',geo.lon);
			  JRJ.map.obj.geoChange(geo);
		      }else{
			  alert("Location not found:" + status);
		      }
		  });
    fbGeoBlock = false;
    return false;
}

function actResetObj(newObj){
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    JRJ.obj.activity = newObj;
}

function jrjActInit(mKey){
    if(JRJ.obj.activity){
	if(JRJ.obj.activity.ajaxBusy === true){
	    return false;
	}
	if(JRJ.obj.activity.name != mKey){
	    JRJ.obj.activity.clear();
	}
    }
    if(mKey){
	setCookie('fbAct',mKey);
    }else{
	mKey = getCookie('fbAct');
	if( ! mKey){
	    mKey = 'spot';
	}
    }
    JRJ.obj.activity = actObj(mKey);
    return JRJ.obj.activity;
}

function changePageProfile(mUsername){
    $.mobile.changePage('#u?' + escape(mUsername));
    return false;
}

function mobProfile(mUsername){
    JRJ.obj.activity = jrjActInit('user');
    JRJ.obj.activity.detailInit(mUsername);
    return JRJ.obj.activity;
}

function actNewInit(mKey){
    JRJ.obj.activity = jrjActInit(mKey);
    JRJ.obj.activity.newOpen();
    return JRJ.obj.activity;
}

function actMapInit(mKey){
    JRJ.obj.activity = jrjActInit(mKey);
    JRJ.obj.activity.changePageMap();
    return false;
}

function actMapSearchInit(mKey){
    JRJ.obj.activity = jrjActInit(mKey);
    JRJ.obj.activity.searchInit();
    return false;
}

function actDetailInit(mKey,mId){
    JRJ.obj.activity = jrjActInit(mKey);
    if(mId){
	JRJ.obj.activity.detailOpenById(mId);
    }else{
	JRJ.obj.activity.detailOpenInit();
    }
    return false;
}

function actEditInit(mKey,mId){
    JRJ.obj.activity = jrjActInit(mKey);
    JRJ.obj.activity.editOpenById(mId);
    return JRJ.obj.activity;
}

function actListInit(mKey){
    JRJ.obj.activity = jrjActInit(mKey);
    JRJ.obj.activity.listOpen();
    return false;
}

function actSearchLocInit(mKey){
    JRJ.obj.activity = jrjActInit(mKey);
    JRJ.obj.activity.searchLocOpen();
    return false;
}

function actListOrMapInit(mKey){
    JRJ.obj.activity = jrjActInit(mKey);
    JRJ.obj.activity.listOrMap();
    return false;
}
function actMenuDisplay(mKey){
    JRJ.obj.activity = jrjActInit(mKey);
    JRJ.obj.activity.menuOpen();
    return JRJ.obj.activity;
}

function mobMenuInit(mKey){
    if( userValid() ){
	jrjMenu = menuObj(mKey);
	jrjMenu.display();
    }else{
	mobMenuGuest();
    }
    return false;
}

function mobMenuGuest(){
    JRJ.menu.user = menuObj('guest');
    JRJ.menu.user.display();
    return false;
}

function mobHomeInit(){
    if(userValid()){
	JRJ.menu.user = menuObj('user');
    }else{
	JRJ.menu.user = menuObj('guest');
    }
    JRJ.menu.user.rootName = 'menuAccountHome';
    JRJ.menu.user.displayHome();
    $('#searchLink').on('click',function(){ actMapSearchInit('all'); return false; } );
    $('#allLink').on('click',function(){ actListOrMapInit('all'); return false; } );
    $('#photoLink').on('click',function(){ actListOrMapInit('photo'); return false; } );
    $('#reportLink').on('click',function(){ actListOrMapInit('report'); return false; } );
    $('#catchLink').on('click',function(){ actListOrMapInit('catch'); return false; } );
    $('#spotLink').on('click',function(){ actListOrMapInit('spot'); return false; } );
    $('#discLink').on('click',function(){ actListOrMapInit('disc'); return false; } );
    $('#userLink').on('click',function(){ actListOrMapInit('user'); return false; } );
    $('#groupLink').on('click',function(){ actListOrMapInit('group'); return false; } );
    return false;
}

function mobHomeRefresh(){
    mobHomeInit();
    if(JRJ.menu.user){
	JRJ.menu.user.refresh();
    }
    return false;
}

function mobLogin(){
    if(userValid()){
	alert('Please Logout first');
	return false;
    }else{
	JRJ.user.obj = new ActLogin();
	JRJ.user.obj.newOpen();
	return true;
    }
}

function mobLogout(){
    $.ajax({ url: '/user/a/aLogoutUser', dataType: 'json',
		success: function(json,textStatus){ mobLogoutCB(json, textStatus); },
		error: function(){ }
	});
  return false;
}

function mobLogoutCB(json,textStatus){
    mobHomeRefresh();
    mobHome();
}

function mobHome(){
    $.mobile.changePage('/');
}

function mobOwnerObj(){
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj = new ActOwner();
    return JRJ.user.obj;
}

function mobLoginNew(){
    if(userValid()){
	alert('Please Logout first');
	return false;
    }else{
	JRJ.user.obj = mobOwnerObj();
	JRJ.user.obj.mode = 'new';
	JRJ.user.obj.headerText = 'Create New Account';
	JRJ.user.obj.newOpen();
	return true;
    }
}

function mobLoginReset(){
    if(userValid()){
	alert('Please Logout first');
	return false;
    }else{
	JRJ.user.obj = new ActLoginReset();
	JRJ.user.obj.mode = 'reset';
	JRJ.user.obj.titleStr = 'Reset My FishBlab Password';
	JRJ.user.obj.resetStartOpen();
	return true;
    }
}

function mobLoginReset2(mRid,mRcode){
    if(userValid()){
	alert('Please Logout first');
	return false;
    }else{
	JRJ.user.obj = new ActEditPass();
	JRJ.user.obj.rid = mRid;
	JRJ.user.obj.rCode = mRcode;
	JRJ.user.obj.resetOpen();
	return true;
    }
}

function mobUserEdit(){
    if( ! userValid()){
	alert('Please Login first');
	return false;
    }else{
	JRJ.user.obj = mobOwnerObj();
	JRJ.user.obj.mode = 'edit';
	JRJ.user.obj.titleStr = 'Edit My Account';
	JRJ.user.obj.ajaxGetUserEdit();
	return false;
    }
}

function mobUserEditPassword(){
    if( ! userValid()){
	alert('Please Login first');
	return false;
    }else{
	JRJ.user.obj = new ActEditPass();
	JRJ.user.obj.editOpen();
	return false;
    }
}

function mobUserEditEmail(){
    if( ! userValid()){
	alert('Please Login first');
	return false;
    }else{
	JRJ.user.obj = new ActOwnerEmail();
	JRJ.user.obj.editOpen(fbUser);
	return true;
    }
}

function mobUserPhoto(){
    if( ! userValid()){
	alert('Please Login first');
	return false;
    }else{
	JRJ.user.obj = new ActOwnerPhoto();
	JRJ.user.obj.detailOpen(fbUser);
	return true;
    }
}

function mobUserReq(mId){
    if( ! userValid()){
	alert('Please Login first');
	return false;
    }else{
	JRJ.user.obj = new ActOwnerReq(mId);
	JRJ.user.obj.username_from = mId;
	JRJ.user.obj.editOpenInit(mId);
	return true;
    }
}
function mobUserEmailStop(mId){
    JRJ.user.obj = new ActOwnerEmailStop(mId);
    JRJ.user.obj.username = mId;
    JRJ.user.obj.editOpen(mId);
    return true;
}

function mobUserDetail(){
    if( ! userValid()){
	alert('Please Login first');
	return false;
    }else{
	JRJ.user.obj = new ActOwner();
	JRJ.user.obj.detailOpen(fbUser);
	return true;
    }
}

function mobFeed(){
    JRJ.user.obj = new ActFeed();
    JRJ.user.obj.newOpen();
}

function mobDialog(mOpt){
    jrjMobDialog = new MobPopSimple(mOpt);
    jrjMobDialog.open();
}

function initDialog(){
    alert('handle: U=' + u.toSource() + ' data=' + data.toSource());
}
