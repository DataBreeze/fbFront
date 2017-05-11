// copyright 2012 DataFree, Inc
// Joe Junkin

var fbActMapWin;
var fbActOwnerMarker;

function ActClass(){
    this.fields = {};
    this.enforceDirty = false;
    this.requireLogin = false;
    this.ajaxBusy = false;
    this.setGeo = false;
    this.recList = [];
    this.recHash = {};
    this.count = 0;
    this.countTotal = 0;
    this.countReply = 0;
    this.countPhoto = 0;
    this.recordOffset = 0;
    this.recordLimit = 50;
    this.filters = [];
    this.filtersCur = [];
    this.filterActive = false;
    this.disableUploadSec = true;
    this.ajaxGetRecsTimeout = false;
    this.urlAddKey = false;
    this.paginate = false;
}

ActClass.prototype.dataFetched = false;
ActClass.prototype.mode = 'detail';
ActClass.prototype.errorDisplayId = document.getElementById('toolError');
ActClass.prototype.titleField = 'date_time';
ActClass.prototype.statLinkFlagShow = false;
ActClass.prototype.statLinkMapShow = false;
ActClass.prototype.statLinkUserShow = false;
ActClass.prototype.tabReplyBodyId = 'tabReplyBody';
ActClass.prototype.tabReplyCountId = 'tabReplyCount';
ActClass.prototype.tabPhotoBodyId = 'tabPhotoBody';
ActClass.prototype.tabPhotoCountId = 'tabPhotoCount';
ActClass.prototype.tabFishBodyId = 'tabFishBody';
ActClass.prototype.tabFishCountId = 'tabFishCount';
ActClass.prototype.pageId = 'mobForm';
ActClass.prototype.pageHomeId = 'homePage';
ActClass.prototype.transition = 'slide';
ActClass.prototype.allowSamePageTransition = false;
ActClass.prototype.allowListStat = false;
ActClass.prototype.actHash = false;

ActClass.prototype.loadObjSettings = function(rObj){
    for(var mName in rObj){
	this[mName] = rObj[mName];
    }
    //if(this.children && (this.children.length > 0) ){
	this.childList = [];
	this.childHash = {};
    //}
};

ActClass.prototype.actObjHash = function(){
    var myThis = this;
    if( ! this.actHash){
	this.actHash = {};
	this.actHash['spot'] = new ActSpot();
	this.actHash['catch'] = new ActCatch();
	this.actHash['report'] = new ActReport();
	this.actHash['disc'] = new ActDiscuss();
	this.actHash['photo'] = new ActPhoto();
	for(var mKey in this.actHash){
	    mObj = this.actHash[mKey];
	    mObj.detailHeader = function(){ myThis.detailHeader(); };
	    mObj.detailButtonBack = function(){ myThis.listOrMap();return false; };
	    mObj.editHeader = function(){ myThis.editHeader(); };
	}
    }
    return this.actHash;
};

ActClass.prototype.postAllow = function(){
    if(userValid()){
	return true;
    }else{
	return false;
    }
};

ActClass.prototype.changePageUrlSource = function(){
    return this.name;
};

ActClass.prototype.changePageUrl = function(){
    var mUrl = '#' + this.rootName + '?s=' + this.changePageUrlSource();    
    if( this.urlAddKey && this.changeMode ){
	if( this.changeMode.match(/(edit|detail)/) ){
	    mUrl += '&k=' + this.rec.id;
	}
    }
    return mUrl;
};

ActClass.prototype.changePage = function(){
    var $page = this.getRoot();
    $page.page();
    $page.trigger('create');
    var mUrl = this.changePageUrl();
    var mOpt = {'changeHash':this.changeHash,'dataUrl':mUrl,'allowSamePageTransition':this.allowSamePageTransition,'transition':this.transition};
    $.mobile.changePage($page, mOpt);
};

ActClass.prototype.changePageTo = function(mUrl){
    var mOpt = {};
    $.mobile.changePage(mUrl);
};

ActClass.prototype.changePageHome = function(){
    var $page = $('#' + this.pageHomeId);
    $page.page();
    $page.trigger('create');
    var mOpt = {'changeHash':true};
    $.mobile.changePage($page, mOpt);
};

ActClass.prototype.listOrMap = function(){
    var cookieVal = getCookie('fbListOrMap');
    if(JRJ.display.listOrMap == 'list'){
	return this.listOpen();
    }else if(cookieVal == 'list'){
	return this.listOpen();
    }else{
	return this.changePageMap();
    }
};

ActClass.prototype.changePageMap = function(){
    this.mapWinClose();
    this.mapHeader();
    var $page = $('#mobMap');
    $page.page();
    $page.trigger('create');
    var mUrl = '#mobMap?s=' + this.name;
    //var mUrl = '/act/' + this.name + '/map/';
    this.changeHash = true;
    var mOpt = {'changeHash':this.changeHash,'dataUrl':mUrl,'allowSamePageTransition':true,'transition':'none'};
    $.mobile.changePage($page, mOpt);
};

ActClass.prototype.changePageDetail = function(mRec){
    var $page = $('#mobDetail');
    $page.page();
    $page.trigger('create');
    var mUrl = '#mobDetail?s=' + this.name + '&k=' + mRec.id;
    var mOpt = {'changeHash':this.changeHash,'dataUrl':mUrl};
    $.mobile.changePage($page, mOpt);
};

ActClass.prototype.changePageEdit = function(mRec){
    var $page = $('#mobForm');
    $page.page();
    $page.trigger('create');
    var mUrl = '#mobForm?s=' + this.name + '&k=' + mRec.id;
    var mOpt = {'changeHash':this.changeHash,'dataUrl':mUrl};
    $.mobile.changePage($page, mOpt);
};

ActClass.prototype.changePageList = function(){
    var $page = $('#mobList');
    $page.page();
    $page.trigger('create');
    var mUrl = '#mobList?s=' + this.name;    
    var mOpt = {'changeHash':this.changeHash,'dataUrl':mUrl};
    $.mobile.changePage($page, mOpt);
};

ActClass.prototype.changePageActNew = function(mName){
    var mUrl = '#mobMenu?s=actNew';
    //var mUrl = '/act/new/';
    $.mobile.changePage(mUrl);
};

ActClass.prototype.changePageMenu = function(mName){
    var mUrl = '#mobMenu?s=' + mName;
    //var mUrl = '/act/new/';
    $.mobile.changePage(mUrl);
};

ActClass.prototype.menuOpen = function(){
    var myThis = this;
    this.rootName = 'mobMenu';
    this.mode = 'menu';
    this.reset();
    this.menuHeader();
    this.menuContent();
    this.changeHash = true;
    this.changeMode = 'menu';
    this.changePage();
};

ActClass.prototype.menuOpenPOP = function(mRoot){
    this.subMenu = menuObj('actSelect');
    this.subMenu.rootNamePop = mRoot;
    this.subMenu.label = this.label;
    this.subMenu.source = this.name;
    this.subMenu.listMode = this.mode;
    this.subMenu.displayPopup();
};

ActClass.prototype.accordionLike = function($mBox){
    $mBox.addClass("ui-accordion ui-accordion-icons ui-widget ui-helper-reset")
    .find("h3")
    .addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom")
    .hover(function() { $(this).toggleClass("ui-state-hover"); })
    .prepend('<span class="ui-icon ui-icon-triangle-1-e"></span>')
    .click(function() {
	    $(this)
	    .toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom")
	    .find("> .ui-icon").toggleClass("ui-icon-triangle-1-e ui-icon-triangle-1-s").end()
	    .next().toggleClass("ui-accordion-content-active").slideToggle();
	    return false;
	})
    .next()
    .addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom")
    .css("display", "block")
    .hide()
    .end().trigger("click");
};

ActClass.prototype.actionBarReset = function(){
    var $mBox = $('#mapStat');
    $mBox.empty();
    return $mBox;
};

ActClass.prototype.actionBarUpdate = function(){
    if( ! mapIsOpen() ){ return false; }
    var myThis = this;
    var $mBox = this.actionBarReset();
    var $mCell = $(document.createElement('div')).addClass('bold');
    $mCell.html(this.labelPlural + ' (' + this.count + ')');
    $mBox.append($mCell);
    var $mCell = $(document.createElement('div'));
    if(this.countTotal > this.count){
	$mCell.append( $(document.createElement('div') ).addClass('jrjActBarCell3').html('Total:') );
	$mCell.append( $(document.createElement('div') ).addClass('jrjActBarCell3 bold').html(this.countTotal) );
    }
    $mCell.append( this.clearBr() );
    $mBox.append($mCell);
};

ActClass.prototype.actionBarMenuOpen = function(mRec){
    var myThis = this;
    this.mode = 'menu';
    this.reset();
    var $main = this.actionBarMenuContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Actions for ' + myThis.label, buttons: this.closeButtons()
		});
};

ActClass.prototype.actionBarMenuContent = function(){
    var $mSpan,mTip;
    var myThis = this;
    var $main = this.getRoot();
    $main.append(this.errorDivCreate());
    var $mCell = $(document.createElement('div')).addClass('pad10');
    if(this.allowSearch !== false){
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mBut = $(document.createElement('button')).html('Search').addClass('fbMenuBut');
	$mBut.bind('click',function(){myThis.searchOpen();});
	$mBut.button();
	$mRow.append($mBut);
	$mCell.append($mRow);
    }
    if(this.allowList !== false){
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mBut = $(document.createElement('button')).html('List').addClass('fbMenuBut');
	$mBut.bind('click',function(){myThis.listOpen();});
	$mBut.button();
	$mRow.append($mBut);
	$mCell.append($mRow);
    }
    if( this.recList && (this.recList.length > 0) && (this.allowDetail !== false) ){
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mBut = $(document.createElement('button')).html('Detail').addClass('fbMenuBut');
	$mBut.bind('click',function(){myThis.readOpen(myThis.recList[0]);});
	$mBut.button();
	$mRow.append($mBut);
	$mCell.append($mRow);
    }
    if(this.allowNew !== false){
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mBut = $(document.createElement('button')).html('New').addClass('fbMenuBut');
	$mBut.bind('click',function(){myThis.newOpen();});
	$mBut.button();
	$mRow.append($mBut);
	$mCell.append($mRow);
    }
    if(this.filterList()){
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mBut = $(document.createElement('button')).html('Filter').addClass('fbMenuBut');
	$mBut.bind('click',function(){myThis.filterOpen();});
	$mBut.button();
	$mRow.append($mBut);
	$mCell.append($mRow);
    }
    $mCell.append( this.clearBr() );
    $main.append($mCell);
    return $main;
};

ActClass.prototype.fieldList = function(){
    var allFields = [];
    for(var i=0; i<this.fields.length; i++){
	var mF = this.fields[i];
	if( (mF.type == 'row') && mF.fields && (mF.fields.length > 0) ){
	    for(var j=0; j < mF.fields.length; j++){
		if(mF.fields[j].disabled !== true){
		    allFields.push(mF.fields[j]);
		}
	    }
	}else{
	    if(mF.disabled !== true){
		allFields.push(mF);
	    }
	}
    }
    return allFields;
};
 
ActClass.prototype.fieldByName = function(mName){
    for(var i=0; i<this.fields.length; i++){
	var mF = this.fields[i];
	if( (mF.type == 'row') && (mF.fields.length > 0) ){
	    for(var j=0; j < mF.fields.length; j++){
		var mF2 = mF.fields[j];
		if(mF2.name == mName){
		    return mF2;
		}
	    }
	}else{
	    if(mF.name == mName){
		return mF;
	    }
	}
    }
    return false;
};

ActClass.prototype.setDomInput = function(mName,mInp){
    this.fieldByName(mName)['domElement'] = mInp;    
};

ActClass.prototype.getDomInput = function(mName){
    var mDom = this.fieldByName(mName)['domElement'];
    if(mDom){
	return mDom;
    }
    return false;
};

ActClass.prototype.getDomInputVal = function(mName){
    var mDom = this.fieldByName(mName)['domElement'];
    if(mDom){
	if($(mDom).val()){
	    return $(mDom).val();
	}
    }
    return false;
};

ActClass.prototype.setDomInputVal = function(mName,mVal){
    var mDom = this.fieldByName(mName)['domElement'];
    if(mDom){
	return $(mDom).val(mVal);
    }
    return false;
};

ActClass.prototype.setFocus = function(mName){
    var mDom = this.fieldByName(mName)['domElement'];
    if(mDom){
	return $(mDom).focus();
    }
    return false;
};

ActClass.prototype.setFocusError = function(mName){
    var mDom = this.fieldByName(mName)['domElement'];
    if(mDom){
	$(mDom).addClass('fbFormError').focus();
	return $(mDom);
    }
    return false;
};

ActClass.prototype.loadRecords = function(newObj){
    if(newObj.record_offset > 0){
	this.recList = this.recList.concat(newObj.records);
    }else{
	this.recHash = {};
	this.recList = newObj.records;
    }
    for(var i=0; i<newObj.records.length; i++){
	var recId = newObj.records[i].id;
	newObj.records[i].array_index = i;
	this.recHash[recId] = newObj.records[i];
    }
    this.count = this.recList.length;
    this.countTotal = newObj.count_total;
    this.recordOffset = newObj.record_offset;
    this.recordLimit = newObj.record_limit;
    if(this.allowActionBar !== false){
	//	this.actionBarUpdate();
    }
};

ActClass.prototype.eventAddEnterKeySubmit = function(){
    var myThis = this;
    $main = this.getRoot();
    $main.keyup(function(e) {
	    if (e.keyCode == 13) {
		myThis.editSubmit();
	    }
	});
};

ActClass.prototype.content = function(){

};

ActClass.prototype.ajaxError = function(){
    this.ajaxBusy = false;
    //alert('Ajax system error');
    return false;
};

ActClass.prototype.inputClassName = function(){
    return 'text ui-widget-content ui-corner-all';
};

ActClass.prototype.formId = function(){
    return 'jrjMobForm';
};

ActClass.prototype.getForm = function(){
    return this.jrjForm;
};

ActClass.prototype.formNode = function(){
    var myThis = this;
    this.jrjForm =  document.createElement('form');
    $(this.jrjForm).attr({'id':myThis.formId,'action':'#','method':'get'});
    $(this.jrjForm).on('submit',function(){return false;});
    return $(this.jrjForm);
};

ActClass.prototype.errorClear = function(){
    $(this.errorDiv).css('display','none');
    var mFields = this.fieldList();
    for(var i = 0;i < mFields.length; i++){
	var mDom = mFields[i].domElement;
	if(mDom){
	    $(mDom).removeClass('fbFormError');
	}
    }
};

ActClass.prototype.errorDisplay = function(mMsg){
    $(this.errorDiv).css('display','block');
    $(this.errorDiv).html(mMsg || this.errorMsg);
};

ActClass.prototype.errorDivCreate = function(){
    this.errorDiv = document.createElement('div');
    $( this.errorDiv ).attr('id','mobError').addClass('ui-bar ui-bar-e');
    return this.errorDiv;
};

ActClass.prototype.dirty = function(){
    var myThis = this;
    if(this.enforceDirty){
	if(this.rec){
	    var mFields = this.fieldList();
	    for(var i=0;i<mFields.length;i++){
		var mVal = this.getDomInputVal(mFields[i].name);
		if( (! this.rec[mName]) && (! mVal) ){
		    continue;
		}else if( this.rec[mName] != mVal ){
		    return true;
		}
	    }
	}
	return false;
    }else{
	return true;
    }
};

ActClass.prototype.update = function(){
    this.ajaxGetRecs();
};

ActClass.prototype.mapEditInit = function(){
    JRJ.map.mode = 'editLoc';
    this.changePageMap();
};

ActClass.prototype.mapEditInitFromEdit = function(){
    // this may be called while the parent source is 'all'
    // so need to reset the global object
    actResetObj(this);
    JRJ.map.mode = 'editLoc';
    this.changePageMap();
};

ActClass.prototype.mapEdit = function(){
    var mPoint;
    var mRec = this.rec;
    var myThis = this;
    this.clear();
    this.mapMarkerNew(mRec);
    this.mapWinClose();
    this.mode = 'mapEdit';
    if( ! this.mapEditTitle){
	this.mapEditTitle = 'Change '+ this.label +' Location';
    }
    if( ! this.mapEditIcon){
	this.mapEditIcon = '/images/map/setLoc40.png';
    }
    if( ! this.mapEditCaption){
	this.mapEditCaption = 'Post Location';
    }
    if(mRec.lat && mRec.lon){
	mPoint = new google.maps.LatLng(mRec.lat,mRec.lon);
    }else{
	mPoint = this.getCenterObj();
    }
    if(this.mapEditMarker){
	this.mapEditMarker.setMap(null);
    }
    this.mapEditMarker = new google.maps.Marker({ position: mPoint, title:'Set Location', draggable:true, icon: this.mapEditIcon });
    this.mapEditMarker.setMap(JRJ.map.googleMap);
    google.maps.event.addListener(this.mapEditMarker, 'drag', function(){ myThis.mapEditDrag(); });
    var mNode = this.mapEditContent();
    this.mapWin = new google.maps.InfoWindow( { content: mNode } );
    google.maps.event.addListener(this.mapEditMarker, 'click', function(){ myThis.mapWin.open(JRJ.map.googleMap,myThis.mapEditMarker); });
    this.mapWin.open(JRJ.map.googleMap,this.mapEditMarker);
};

ActClass.prototype.mapEditContent = function(){
    var myThis = this;
    var $mBut,$mCell,$mRow;
    var mCenter = this.mapEditMarker.getPosition();
    var mNode = document.createElement('div');

    $mRow = $(document.createElement('div')).addClass('ui-grid-solo pad5 ui-bar-e');
    $mCell = $(document.createElement('div')).addClass('ui-block-a').html('Change the location by dragging the icon');
    $mRow.append($mCell);
    $(mNode).append($mRow);
    $mRow = $(document.createElement('div')).addClass('ui-grid-a pad5');
    $mCell = $(document.createElement('div')).addClass('ui-block-a').attr({'id':'locLat'}).html('Lat: ' + mCenter.lat().toFixed(2));
    $mRow.append($mCell);
    $mCell = $(document.createElement('div')).addClass('ui-block-b').attr({'id':'locLon'}).html('Lon: ' + mCenter.lng().toFixed(2));
    $mRow.append($mCell);
    $(mNode).append($mRow);
    $mRow = $(document.createElement('fieldset')).addClass('ui-grid-a');
    $mCell = $(document.createElement('div')).addClass('ui-block-a');    
    $mBut = $(document.createElement('button')).html('Cancel').on('click',function(){ myThis.mapEditClose(); } );
    //$mBut = this.jqmButton({ 'icon':'back', 'label':'Cancel', 'sub':function(){ myThis.mapEditClose(); } });
    $mCell.append($mBut);
    $mRow.append($mCell);
    $mCell = $(document.createElement('div')).addClass('ui-block-b');
    $mBut = $(document.createElement('button')).html('Set').on('click',function(){ myThis.mapEditSubmit(); } );
    //$mBut = this.jqmButton({ 'icon':'check', 'label':'Set', 'sub':function(){ myThis.mapEditSubmit(); } });
    $mCell.append($mBut);
    $mRow.append($mCell);
    $(mNode).append($mRow);
    return mNode;
};

ActClass.prototype.mapEditDrag = function(){
    if(this.mapEditMarker){
	var mLoc = this.mapEditMarker.getPosition();
	$('#locLat').html('Lat:' + mLoc.lat().toFixed(2));
	$('#locLon').html('Lon:' + mLoc.lat().toFixed(2));
    }
};

ActClass.prototype.mapEditSubmit = function(){
    var myThis = this;
    var mCenter = this.mapEditMarker.getPosition();
    if(mCenter != undefined){
	var mData = {'center': mCenter.toUrlValue(),'id':this.rec.id };
	$.ajax({ 'url': myThis.ajaxUrlEditGeo, dataType:'json', 'data': mData,
		    success: function(json,textStatus){ myThis.mapEditSubmitCB(json, textStatus); },
		    error: function(){}
	    });
    }
    this.mapEditClose();
};

ActClass.prototype.mapEditClose = function(){
    this.mapWin.close();
    if(this.mapEditMarker){
	this.mapEditMarker.setMap(null);
	this.mapEditMarker = false;
    }
};

ActClass.prototype.mapEditSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.editRec(json.record);
	    this.clear();
	    this.mapMarkerNew(json.record);
	}
    }
};

ActClass.prototype.mapDisplay = function(){
    this.mode = 'map';
    var mapMode = JRJ.map.mode;
    JRJ.map.mode = 'default';
    if(mapMode == 'editLoc'){
	this.mapEdit();
    }else if(mapMode == 'searchLoc'){
	this.searchLocLoad();
    }else if(mapMode == 'zoomOut'){
	this.mapZoomOut();
    }else{ // default
	if(this.dataFetched){
	    this.mapDisplay2();
	}else{
	    this.ajaxGetRecs();
	}
    }
};

ActClass.prototype.detailOpenInit = function(){
    this.mode = 'detail';
    this.ajaxGetRecs();
};

ActClass.prototype.clear = function(){
    this.mapClear();
};

ActClass.prototype.ajaxGetRecsUrl = function(){
    var mUrl = this.ajaxUrlBB;
    if(this.filtersCur.length > 0){
	for(var i=0; i<this.filtersCur.length; i++){
	    var mFilter = this.filtersCur[i];
	    if(mFilter.url && (mFilter.type == 'url')){
		mUrl = mFilter.url;
		break; // only one url allowed
	    }
	}
    }
    return mUrl;
};

ActClass.prototype.getBounds = function(){
    var mBounds = false;
    // try from map
    if(JRJ.map.googleMap){
	if(JRJ.map.googleMap.getBounds()){
	    mBounds = JRJ.map.googleMap.getBounds().toUrlValue();
	    //alert('BfMap: ',mBounds);
	}
    }
    mBounds = false;
    // try from cookie
    if( ! mBounds){
	var cBounds = getCookie('fbBounds');
	if(cBounds){
	    mBounds = cBounds;
	    //alert('BfCook: ',mBounds);
	}
    }
    // get default
    if( ! mBounds){
	mBounds = '26.632426,-82.59118,26.861447,-81.93715';
	//alert('BfDef: ',mBounds);
    }
    return mBounds;
};

ActClass.prototype.getCenterObj = function(){
    var mCenter = false;
    if(JRJ.map.googleMap){
	if(JRJ.map.googleMap.getCenter()){
	    mCenter = JRJ.map.googleMap.getCenter();
	}
    }
    if( ! mCenter){
	var cookieStr = getCookie('fbCenter');
	if(cookieStr){
	    var mArr = cookieStr.split(',');
	    mCenter = new google.maps.LatLng(mArr[0],mArr[1]);
	}
    }
    if( ! mCenter){
	mCenter = new google.maps.LatLng('26.746994,-82.264165');
    }
    return mCenter;
};

ActClass.prototype.getCenterStr = function(){
    return this.getCenterObj().toUrlValue();
};

ActClass.prototype.ajaxGetRecsPage = function(){
    this.recordOffset++;
    this.paginate = true;
    this.ajaxGetRecs();
};

ActClass.prototype.ajaxGetRecs = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mUrl = myThis.ajaxGetRecsUrl();
    var mData = { 'bounds':myThis.getBounds() };
    if(this.paginate){
	mData.offset = this.recordOffset;
    }
    this.paginate = false;
    $.ajax({ url:mUrl, dataType:'json', data: mData,
		success: function(json,textStatus){ myThis.ajaxGetRecsCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActClass.prototype.ajaxGetRecsCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.setFocusError('name');
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.dataFetched = true;
	    this.loadRecords(json);
	    if(this.mode == 'detail'){
		this.detailOpen(this.recList[0]);
	    }else if(this.mode == 'list'){
		this.listOpen2();
	    }else{
		this.mapDisplay2();
	    }
	}
    }
};

ActClass.prototype.mapDisplayBounds = function(){
    var mBounds = new google.maps.LatLngBounds();
    for(var i=0;i<this.recList.length;i++){
	var mRec = this.recList[i];
	var mPoint = new google.maps.LatLng(mRec.lat,mRec.lon);
	mBounds.extend(mPoint);
    }
    JRJ.map.googleMap.fitBounds(mBounds);
    this.mapLoad();
};

ActClass.prototype.mapDisplay2 = function(){
    JRJ.display.listOrMap = 'map';
    setCookie('fbListOrMap','map');
    this.mapClear();
    this.mapHeader();
    $('#mobMap').page();
    $('#mobMap').trigger('create');
    this.mapLoad();
};

ActClass.prototype.ownerMarkerClear = function(){
    if(fbActOwnerMarker){
	fbActOwnerMarker.setMap(null);
    }
};

ActClass.prototype.mapClear = function(){
    this.mapWinClose();
    this.ownerMarkerClear();
    if(JRJ.map.markers.length > 0){
	for(var i=0; i<JRJ.map.markers.length; i++){
	    var mMarker = JRJ.map.markers[i];
	    if(mMarker != undefined){
		mMarker.setMap(null);
	    }
	}
    }
    JRJ.map.markers = [];
};

ActClass.prototype.mapLoad = function(){
    this.clear();
    if(this.count > 0){
	for(var i=0; i<this.recList.length; i++){
	    var rec = this.recList[i];
	    this.mapMarkerNew(rec);
	}
    }
};

ActClass.prototype.mapMarkerNew = function(mRec){
    var myThis = this;
    var mShadow = this.mapIconMedBg(mRec);
    var mPoint = new google.maps.LatLng(mRec.lat,mRec.lon);    
    var mOpt = { position: mPoint, title:mRec[this.titleField], icon:this.mapIconMed(mRec) };
    if(mShadow){
	mOpt['shadow'] = mShadow;
    }
    var mMarker = new google.maps.Marker(mOpt);
    mMarker.setMap(JRJ.map.googleMap);
    google.maps.event.addListener(mMarker, 'click', function(){ myThis.mapWinOpen(mRec); } );
    mRec.map_marker = mMarker;
    JRJ.map.markers.push(mMarker);
    return mMarker;
};

ActClass.prototype.mapContent = function(){
    var $mRow, myThis = this;
    var mNode = document.createElement('div');
    var mRec = this.rec;
    mRec.dc = mRec.date_create;
    if(this.allowHead !== false){
	$(mNode).append(this.head());
    }
    var mFields = this.mapFields();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.type == 'hidden'){ continue; }
	if(mF.mapShow === false){ continue; }
	if(mF.readShow === false){ continue; }
	if(mF.readSub != undefined){
	    $mRow = this[mF.readSub]();
	    if($mRow){
		$(mNode).append($mRow);
	    }
	}else if(mF.type == 'image'){
	    mF.widthTemp = '100';
	    mF.heightTemp = '100';
	    $mRow = $(document.createElement('p'));	    
	    $mRow.append(myThis.readRowImage(mF));
	    $mRow.append(this.clearBr());
	    $(mNode).append($mRow);
	    mF.widthTemp = false;
	    mF.heightTemp = false;
	}else{
	    $mRow = $(document.createElement('p'));
	    if(mF.label){
		var $mLab = $(document.createElement('span')).addClass('labelRead');
		$mLab.html(mF.label+':');
		$mRow.append($mLab);
	    }
	    $mVal = $(document.createElement('span')).addClass('valueRead');
	    $mVal.html(mRec[mF.name]);
	    $mRow.append($mVal);
	    $mRow.append(this.clearBr());
	    $(mNode).append($mRow);
	}
    }
    $(mNode).append(this.mapButtons());
    return mNode;
};

ActClass.prototype.mapInit = function(){

};

ActClass.prototype.mapIconSmall = function(mRec){
    if(! this.mIconSmall){
	var mSz = (this.iconUrlSmallSz ? this.iconUrlSmallSz : [16,16,0,0,8,8]);
	this.mIconSmall = new google.maps.MarkerImage(this.iconUrlSmall,
						      new google.maps.Size(mSz[0],mSz[1]),
						      new google.maps.Point(mSz[2],mSz[3]), 
						      new google.maps.Point(mSz[4],mSz[5])
						      );
    }
    return this.mIconSmall;
};

ActClass.prototype.mapIconSmallBg = function(mRec){
    if(this.iconUrlSmallBg){
	if(! this.mIconSmallBg){
	    this.mIconSmallBg = new google.maps.MarkerImage(this.iconUrlSmallBg, new google.maps.Size(18,16),
							    new google.maps.Point(0,0), new google.maps.Point(5,8)
							    );
	}
	return this.mIconSmallBg;
    }
    return false;
};

ActClass.prototype.mapIconUrlMed = function(mRec){
    return this.iconUrlMed;
};

ActClass.prototype.mapIconMed = function(mRec){
    if(! this.mIconMed){
	var mSz = (this.iconUrlMedSz ? this.iconUrlMedSz : [24,24,0,0,12,12]);
	this.mIconMed = new google.maps.MarkerImage(this.iconUrlMed,
						    new google.maps.Size(mSz[0],mSz[1]),
						    new google.maps.Point(mSz[2],mSz[3]), 
						    new google.maps.Point(mSz[4],mSz[5])
						    );
    }
    return this.mIconMed;
};

ActClass.prototype.mapIconMedBg = function(mRec){
    if(this.iconUrlMedBg){
	if(! this.mIconMedBg){
	    var mSz = (this.iconUrlMedBgSz ? this.iconUrlMedBgSz : [24,24,0,0,12,12]);

	    this.mIconMedBg = new google.maps.MarkerImage(this.iconUrlMedBg,
							  new google.maps.Size(mSz[0],mSz[1]),
							  new google.maps.Point(mSz[2],mSz[3]), 
							  new google.maps.Point(mSz[4],mSz[5])
							  );
	}
	return this.mIconMedBg;
    }
    return false;
};

ActClass.prototype.mapWinClose = function(){
    if(fbActMapWin != undefined){
	fbActMapWin.close();
    }
};

ActClass.prototype.mapWinOpen = function(mRec){
    var myThis = this;
    this.mapWinClose();
    this.mode = 'mapWin';
    this.rec = mRec;
    this.statLinkFlagShow = false;
    this.statLinkMapShow = false;
    var mNode = this.mapContent();
    fbActMapWin = new google.maps.InfoWindow( {content: mNode } );
    fbActMapWin.open(JRJ.map.googleMap,mRec.map_marker);
    return false;
};

ActClass.prototype.clearDiv = function(){
    return $( document.createElement('div') ).addClass('clear');
};

ActClass.prototype.clearBr = function(){
    return $( document.createElement('br') ).addClass('clear');
};

ActClass.prototype.flagLink = function(){
    return false;
};

ActClass.prototype.head = function(){
    var myThis = this;
    var mRec = this.rec;
    var mBox = $( document.createElement('div')).addClass('mobHead fbBorder5');
    var imgId = fbDefaultProfileId;
    if(mRec.photo_id && (mRec.photo_id != 0) ){
	imgId = mRec.photo_id;
    }
    var imgSrc = imageSource(imgId,'32');
    var $mCell = $(document.createElement('div')).addClass('mobHeadCell');
    var $mImg = $(document.createElement('img')).attr({src:imgSrc,width:32,height:32}).addClass('uImg');
    $mImg.bind('click',function(){ changePageProfile(mRec.username);return false; });
    $mCell.append($mImg);
    $(mBox).append($mCell);
    $mCell = $(document.createElement('div')).addClass('mobHeadCell');
    var $mRow = $(document.createElement('div'));
    $mRow.append( $( document.createElement('span') ).html(this.label + ': ').addClass('bold') );
    var mDisplay = mRec[this.displayField];
    if(mDisplay){
	$mRow.append( $( document.createElement('span') ).html(mDisplay).addClass('darkGreen') );
    }
    $mCell.append($mRow);
    $mCell.append(this.headUserStat());
    $(mBox).append($mCell);
    $(mBox).append(this.clearBr());
    if(this.allowHeadLink !== false){
	$mRow = $(document.createElement('div'));
	//$mRow.append( $( document.createElement('span') ).html('WWW:').addClass('floatLeft') );
	var mUrl = this.host + '.fishblab.com/' + mRec[this.keyField];
	$mRow.append( $(document.createElement('a')).addClass('discStatLink').attr({href:'http://' + mUrl,'target':'www'}).html(mUrl) );
	//$(mBox).append($mRow);
	//$(mBox).append(this.clearBr());
    }
    return mBox;
};

ActClass.prototype.headUserStat = function(){
    var myThis = this;
    var mRec = this.rec;
    var $mRow = $(document.createElement('div'));
    var $mAnc = $(document.createElement('a')).addClass('mobHeadCell').attr({href:'http://m.fishblab.com#u?' +  escape(mRec.username)}).html(mRec.username);
    //$mAnc.bind('click',function(){ changePageProfile(mRec.username);return false; });
    $mRow.append($mAnc);
    var $mCell = $(document.createElement('div')).addClass('mobHeadCell').html(mRec.date_create || mRec.dc);
    $mRow.append($mCell);
    $mCell = $(document.createElement('div')).addClass('mobHeadCell').html(this.secDisplay());
    $mRow.append($mCell);
    if(this.statLinkFlagShow){
	if(mRec.username != fbUser.username){
	    $mAnc = $(document.createElement('a')).addClass('mobHeadCell').html('Flag').attr({href:'/'});
	    $mAnc.bind('click',myThis.statLinkFlag());
	    $mRow.append($mAnc);
	}
    }
    if(false){ //this.isRead() && (this.allowGeo !== false) ){
	$mAnc = $( document.createElement('a') );
	$mAnc.addClass('mobHeadCell').html('Map').attr({href:'/'});
	$mAnc.bind('click', function(){ myThis.close();myThis.mapWinOpen(mRec);return false; } );
	$mRow.append($mAnc);
    }
    $mRow.append(this.clearDiv());
    return $mRow;
};

ActClass.prototype.headGW = function(){
    var myThis = this, $mBut;
    var mRec = this.rec;
    var mBox = $( document.createElement('div')).addClass('discCap fbBorder1');
    var imgId = fbDefaultProfileId;
    if(mRec.photo_id && (mRec.photo_id != 0) ){
	imgId = mRec.photo_id;
    }
    var imgSrc = imageSource(imgId,'32');
    var $mCell = $(document.createElement('div')).addClass('discHeadCell');
    var $mAnc = $(document.createElement('a')).addClass('discStatLink').attr({href:'http://user.fishblab.com/' + escape(mRec.username) });
    var $mImg = $(document.createElement('img')).attr({src:imgSrc,width:32,height:32}).addClass('uImg');
    $mAnc.append($mImg);
    $mCell.append($mAnc);
    $(mBox).append($mCell);
    $mCell = $(document.createElement('div')).addClass('discHeadCell');
    var $mRow = $(document.createElement('div')).addClass('discCapTxt');
    $mRow.append( $( document.createElement('span') ).html(this.label + ': ').addClass('black') );
    var mDisplay = mRec[this.displayField];
    if(mDisplay){
	$mRow.append( $( document.createElement('span') ).html(mDisplay).addClass('darkGreen') );
    }
    $mCell.append($mRow);
    $mCell.append(this.headUserStatGW());
    $(mBox).append($mCell);
    if(mRec.username == fbUser.username){
	$mBut = $(document.createElement('button')).html('Edit').addClass('floatRight marRight5');
	// $mBut.bind('click',function(){myThis.editOpen(mRec);});
	$mBut.bind('click',function(){ actMapEdit(myThis.name,mRec[myThis.keyField]); });
	$mBut.button();
	$(mBox).append($mBut);
    }
    $mBut = $(document.createElement('button')).html('Map').addClass('floatRight marRight5');
    $mBut.bind('click',function(){ actMapOne(myThis.name,mRec[myThis.keyField]); });
    $mBut.button();
    $(mBox).append($mBut);
    $(mBox).append(this.clearDiv());
    return mBox;
};

ActClass.prototype.headUserStatGW = function(){
    var myThis = this;
    var mRec = this.rec;
    var $mBox = $(document.createElement('div')).addClass('discStatBox');
    var $mCell = $(document.createElement('div')).addClass('discStatLink').html(mRec.date_create || mRec.dc);
    $mBox.append($mCell);
    $mCell = $(document.createElement('div')).addClass('discStatLink').html(this.secDisplay());
    $mBox.append($mCell);
    var $mAnc = $(document.createElement('a')).addClass('discStatLink').attr({href:'http://user.fishblab.com/' + escape(mRec.username) }).html(mRec.username);
    $mBox.append($mAnc);
    if(this.statLinkFlagShow){
	if(mRec.username != fbUser.username){
	    $mAnc = $(document.createElement('a')).addClass('discStatCell').html('Flag').attr({href:'/'});
	    $mAnc.bind('click',myThis.statLinkFlag());
	    $mBox.append($mAnc);
	}
    }
    $mBox.append(this.clearDiv());
    return $mBox;
};

ActClass.prototype.mapActionBut = function(){
    var myThis = this;
    var mRec = this.rec;
    if(this.allowMapButtons === false){
	return false;
    }
    var $mRow = $(document.createElement('div')).addClass('mapBut');
    var $mBut = $(document.createElement('button')).html('Detail');
    $mBut.bind('click',function(){myThis.readOpen(mRec);});
    $mBut.button();
    $mRow.append($mBut);
    if(this.allowList !== false){
	$mBut = $(document.createElement('button')).html('List').addClass('marLeft10');
	$mBut.bind('click',function(){myThis.listOpen();});
	$mBut.button();
	$mRow.append($mBut);
    }
    if( (this.allowEdit !== false) && (fbUser.jrjSec || (fbUser.username == mRec.username)) ){
	$mBut = $(document.createElement('button')).html('Edit').addClass('marLeft10');
	$mBut.bind('click',function(){myThis.editOpen(mRec);});
	$mBut.button();
	$mRow.append($mBut);
    }
    return $mRow;
};

ActClass.prototype.rootName = 'mobForm';

ActClass.prototype.getRoot = function(){
    return $('#' + this.rootName );
};

ActClass.prototype.getRootContent = function(){
    return $('#' + this.rootName + 'Content');
};

ActClass.prototype.getRootPop = function(){
    return $('#' + this.rootName + 'Popup');
};

ActClass.prototype.close = function(){
    var $main = this.getRoot();
    this.mapClear();
    return $main;
};

ActClass.prototype.reset = function(){
    var $content = this.getRootContent();
    $content.children().remove();
    return $content;
};

ActClass.prototype.rootName2 = 'jrjDialog2';

ActClass.prototype.getRoot2 = function(){
    return $('#' + this.rootName2);
};

ActClass.prototype.close2 = function(){
    var $main = this.getRoot2();
    return $main;
};

ActClass.prototype.reset2 = function(){
    var $main = this.close2();
    $main.children().remove();
    $main.html('');
    $main.removeClass();
    return $main;
};

ActClass.prototype.rootName3 = 'jrjDialog3';

ActClass.prototype.getRoot3 = function(){
    return $('#' + this.rootName3);
};

ActClass.prototype.close3 = function(){
    var $main = this.getRoot3();
    return $main;
};

ActClass.prototype.reset3 = function(){
    var $main = this.close3();
    $main.children().remove();
    $main.html('');
    $main.removeClass();
    return $main;
};

ActClass.prototype.rootNameGW = 'gwOne';

ActClass.prototype.getRootGW = function(){
    return $('#' + this.rootNameGW);
};

ActClass.prototype.closeGW = function(){
    var $main = this.getRootGW();
    return $main;
};

ActClass.prototype.resetGW = function(){
    var $main = this.closeGW();
    $main.children().remove();
    $main.html('');
    $main.removeClass();
    return $main;
};

ActClass.prototype.isRead = function(){
    return (this.mode == 'detail' ? true : false);
};

ActClass.prototype.isDetail = function(){
    return (this.mode == 'detail' ? true : false);
};

ActClass.prototype.isEdit = function(){
    return (this.mode == 'edit' ? true : false);
};

ActClass.prototype.isDelete = function(){
    return (this.mode == 'delete' ? true : false);
};

ActClass.prototype.isNew = function(){
    return (this.mode == 'new' ? true : false);
};

ActClass.prototype.isList = function(){
    return (this.mode == 'list' ? true : false);
};

ActClass.prototype.readOpenById = function(mId){
    this.ajaxGetRec(mId);
};

ActClass.prototype.detailOpenById = function(mId){
   this.mode = 'detail';
    this.ajaxGetRec(mId);
};

ActClass.prototype.editOpenById = function(mId){
    this.mode = 'edit';
    this.ajaxGetRec(mId);
};

ActClass.prototype.ajaxGetRec = function(mKey){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mData = {};
    mData[this.keyField] = mKey;
    $.ajax({ url:myThis.ajaxUrlById, dataType:'json', data:mData,
		success: function(json,textStatus){ myThis.ajaxGetRecCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActClass.prototype.ajaxGetRecCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.setFocusError('name');
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    var mRec = json.record;
	    var mRecs = {'count':1,'records':[mRec],'count_total':1,'record_offset':0,'record_limit':10};
	    if(this.mode == 'edit'){
		this.editOpen(mRec);
	    }else{
		this.detailOpen(mRec);
	    }
	}
    }
};

ActClass.prototype.detailOpen = function(mRec){
    var myThis = this;
    this.rootName = 'mobDetail';
    this.mode = 'detail';
    this.rec = mRec;
    this.reset();
    this.detailHeader();
    this.detailContent();
    this.detailFooter();
    this.changeHash = true;
    this.changeMode = 'detail';
    this.changePage();
};

ActClass.prototype.editOpen = function(mRec){
    var myThis = this;
    this.rootName = 'mobForm';
    this.mode = 'edit';
    this.rec = mRec;
    this.reset();
    this.editHeader();
    this.editContent();
    this.editFooter();
    this.changeHash = true;
    this.changeMode = 'edit';
    this.changePage();
};

ActClass.prototype.newOpen = function(){
    var myThis = this;
    this.rootName = 'mobForm';
    this.mode = 'new';
    this.setGeo = true;
    this.rec = {};
    this.reset();
    this.newHeader();
    this.newContent();
    this.newFooter();
    this.changeHash = true;
    this.changeMode = 'new';
    this.changePage();
};

ActClass.prototype.mapPageChange = function(){
    var myThis = this;
    this.rootName = 'mobMap';
    this.mode = 'map';
    this.changeHash = true;
    this.allowSamePageTransition = true;
    this.changeMode = 'map';
    this.changePage();
};

ActClass.prototype.listOpen = function(){
    if(this.allowList === false){ return false; }
    this.mode = 'list';
    if(this.dataFetched){
	this.listOpen2();
    }else{
	this.ajaxGetRecs();
    }
};

ActClass.prototype.listOpen2 = function(){
    var myThis = this;
    JRJ.display.listOrMap = 'list';
    setCookie('fbListOrMap','list');
    this.rootName = 'mobList';
    this.mode = 'list';
    this.changeMode = 'list';
    this.reset();
    this.listHeader();
    this.listContent();
    this.listFooter();
    this.changeHash = true;
    this.changePage();
};

ActClass.prototype.searchLocOpen = function(){
    var myThis = this;
    var myThis = this;
    this.rootName = 'mobSearchLoc';
    this.mode = 'searchLoc';
    this.rec = {};
    this.reset();
    this.searchLocHeader();
    this.searchLocContent();
    this.changeHash = true;
    this.changeMode = 'searchLoc';
    this.changePage();
};

ActClass.prototype.searchInit = function(){
    JRJ.map.mode = 'search';
    this.changePageMap();
};

ActClass.prototype.mapZoomOutInit = function(){
    JRJ.map.mode = 'zoomOut';
    this.changePageMap();
};

ActClass.prototype.buildClose = function(){
    var myThis = this;
    var $mA = $( document.createElement('a') ).attr({'href':'#','Xdata-rel':'back','data-role':'button','data-theme':'a','data-icon':'delete','data-iconpos':'notext'}).addClass("ui-btn-right").html('Close');
    $mA.on('click',function(){ myThis.popupClose(); } );
    return $mA;
};

ActClass.prototype.popupClose = function(){
    var myThis = this;
    if(JRJ.win.popup){
	JRJ.win.popup.close();
    }
};

ActClass.prototype.searchLocOpenPOP = function(){
    var myThis = this;
    JRJ.win.popup = new MobPopSearch();
    JRJ.win.popup.open();
    return false;
};

ActClass.prototype.mapZoomOut = function(){
    var myThis = this;
    if(JRJ.map.obj){
	JRJ.map.obj.zoomOut();
    }
    return false;
};

ActClass.prototype.waitOpen = function(){
    var myThis = this;
    this.reset3();
    var $main = this.waitContent();
    $main.dialog({ autoOpen: true, height:'auto', width: 'auto', modal: true, show:null,
		position: 'center', closeOnEscape: false, title: 'Please wait for Upload'
		});
};

ActClass.prototype.waitContent = function(){
    var myThis = this;
    var $main = this.getRoot3();
    var $mRow = $( document.createElement('div') ).addClass('fbFormHead').html('Please wait while your photo uploads ...');
    $main.append($mRow);
    $mRow = $( document.createElement('div') ).addClass('upWait');
    var $mImg = $( document.createElement('img') ).attr({'src':'/images/fb/loading.gif'}).addClass('upWait');
    $mRow.append($mImg);
    $main.append($mRow);
    return $main;
};

ActClass.prototype.waitClose = function(){
    var $main = this.close3();
    return false;
};

ActClass.prototype.focus = function(){
    return false;
};

ActClass.prototype.title = function(){
    return 'FishBlab ' + this.label;
};

ActClass.prototype.searchTitle = function(){
    return 'Search for ' + this.labelPlural
};

ActClass.prototype.buildButtons = function(bList){
    var $mBut, myThis = this;
    var $mRow = $(document.createElement('div'));
    for(var i=0; i <bList.length; i++){
	var rBut = bList[i];
	if( ! rBut.type){
	    rBut.type = 'button';
	}
	$mBut = $(document.createElement(rBut.type)).attr(rBut.attr).html(rBut.label);
	if(rBut.sub){
	    $mBut.bind('click', rBut.sub );
	}
	$mRow.append($mBut);
    }
    return $mRow;
};

ActClass.prototype.readButtons = function(){
    var myThis = this;
    var mOpt = {};
    var mRec = this.rec;
    if( (this.allowList !== false) && (this.count > 1) ){
	mOpt['List'] = function(){myThis.listOpen();};
    }
    if(this.allowEdit && (fbUser.jrjSec || (mRec.username) == fbUser.username)){
	mOpt['Edit'] = function(){ myThis.editOpen(mRec); };
    }
    mOpt['Close'] = function(){ myThis.close(); };
    return mOpt;
};

ActClass.prototype.listButtons = function(){
    var myThis = this;
    var mOpt = {};
    if(this.allowNew !== false){
	mOpt['New'] = function(){ myThis.newOpen(); };
    }
    mOpt['Close'] = function(){ myThis.close(); };
    return mOpt;
};

ActClass.prototype.closeButtons = function(){
    var myThis = this;
    var mOpt = {};
    mOpt['Close'] = function(){ myThis.close(); };
    return mOpt;
};

ActClass.prototype.searchButtons = function(){
    var myThis = this;
    var mOpt = {};
    mOpt['Search'] = function(){ myThis.searchSubmit(); };
    mOpt['Close'] = function(){ myThis.close(); };
    return mOpt;
};

ActClass.prototype.newButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'back';
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'type':'button', 'sub':myThis.newButtonCancel() } );
    mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'check';
    mList.push( { 'label':'Save', 'sub':function(){ myThis.newSubmit(); }, 'attr':mAttr } );
    return this.buildButtons(mList);
};

ActClass.prototype.newButtonCancel = function(){
    var myThis = this;
    return function(){ myThis.changePageHome(); };
};

ActClass.prototype.editButtons = function(){
    var myThis = this;
    var mAttr, mList = [];
    if(fbUser.jrjSec || (this.rec.username == fbUser.username) ){
	mAttr = this.defaultButtonAttr();
	mAttr['data-icon'] = 'arrow-r';
	mAttr['data-inline'] = 'false';
	mAttr['data-iconpos'] = 'right';
	mList.push( { 'label':'Change Location', 'sub':function(){ myThis.mapEditInitFromEdit();return false; }, 'attr':mAttr } );	
    }
    mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'back';
    mAttr['href'] = '/..';
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'type':'button', 'sub':function(){ myThis.detailOpen(myThis.rec);return false; } } );
    mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'check';
    mList.push( { 'label':'Save', 'sub':function(){ myThis.editSubmit(); }, 'attr':mAttr } );
    return this.buildButtons(mList);
};

ActClass.prototype.editButtonBack = function(){
    var myThis = this;
    return 
};

ActClass.prototype.detailButtons = function(){
    var myThis = this;
    var mRec = this.rec;
    var mAttr = this.defaultButtonAttr();
    var $mRow = $(document.createElement('div'));
    var $mBut = $(document.createElement('a')).attr(mAttr).html('Back').on('click',function(){return myThis.detailButtonBack();});
    $mRow.append($mBut);
    if(fbUser.jrjSec || (this.rec.username == fbUser.username) ){
	mAttr = this.defaultButtonAttr();
	mAttr['data-icon'] = 'gear';
	$mBut = $(document.createElement('a')).attr(mAttr).html('Edit').on('click',function(){myThis.editOpen(mRec);return false;});
	$mRow.append($mBut);
    }
    return $mRow;
};

ActClass.prototype.detailButtonBack = function(){
    this.listOrMap();
    return false;
};

ActClass.prototype.defaultButtonAttr = function(){
    return {'data-role':'button', 'data-inline':'true', 'data-theme':'b', 'data-mini':'false'};
};

ActClass.prototype.jqmButton = function(mOpt){
    var $mDiv = $(document.createElement('div')).addClass('ui-btn ui-btn-up-b ui-btn-inline ui-shadow ui-btn-corner-all ui-mini ui-btn-icon-left');
    var $mSpan = $(document.createElement('span')).addClass('ui-btn-inner ui-btn-corner-all');
    $mSpan.append( $(document.createElement('span')).addClass('ui-btn-text').html(mOpt.label + '&nbsp;') );
    $mSpan.append( $(document.createElement('span')).addClass('ui-icon ui-icon-'+ mOpt.icon +' ui-icon-shadow').html('&nbsp;') );
    $mDiv.append($mSpan);
    var $mBut = $(document.createElement('button')).addClass('ui-btn ui-btn-up-b ui-btn-inline ui-shadow ui-btn-corner-all ui-mini ui-btn-icon-left ui-btn-hidden');
    $mSpan = $(document.createElement('span')).addClass('ui-btn-inner ui-btn-corner-all');
    $mSpan.append( $(document.createElement('span')).addClass('ui-btn-text').html(mOpt.label) );
    $mSpan.append( $(document.createElement('span')).addClass('ui-icon ui-icon-'+ mOpt.icon +' ui-icon-shadow').html('&nbsp;') );
    $mBut.append($mSpan);
    $mBut.bind('click',mOpt.sub);
    $mDiv.append($mBut);
    return $mDiv;
};

ActClass.prototype.mapButtons = function(){
    var myThis = this;
    var $mRow = $(document.createElement('div'));
    var $mBut = this.jqmButton({ 'icon':'info', 'label':'Detail', 'sub':function(){ myThis.detailOpen(myThis.rec); } });
    $mRow.append($mBut);
    if( (this.allowEdit) && (fbUser.jrjSec || (this.rec.username == fbUser.username) ) ){
	$mBut = this.jqmButton({ 'icon':'gear', 'label':'Edit', 'sub':function(){ myThis.editOpen(myThis.rec); } });
	$mRow.append($mBut);
    }
    return $mRow;
};

ActClass.prototype.secDisplay = function(){
    var mRec = this.rec;
    var secVal = mRec.sec
    var secStr = 'Public';
    if(secVal == 15){
	if(mRec.group_name){
	    secStr = 'Members: ' + mRec.group_name;
	}else{
	    secStr = 'Members Only';
	}
    }else if(secVal == 10){
	secStr = 'Private';
    }else if(secVal == 5){
	secStr = 'Friends Only';
    }
    return secStr;
};

ActClass.prototype.secGroupInit = function(secNew){
    if(this.secGroupActive){
	if(secNew == 15){
	    this.secGroupBox.removeClass('hidden');
	    this.secGroupSet( $(this.secGroupSelect).val() );
	}else{
	    this.secGroupBox.addClass('hidden');
	}
    }
};

ActClass.prototype.secSet = function(secNew){
    setCookie('fbSecE',secNew);
    this.setDomInputVal('sec',secNew);
    if(this.secGroupActive){
	this.secGroupInit(secNew);
    }else{
	if(secNew == 15){
	    alert('You are not yet a member of any groups');
	    return false;
	}
    }
    return true;
};

ActClass.prototype.secGroupSet = function(groupId){
    this.setDomInputVal('group_id',groupId);
    return false;
};

ActClass.prototype.secGroupSelectInit = function(mArg){
    var myThis = this;
    var mGrp = userGroups();
    if(mGrp){
	mArg.size = (mArg.size ? mArg.size : 1);
	var mSel = document.createElement('select');
	$(mSel).attr({'name':'group_id_select','id':mArg.domId,'size':mArg.size}).addClass('secGroupSelect');
	for(var i=0; i <mGrp.length; i++){
	    rGroup = mGrp[i];
	    var mOpt = document.createElement('option');
	    mOpt.value = rGroup.id;
	    mOpt.innerHTML = rGroup.name;
	    $(mSel).append(mOpt);
	    if(mArg.gid){
		if(rGroup.id == mArg.gid){
		    mOpt.selected = true;
		}
	    }
	}
	$(mSel).bind('change',function(){ myThis.secGroupSet( $(this).val() ); });
	return mSel;
    }
    return false;
};

ActClass.prototype.editSec = function(){
    var mSec,groupId;
    var mRec = this.rec;
    var myThis = this;
    if( (mRec != undefined) && (mRec != null) ){
	mSec = mRec.sec;
	groupId = mRec.group_id;
    }
    if( (mSec == undefined) || (mSec == null) ){
	mSec = getCookie('fbSecE');
	if( (mSec == undefined) || (mSec == null) || (mSec == 15) ){
	    mSec = 1;
	}
    }
    var mGrp = userGroups();
    var mWidth = '25px';
    var $mBox = $(document.createElement('div')).attr({id:'secEOptions'});
    var $mRow = $(document.createElement('fieldset')).attr({'data-role':'controlgroup','data-type':'horizontal'});
    var $mLeg = $(document.createElement('legend')).html('Who can view this?');
    $mRow.append($mLeg);

    var $mInp = $(document.createElement('input')).attr({type:'radio',name:'secOpt',value:1,id:'sec_pub'});
    $mInp.bind('click',function(){ myThis.secSet(1); });
    if(mSec == 1){ $mInp.attr({checked:true}); }
    $mRow.append($mInp);
    var $mLab = $(document.createElement('label')).attr({'for':'sec_pub'}).html('Public');
    $mRow.append($mLab);

    $mInp = $(document.createElement('input')).attr({type:'radio',name:'secOpt',value:5,id:'sec_fri'});
    $mInp.bind('click',function(){ myThis.secSet(5); });
    if(mSec == 5){ $mInp.attr({checked:true}); }
    $mRow.append($mInp);
    $mLab = $(document.createElement('label')).attr({'for':'sec_fri'}).html('Friends');
    $mRow.append($mLab);

    $mInp = $(document.createElement('input')).attr({type:'radio',name:'secOpt',value:10,id:'sec_pri'});
    $mInp.bind('click',function(){ myThis.secSet(10); });
    if(mSec == 10){ $mInp.attr({checked:true}); }
    $mRow.append($mInp);
    $mLab = $(document.createElement('label')).attr({'for':'sec_pri'}).html('Private');
    $mRow.append($mLab);

    $mInp = $(document.createElement('input')).attr({type:'radio',name:'secOpt',value:15,id:'sec_grp'});
    $mInp.bind('click',function(){ myThis.secSet(15); });
    if(mSec == 15){ $mInp.attr({checked:true}); }
    //$mRow.append($mInp);
    this.secGroupRadio = $mInp;
    $mLab = $(document.createElement('label')).attr({'for':'sec_grp'}).html('Group');
    //$mRow.append($mLab);

    $mBox.append($mRow);
    this.secgroupActive = false;
    if(mGrp && (mGrp.length > 0) ){
	var mSel = this.secGroupSelectInit({ sec:mSec, gid:groupId });
	if(mSel){
	    $mRow = $(document.createElement('div'));
	    $mRow.append($(document.createElement('span')).html('My Groups:'));
	    $mRow.append(mSel);
	    $mBox.append($mRow);
	    this.secGroupBox = $mRow;
	    this.secGroupSelect = mSel;
	    this.secGroupActive = true;
	    this.secGroupInit(mSec);
	}
    }    
    var mInp = document.createElement('input');	    
    $( mInp ).attr( {'type':'hidden','name':'sec','value':mSec} );
    this.setDomInput('sec',mInp);
    $mBox.append(mInp);
    return $mBox;
};

ActClass.prototype.editTitle = function(){
    return 'Edit ' + this.label;
};

ActClass.prototype.newTitle = function(){
    return 'New ' + this.label;
};

ActClass.prototype.editForm = function(){
    var mFields = this.fieldList();
    var $mFrm = this.formNode();
    var showFieldName = 'editShow';
    var mHead = this.editTitle();
    if(this.isNew()){
	mHead = this.newTitle();
	showFieldName = 'newShow';
    }
    if(mHead){
	$mFrm.append( $(document.createElement('h2')).html(mHead) );
    }
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF[showFieldName] !== false){
	    $mFrm.append(this.editContentRow(mF));	    
	}
    }
    return $mFrm;
};

ActClass.prototype.editContentRow = function(mF){
    var isNew = this.isNew();
    if(mF.type == 'hidden'){
	return this.editInput(mF);
    }else{
	var $mRow = $(document.createElement('div')).attr({'data-role':'fieldcontain'});
	if(mF.label){
	    $mLab = $( document.createElement('label') ).attr({'for':mF.name}).html(mF.label);
	    if(mF.required === true){
		var $mReq = $(document.createElement('em')).html('*');
		$mLab.attr({'title':'Required'}).append($mReq);
	    }
	    $mRow.append($mLab);
	}
	$mRow.append(this.editInput(mF));
	if(false){ //this.tipShow !== false){
	    $mRow.append(this.clearBr());
	    mTip = (isNew ? mF.tipNew || mF.tip : mF.tipEdit || mF.tip);
	    if(mTip){
		$mSpan = $( document.createElement('span') ).html(mTip);
		$mRow.append($mSpan);
	    }
	}
    }
    return $mRow;
};

ActClass.prototype.newHeader = function(){
    var myThis = this;
    myThis.headButtons('Form');
    $('#mobFormHome').off().on('click', function(){ myThis.changePageActNew();return false; });
    $('#mobFormMenu').off().on('click', function(){ myThis.menuOpen('mobFormPopup'); return false; });
};

ActClass.prototype.editHeader = function(){
    var myThis = this;
    myThis.headButtons('Form');
    $('#mobFormHome').off().on('click', function(){ myThis.detailOpen(myThis.rec); return false;});
    $('#mobFormMenu').off().on('click', function(){ myThis.menuOpen('mobFormPopup'); return false; });
};

ActClass.prototype.detailBackSub = function(){
    this.listOrMap();
    return false;
};

ActClass.prototype.detailHeader = function(){
    var myThis = this;
    myThis.headButtons('Detail');
    $('#mobDetailHome').off().on('click', function(){ myThis.listOrMap();return false; } );
    $('#mobDetailMenu').off().on('click', function(){ myThis.menuOpen('mobDetailPopup'); return false; });
};

ActClass.prototype.menuHeader = function(){
    var myThis = this;
    myThis.headButtons('Menu');
    $('#mobMenuHome').off().on('click', function(){ myThis.listOrMap();return false; } );
    $('#mobMenuMenu').off().on('click', function(){ myThis.changePageHome(); return false; });
};

ActClass.prototype.mapHeader = function(){
    var myThis = this;
    myThis.headButtons('Map');
    $('#mobMapHome').off().on('click', function(){ myThis.changePageHome(); });
    $('#mobMapMenu').off().on('click', function(){ myThis.menuOpen('mobMapPopup'); return false; });
};

ActClass.prototype.listHeader = function(){
    var myThis = this;
    myThis.headButtons('List');
    $('#mobListHome').off().on('click', function(){ myThis.changePageHome(); });
    $('#mobListMenu').off().on('click', function(){ myThis.menuOpen('mobListPopup'); return false; });
};

ActClass.prototype.searchLocHeader = function(){
    var myThis = this;
    myThis.headButtons('SearchLoc');
    $('#mobListHome').off().on('click', function(){ myThis.changePageHome(); });
    $('#mobListMenu').off().on('click', function(){ myThis.menuOpen('mobSearchLocPopup'); return false; });
};

ActClass.prototype.headButtons = function(mSource){
    var myThis = this;
    var $mDiv = $('#mob' + mSource + 'But');
    $mDiv.empty();
    var $mBut = $(document.createElement('a')).attr({'data-role':'button'}).html('Map').on('click', function(){ myThis.changePageMap();return false; });
    $mDiv.append($mBut);
    $mBut = $(document.createElement('a')).attr({'data-role':'button'}).html('List').on('click', function(){ myThis.listOpen();return false; });
    $mDiv.append($mBut);
    $mBut = $(document.createElement('a')).attr({'data-role':'button'}).html('Search');
    if(false){  //mSource == 'Map'){
	$mBut.on('click', function(){ myThis.searchLocOpen();return false; });
    }else{
	$mBut.on('click', function(){ myThis.searchLocOpen();return false; });
    }
    $mDiv.append($mBut);
    if(this.allowNew !== false){
	$mBut = $(document.createElement('a')).attr({'data-role':'button','data-mini':'true'}).html('New').on('click', function(){ myThis.newOpen();return false; });
	$mDiv.append($mBut);
    }
    return $mDiv;
};

ActClass.prototype.headTextDELETE = function(mSource){
    var myThis = this;
    var $mDiv = $('#mob' + mSource + 'But');
    $mDiv.empty();
    var $mBut = $(document.createElement('a')).attr({'data-role':'button'}).html('Map').on('click', function(){ myThis.changePageMap();return false; });
    $mDiv.append($mBut);
    $mBut = $(document.createElement('a')).attr({'data-role':'button'}).html('List').on('click', function(){ myThis.listOpen();return false; });
    $mDiv.append($mBut);
    $mBut = $(document.createElement('a')).attr({'data-role':'button'}).html('Search');
    if(mSource == 'Map'){
	$mBut.on('click', function(){ myThis.searchLocOpen();return false; });
    }else{
	$mBut.on('click', function(){ myThis.searchInit();return false; });
    }
    $mDiv.append($mBut);
    return $mDiv;
};

ActClass.prototype.newContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(this.errorDivCreate());
    $main.append(this.editForm());
    $main.append(this.newButtons());
    return $main;
};

ActClass.prototype.editContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(this.errorDivCreate());
    if(this.allowHead !== false){
	$main.append( myThis.head() );
    }
    $main.append(this.editForm());
    $main.append(this.editButtons());
    return $main;
};

ActClass.prototype.detailContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(this.errorDivCreate());
    if(this.allowHead !== false){
	$main.append( myThis.head() );
    }
    $main.append(this.detailBody());
    $main.append(this.detailButtons());
    return $main;
};

ActClass.prototype.menuContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(this.errorDivCreate());
    $main.append(this.menuBody());
    return $main;
};

ActClass.prototype.listContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(this.errorDivCreate());
    $main.append(this.listBody());
    return $main;
};

ActClass.prototype.searchLocContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(this.errorDivCreate());
    var $mForm = this.formNode();
    $mForm.addClass('ui-content');
    var $mRow = $(document.createElement('div')).attr({'data-role':'fieldcontain'});
    var $mLab = $( document.createElement('label') ).attr({'for':'locInput'}).html('Change Search Location:');
    $mRow.append($mLab);
    var mInp = document.createElement('input');
    $(mInp).attr( {'type':'text','name':'locInput','id':'locInput' });
    $mRow.append(mInp);
    this.searchInput = mInp;
    $mForm.append($mRow);
    var mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'back';
    mAttr['href'] = '/';
    $mRow = $(document.createElement('div'));
    var $mBut = $(document.createElement('button')).attr(mAttr).html('Cancel').on('click', function(){ myThis.listOrMap();return false; } ) ;
    $mForm.append($mBut);
    mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'check';
    $mRow = $(document.createElement('div'));
    $mBut = $(document.createElement('button')).attr(mAttr).html('Search').on('click', function(){ myThis.searchLocSubmit();return false; } ) ;
    $mForm.append($mBut);
    $mForm.on('submit',function(){ myThis.searchLocSubmit();return false;});
    $main.append($mForm);
    return $main;
};

ActClass.prototype.searchLocSubmit = function(){
    var mInput = $(this.searchInput).val();
    if( ! mInput){
	this.errorMsg = 'Please enter a location to search';
	this.errorDisplay();
    }else{
	this.searchLocGeocode(mInput);
    }
    return false;
};

ActClass.prototype.searchLocGeocode = function(mStr){
    var myThis = this;
    if( ! mStr){
	myThis.errorMsg = 'Please provide a location to search';
	myThis.errorDisplay();
	return false;
    }
    if ( ! JRJ.gecoder) { JRJ.geocoder = new google.maps.Geocoder(); }
    if(JRJ.gecoderBlock){ return false; }
    JRJ.geocoderBlock = true;
    JRJ.geocoder.geocode({ 'address': mStr },
			  function(results, status) {
			      if(status == google.maps.GeocoderStatus.OK){
				  var mResult = results[0];
				  var mInput = mResult.formatted_address;
				  mInput = mInput.replace(/\,\s*USA$/i,'');
				  if(mInput.match(/[\w\s\-]+\,\s[A-Z][A-Z]\s\d\d\d\d\d/)){
				      mInput = mInput.replace(/\s\d\d\d\d\d$/,'');
				  }
				  var geom = mResult.geometry;
				  JRJ.geo = {};
				  JRJ.geo.input = mInput;
				  JRJ.geo.lat = geom.location.lat();
				  JRJ.geo.lon = geom.location.lng();
				  JRJ.geo.center = new google.maps.LatLng(JRJ.geo.lat,JRJ.geo.lon);
				  JRJ.geo.bounds = geom.viewport;
				  setCookie('fbInput',mInput);
				  setCookie('fbLat',JRJ.geo.lat);
				  setCookie('fbLon',JRJ.geo.lon);
				  JRJ.map.mode = 'searchLoc';
				  myThis.changePageMap();
			      }else{
				  myThis.errorMsg = "Geocode Error: " + status;
				  myThis.errorDisplay();
			      }
			      JRJ.geocoderBlock = false;
			  });
    JRJ.geocoderBlock = false;
};

ActClass.prototype.searchLocLoad = function(){
    this.dataFetched = false;
    JRJ.map.googleMap.panTo(JRJ.geo.center);
    if(JRJ.geo.bounds){
	JRJ.map.googleMap.fitBounds(JRJ.geo.bounds);
    }
};

ActClass.prototype.newFooter = function(){
    // $('#mobFormFooter').html('Footer');
};

ActClass.prototype.editFooter = function(){
    // $('#mobFormFooter').html('Footer');
};

ActClass.prototype.detailFooter = function(){
    // $('#mobDetailFooter').html('Footer');
};

ActClass.prototype.listFooter = function(){
    // $('#mobListFooter').html('Footer');
};

ActClass.prototype.editInput = function(mF){
    var myThis = this;
    var mRec = this.rec;
    var mInp;
    var isEdit = this.isEdit();
    if(mF.editSub != undefined){
	mInp = this[mF.editSub]();
    }else if(mF.type == 'button'){
	mInp = document.createElement('button');
	$( mInp ).html(mF.buttonLabel).addClass('jrjEditBut');
	$(mInp).bind('click',function(){ myThis[mF.clickSub](); });
	$(mInp).button();
    }else if(mF.type == 'image'){
	mF.widthTemp = '100';
	mF.heightTemp = '100';
	mInp = myThis.readRowImage(mF);
	mF.widthTemp = false;
	mF.heightTemp = false;
    }else{
	// all others will set the value on edit
	if(mF.type == 'textarea'){
	    mInp = document.createElement('textarea');
	    $( mInp ).css('display','block').attr( {'Xrows':(mF.rows ? mF.rows : 4),'Xcols':(mF.cols? mF.Cols : '30'),'name':mF.name,'id':(mF.id ? mF.id : mF.name)} );
	}else if(mF.type == 'select'){
	    mInp = document.createElement('select');
	    $( mInp ).css('display','block').attr( {'id':(mF.id ? mF.id : mF.name),'name':mF.name} ).addClass(this.inputClassName);
	    var mLabs = this[mF.selectLabel];
	    var mVals = this[mF.selectValue];
	    for(var i=0; i<mVals.length; i++){
		var $mOpt = $( document.createElement('option')).attr({value:mVals[i]}).html(mLabs[i]);
		if(isEdit){
		    if($mOpt.val() == mRec[mF.name]){
			$mOpt.attr({'selected':true});
		    }
		}
		$(mInp).append($mOpt);
	    }
	}else if(mF.type == 'date'){
	    mInp = document.createElement('input');
	    $( mInp ).attr( {'id':(mF.id ? mF.id : mF.name),'type':'text','name':mF.name} ).addClass(this.inputClassName);
	    //$( mInp ).datepicker();
	}else if(mF.type == 'hour'){
	    mInp = document.createElement('input');
	    $( mInp ).attr( {'id':(mF.id ? mF.id : mF.name),'type':'text','name':mF.name} ).addClass(this.inputClassName);
	}else if(mF.type == 'hidden'){
	    mInp = document.createElement('input');
	    $( mInp ).attr( {'type':mF.type,'name':mF.name} );
	}else{
	    mInp = document.createElement('input');
	    $( mInp ).attr( {'id':(mF.id ? mF.id : mF.name),'type':(mF.type ? mF.type : 'text'),'name':mF.name,'size':(mF.size ? mF.size : 20) });
	    if(isEdit && (mF.readOnEdit == true)){
		$(mInp).attr({'disabled':true});
	    }
	}
	if(isEdit){
	    if(mRec){
		var mVal = mRec[mF.name];
		if( (mF.type == 'checkbox') || (mF.type == 'radio') ){
		    if(mF.value == mVal){
			$(mInp).attr({'checked':true,'value':mVal});
		    }
		}else{
		    $(mInp).val(mVal);
		}
	    }
	}else{
	    if(mF.defaultValue){
		$(mInp).val(mF.defaultValue);
	    }
	}
	mF['domElement'] = mInp;
    }
    return mInp;
};

ActClass.prototype.validate = function(){
    this.errorClear();
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	var mVal = $(mF.domElement).val();
	if(mF.required){
	    if( ! mVal ){
		this.errorMsg = 'Please enter a ' + mF.label;
		this.setFocusError(mF.name);
		return false;
	    }
	}
	if(mF.regExp){
	    if( ! mVal.match(mF.regExp) ){
		this.errorMsg = 'Illegal characters in ' + mF.label;
		this.setFocusError(mF.name);
		return false;
	    }
	}
    }
    this.errorClear();
    return true;
};

ActClass.prototype.newUserValidate = function(){
    this.errorClear();
    var mUsername = this.getDomInputVal('username');
    var mPassword = this.getDomInputVal('password');
    var mPasswordVerify = this.getDomInputVal('password_verify');
    var mEmail = this.getDomInputVal('email');
    if( mUsername ){
	if( mPassword ){
	    if( mPasswordVerify ){
		if( mEmail ){
		    if( mPassword == mPasswordVerify ){
			if(mUsername.length > 1){
			    if(mPassword.length > 5){
				if(mUsername.match(/^([0-9a-z_\.\-])+$/i) ){
				    if(mEmail.match(emailRegExp)){
					return true;    					
				    }else{
					this.errorMsg = 'Email appears invalid (ex: name@fishblab.com)';
					this.setFocusError('email');
				    }
				}else{
				    this.errorMsg = 'Username may consist of a-z, 0-9, _, -, .';
				    this.setFocusError('username');
				}
			    }else{
				this.errorMsg = 'Password must be at least 6 characters';
				this.setFocusError('password');
			    }
			}else{
			    this.errorMsg = 'Username must be at least 2 characters';
			    this.setFocusError('username');
			}
		    }else{
			this.errorMsg = 'Password & Password Verify do not match';
			this.setFocusError('password_verify');
		    }
		}else{
		    this.errorMsg = 'Please enter an email';
		    this.setFocusError('email');
		}
	    }else{
		this.errorMsg = 'Please enter a Password Verify';
		this.setFocusError('password_verify');
	    }
	}else{
	    this.errorMsg = 'Please enter a Password';
	    this.setFocusError('password');
	}
    }else{
	this.errorMsg = 'Please enter a Username';
	this.setFocusError('username');
    }
    return false;
};

ActClass.prototype.editUserValidate = function(){
    this.errorClear();
    var mUsername = this.getDomInputVal('username');
    var mEmail = this.getDomInputVal('email');
    if( mUsername ){
	if( mEmail ){
	    if(mUsername.length > 1){
		if(mUsername.match(/^([0-9a-z_\.\-])+$/i) ){
		    if(mEmail.match(emailRegExp)){
			return true;    					
		    }else{
			this.errorMsg = 'Email appears invalid (ex: name@fishblab.com)';
			this.setFocusError('email');
		    }
		}else{
		    this.errorMsg = 'Username may consist of a-z, 0-9, _, -, .';
		    this.setFocusError('username');
		}
	    }else{
		this.errorMsg = 'Username must be at least 2 characters';
		this.setFocusError('username');
	    }
	}else{
	    this.errorMsg = 'Please enter an email';
	    this.setFocusError('email');
	}
    }else{
	this.errorMsg = 'Please enter a Username';
	this.setFocusError('username');
    }
    return false;
};

// not used?
ActClass.prototype.fieldsAndValues = function(){
    var mHash = {};
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	mHash[mF.name] = $(mF.domElement).val();
    }
    if(this.isNew()){
	mHash.center = this.getCenterStr();
    }
    return mHash;
};

ActClass.prototype.editFieldsAndValues = function(){
    var mHash = {},mFields;
    if(this.isNew()){
	mFields = this.newFields();
	if(this.allowGeo !== false){
	    if(JRJ.map.googleMap){
		mHash['center'] = this.getCenterStr();
	    }
	}
    }else{
	mFields = this.editFields();	    
    }
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if( (mF.type == 'checkbox') || (mF.type == 'radio') ){
	    if($(mF.domElement).attr('checked')){
		mHash[mF.name] = mF.value;
	    }
	}else{
	    mHash[mF.name] = $(mF.domElement).val();
	}
    }
    return mHash;
};

ActClass.prototype.fieldsAll = function(){
    return this.fields;
};

ActClass.prototype.editFields = function(){
    var mArr = [];
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.editShow === false){
	    continue;
	}else{
	    mArr.push(mF);
	}
    }
    return mArr;
};

ActClass.prototype.readFields = function(){
    var mArr = [];
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.readShow !== false){
	    mArr.push(mF);
	}
    }
    return mArr;
};

ActClass.prototype.newFields = function(){
    var mArr = [];
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.newShow !== false){
	    mArr.push(mF);
	}
    }
    return mArr;
};

ActClass.prototype.listFields = function(){
    var mArr = [];
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.listShow === true){
	    mArr.push(mF);
	}
    }
    return mArr;
};

ActClass.prototype.searchFields = function(){
    var mArr = [];
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.searchShow === true){
	    mArr.push(mF);
	}
    }
    return mArr;
};

ActClass.prototype.shortFields = function(){
    var mArr = [];
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.shortShow === true){
	    mArr.push(mF);
	}
    }
    return mArr;
};

ActClass.prototype.mapFields = function(){
    var mArr = [];
    var mFields = this.fieldList();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.mapShow === true){
	    mArr.push(mF);
	}
    }
    return mArr;
};

ActClass.prototype.editSubmit = function(){
    if( ! this.ajaxBusy){
	if(this.dirty()){
	    if(this.validate()){
		this.ajaxEdit();
	    }else{
		this.errorDisplay();
	    }
	}
    }
};

ActClass.prototype.newSubmit = function(){
    if( ! this.ajaxBusy){
	if(this.dirty()){
	    if(this.validate()){
		this.ajaxNew();
	    }else{
		this.errorDisplay();
	    }
	}
    }
};

ActClass.prototype.ajaxEdit = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mData = this.editFieldsAndValues();
    $.ajax({ url: this.ajaxUrlEdit, dataType: 'json', data: mData,
		success: function(json,textStatus){ myThis.ajaxEditCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActClass.prototype.ajaxNew = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mData = this.editFieldsAndValues();
    $.ajax({ url:this.ajaxUrlNew, dataType: 'json', data: mData,
		success: function(json,textStatus){ myThis.ajaxNewCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActClass.prototype.ajaxEditCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.editRec(json.record);
	    this.detailOpen(json.record);
	}
    }
};

ActClass.prototype.ajaxNewCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.newRec(json.record);
	    this.close();
	    if(this.allowGeo !== false){
		this.mode = 'edit';
		this.mapEditInit();
	    }else{
		this.detailOpen(json.record);
	    }
	}
    }
};

ActClass.prototype.del = function(mId){
    var myThis = this;
    mUrl = this.ajaxUrlDelete;
    if( ! mUrl){
	this.errorDisplay('No delete url');
    }else if( !mId){
	this.errorDisplay('No delete ID');
    }else{
	this.deleteId = mId;
	if(confirm('Are you sure you want to delete this ' + this.label + '?')){
	    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	    $.ajax({ url: mUrl , dataType: 'json', data: {'id':mId},
			success: function(json,textStatus){ myThis.delCB(json, textStatus); },
			error: function(){ myThis.ajaxError(); }
		});
	}
    }
};

ActClass.prototype.delCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.deleteRec(json.id);
	    this.close();
	}
    }
};

ActClass.prototype.searchValidate = function(){
    var mFields = this.searchFields();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	var mVal = $(mF.domElement).val();
	if(mVal){
	    return true;
	}
    }
    this.errorMsg = 'No values submitted for search';
    return false;
};

ActClass.prototype.searchSubmit = function(){
    if( ! this.ajaxBusy){
	this.errorClear();
	if(this.searchValidate()){
	    this.ajaxSearch();
	}else{
	    this.errorDisplay();
	}
    }
};

ActClass.prototype.ajaxSearch = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mUrl = this.ajaxUrlSearch;
    var mData = {};
    mFields = this.searchFields();
    if(this.searchMapGet() == 'y'){
	mData['bounds'] = myThis.getBounds();
    }
    for(i=0; i < mFields.length; i++){
	var mF = mFields[i];
	var mVal = this.getDomInputVal(mF.name);
	if(mVal){
	    mData[mF.name] = mVal;
	}
    }
    $.ajax({ url: this.ajaxUrlSearch , dataType: 'json', data: mData,
	     success: function(json,textStatus){ myThis.ajaxSearchCB(json, textStatus); },
	     error: function(){ myThis.ajaxError(); }
	});
};

ActClass.prototype.ajaxSearchCB = function(json,mStatus){
    if(mStatus != 'success'){
	this.ajaxBusy = false;
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	this.ajaxBusy = false;
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    if(json.count > 0){
		this.dataFetched = true;
		this.mapClear();
		this.loadRecords(json);
		mapEventZoomDisable();
		this.mapDisplayBounds();
		mapEventZoomEnable();
		this.searchUpdate();
	    }else{
		this.recTableStatus.css({'color':'red'}).html('No Records found in search');
		this.recTableClear();
	    }
	}
    }
};

ActClass.prototype.newRec = function(recNew){
    var rec_index,rId = recNew.id;
    var recListNew = [];
    recNew.array_index = 0;
    recListNew.push(recNew);
    for(var i=0;i<this.recList.length; i++){
	var mRec = this.recList[i];
	recListNew.push(mRec);
	mRec.array_index = recListNew.length - 1;
    }
    delete this.recList;
    this.recList = recListNew;
    this.count++;
    this.countTotal++;
    this.recHash[rId] = recNew;
    if(this.allowGeo !== false){
	this.mapMarkerNew(recNew);
    }
    this.rec = recNew;
};

ActClass.prototype.editRec = function(recNew){
    var rec_index,rId = recNew.id;
    var recOld = this.recHash[rId];
    if(recOld){
	if(recOld.map_marker){
	    recOld.map_marker.setMap(null);
	    recOld.map_marker = null;
	}
	rec_index = recOld.array_index;
	delete this.recHash[rId];
    }else{
	rec_index = this.recList.length;
    }
    this.recList[rec_index] = recNew;
    recNew.array_index = rec_index;
    this.recHash[rId] = recNew;
    if(this.allowGeo !== false){
	this.mapMarkerNew(recNew);
    }
    this.rec = recNew;
};

ActClass.prototype.deleteRec = function(mId){
    if(mId){
	var recOld = this.recHash[mId];
	if(recOld){
	    if(recOld.map_marker){
		recOld.map_marker.setMap(null);
		recOld.map_marker = null;
	    }
	    var recListNew = [];
	    for(var i=0;i<this.recList.length; i++){
		if(this.recList[i].id != mId){
		    var mRec = this.recList[i];
		    recListNew.push(mRec);
		    mRec.array_index = recListNew.length - 1;
		}
	    }
	    delete this.recList;
	    this.recList = recListNew;
	    this.count = this.recList.length;
	    this.countTotal--;
	    delete this.recHash[mId];
	    this.rec = undefined;
	    return true;
	}
    }
    return false;
};

ActClass.prototype.recTableNode = function(){
    var $mBox = $(document.createElement('div') );
    this.recTableStatus = $(document.createElement('div') ).addClass('jrjSearchStatus');
    $mBox.append(this.recTableStatus);
    $mBox.append(this.recTableInit());    
    return $mBox;
};

ActClass.prototype.recTableClear = function(){
    if( (this.recTable != undefined) && (this.recTable != null) ){
	$(this.recTable).children().remove();
    }
};

ActClass.prototype.recTableInit = function(){
    this.recTable = document.createElement('table');
    $(this.recTable).attr( {'id':'jrjDialogTable','cellspacing':0,'cellpadding':0});
    return this.recTable;
};

ActClass.prototype.recTableLoad = function(){
    if( (this.recTable == undefined) || (this.recTable == null) ){
	this.recTableInit();
    }
    var strCount = 'Total: ' + this.countTotal;
    if(this.countTotal > this.count){
	strCount += ' Viewing:' + this.count;
    }
    //this.recTableStatus.addClass('fbBorder2').html(strCount);
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    var mFields = this.listFields();
    for(var i=0; i < mFields.length; i++){
	$mTr.append( $( document.createElement('th') ).html(mFields[i].label) );
    }
    $(this.recTable).append($mTr);
    for(var i=0; i<this.recList.length; i++){
	$(this.recTable).append(this.listContentRow(this.recList[i]));
    }
    return this.recTable;
};

ActClass.prototype.searchCaption = function(){
    return false;
};

ActClass.prototype.searchStartSym = function(){
    return $( document.createElement('span') ).attr({'title':'Starts with'}).addClass('jrjSearchSymBlue').html('S');
};

ActClass.prototype.searchContainSym = function(){
    return $( document.createElement('span') ).attr({'title':'Contains'}).addClass('jrjSearchSymGreen').html('C');
};

ActClass.prototype.searchEqualSym = function(){
    return $( document.createElement('span') ).attr({'title':'Equals'}).addClass('jrjSearchSymRed').html('X');
};

ActClass.prototype.searchSym = function(mF){
    var $span;
    if(mF.searchType === 'equal'){
	$span = this.searchEqualSym();
    }else if(mF.searchType === 'contain'){
	$span = this.searchContainSym();
    }else{
	$span = this.searchStartSym();
    }
    $span.addClass('floatLeft');
    return $span;
};

ActClass.prototype.searchLegendNode = function(){
    var $mRow = $( document.createElement('div') ).addClass('mar5');
    $mRow.append( this.searchStartSym());
    $mRow.append( $( document.createElement('span') ).html('= Starts With ').addClass('marRight10') );
    $mRow.append( this.searchContainSym());
    $mRow.append( $( document.createElement('span') ).html('= Contains').addClass('marRight10') );
    $mRow.append( this.searchEqualSym());
    $mRow.append( $( document.createElement('span') ).html('= Exact').addClass('marRight10') );
    return $mRow;
};

ActClass.prototype.searchMapSet = function(){
    var searchMap = this.searchMapGet();
    searchMap = (searchMap == 'y' ? 'n' : 'y') 
    setCookie('fbSearchMap',searchMap);
};

ActClass.prototype.searchMapGet = function(){
    var searchMap = getCookie('fbSearchMap');
    return (searchMap || 'n');
};

ActClass.prototype.searchUpdate = function(){
    this.recTableClear();
    this.recTableLoad();
};

ActClass.prototype.searchContent = function(){
    var myThis = this;
    var mInp,$mCell,$mSpan,i;
    var $main = this.getRoot();
    var $mRow = this.searchCaption();
    if($mRow){
	$main.append($mRow);
    }
    $main.append(this.errorDivCreate());
    var $mFrm = this.formNode();
    $mFrm.addClass('jrjSearch');
    var $mGroup = $(document.createElement('fieldset')).addClass('fbBorder3');
    var $mLegend = $(document.createElement('legend')).html('Enter Search Criteria');
    $mGroup.append($mLegend);
    var mFields = this.searchFields();
    for(i=0; i < mFields.length; i++){
	var mF = mFields[i];
	$mCell = $( document.createElement('div')).addClass('jrjSearchCell');	
	$mCell.append( $( document.createElement('span') ).html(mF.label) );
	$mCell.append(this.searchSym(mF));
	$mCell.append(this.clearBr());
	mInp = document.createElement('input');
	$(mInp).attr({size:5});
	$mCell.append( $( mInp ) );
	this.setDomInput(mF.name,mInp);
	$mGroup.append($mCell);
    }
    $mGroup.append(this.clearBr());
    var searchMap = this.searchMapGet();
    if(this.allowSearchBounds !== false){
	$mRow = $(document.createElement('div'));
	var $mLab = $(document.createElement('label')).html('In current Map Only').attr('for','searchMap');
	$mRow.append($mLab);
	var $mBut = $(document.createElement('input')).attr({'type':'checkbox','name':'searchMap','value':'y','id':'searchMap'});
	$mBut.bind('change',function(){ myThis.searchMapSet(); });
	if(searchMap == 'y'){ $mBut.attr({'checked':true}); }
	$mRow.append($mBut);
	$mGroup.append($mRow);
    }
    $mFrm.append($mGroup,this.clearBr());
    $main.append($mFrm);
    $main.append(this.recTableNode());
    return $main;
};

ActClass.prototype.listContentRow = function(mRec){
    var myThis = this;
    var mFields = this.listFields();
    var $mTr = $( document.createElement('tr') );
    for(var i=0; i < mFields.length; i++){
	$mTr.append( $( document.createElement('td') ).html(mRec[mFields[i].name]) );
    }
    $mTr.bind('mouseover',function(){$(this).removeClass().addClass('jrjActive');});
    $mTr.bind('mouseout',function(){$(this).removeClass().addClass('jrjInactive');});
    $mTr.bind('click',function(){ myThis.readOpen(mRec);return false; });
    return $mTr;
};

ActClass.prototype.bigQ = function(){
    return $(document.createElement('span')).addClass('bigQuote').html('"');
};

ActClass.prototype.readUrlNode = function(){
    var mRec = this.rec;
    var mUrl = (mRec.url ? mRec.url : mRec.website);
    if( ! mUrl ){return false;}
    var $mRow = $(document.createElement('p'));
    var $mLab = $(document.createElement('span')).addClass('detailLabel');
    $mLab.html('Website:');
    $mRow.append($mLab);
    $mVal = $(document.createElement('span')).addClass('detailValue');
    var $mAnc = $(document.createElement('a')).attr({href:urlFix(mUrl),target:'new'}).html(mRec.url_caption ? mRec.url_caption : mUrl);
    $mRow.append($mAnc);
    $mRow.append(this.clearDiv());
    return $mRow;
};

ActClass.prototype.shortContent = function(){
    var myThis = this;
    var mRec = this.rec;
    var $mBox = $(document.createElement('div')).addClass('jrjShortContent');
    var $mRow,$mLab,$mVal;
    var mFields = this.shortFields();
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.type == 'hidden'){ continue; }
	if(mF.shortShow !== true){ continue; }
	if(mF.readSub != undefined){
	    $mRow = this[mF.readSub]();
	    if($mRow){
		$mBox.append($mRow);
	    }
	}else{
	    $mRow = $(document.createElement('p'));
	    if(mF.label){
		$mLab = $(document.createElement('span')).addClass('jrjReadLabel');
		$mLab.html(mF.label);
		$mRow.append($mLab);
	    }
	    $mVal = $(document.createElement('span')).addClass('jrjReadVal');
	    $mVal.html(mRec[mF.name]);
	    $mRow.append($mVal);
	    $mRow.append(this.clearDiv());
	    $mBox.append($mRow);
	}
    }
    return $mBox;
};

ActClass.prototype.detailBody = function(){
    var myThis = this;
    var mRec = this.rec;
    this.secType = 'tab';
    var isGate = false;
    var mHasChildren = false;
    if(this.children && (this.children.length > 0) ){
	mHasChildren = true;
    }
    mHasChildren = false;
    mRec.dc = mRec.date_create;
    var $mRow,$mLab,$mVal;
    var mFields = this.readFields();
    var $mCell = $(document.createElement('div')).addClass('fbBorder1 pad5');
    this.readNavInit();
    $mCell.append( $(document.createElement('h2')).html(this.label + ' Detail') );
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF.type == 'hidden'){ continue; }
	if(mF.readShow === false){ continue; }
	if(mF.readSub != undefined){
	    $mRow = this[mF.readSub]();
	    if($mRow){
		$mCell.append($mRow);
	    }
	}else if(mF.type == 'button'){
	    break;
	    $mRow = $(document.createElement('p'));
	    $mBut = $( document.createElement('button') ).html(mF.buttonLabel).addClass('jrjEditBut');
	    var mSub = mF.clickSub;
	    $mBut.bind('click',function(){ myThis[mSub](mRec); });
	    $mBut.button();
	    $mRow.append($mBut);
	    $mCell.append($mRow);
	}else if(mF.type == 'image'){
	    $mRow = $(document.createElement('p'));
	    var $mImg = myThis.readRowImage(mF);
	    $mRow.append($mImg);
	    $mRow.append(this.clearBr());
	    $mCell.append($mRow);
	}else{
	    $mRow = $(document.createElement('p'));
	    if(mF.label){
		$mLab = $(document.createElement('span')).addClass('detailLabel');
		$mLab.html(mF.label + ':');
		$mRow.append($mLab);
	    }
	    $mVal = $(document.createElement('span')).addClass('detailValue');
	    $mVal.html(mRec[mF.name]);
	    $mRow.append($mVal);
	    $mRow.append(this.clearBr());
	    $mCell.append($mRow);
	}
    }
    return $mCell;
};

ActClass.prototype.menuBody = function(){
    var myThis = this;
    var mMode = 'List';
    var $mDiv = $(document.createElement('div')).addClass('pad5');
    //$mDiv.append( $(document.createElement('h2')).html(this.label + ' Menu') );
    var $mUl = $(document.createElement('ul')).attr({'data-role':'listview','data-theme':'c','data-divider-theme':'b','data-inset':'true'});
    var $mLi = $( document.createElement('li') ).attr({'data-role':'List-divider'}).html('Activity Select');
    $mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    var $mA = $(document.createElement('a')).html('All').attr({'href':'#mob' + mMode + '?s=all'});
    $mLi.append($mA);
    $mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Photos').attr({'href':'#mob'+mMode+'?s=photo'});
    $mLi.append($mA);
    $mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Spots').attr({'href':'#mob'+mMode+'?s=spot'});
    $mLi.append($mA);
    $mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Reports').attr({'href':'#mob'+mMode+'?s=report'});
    $mLi.append($mA);
    $mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Catch').attr({'href':'#mob'+mMode+'?s=catch'});
    $mLi.append($mA);
    $mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Discussion').attr({'href':'#mob'+mMode+'?s=disc'});
    $mLi.append($mA);
    $mUl.append($mLi);    
    $mDiv.append($mUl);
    return $mDiv;
};

ActClass.prototype.listBody = function(){
    var myThis = this;
    var mRec = this.rec;
    var mFields = this.listFields();
    var $mDiv = $(document.createElement('div'));
    var $mNode = this.listStat();
    if($mNode){
	$mDiv.append($mNode);
    }
    var $mUl = $(document.createElement('ul')).attr({'data-role':'listview','data-theme':'c','data-inset':'true'});
    for(var i=0; i<this.recList.length; i++){
	$mUl.append(this.listBodyRow(this.recList[i]));
    }
    $mDiv.append($mUl);
    return $mDiv;
};

ActClass.prototype.listStat = function(){
    var myThis = this, $mBut, $mRow;
    if(this.allowListStat){
	var $mDiv = $(document.createElement('div')).addClass('ui-grid-solo ui-bar ui-bar-e');
	if(this.count < 1){
	    $mRow = $(document.createElement('div')).html('No <strong>' + this.labelPlural + '</strong> found in current area');
	    $mDiv.append($mRow);
	    $mRow = $(document.createElement('div')).html('Try changing your ');
	    $mBut = $(document.createElement('a')).attr({'data-role':'button','data-inline':'true','data-mini':'true'}).html('Search Area').on('click', function(){ myThis.searchLocOpen();return false; });
	    $mRow.append($mBut);
	    $mDiv.append($mRow);
	    $mRow = $(document.createElement('div')).html('Try increasing your ');
	    $mBut = $(document.createElement('a')).attr({'data-role':'button','data-inline':'true','data-mini':'true'}).html('Search Radius').on('click', function(){ myThis.mapZoomOutInit();return false; });
	    $mRow.append($mBut);
	    $mDiv.append($mRow);
	}else{
	    if(this.countTotal > this.count){
		$mRow = $(document.createElement('div')).html(this.countTotal + ' <strong>' + this.labelPlural + '</strong>, showing ' + this.count);
		$mBut = $(document.createElement('a')).attr({'data-role':'button','data-inline':'true','data-mini':'true'}).html('Get More').on('click', function(){ myThis.ajaxGetRecsPage();return false; });
		$mRow.append($mBut);		
		$mDiv.append($mRow);
	    }else{
		$mRow = $(document.createElement('div')).html(this.count + ' <strong>' + this.labelPlural + '</strong> in current search area');
		$mBut = $(document.createElement('a')).attr({'data-role':'button','data-inline':'true','data-mini':'true'}).html('Expand').on('click', function(){ myThis.mapZoomOutInit();return false; });
		$mRow.append($mBut);
		$mDiv.append($mRow);
	    }
	}
	return $mDiv;
    }
    return false;
};

ActClass.prototype.listBodyRow = function(mRec){
    var myThis = this;
    var mUrl = '#mobDetail?s=' + this.name + '&k=' + mRec.id; 
    var $mLi = $(document.createElement('li'));
    var $mA = $(document.createElement('a')).attr({ 'href':mUrl }).on('click',function(){ myThis.detailOpen(mRec);return false;});
    $mA.append(this.listBodyRowContent(mRec));
    $mLi.append($mA);
    return $mLi;
};

ActClass.prototype.listBodyRowContent = function(mRec){
    var $mDiv = $(document.createElement('div'));
    var $mSpan,$mCell;
    var mSrc = this.mapIconUrlMed(mRec);
    if(mSrc){
	$mCell = $(document.createElement('div')).addClass('lvCell lvCellImg');
	$mCell.append( $(document.createElement('img')).attr({'src':mSrc,'title':this.label}) );
	$mDiv.append($mCell);
    }
    var mStr = mRec.date;
    if(mStr){
	$mDiv.append( $(document.createElement('div')).addClass('lvCell lvCellDate').html(mStr) );
    }
    mStr = mRec.username;
    if(mStr.length > 10){
	mStr = mStr.slice(0,10) + '..';
    }
    $mSpan = $(document.createElement('span')).addClass('lvCell lvCellUser').html(mStr);
    $mDiv.append($mSpan);
    mStr = mRec[this.displayField];
    if(mStr){
	if(mStr.length > 100){
	    mStr = mStr.slice(0,100) + '..';
	}
    }
    $mSpan = $(document.createElement('div')).addClass('lvCell').html(mStr);
    $mDiv.append($mSpan, this.clearBr() );
    return $mDiv;
};

ActClass.prototype.readRowImage = function(mF){
    var myThis = this;
    var mRec = this.rec;
    var mWidth = (mF.widthTemp || mF.width || '200');
    var mHeight = (mF.heightTemp || mF.height || '200');
    var mClassName = (mF.classNameTemp || mF.className || 'uImg');
    var mPhotoId = mRec[mF.name] || fbDefaultProfileId;
    var $mImg = $( document.createElement('img') ).attr( {'src':imageSource( mPhotoId ,mWidth +'x'+ mHeight),'width':mWidth,'height':mHeight} ).addClass(mClassName);
    if(this.navNext){
	$mImg.bind('click',myThis.navNextSub);
    }
    return $mImg;
};

ActClass.prototype.readRowImageNav = function(mF){
    var myThis = this,$mA;
    var mCount = this.recList.length;
    var mNext = false;
    var mPrev = false;
    var mRec = this.rec;
    $mRow = $(document.createElement('p'));
    var $mImg = myThis.readRowImage(mF);
    var mIndex = mRec.array_index;
    if(mIndex == 0){
	mNext = function(){myThis.readOpen(myThis.recList[mIndex+1])};
	$mImg.bind('click',mNext);
    }else if(mIndex == (mCount-1)){
	mPrev = function(){myThis.readOpen(myThis.recList[mIndex-1])};
    }else{
	mNext = function(){myThis.readOpen(myThis.recList[mIndex+1])};
	$mImg.bind('click',mNext);
	mPrev = function(){myThis.readOpen(myThis.recList[mIndex-1])};
    }
    if(mPrev){
	$mA = $(document.createElement('a')).addClass('prev browse left').bind('click',mPrev);;
	$mRow.append($mA);
    }
    $mRow.append($mImg);
    if(mNext){
	$mA = $(document.createElement('a')).addClass('next browse right').bind('click',mNext);;
	$mRow.append($mA);
    }
    $mRow.append(this.clearBr());
    return $mRow;
};

ActClass.prototype.readNavInit = function(){
    var myThis = this;
    this.navPrev = false;
    this.navNext = false;
    if(this.recList.length > 1){
	var lastIndex = (this.recList.length - 1);
	var mRec = this.rec;
	var mIndex = mRec.array_index;
	if( mIndex < lastIndex ){
	    this.navNextSub = function(){myThis.readOpen(myThis.recList[mIndex+1])};
	    this.navNext = $(document.createElement('a')).addClass('next browse right').bind('click',myThis.navNextSub);
	}
	if(mIndex > 0){
	    this.navPrevSub = function(){myThis.readOpen(myThis.recList[mIndex-1])};
	    this.navPrev = $(document.createElement('a')).addClass('prev browse left').bind('click',myThis.navPrevSub);;
	}
    }
    return (this.navPrev || this.navNext);
};

ActClass.prototype.secHead = function(){
    var $mHead;
    if(this.secType == 'tab'){
	var $mA = $(document.createElement('a')).attr({'href':'#tab-' + this.name + '-detail'}).html('Detail');
	$mHead = $(document.createElement('li'));
	$mHead.append($mA);
    }else{
	$mHead = $(document.createElement('h3')).html('Detail');
    }
    return $mHead;
};

ActClass.prototype.secBody = function($mDetail){
    var $mBody = $(document.createElement('div'));
    if(this.secType == 'tab'){
	$mBody.attr({'id':'tab-' + this.name + '-detail'}).addClass('tabContent');
	$mBody.append($mDetail);	
    }else{
	$mBody.append($mDetail);	
    }
    return $mBody;
};

ActClass.prototype.secHeadChild = function(){
    var myThis = this;
    if(this.secType == 'tab'){
	var $mA = $(document.createElement('a')).attr({'href':'#tab-'+ this.parentName +'-'+ this.name});
	$mA.append( $(document.createElement('span')).html(myThis.label + '(') );
	this.countNode = document.createElement('span');
	$(this.countNode).html(0);
	$mA.append(this.countNode);
	$mA.append( $(document.createElement('span')).html(')') );
	var $mLi = $(document.createElement('li'));
	$mLi.append($mA);
	return $mLi;
    }else{
	var $mH = $(document.createElement('h3'));
	$mH.append( $(document.createElement('span')).html(myThis.label + '(') );
	this.countNode = document.createElement('span');
	$(this.countNode).html(0);
	$mH.append(this.countNode);
	$mH.append( $(document.createElement('span')).html(')') );
	return $mH;
    }
};

ActClass.prototype.secBodyChild = function(){
    var myThis = this;
    if(this.secType = 'tab'){
	this.bodyNode = document.createElement('div');
	$(this.bodyNode).attr({'id':'tab-'+ this.parentName +'-'+ this.name});
    }else{
	this.bodyNode = document.createElement('div');
    }
    return $(this.bodyNode);
};

ActClass.prototype.fishCount = function(){
    if(this.rec){
	return this.rec.fish_count;
    }
    return 0;
};

ActClass.prototype.fishTab = function(){
    var myThis = this;
    var $mA = $(document.createElement('a')).attr({'href':'#' + this.tabFishBodyId +'-'+ this.name});
    $mA.append( $(document.createElement('span')).html('Fish (') );
    this.fishCountNode = document.createElement('span');
    $(this.fishCountNode).html(this.fishCount());
    $mA.append(this.fishCountNode);
    $mA.append( $(document.createElement('span')).html(')') );
    var $mLi = $(document.createElement('li'));
    $mLi.append($mA);
    return $mLi;
};

ActClass.prototype.fishH3 = function(){
    var myThis = this;
    var $mH = $(document.createElement('h3'));
    $mH.append( $(document.createElement('span')).html('Fish (') );
    $mH.append( $(document.createElement('span')).attr({'id':this.tabFishCountId +'-'+ this.name}).html(this.fishCount()) );
    $mH.append( $(document.createElement('span')).html(')') );
    return $mH;
};

ActClass.prototype.fishBody = function(){
    var myThis = this;
    this.fishBodyNode = document.createElement('div');
    $(this.fishBodyNode).attr({'id':this.tabFishBodyId +'-'+ this.name});
    return $(this.fishBodyNode);
};

ActClass.prototype.fishBodyGW = function(){
    var myThis = this;
    this.fishBodyNode = document.createElement('div');
    return $(this.fishBodyNode);
};

ActClass.prototype.editPassValidate = function(){
    this.errorClear();
    var mPassword = this.getDomInputVal('password');
    var mVerify = this.getDomInputVal('password_verify');
    if( ! mPassword ){
	this.errorMsg = 'Please enter a new Password';
	this.setFocusError('password');
	return false;
    }else if( ! mVerify ){
	this.errorMsg = 'Please verify Password';
	this.setFocusError('password_verify');
	return false;
    }else if( mPassword.length < 4 ){
	this.errorMsg = 'Password must be at least 4 characters';
	this.setFocusError('password');
	return false;
    }else if( mPassword != mVerify){
	this.errorMsg = 'Password and verify do not match';
	this.setFocusError('password');
	return false;
    }
    return true;
};

ActClass.prototype.photoId = function(){
    if(this.rec.photo_id){
	this.photo_id = this.rec.photo_id;
    }else{
	this.photo_id = fbDefaultProfileId;
    }
    return this.photo_id;
};

// filter
ActClass.prototype.filtersCurAdd = function(newFilter){
    if(this.filtersCurIsOnByGroup(newFilter.group)){
	// remove all members of this group first
	this.filtersCurDeleteByGroup(newFilter.group);
    }
    this.filtersCur.push(newFilter);
    return true;
};

ActClass.prototype.filtersCurDelete = function(mId){
    if(this.filtersCur.length > 0){
	var newList = [];
	for(var i=0; i<this.filtersCur.length; i++){
	    var mFilter = this.filtersCur[i];
	    if(mFilter.id != mId){
		newList.push(mFilter);
	    }
	}
	this.filtersCur = newList;
	return true;
    }
    return false;
};

ActClass.prototype.filtersCurDeleteByGroup = function(mGroup){
    if(this.filtersCur.length > 0){
	var newList = [];
	for(var i=0; i<this.filtersCur.length; i++){
	    var mFilter = this.filtersCur[i];
	    if(mFilter.group != mGroup){
		newList.push(mFilter);
	    }
	}
	this.filtersCur = newList;
	return true;
    }
    return false;
};

ActClass.prototype.filtersCurIsOnByGroup = function(mGroup){
    if(this.filtersCur.length > 0){
	for(var i=0; i<this.filtersCur.length; i++){
	    if(mGroup == this.filtersCur[i].group){
		return true;
	    }
	}
    }
    return false;
};

ActClass.prototype.filterInit = function(){
    if(this.allowFilter !== false){
	this.filterInitSec();
	this.filterInitFish();
    }
};

ActClass.prototype.filterInitSec = function(){
    var mSec = getCookie('fbSec');
    if(mSec){
	if(mSec.match(/^(5|10|15)$/)){
	    if(mSec == 15){
		var mFilter = this.filterOn('group');
		mFilter.labelCur = mFilter.label +' '+ getCookie('fbSecGname') +' - '+ getCookie('fbSecGid');
	    }else{
		var mId = 'friend';
		if(mSec == 10){
		    mId = 'private';
		}
		this.filterOn(mId);
	    }
	}
    }
};

ActClass.prototype.filterInitFish = function(){
    var fishId = getCookie('fbFishId');
    var fishName = getCookie('fbFishName');
    if(fishId && fishName){
	this.filterFishSet({'id':fishId,'name':fishName});
    }
};

ActClass.prototype.filterFishSet = function(mOpt){
    setCookie('fbFishId',mOpt.id);
    setCookie('fbFishName',mOpt.name);
    var mFilter = this.filterOn('fish');
    mFilter.labelCur = mFilter.label +' '+ mOpt.name;
};

// list of available filters
ActClass.prototype.filterList = function(){
    if(this.filterCfg && (this.filterCfg.length > 0) ){
	var mList = [];
	var loggedIn = userValid();
	for(var i=0; i<this.filterCfg.length; i++){
	    var mFilter = this.filterCfg[i];
	    if( (mFilter.sec == 'none') || (mFilter.sec == 'all') ){
		mList.push(mFilter);
	    }else if(mFilter.sec == 'login'){
		if(loggedIn){
		    mList.push(mFilter);
		}
	    }else if(mFilter.sec == 'guest'){
		if( ! loggedIn){
		    mList.push(mFilter);
		}
	    }
	}
	if(mList.length > 0){
	    return mList;
	}
    }
    return false;
};

// filter dashboard select menu
ActClass.prototype.filterOpen = function(){
    var myThis = this;
    this.mode = 'filter';
    this.reset();
    var $main = this.filterContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Filter ' + this.title(), buttons: this.filterButtons()
		});
    this.unfocus();
};

ActClass.prototype.unfocus = function(){
    $('.fbMenuBut').blur();
    return false; 
};

ActClass.prototype.filterContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var mCaption = 'Filters for Current Map';
    var $mRow = $( document.createElement('div') ).addClass('fbFormHead centerText').html(mCaption);
    $main.append($mRow);
    var mFilters = this.filterList();
    if(mFilters){
	for(var i=0; i<mFilters.length; i++){
	    $main.append(this.filterContentRow(mFilters[i]));
	}
	$main.append(this.filterContentRemove());
    }else{
	$main.html('No filters found');
    }
    return $main;
};

ActClass.prototype.filterContentRow = function(mFilter){
    var myThis = this;
    var $mRow = $(document.createElement('p')).addClass('mar5');
    var $mBut = $(document.createElement('button')).html(mFilter.labelMenu || mFilter.label).addClass('fbMenuBut');
    if(mFilter.type == 'sub'){
	$mBut.bind('click',function(){ myThis[mFilter.sub](); });
    }else{
	$mBut.bind('click',function(){myThis.filterOn(mFilter.id);});
    }
    $mBut.button();
    $mRow.append($mBut);
    return $mRow;
};

ActClass.prototype.filterContentRemove = function(mFilter){
    var myThis = this;
    var $mRow = $(document.createElement('p')).addClass('mar5');
    var $mBut = $(document.createElement('button')).html('Remove All Filters').addClass('fbMenuBut');
    $mBut.bind('click',function(){myThis.close();myThis.filterOffAll();});
    $mBut.button();
    $mRow.append($mBut);
    return $mRow;
};

ActClass.prototype.filterButtons = function(){
    var myThis = this;
    var mOpt = {};
    mOpt['Close'] = function(){ myThis.close(); };
    return mOpt;
};

ActClass.prototype.filterOn = function(mId){
    this.close();
    var mFilter = this.filterGet(mId);
    if(mFilter){
	if(this.filtersCurAdd(mFilter)){
	    if(mFilter.cookieName && mFilter.cookieValue){
		setCookie(mFilter.cookieName,mFilter.cookieValue);
	    }
	    this.update();
	}
	return mFilter;
    }
    return false;
};

ActClass.prototype.filterOff = function(mId){
    var mFilter = this.filterGet(mId);
    if(mFilter){
	if(mFilter.cookieName){
	    deleteCookie(mFilter.cookieName);
	}
	this.filtersCurDelete(mId);
	this.update();
    }
};

ActClass.prototype.filterOffAll = function(){
    if(this.filtersCur.length > 0){
	for(var i=0; i<this.filtersCur.length; i++){
	    var mFilter = this.filtersCur[i];
	    if(mFilter.cookieName){
		deleteCookie(mFilter.cookieName);
	    }
	    delete this.filtersCur[i];
	}
	this.filtersCur = [];
	this.update();
	return true;
    }
    return false;
};


ActClass.prototype.filterGet = function(mId){
    var myThis = this;
    var $main = this.getRoot();
    if(this.filterCfg && (this.filterCfg.length > 0) ){
	for(var i=0; i<this.filterCfg.length; i++){
	    var mFilter = this.filterCfg[i];
	    if(mId == mFilter.id ){
		return mFilter;
	    }
	}
    }
    return false;
};

ActClass.prototype.filterSecGroupOn = function(rGroup){
    setCookie('fbSecGid',rGroup.id);
    setCookie('fbSecGname',rGroup.name);
    var mFilter = this.filterOn('group');
    mFilter.labelCur = mFilter.label +' '+ rGroup.name;
};

// group select
ActClass.prototype.selectGroupOpen = function(){
    var myThis = this;
    this.mode = 'select';
    this.rec = {};
    this.reset();
    var $main = this.groupSelectContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, height:400, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: this.title(), buttons: this.groupSelectButtons()
		});
};

ActClass.prototype.groupSelectButtons = function(){
    var myThis = this;
    var mOpt = {};
    mOpt['Close'] = function(){ myThis.close(); };
    return mOpt;
};

ActClass.prototype.groupSelectContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var mCaption = 'Select one of your member Groups';
    var $mRow = $( document.createElement('div') ).addClass('fbFormHead').html(mCaption);
    $main.append($mRow);
    var mGrp = userGroups();
    if(mGrp){
	var $mTab = $(this.recTableInit());
	var $mTr = $( document.createElement('tr') );
	$mTr.append( $( document.createElement('th') ).html('Name') );
	$mTr.append( $( document.createElement('th') ).html('Caption') );
	$mTab.append($mTr);
	for(var i=0; i <mGrp.length; i++){
	    $mTab.append(this.groupSelectContentRow(mGrp[i]));
	}
    }
    $main.append($mTab);
    return $main;
};

ActClass.prototype.groupSelectContentRow = function(mRec){
    var myThis = this;
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('td') ).html(mRec.name));
    $mTr.append( $( document.createElement('td') ).html(mRec.caption));
    $mTr.bind('click',function(){ myThis.filterSecGroupOn(mRec); } );
    $mTr.bind('mouseover',function(){$(this).removeClass().addClass('jrjActive');});
    $mTr.bind('mouseout',function(){$(this).removeClass().addClass('jrjInactive');});
    return $mTr;
};

  ///////////
 // upload /
///////////
ActClass.prototype.uploadAllow = function(){
    if(userValid()){
	return true;
    }else{
	//showMsg('You need to Login or Create a New Account before you can upload a Photo');
	//ownerNew();
	return false;
    }
};

ActClass.prototype.uploadTitle = 'Upload a Photo';

ActClass.prototype.uploadOpen = function(){
    this.rootName = 'mobForm';
    this.mode = 'new';
    this.newHeader();
    this.uploadContent();
    this.newFooter();
    this.changeHash = true;
    this.changePage();
};

ActClass.prototype.uploadFields = function(){
    return jrjCfgUpload.fields;
};
ActClass.prototype.uploadFieldHash = function(){
    var mHash = {};
    var mFields = this.uploadFields();
    for(var i =0;i< mFields.length; i++){
	mHash[mFields[i].name] = mFields[i];
    }
    return mHash;
};

ActClass.prototype.uploadFormInit = function(){
    var myThis = this;
    var formOpt = {'id':'jrjUploadForm', 'action':this.urlUpload,
		   'method':'post', 'target':'upIFrame', 'name':'upForm',
		   'enctype':'multipart/form-data', 'encoding':'multipart/form-data'};
    this.uploadForm =  document.createElement('form');
    $(this.uploadForm).attr(formOpt);
    return $(this.uploadForm);
};

ActClass.prototype.uploadContent = function(){
    var myThis = this;
    var mFields = this.uploadFieldHash();
    var $main = this.reset();
    $main.append(this.errorDivCreate());
    var $mFrm = this.uploadFormInit();
    var mHead = 'Edit ' + this.label;
    if(this.isNew()){
	mHead = 'New ' + this.label;
    }
    $mFrm.append( $(document.createElement('h2')).html(mHead) );
    if( ! this.disableUploadSec){
	$mFrm.append(this.editSec());
    }
    var $mRow = $(document.createElement('div')).attr({'data-role':'fieldcontain'});
    var $mLab = $( document.createElement('label') ).attr({'for':'file'}).html('Select Photo');
    $mRow.append($mLab);
    var mInp = document.createElement('input');
    $( mInp ).attr( {'type':'file','name':'file','id':'file'} );
    $mRow.append( mInp );
    mFields.file['domElement'] = mInp;
    $mFrm.append($mRow);
    $mRow = $( document.createElement('div') ).attr({'data-role':'fieldcontain'});
    $mLab = $( document.createElement('label') ).attr({'for':'caption'}).html('Caption (optional)');
    $mRow.append($mLab);
    mInp = document.createElement('input');
    $( mInp ).attr( {'type':'text','name':'caption','id':'caption'} ).addClass(this.inputClassName());
    $mRow.append($(mInp));
    mFields.caption['domElement'] = mInp;
    $mFrm.append($mRow);

    $mRow = $( document.createElement('div') ).attr({'data-role':'fieldcontain'});
    $mLab = $( document.createElement('label') ).attr({'for':'detail'}).html('Detail (optional)');
    $mRow.append($mLab);
    mInp = document.createElement('textarea');
    $( mInp ).css('display','block').attr( {'id':'detail','name':'detail'} ).addClass(this.inputClassName());
    $mRow.append(mInp);
    mFields.detail['domElement'] = mInp;
    $mFrm.append($mRow);

    if(this.pid){
	mInp = document.createElement('input');
	$( mInp ).attr( {'type':'hidden','name':'pid','value':this.pid} );
	$mFrm.append($(mInp));
	mFields.pid['domElement'] = mInp;
    }

    mInp = document.createElement('input');
    $( mInp ).attr( {'type':'hidden','name':'lat'} );
    $mFrm.append($(mInp));
    mFields.lat['domElement'] = mInp;

    mInp = document.createElement('input');
    $( mInp ).attr( {'type':'hidden','name':'lon'} );
    $mFrm.append($(mInp));
    mFields.lon['domElement'] = mInp;

    $main.append($mFrm);

    $mRow = $( document.createElement('div') ).attr('id','upStatus').addClass('upStatus');
    $mRow.html('Click Browse above to locate the photo you wish to upload.\n<br />\nWhen you have selected a file, click Upload File below.');
    $main.append($mRow);

    $main.append(this.uploadButtons());
    
    var $mFrame = $( document.createElement('iFrame') ).attr({'id':'upIFrame','name':'upIFrame'}).css({width:0,height:0});
    $main.append($mFrame);

    return $main;
};

ActClass.prototype.uploadSubmit = function(){
    if(this.uploadValidate()){
	var mPoint = this.getCenterObj();
	var mFields = this.uploadFieldHash();
	$(mFields.lat['domElement']).val(mPoint.lat());
	$(mFields.lon['domElement']).val(mPoint.lng());
	this.uploadForm.submit();
	this.waitOpen();
    }else{
	this.errorDisplay();
    }
};

ActClass.prototype.uploadValidate = function(){
    this.errorClear();
    var mFields = this.uploadFieldHash();
    var $mFile = $(mFields.file['domElement']);
    if( $mFile.val() ){
	return true;
    }else{
	this.errorMsg = 'Please Select a File for Upload';
	$mFile.addClass('fbFormError').focus();
	return false;
    }
};

ActClass.prototype.uploadButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'back';
    var mOpt = { 'label':'Cancel', 'attr':mAttr, 'type':'button', 'sub':function(){ myThis.changePageActNew(); } };
    if(this.cancelSub){
	mOpt.sub = this.cancelSub;
    }
    mList.push(mOpt);
    mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'check';
    mList.push( { 'label':'Upload', 'sub':function(){ myThis.uploadSubmit(); }, 'attr':mAttr } );
    return this.buildButtons(mList);
};

ActClass.prototype.editFishLookup = function(){
    var mInp = document.createElement('input');
    $( mInp ).attr( {'type':'text','name':'fish_name','value':this.rec.fish_name} );
    //$(mInp).autocomplete({ minLength:1, source: function(request, response) { $.ajax({ url:"/fish/a/aLookup", dataType:"json", data:request, success: function(data) { response( data ); } }); } });
    this.setDomInput('fish_name',mInp);
    return mInp;
};

ActClass.prototype.parentLoadInit = function(){
    var myThis = this;
    if(this.cache[this.pid] == undefined){
	$.ajax({ url: this.ajaxUrlGetAll , dataType: 'json', data: {'pid':this.pid},
		    success: function(json,textStatus){ myThis.parentLoadInitCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }else{
	this.loadRecords(this.cache[this.pid]);
	this.parentLoad();
    }
};

ActClass.prototype.parentLoadInitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.cache[this.pid] = json.result;
	    this.loadRecords(json.result);
	    this.parentLoad();
	}
    }
};

// called from one object (fish1) to create another object (fish2)
// to add selected fish from fish2 to fish1
ActClass.prototype.fishSelectInit = function(){
    var mObj = this.childObjGet('fish');
    if( ! mObj){
	mObj = this.childObjNew('fish');
    }
    mObj.fishSelectTitle = 'Select Fish for ' + this.parentName;
    mObj.selectMode = 'parent';
    mObj.parent = this;
    mObj.fishSelectOpen();
    return false;
};

// initiate a persistant fish filter via cookie
ActClass.prototype.fishFilterInit = function(){
    var mObj = this.childObjGet('fish');
    if( ! mObj){
	mObj = this.childObjNew('fish');
    }
    mObj.fishSelectTitle = 'Select Fish to Filter';
    mObj.selectMode = 'filter';
    mObj.parent = this;
    mObj.fishSelectOpen();
    return false;
};

ActClass.prototype.childObjNew = function(mKey){
    var mObj = actObjRef(mKey);
    if(mObj){
	if(this.rec){
	    mObj.pid = this.rec.id;
	    mObj.owner = this.rec.username;
	}
	mObj.parentName = this.name;
	mObj.secType = this.secType;
	mObj.initAsChild();
	this.childHash[mKey] = mObj;
	this.childList.push(mObj);
	return mObj;
    }
    return false;
};

ActClass.prototype.childObjGet = function(mKey){
    var mObj = this.childHash[mKey];
    if(mObj){
	mObj.pid = this.rec.id;
	mObj.owner = this.rec.username;
	return mObj;
    }
    return false;
};

ActClass.prototype.loginNode = function(){
    var myThis = this;
    var $mRow = $( document.createElement('div') ).addClass('ui-bar ui-bar-d center');
    var $mCell = $( document.createElement('div') ).html('Already have an Account?');
    $mRow.append($mCell);
    $mCell = $( document.createElement('div') );
    var $mAnc = $( document.createElement('a') ).attr('href','/').addClass('bold blue').html('Login');
    $mAnc.bind('click',function(){ mobLogin();return false; } );
    $mCell.append($mAnc);
    $mCell.append(myThis.clearDiv());
    $mRow.append($mCell);
    return $mRow;
};

ActClass.prototype.loginCreateNode = function(){
    var myThis = this;
    var $mRow = $( document.createElement('div') ).addClass('ui-bar ui-bar-d center');
    var $mCell = $( document.createElement('div') ).html('Don\'t have an Account?');
    $mRow.append($mCell);
    $mCell = $( document.createElement('div') );
    var $mAnc = $( document.createElement('a') ).attr('href','/').addClass('bold blue').html('Create a New Account');
    $mAnc.bind('click',function(){ mobLoginNew();return false; } );
    $mCell.append($mAnc);
    $mCell.append(myThis.clearDiv());
    $mRow.append($mCell);
    return $mRow;
};

ActClass.prototype.loginResetNode = function(){
    var myThis = this;
    var $mRow = $( document.createElement('div') ).addClass('ui-bar ui-bar-d center');
    $mCell = $( document.createElement('div') ).html('Forgot Your Password or Username?');
    $mRow.append($mCell);
    $mCell = $( document.createElement('div') );
    var $mAnc = $( document.createElement('a') ).attr('href','/').addClass('bold blue').html('Reset Your Account');
    $mAnc.bind('click',function(){ mobLoginReset();return false; } );
    $mCell.append($mAnc);
    $mCell.append(myThis.clearDiv());
    $mRow.append($mCell);
    return $mRow;
};

///////////////////////////////////////////
// ActFish - Fish
///////////////////////////////////////////
ActFish.prototype = new ActClass();
ActFish.prototype.constructor = ActFish;
function ActFish() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgFish);
    this.cache = {};
}

ActFish.prototype.rootName = 'jrjDialog2';

ActFish.prototype.initAsChild = function(){
    this.cache = {};
    this.allowList = false;
    this.ajaxUrlNew = '/' + this.parentName + '/a/aFishPost';
    this.ajaxUrlEdit = '/' + this.parentName + '/a/aFishEdit';
    this.ajaxUrlDelete = '/' + this.parentName + '/a/aFishDelete';
    this.ajaxUrlGetAll = '/' + this.parentName + '/a/aFishGetAll';
};

ActFish.prototype.parentSetUrl = function(mName){
    this.ajaxUrlNew = '/' + mName + '/a/aFishPost';
    this.ajaxUrlEdit = '/' + mName + '/a/aFishEdit';
    this.ajaxUrlDelete = '/' + mName + '/a/aFishDelete';
    this.ajaxUrlGetAll = '/' + mName + '/a/aFishGetAll';
};

ActFish.prototype.permitParentFish = function(){
    if(this.owner == fbUser.username){
	return true;
    }
    return false;
};

ActFish.prototype.parentLoad = function(){
    var myThis = this;
    $(this.countNode).html(this.countTotal);
    var $mBox = $(this.bodyNode);
    $mBox.children().remove();
    if(this.permitParentFish()){
	var $mRow = $(document.createElement('div')).addClass('centerText mar5');
	var $mBut = $(document.createElement('button')).html('New Fish');
	$mBut.bind('click',function(){myThis.fishSelectInit();});
	$mBut.button();
	$mRow.append($mBut);
	$mBox.append($mRow);
    }
    var $mTab = $(document.createElement('table')).attr( {'cellspacing':0,'cellpadding':0}).addClass('jrjTable padTop5');
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('th') ).html('') );
    $mTr.append( $( document.createElement('th') ).html('name') );
    $mTr.append( $( document.createElement('th') ).html('alias') );
    $mTab.append($mTr);
    $mTbody = $(document.createElement('tbody'));
    if(this.count == 0){
	$mTr = $( document.createElement('tr') ).addClass('jrjInactive');
	$mTr.append( $( document.createElement('td') ).attr({'colspan':2}).html('No Fish yet') );
	$mTbody.append($mTr);
    }else{
	for(var i=0; i<this.recList.length; i++){
	    $mTbody.append(this.parentLoadRow(this.recList[i]));
	}
    }
    $mTab.append($mTbody);
    $mBox.append($mTab);
};

ActFish.prototype.parentLoadRow = function(mRec){
    var myThis = this;
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    var $mTd = $( document.createElement('td') ).html('X').addClass('red bold');
    $mTd.bind('click',function(){ myThis.parentDelete(mRec); } );
    $mTr.append($mTd);
    $mTd = $( document.createElement('td') ).html(mRec.name);
    $mTd.bind('click',function(){ myThis.readOpen(mRec); } );
    $mTr.append($mTd);
    $mTd = $( document.createElement('td') ).html(mRec.alias);
    $mTd.bind('click',function(){ myThis.readOpen(mRec); } );
    $mTr.append($mTd);
    $mTr.bind('mouseover',function(){$(this).removeClass().addClass('jrjActive');});
    $mTr.bind('mouseout',function(){$(this).removeClass().addClass('jrjInactive');});
    return $mTr;
};

ActFish.prototype.mapDisplay = function(){
    this.mode = 'map';
    return false;
};

ActFish.prototype.searchMapGet = function(){
    return 'n';
};

ActFish.prototype.parentSet = function(mRec){
    var myThis = this;
    if(mRec && this.pid){
	$.ajax({ url: myThis.ajaxUrlNew , dataType: 'json', data: {'fish_id':mRec.id,'pid':this.pid},
		    success: function(json,textStatus){ myThis.parentSetCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }
};

ActFish.prototype.parentSetCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.newRec(json.record);
	    this.close();
	    delete this.cache[this.pid];
	    this.parentLoad();
	}
    }
};

ActFish.prototype.parentDelete = function(mRec){
    var myThis = this;
    if(mRec && this.pid){
	$.ajax({ url: myThis.ajaxUrlDelete , dataType: 'json', data: {'fish_id':mRec.id,'pid':this.pid},
		    success: function(json,textStatus){ myThis.parentDeleteCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }
};

ActFish.prototype.parentDeleteCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.parentDeleteRec(json);
	    this.close();
	    delete this.cache[this.pid];
	    this.parentLoad();
	}
    }
};

ActFish.prototype.parentDeleteRec = function(json){
    var fishId = json.fish_id;
    if(fishId){
	var recOld = this.recHash[fishId];
	if(recOld){
	    var rec_index = recOld.array_index;
	    this.recList.splice(rec_index,1);
	    this.count = this.recList.length;
	    this.countTotal--;
	    delete this.recHash[fishId];
	    this.rec = undefined;
	    return true;
	}
    }
    return false;
};

///////////////
/// fish select
///////////////

ActFish.prototype.fishSelectOpen = function(){
    var myThis = this;
    this.mode = 'search';
    this.reset();
    var $main = this.fishSelectContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', height:400, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, buttons: this.fishSelectButtons(),
		title: myThis.fishSelectTitle
		});
    this.focus();
    $main.keyup(function(e) {
	    if (e.keyCode == 13) {
		myThis.fishSelectSubmit();
	    }
	});
};

ActFish.prototype.fishSelectButtons = function(){
    var myThis = this;
    var mOpt = {};
    mOpt['New'] = function(){ myThis.newOpen(); };
    mOpt['Search'] = function(){ myThis.fishSelectSubmit(); };
    mOpt['Close'] = function(){ myThis.close(); };
    return mOpt;
};

ActFish.prototype.fishSelectContent = function(){
    var myThis = this;
    var mInp,$mCell,$mSpan,i;
    var $main = this.getRoot();
    $main.append(this.errorDivCreate());
    var $mRow = $( document.createElement('div') ).addClass('bold black fbBorder2R pad5 mar5');
    $mRow.append( $( document.createElement('div') ).html('1) Search for a Fish') );
    $mRow.append( $( document.createElement('div') ).html('2) Click on the Fish to set value') );
    $main.append($mRow);
    var $mFrm = this.formNode();
    $mFrm.addClass('jrjSearch');
    var $mGroup = $(document.createElement('fieldset')).addClass('fbBorder3');
    var $mLegend = $(document.createElement('legend')).html('Enter Search Criteria');
    $mGroup.append($mLegend);
    var mFields = this.searchFields();
    for(i=0; i < mFields.length; i++){
	$mGroup.append(myThis.fishSelectInputCell(mFields[i]));
    }
    $mGroup.append(this.clearBr());
    $mFrm.append($mGroup,this.clearBr());
    $main.append($mFrm);
    $main.append(this.recTableNode());
    return $main;
};

ActFish.prototype.fishSelectInputCell = function(mF){
    var myThis = this;
    $mCell = $( document.createElement('div')).addClass('jrjSearchCell');	
    $mCell.append( $( document.createElement('span') ).html(mF.label) );
    $mCell.append(this.searchSym(mF));
    $mCell.append(this.clearBr());
    mInp = document.createElement('input');
    $(mInp).attr({size:5}).addClass('jrjSearchInput');
    $(mInp).bind('keyup',function(){myThis.fishSelectKeyUp(mF);});
    $mCell.append( $( mInp ) );
    this.setDomInput(mF.name,mInp);
    return $mCell;
};

ActClass.prototype.fishSelectSubmit = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mUrl = this.ajaxUrlSearch;
    var mData = {};
    mFields = this.searchFields();
    for(i=0; i < mFields.length; i++){
	var mF = mFields[i];
	var mVal = this.getDomInputVal(mF.name);
	if(mVal){
	    mData[mF.name] = mVal;
	}
    }
    $.ajax({ url: this.ajaxUrlSearch , dataType: 'json', data: mData,
	     success: function(json,textStatus){ myThis.fishSelectSubmitCB(json, textStatus); },
	     error: function(){ myThis.ajaxError(); }
	});
};

ActFish.prototype.fishSelectSubmitCB = function(json,mStatus){
    if(mStatus != 'success'){
	this.ajaxBusy = false;
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	this.ajaxBusy = false;
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    if(json.count > 0){
		this.loadRecords(json);
		this.recTableClear();
		this.fishSelectLoad();
	    }else{
		this.recTableStatus.css({'color':'red'}).html('No Fish Found');
		this.recTableClear();
	    }
	}
    }
};

ActFish.prototype.fishSelectKeyUp = function(mF){
    var mFields = this.searchFields();
    for(i=0; i < mFields.length; i++){
	var otherF = mFields[i];
	if(otherF.name != mF.name){
	    this.setDomInputVal(otherF.name,'');
	}
    }
    var mVal = this.getDomInputVal(mF.name);
    if(mVal.length > 2){
	if(mVal != mF.oldValue){
	    mF.oldValue = mVal;
	    this.fishSelectSubmit();
	}
    }
};

ActClass.prototype.fishSelectLoad = function(){
    if( (this.recTable == undefined) || (this.recTable == null) ){
	this.recTableInit();
    }
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    var mFields = this.listFields();
    $mTr.append( $( document.createElement('th') ).html('Select') );
    for(var i=0; i < mFields.length; i++){
	$mTr.append( $( document.createElement('th') ).html(mFields[i].label) );
    }
    $(this.recTable).append($mTr);
    for(var i=0; i<this.recList.length; i++){
	$(this.recTable).append(this.fishSelectRow(this.recList[i]));
    }
    return this.recTable;
};

ActFish.prototype.fishSelectRow = function(mRec){
    var myThis = this;
    var mFields = this.listFields();
    var $mTr = $( document.createElement('tr') );
    $mTr.append( $( document.createElement('td') ).html('Select').addClass('blue') );
    for(var i=0; i < mFields.length; i++){
	$mTr.append( $( document.createElement('td') ).html(mRec[mFields[i].name]) );
    }
    $mTr.bind('mouseover',function(){$(this).removeClass().addClass('jrjActive');});
    $mTr.bind('mouseout',function(){$(this).removeClass().addClass('jrjInactive');});
    if(this.selectMode == 'filter'){
	$mTr.bind('click',function(){ myThis.close(); myThis.parent.filterFishSet({'id':mRec.id,'name':mRec.name});return false; });
    }else if(this.selectMode = 'parent'){
	$mTr.bind('click',function(){ myThis.close(); myThis.parent.parentSet(mRec);return false; });
    }else{
	$mTr.bind('click',function(){ alert(myThis.selectMode);return false; });
    }
    return $mTr;
};

///////////////////
// fish select end
///////////////////

///////////////////////////////////////////
// ActAll - All Fishing Activity
///////////////////////////////////////////
ActAll.prototype = new ActClass();
ActAll.prototype.constructor = ActAll;
function ActAll() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgAll);
}

ActAll.prototype.listBody = function(){
    var myThis = this;
    var mRec = this.rec;
    var mFields = this.listFields();
    var $mDiv = $(document.createElement('div'));
    var $mNode = this.listStat();
    if($mNode){
	$mDiv.append($mNode);
    }
    var $mUl = $(document.createElement('ul')).attr({'data-role':'listview','data-theme':'c','data-inset':'true'});
    var mHash = this.actObjHash();
    for(var i=0; i<this.recList.length; i++){
	var mRec = this.recList[i];
	var mObj = mHash[mRec.fb_source];
	$mUl.append( mObj.listBodyRow(mRec) );
    }
    $mDiv.append($mUl);
    return $mDiv;
};

ActAll.prototype.mapMarkerNew = function(mRec){
    if(mRec.fb_source){
	var mObj = this.actObjHash()[mRec.fb_source];
	if(mObj){
	    return mObj.mapMarkerNew(mRec);
	}
    }
    return false;
};


ActAll.prototype.newOpen = function(){
    this.changePageActNew();
    return false;
};

ActAll.prototype.editOpen = function(){
    return false;
};

ActAll.prototype.detailOpen = function(){
    return false;
};

///////////////////////////////////////////
// ActCatch - Fish Catch Activity
///////////////////////////////////////////
ActCatch.prototype = new ActClass();
ActCatch.prototype.constructor = ActCatch;
function ActCatch() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgCatch);
    this.filterInit();
}

ActCatch.prototype.newButtonCancel = function(){
    var myThis = this;
    return function(){ myThis.changePageActNew(); };
};

///////////////////////////////////////////
// ActReport - Fishing Report Activity
///////////////////////////////////////////
ActReport.prototype = new ActClass();
ActReport.prototype.constructor = ActReport;
function ActReport() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgReport);
    this.filterInit();
}

ActReport.prototype.newButtonCancel = function(){
    var myThis = this;
    return function(){ myThis.changePageActNew(); };
};

ActReport.prototype.flagLink = function(){repFlag(this.rec.id);};
ActReport.prototype.mapLink = function(){repFlag(this.rec.id);};

///////////////////////////////////////////
// ActPhoto - Fishing Photo Activity
///////////////////////////////////////////
ActPhoto.prototype = new ActClass();
ActPhoto.prototype.constructor = ActPhoto;
function ActPhoto() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgPhoto);
    this.disableUploadSec = false;
    this.uploadType = 'none';
}

ActPhoto.prototype.mapIconUrlMed = function(mRec){
    return imageSource( mRec.id ,'25');
};

ActPhoto.prototype.newButtonCancel = function(){
    var myThis = this;
    return function(){ myThis.changePageActNew(); };
};

ActPhoto.prototype.uploadResponse = function(){
    var myThis = this;
    this.waitClose();
    var resp = {};
    var jsonTxt = $('#upIFrame').contents().find('#upResponse').val();
    if(jsonTxt){
	var resp = $.parseJSON(jsonTxt);
	if(resp){
	    if(resp.error){
		this.errorDisplay(resp.desc);
	    }else{
		this.uploadJson = resp;
		this.uploadFinish();
	    }
	}else{
	    this.errorDisplay('Server Error: Response not recognized');
	}
    }else{
	this.errorDisplay('Response not received');
    }

};

ActPhoto.prototype.uploadFinish = function(){
    this.close();
    var mResponse = this.uploadJson;
    var rImg = mResponse.record;
    if(rImg){
	this.newRec(rImg);
	if(this.isNew()){
	    if(this.uploadType == 'profile'){
		fbUser.photo_id = rImg.id;
		this.changePageTo('#mobDetail?s=userPhoto');
	    }else if(this.pid){
		this.parentLoad();
	    }else if(this.allowGeo !== false){
		this.mode = 'edit';
		this.mapEditInit();
	    }
	}
    }
};

ActPhoto.prototype.listBody = function(){
    var myThis = this;
    $mRow = $( document.createElement('div') ).addClass('mar5');
    this.imgWidth = '100';
    this.imgHeight = '100';
    this.imgClassname = 'jrjActListPhoto';
    for(var i=0; i<this.recList.length; i++){
	$mRow.append(myThis.listCell(this.recList[i]));
    }
    $mRow.append(this.clearBr());
    return $mRow;
};

ActPhoto.prototype.listCell = function(mRec){
    var myThis = this;
    var $mImg = $( document.createElement('img') ).attr( {'src':imageSource( mRec.id ,this.imgWidth +'x'+ this.imgHeight),'width':this.imgWidth,'height':this.imgHeight} ).addClass('mobListImg');
    var $mAnc = $( document.createElement('a') );
    $mAnc.append($mImg);
    $mAnc.on('click',function(){ myThis.detailOpen(mRec);return false; });
    return $mAnc;
};

ActPhoto.prototype.newOpen = function(){
    this.uploadOpen();
};

ActPhoto.prototype.ajaxNewCB = function(json,mStatus){
    ActClass.prototype.ajaxNewCB.call(this,json,mStatus);
    if(this.pid){
	delete this.cache[this.pid];
	this.parentLoad();
    }
};

ActPhoto.prototype.ajaxEditCB = function(json,mStatus){
    ActClass.prototype.ajaxEditCB.call(this,json,mStatus);
    if(this.pid){
	delete this.cache[this.pid];
	this.parentLoad();
    }
};

ActPhoto.prototype.del = function(mId){
    var myThis = this;
    mUrl = this.ajaxUrlDelete;
    if( ! mUrl){
	this.errorDisplay('No delete url');
    }else if( !mId){
	this.errorDisplay('No delete ID');
    }else{
	if(confirm('Are you sure you want to delete this ' + this.label + '?')){
	    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	    $.ajax({ url: mUrl , dataType: 'json', data: {'id':mId,'pid':myThis.pid},
			success: function(json,textStatus){ myThis.delCB(json, textStatus); },
			error: function(){ myThis.ajaxError(); }
		});
	}
    }
};

ActPhoto.prototype.delCB = function(json,mStatus){
    ActClass.prototype.delCB.call(this,json,mStatus);
    if(this.pid){
	delete this.cache[this.pid];
	this.parentLoad();
    }
};

/////////////////////////////
// for use with parent photos
/////////////////////////////

ActPhoto.prototype.initAsChild = function(){
    this.cache = {};
    this.urlUpload = '/' + this.parentName + '/a/upload';
    this.ajaxUrlNew = '/' + this.parentName + '/a/aPhotoPost';
    this.ajaxUrlEdit = '/' + this.parentName + '/a/aPhotoEdit';
    this.ajaxUrlDelete = '/' + this.parentName + '/a/aPhotoDelete';
    this.ajaxUrlGetAll = '/' + this.parentName + '/a/aPhotoGetAll';
    this.rootNameOLD = 'jrjDialog2';
    this.allowActionBar = false;
    this.allowList = false;
    this.allowGeo = false;
    this.fieldByName('mapEdit')['editShow'] = false;
    this.fieldByName('sec')['editShow'] = false;
    this.disableUploadSec = true;
};

ActPhoto.prototype.permitParentPhoto = function(){
    if(this.owner == fbUser.username){
	return true;
    }
    return false;
};

ActPhoto.prototype.parentLoad = function(){
    var myThis = this;
    $(this.countNode).html(this.countTotal);
    var $mBox = $(this.bodyNode);
    $mBox.children().remove();
    if(this.permitParentPhoto()){
	var $mRow = $(document.createElement('div')).addClass('centerText mar5');
	var $mBut = $(document.createElement('button')).html('New Photo');
	$mBut.bind('click',function(){myThis.newOpen();});
	$mBut.button();
	$mRow.append($mBut);
	$mBox.append($mRow);
    }
    if(this.count > 0){
	$mRow = $(document.createElement('div'));
	this.imgWidth = '100';
	this.imgHeight = '100';
	this.imgClassname = 'jrjActListPhoto';
	for(var i=0;i<this.recList.length;i++){
	    $mRow.append(myThis.parentLoadRow(this.recList[i]));
	}
	$mRow.append(this.clearBr());
	$mBox.append($mRow);
    }
};

ActPhoto.prototype.parentLoadRow = function(mRec){
    var myThis = this;
    this.photoCurId = mRec.id;
    var $mImg = $( document.createElement('img') ).attr( {'src':imageSource( mRec.id ,this.imgWidth +'x'+ this.imgHeight),'width':this.imgWidth,'height':this.imgHeight} ).addClass(this.imgClassname);
    $mImg.bind('click',function(){ myThis.readOpen(mRec);return false; });
    return $mImg;
};

ActPhoto.prototype.mapIconSmall = function(mRec){
    var src = imageSource(mRec.id,'25');
    this.mIconSmall =  new google.maps.MarkerImage(src, new google.maps.Size(16,16),
						   new google.maps.Point(0,0),new google.maps.Point(8,8) );
    return this.mIconSmall;
};

ActPhoto.prototype.mapIconMed = function(mRec){
    var src = imageSource(mRec.id,'25');
    this.mIconMed =  new google.maps.MarkerImage(src, new google.maps.Size(24,24),
						 new google.maps.Point(0,0),new google.maps.Point(12,12) );
    return this.mIconMed;
};

///////////////////////////////////////////
// ActSpot - Fishing Spot Activity
///////////////////////////////////////////
ActSpot.prototype = new ActClass();
ActSpot.prototype.constructor = ActSpot;
function ActSpot() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgSpot);
    this.filterInit();
}

ActSpot.prototype.newButtonCancel = function(){
    var myThis = this;
    return function(){ myThis.changePageActNew(); };
};

ActSpot.prototype.title = function(){
    return 'FishBlab Fishing Spot';
};

///////////////////////////////////////////
// ActDiscuss - Fishing Discussion Activity
///////////////////////////////////////////
ActDiscuss.prototype = new ActClass();
ActDiscuss.prototype.constructor = ActDiscuss;
function ActDiscuss() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgDisc);
    this.filterInit();
}

ActDiscuss.prototype.newButtonCancel = function(){
    var myThis = this;
    return function(){ myThis.changePageActNew(); };
};

ActDiscuss.prototype.readWaterType = function(){
    var myThis = this;
    var mRec = this.rec;
    var mType = (mRec.wtype ? mRec.wtype : 1);
    var mWaterRead = (mRec.wtype == 2 ? 'Freshwater' : 'Saltwater');
    var $mRow = $(document.createElement('p'));
    var $mLab = $(document.createElement('span')).addClass('jrjReadLabel');
    $mLab.html('Type:');
    $mRow.append($mLab);
    $mVal = $(document.createElement('span')).addClass('jrjReadValue');
    $mVal.html(mWaterRead);
    $mRow.append($mVal);
    $mRow.append(this.clearDiv());
    return $mRow;
};

ActDiscuss.prototype.readCat = function(){
    var myThis = this;
    var mRec = this.rec;
    var mId = (mRec.cat_id ? mRec.cat_id : 1);
    var mLabel = this.catLabel[0];
    for(var i=0;i < this.catValue.length; i++){
	if(this.catValue[i] == mId){
	    mLabel = this.catLabel[i];
	    break;
	}
    }
    var $mRow = $(document.createElement('p'));
    var $mLab = $(document.createElement('span')).addClass('jrjReadLabel');
    $mLab.html('Category:');
    $mRow.append($mLab);
    $mVal = $(document.createElement('span')).addClass('jrjReadValue');
    $mVal.html(mLabel);
    $mRow.append($mVal);
    $mRow.append(this.clearDiv());
    return $mRow;
};

///////////////////////////////////////////
// ActReply - Comments for all objects
///////////////////////////////////////////
ActReply.prototype = new ActClass();
ActReply.prototype.constructor = ActReply;
function ActReply() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgReply);
    this.allowGeo = false;
    this.target = 'map';
}

ActReply.prototype.rootName = 'jrjDialog3';

ActReply.prototype.initAsChild = function(){
    this.cache = {};
    this.ajaxUrlNew = '/' + this.parentName + '/a/aReplyPost';
    this.ajaxUrlEdit = '/' + this.parentName + '/a/aReplyEdit';
    this.ajaxUrlDelete = '/' + this.parentName + '/a/aReplyDelete';
    this.ajaxUrlGetAll = '/' + this.parentName + '/a/aReplyGetAll';
};

ActReply.prototype.title = function(){
    return 'Comment';
};

ActReply.prototype.newOpen = function(){
    ActClass.prototype.newOpen.call(this);
    this.setDomInputVal('pid',this.pid);
};

ActReply.prototype.parentLoad = function(){
    var myThis = this;
    $(this.countNode).html(this.countTotal);
    var $mBox = $(this.bodyNode);
    $mBox.children().remove();
    var $mRow = $(document.createElement('div')).addClass('centerText mar5');
    var $mBut = $(document.createElement('button')).html('New Comment');
    $mBut.bind('click',function(){myThis.newOpen();});
    $mBut.button();
    $mRow.append($mBut);
    $mBox.append($mRow);
    var $mTab = $(document.createElement('table')).attr( {'cellspacing':0,'cellpadding':0}).addClass('jrjTable padTop5');
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('th') ).html('Date') );
    $mTr.append( $( document.createElement('th') ).html('User') );
    $mTr.append( $( document.createElement('th') ).html('Comment') );
    $mTab.append($mTr);
    $mTbody = $(document.createElement('tbody'));
    if(this.count == 0){
	$mTr = $( document.createElement('tr') ).addClass('jrjInactive');
	$mTr.append( $( document.createElement('td') ).attr({'colspan':2}).html('No Comments yet') );
	$mTbody.append($mTr);
    }else{
	for(var i=0; i<this.recList.length; i++){
	    $mTbody.append(this.parentLoadRow(this.recList[i]));
	}
    }
    $mTab.append($mTbody);
    $mBox.append($mTab);
};

ActReply.prototype.parentLoadRow = function(mRec){
    var myThis = this;
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('td') ).html(mRec.date_create) );
    $mTr.append( $( document.createElement('td') ).html(mRec.username) );
    $mTr.append( $( document.createElement('td') ).html(mRec.content) );
    $mTr.bind('click',function(){myThis.readOpen(mRec);return false; } );
    $mTr.bind('mouseover',function(){$(this).removeClass().addClass('jrjActive');});
    $mTr.bind('mouseout',function(){$(this).removeClass().addClass('jrjInactive');});
    return $mTr;
};

ActReply.prototype.ajaxEdit = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mData = this.editFieldsAndValues();
    $.ajax({ url:this.ajaxUrlEdit, dataType: 'json', data: mData,
		success: function(json,textStatus){ myThis.ajaxEditCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActReply.prototype.ajaxNew = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mData = this.editFieldsAndValues();
    $.ajax({ url:this.ajaxUrlNew, dataType: 'json', data: mData,
		success: function(json,textStatus){ myThis.ajaxNewCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActReply.prototype.ajaxEditCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    delete this.cache[this.pid];
	    this.editRec(json.record);
	    this.close();
	    this.parentLoad();
	}
    }
};

ActReply.prototype.ajaxNewCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    delete this.cache[this.pid];
	    this.newRec(json.record);
	    this.close();
	    if(this.target == 'gw'){
		this.parentLoadInit();
	    }else{
		this.parentLoad();
	    }
	}
    }
};

ActReply.prototype.del = function(mId){
    var myThis = this;
    mUrl = this.ajaxUrlDelete;
    if( ! mUrl){
	this.errorDisplay('No delete url');
    }else if( !mId){
	this.errorDisplay('No delete ID');
    }else{
	if(confirm('Are you sure you want to delete this ' + this.label + '?')){
	    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	    $.ajax({ url: mUrl , dataType: 'json', data: {'id':mId,'pid':this.pid},
			success: function(json,textStatus){ myThis.delCB(json, textStatus); },
			error: function(){ myThis.ajaxError(); }
		});
	}
    }
};

ActReply.prototype.delCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    delete this.cache[this.pid];
	    this.deleteRec(json.id);
	    this.close();
	    this.parentLoad();
	}
    }
};

///////////////////////////////////////////
// ActUser - FishBlab User Activity
///////////////////////////////////////////
ActUser.prototype = new ActClass();
ActUser.prototype.constructor = ActUser;
function ActUser() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgUser);
    this.filterInit();
}

ActUser.prototype.detailInit = function(mUsername){
    var myThis = this;
    $.ajax({ url: '/user/a/aGetUserPub', dataType: 'json', data: { 'username':mUsername},
		success: function(json,textStatus){ myThis.detailInitCB(json,textStatus); },
		error: function(){ myThis.ajaxError();}
	});
};

ActUser.prototype.detailInitCB = function(json,textStatus){
    if(textStatus != 'success'){
	alert('Update failed: system error. Please try again');
    }else{
	this.allowSamePageTransition = true;
	this.transition = 'none';
	this.detailOpen(json.record);
    }
};

ActUser.prototype.changePageUrl = function(){
    if(this.mode == 'detail'){
	return '#u?' + this.rec.username;
    }else{
	return ActClass.prototype.changePageUrl.call(this);
    }
};

ActUser.prototype.newOpen = function(){
    return false;
};

ActUser.prototype.ajaxGetRecCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.setFocusError('name');
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    var mRec = json.record;
	    var mRecs = {'count':1,'records':[mRec],'count_total':1,'record_offset':0,'record_limit':10};
	    var mLatLon = new google.maps.LatLng(mRec.lat,mRec.lon);
	    if(this.mode == 'status'){
		this.friendStatOpen(mRec);
	    }else{
		this.detailOpen(mRec);
	    }
	}
    }
};

ActUser.prototype.detailButtons = function(){
    var myThis = this;
    var mRec = this.rec;
    var mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'back';
    mAttr['href'] = '/..';
    var $mRow = $(document.createElement('div'));
    var $mBut = $(document.createElement('button')).attr(mAttr).html('Close').bind('click', function(){ myThis.listOrMap();return false; } ) ;
    $mRow.append($mBut);
    $mBut = myThis.friendStatusBut();
    if($mBut){
	$mRow.append($mBut);
    }
    return $mRow;
};

ActUser.prototype.friendStatusBut = function(){
    var myThis = this;
    var mRec = this.rec;
    if(fbUser.username != mRec.username){
	var mStatus = 'Add Friend';
	mRec.friend_action = 'add';
	if(mRec.friend_status){
	    if(mRec.friend_status == 'block_from'){
		mStatus = 'You are Blocked';
		mRec.friend_action = 'block_from';
	    }else if(mRec.friend_status == 'block_to'){
		mStatus = 'Unblock User';
		mRec.friend_action = 'unblock';
	    }else if(mRec.friend_status == 'friend'){
		mStatus = 'Remove Friend';
		mRec.friend_action = 'remove';
	    }else if(mRec.friend_status == 'request_from'){
		mStatus = 'Request Pending';
		mRec.friend_action = 'request_from';
	    }else if(mRec.friend_status == 'request_to'){
		mStatus = 'Allow Friend Request';
		mRec.friend_action = 'request_allow';
	    }
	}
	var mAttr = this.defaultButtonAttr();
	mAttr['data-icon'] = 'arrow-r';
	var $mBut = $(document.createElement('button')).attr(mAttr).html(mStatus).bind('click', function(){ myThis.friendStatOpen(mRec); } );
	return $mBut;
    }
    return false;
};

ActUser.prototype.friendReadStatus = function(){
    var mStatus = 'Not Yet Friends';
    if(this.rec){
	if(this.rec.username == fbUser.username){
	    mStatus = 'Your Own Best Friend';
	}else if(this.rec.friend_status){
	    if(this.rec.friend_status == 'block_from'){
		mStatus = 'User is Blocking You';
	    }else if(this.rec.friend_status == 'block_to'){
		mStatus = 'User Blocked by You';
	    }else if(this.rec.friend_status == 'friend'){
		mStatus = 'User is Your Friend';
	    }else if(this.rec.friend_status == 'request_from'){
		mStatus = 'Your request is pending';
	    }else if(this.rec.friend_status == 'request_to'){
		mStatus = 'User Requested to be Your Friend';
	    }
	}
    }
    return mStatus;
};

ActUser.prototype.friendReadStatusRow = function(){
    var $mRow = $(document.createElement('p'));
    var $mLab = $(document.createElement('span')).addClass('detailLabel').html('Friend Status:');
    $mRow.append($mLab);
    var $mVal = $(document.createElement('span')).addClass('detailValue').html(this.friendReadStatus());
    $mRow.append($mVal);
    $mRow.append(this.clearBr());
    return $mRow;
};

ActUser.prototype.friendStatOpen = function(mRec){
    var myThis = this, mButSub;
    var mStatus = mRec.friend_action;    
    var mButLabel = 'Add';
    var mMsg = 'Add Friend';
    if(mStatus == 'request_allow'){
	mButSub = function(){ myThis.friendStatEdit('allow');return false;};
	mButLabel = 'Allow Friend Request';
	mMsg = 'Allow this Friend request';
    }else if(mStatus == 'ignore'){ // NA
	mButSub = function(){ myThis.friendStatEdit('ignore'); };
	mButLabel = 'Ignore User';
	mMsg = 'Ignore this Friend request';
    }else if(mStatus == 'block_from'){ // NA
	mButSub = false;
	mButLabel = 'Blocked';
	mMsg = 'This User is Blocking You';
    }else if(mStatus == 'block_to'){ // NA
	mButLabel = 'Block User';
	mButSub = function(){ myThis.friendStatEdit('block'); };
	mMsg = 'Block this User from contacting you';
    }else if(mStatus == 'unblock'){
	mButLabel = 'Unblock User';
	mButSub = function(){ myThis.friendStatEdit('unblock'); };
	mMsg = 'Unblock this User';
    }else if(mStatus == 'remove'){
	mButLabel = 'Remove Friend';
	mButSub = function(){ myThis.friendStatRemove(); };
	mMsg = 'Remove this User as your Friend';
    }else if(mStatus == 'add'){
	mButLabel = 'Add Friend';
	mButSub = function(){ myThis.friendStatAdd(); return false; };
	mMsg = 'Add '+ mRec.username +' as your FishBlab Friend?';
    }else if(mStatus == 'request_from'){
	mButLabel = 'Request Pending';
	mButSub = false;
	mMsg = 'Your Friend Request to '+ mRec.username +' is Pending';
    }
    JRJ.win.popup = new MobPopFriend();
    JRJ.win.popup.rec = mRec;
    JRJ.win.popup.butSub = mButSub;
    JRJ.win.popup.butLabel = mButLabel;
    JRJ.win.popup.msg = mMsg;
    JRJ.win.popup.open();
    return false;
};

ActUser.prototype.friendStatEdit = function(mAction){
    var myThis = this;
    var mUsername = this.rec.username;
    $.ajax({ url: '/user/a/aFriReqAct', dataType: 'json', data: { 'username':mUsername, 'req_action':mAction},
		success: function(json,textStatus){ myThis.friendStatEditCB(json,textStatus); },
		error: function(){ myThis.ajaxError();}
	});
};

ActUser.prototype.friendStatEditCB = function(json,textStatus){
    this.popupClose();
    if(textStatus != 'success'){
	alert('Update failed: system error. Please try again');
    }else{
	var mMsg = json.desc; 
	if(json.friend_status){
	    this.rec.friend_status = json.friend_status;
	}
	//showMsg(mMsg);
    }
};

ActUser.prototype.friendStatAdd = function(){
    var myThis = this;
    var mNote = this.getDomInputVal('friend_note');
    $.ajax({ url: '/user/a/aFriReqAdd', dataType: 'json', data: { 'username':this.rec.username, 'note':mNote},
		success: function(json,textStatus){ myThis.friendStatEditCB(json,textStatus); },
		error: function(){ myThis.ajaxError();}
	});
};

ActUser.prototype.friendStatRemove = function(){
    var myThis = this;
    $.ajax({ url: '/user/a/aFriDel', dataType: 'json', data: { 'username':this.rec.username},
		success: function(json,textStatus){ myThis.friendStatEditCB(json,textStatus); },
		error: function(){ myThis.ajaxError();}
	});
};

ActUser.prototype.friendStatEditCB = function(json,textStatus){
    this.popupClose();
    if(textStatus != 'success'){
	alert('Update failed: system error. Please try again');
    }else{
	var mMsg = json.desc; 
	if(json.friend_status){
	    this.rec.friend_status = json.friend_status;
	}
	//showMsg(mMsg);
    }
};

///////////////////////////////////////////
// ActOwner - FishBlab Account New or Edit
///////////////////////////////////////////
ActOwner.prototype = new ActClass();
ActOwner.prototype.constructor = ActOwner;
function ActOwner() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgOwner);
    this.rec = fbUser;
    this.childList = [];
    this.childHash = {};
}

ActOwner.prototype.changePageUrlSource = function(){
    if(this.mode == 'new'){
	return 'userNew';
    }else if(this.mode == 'edit'){
	return 'userEdit';
    }else{
	return 'userDetail';
    }
};

ActOwner.prototype.newHeader = function(){
    var myThis = this;
    $('#mobFormHeader').html('Create a FishBlab Account');
    $('#mobFormHome').unbind().bind('click', function(){ myThis.changePageHome();return false; });
    $('#mobFormMenu').off().on('click', function(){myThis.changePageTo('#mobMenu?s=account');return false; });
};

ActOwner.prototype.editHeader = function(){
    var myThis = this;
    $('#mobFormHeader').html('Edit My Account');
    $('#mobFormHome').unbind().bind('click', function(){ myThis.changePageHome();return false; });
    $('#mobFormMenu').off().on('click', function(){myThis.changePageTo('#mobMenu?s=account');return false; });
};

ActOwner.prototype.detailHeader = function(){
    var myThis = this;
    $('#mobDetailBut').empty().html('My Profile')
    $('#mobDetailHome').off().on('click', function(){ myThis.changePageHome();return false; } );
    $('#mobDetailMenu').off().on('click', function(){myThis.changePageTo('#mobMenu?s=account');return false; });
};

ActOwner.prototype.ajaxGetUserEdit = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    $.ajax({ url: '/user/a/aGetUser', dataType: 'json',
		success: function(json,textStatus){ myThis.ajaxGetUserCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActOwner.prototype.ajaxGetUserCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.editOpen(json.record);
	}
    }
};

ActOwner.prototype.emailStop = function(mEmail){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    $.ajax({ url: '/user/a/aEmailStop', dataType: 'json','data':{'email':mEmail},
	    success: function(json,textStatus){ myThis.emailStopCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActOwner.prototype.emailStopCB = function(json,mStatus){
    this.ajaxBusy = false;
    this.emailStopOpen();
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    $(this.msgText).html(json.desc);
	}
    }

};

ActOwner.prototype.emailStopOpen = function(){
    var myThis = this;
    this.reset();
    var $main = this.emailStopContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Stop All FishBlab Email', buttons: this.closeButtons()
		});
};

ActOwner.prototype.emailStopContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    $main.append(this.errorDivCreate());
    $mRow = $( document.createElement('div') ).addClass('frmSwitchLink fbBorder5');
    this.msgText = document.createElement('div');
    $mRow.append(this.msgText);
    $main.append($mRow);
    return $main;
};

ActOwner.prototype.title = function(){
    return this.titleStr;
};

ActOwner.prototype.mapWinOpenInit = function(){
    var mRec = this.rec;
    this.mapClear();
    fbActOwnerMarker = this.mapMarkerNew(mRec);
    var mLatLon = fbActOwnerMarker.getPosition();
    JRJ.map.googleMap.panTo(mLatLon);
    this.mapWinOpen(mRec);
};

ActOwner.prototype.editRec = function(recNew){
    fbUser = recNew;
    fbActOwnerMarker = this.mapMarkerNew(fbUser);
    this.rec = fbUser;
};

ActOwner.prototype.newRec = function(recNew){
    fbUser = recNew;
    fbActOwnerMarker = this.mapMarkerNew(fbUser);
    this.rec = fbUser;
};

ActOwner.prototype.dirty = function(json,mStatus){
    return true;
};

ActOwner.prototype.validate = function(){
    if(this.mode == 'new'){
	return this.newValidate();
    }else if(this.mode == 'edit'){
	return this.editValidate();
    }
};

ActOwner.prototype.newContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(this.loginNode());
    $main.append(this.errorDivCreate());
    $main.append(this.editForm());    
    $main.append(this.newButtons());
    return $main;
};

ActOwner.prototype.newButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'sub':function(){ myThis.changePageHome(); } } );
    mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Create', 'attr':mAttr, 'sub':function(){ myThis.newSubmit(); } } );
    return this.buildButtons(mList);
};

ActOwner.prototype.newValidate = function(){
    return this.newUserValidate();
};

ActOwner.prototype.editValidate = function(){
    return this.editUserValidate();
};

ActOwner.prototype.editButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'sub':function(){ myThis.changePageTo('#mobMenu?s=account'); } } );
    mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Save', 'attr':mAttr, 'sub':function(){ myThis.editSubmit(); } } );
    return this.buildButtons(mList);
};

ActOwner.prototype.ajaxEditCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    if(json.desc.match(/^email exists/i)){
		this.setFocusError('email');
	    }else{
		this.setFocusError('username');
	    }
	    this.errorMsg = json.desc;
	    this.errorDisplay();

	}else{
	    fbUser = json.record;
	    loadUser(fbUser);
	    this.changePageTo('#mobMenu?s=account');
	}
    }
};

ActOwner.prototype.ajaxNewCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    if(json.desc.match(/^email exists/i)){
		this.setFocusError('email');
	    }else{
		this.setFocusError('username');
	    }
	    this.errorMsg = json.desc;
	    this.errorDisplay();

	}else{
	    fbUser = json.record;
	    loadUser(fbUser);
	    mobHomeRefresh();
	    this.changePageHome();
	}
    }
};

ActOwner.prototype.mapIconSmallNA = function(mRec){
    var imgId = fbDefaultProfileId;
    if(mRec.photo_id){
	imgId = mRec.photo_id;
    }
    var src = imageSource(imgId,'16');
    this.mIconSmall =  new google.maps.MarkerImage(src, new google.maps.Size(16,16),
						   new google.maps.Point(0,0),new google.maps.Point(8,8) );
    return this.mIconSmall;
};

ActOwner.prototype.mapIconSmallNA = function(mRec){
    var imgId = fbDefaultProfileId;
    if(mRec.photo_id){
	imgId = mRec.photo_id;
    }
    var src = imageSource(imgId,'25');
    this.mIconSmall =  new google.maps.MarkerImage(src, new google.maps.Size(24,24),
						   new google.maps.Point(0,0),new google.maps.Point(12,12) );
    return this.mIconSmall;
};

ActOwner.prototype.detailButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mAttr['data-icon'] = 'back';
    mAttr['href'] = '/..';
    mList.push( { 'label':'Back', 'attr':mAttr, 'type':'button', 'sub':function(){ return myThis.changePageHome(); } } );
    if(fbUser.jrjSec || (this.rec.username == fbUser.username) ){
	mAttr = this.defaultButtonAttr();
	mAttr['data-icon'] = 'gear';
	mList.push( { 'label':'Edit', 'sub':function(){ myThis.ajaxGetUserEdit(); }, 'attr':mAttr } );
    }
    return this.buildButtons(mList);
};

///////////////////////////////////////////
// ActOwnerEmail - Edit User Email Settings
///////////////////////////////////////////
ActOwnerEmail.prototype = new ActClass();
ActOwnerEmail.prototype.constructor = ActOwnerEmail;
function ActOwnerEmail() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgOwnerEmail);
    this.statusTitle = 'Your FishBlab Email Settings';
    this.rec = fbUser;
}

ActOwnerEmail.prototype.changePageUrlSource = function(){
    return 'userEditEmail';
};

ActOwnerEmail.prototype.editHeader = function(){
    var myThis = this;
    $('#mobFormHeader').html('Email Options');
    $('#mobFormHome').off().on('click', function(){ myThis.changePageTo('#mobMenu?s=account');return false; });
};

ActOwnerEmail.prototype.editButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'sub':function(){ myThis.changePageTo('#mobMenu?s=account'); } } );
    mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Save', 'attr':mAttr, 'sub':function(){ myThis.editSubmit(); } } );
    return this.buildButtons(mList);
};

ActOwnerEmail.prototype.ajaxEditCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    fbUser = json.record;
	    this.changePageTo('#mobMenu?s=account');
	}
    }
}

///////////////////////////////////////////
// ActOwnerEmailStop - Stop Email
///////////////////////////////////////////
ActOwnerEmailStop.prototype = new ActClass();
ActOwnerEmailStop.prototype.constructor = ActOwnerEmailStop;
function ActOwnerEmailStop(mEmail) {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgOwnerEmailStop);
    this.statusTitle = 'Stop all FishBlab Emails';
    if(mEmail == 'undefined'){
	mEmail = false;
    }
    this.email = mEmail;
    this.rec = {'id':mEmail};
}

ActOwnerEmailStop.prototype.changePageUrl = function(){
    var mUrl = '#' + this.rootName + '?s=' + this.changePageUrlSource();    
    if( this.urlAddKey && this.changeMode ){
	if( this.changeMode.match(/(edit|detail)/) ){
	    mUrl += '&k=' + this.email;
	}
    }
    return mUrl;
};

ActOwnerEmailStop.prototype.changePageUrlSource = function(){
    return 'userEmailStop';
};

ActOwnerEmailStop.prototype.editHeader = function(){
    var myThis = this;
    $('#mobFormHeader').html('Stop FishBlab Email');
    $('#mobFormHome').off().on('click', function(){ myThis.changePageHome();return false; });
};

ActOwnerEmailStop.prototype.editForm = function(){
    var mRec = this.rec, mMsg;
    var $mFrm = this.formNode();
    var $mRow = $( document.createElement('h3') ).addClass('ui-grid-solo').html('Stop All FishBlab.com Emails');
    $mFrm.append($mRow);
    $mRow = $( document.createElement('div') ).addClass('pad10 mar10');
    if(this.email){
	mMsg = 'Choose Stop All Email below to unsubscribe the address: ' + this.email;
    }else{
	mMsg = 'Error: Email address not found';
    }
    $mRow.html(mMsg);
    $mFrm.append($mRow);
    return $mFrm;
};

ActOwnerEmailStop.prototype.editButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'sub':function(){ myThis.changePageHome();return false; } } );
    if(this.email){
	mAttr = this.defaultButtonAttr();
	mList.push( { 'label':'Stop All Email', 'attr':mAttr, 'sub':function(){ myThis.editSubmit(); } } );
    }
    return this.buildButtons(mList);
};

ActOwnerEmailStop.prototype.ajaxEdit = function(){
    var myThis = this;
    $.ajax({ url: '/user/a/aEmailStop', dataType: 'json', data: {'email':this.email},
	     success: function(json,textStatus){ myThis.ajaxEditCB(json, textStatus); },
	     error: function(){ myThis.ajaxError(); }
	});
};

ActOwnerEmailStop.prototype.ajaxEditCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.changePageHome();
	}
    }
}

///////////////////////////////////////////
// ActOwnerReq - User responds to friend request
///////////////////////////////////////////
ActOwnerReq.prototype = new ActClass();
ActOwnerReq.prototype.constructor = ActOwnerReq;
function ActOwnerReq(mUsernameFrom) {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgOwnerReq);
    this.statusTitle = 'Respond to Friend Request';
    this.rec = {};
    this.usernameFrom = mUsernameFrom;
}

ActOwnerReq.prototype.editOpenInit = function(mUsernameFrom){
    var myThis = this;
    this.mode = 'edit';
    $.ajax({ url: '/user/a/aGetFriReq', dataType: 'json', data: { 'username_from':mUsernameFrom },
		success: function(json,textStatus){ myThis.editOpenInitCB(json,textStatus); },
		error: function(){ myThis.ajaxError();}
	});
};

ActOwnerReq.prototype.editOpenInitCB = function(json,textStatus){
    this.ajaxBusy = false;
    if(json.error){
	this.json_error = true;
	this.json_error_msg = json.desc;
    }
    this.editOpen(json.record);
};

ActOwnerReq.prototype.changePageUrl = function(){
    var mUrl = '#' + this.rootName + '?s=' + this.changePageUrlSource();    
    if( this.urlAddKey && this.changeMode ){
	if( this.changeMode.match(/(edit|detail)/) ){
	    mUrl += '&k=' + this.usernameFrom;
	}
    }
    return mUrl;
};

ActOwnerReq.prototype.changePageUrlSource = function(){
    return 'userReq';
};

ActOwnerReq.prototype.editHeader = function(){
    var myThis = this;
    $('#mobFormHeader').html('Respond to Friend Request');
    $('#mobFormHome').off().on('click', function(){ myThis.changePageHome();return false; });
};

ActOwnerReq.prototype.editForm = function(){
    var mRec = this.rec, mMsg;
    var $mFrm = this.formNode();
    var $mRow = $( document.createElement('div') ).addClass('ui-grid-solo ui-bar ui-bar-e center').html('Friend Request from ' + this.username_from);
    $mFrm.append($mRow);
    $mRow = $( document.createElement('div') ).addClass('center pad10 mar10');
    if(this.json_error){
	mMsg = 'Error: ' + this.json_error_msg;
    }else{
	mMsg = 'You have a Friend request from ' + this.username_from + '. If you accept this request you will be able to see this Users <i>Friends Only</i> posts.';
    }
    $mRow.html(mMsg);
    $mFrm.append($mRow);
    return $mFrm;
};

ActOwnerReq.prototype.editButtons = function(){
    var myThis = this;
    var mList = [], mAttr;
    if(this.json_error){
	mAttr = this.defaultButtonAttr();
	mAttr['data-inline'] = 'true';
	mAttr['data-theme'] = 'c';
	mList.push( { 'label':'Close', 'attr':mAttr, 'sub':function(){ myThis.changePageHome();return false; } } );
    }else{
	mAttr = this.defaultButtonAttr();
	mAttr['data-inline'] = 'true';
	mList.push( { 'label':'Allow', 'attr':mAttr, 'sub':function(){ myThis.friendStatEdit('allow');return false; } } );
	mAttr = this.defaultButtonAttr();
	mAttr['data-inline'] = 'true';
	mAttr['data-theme'] = 'e';
	mList.push( { 'label':'Block', 'attr':mAttr, 'sub':function(){ myThis.friendStatEdit('block');return false; } } );
	mAttr = this.defaultButtonAttr();
	mAttr['data-inline'] = 'true';
	mAttr['data-theme'] = 'c';
	mList.push( { 'label':'Ignore', 'attr':mAttr, 'sub':function(){ myThis.friendStatEdit('ignore');return false; } } );
    }
    return this.buildButtons(mList);
};

ActOwnerReq.prototype.friendStatEdit = function(mAction){
    var myThis = this;
    var mUsername = this.usernameFrom;
    $.ajax({ url: '/user/a/aFriReqAct', dataType: 'json', data: { 'username':mUsername, 'req_action':mAction},
		success: function(json,textStatus){ myThis.friendStatEditCB(json,textStatus); },
		error: function(){ myThis.ajaxError();}
	});
};

ActOwnerReq.prototype.friendStatEditCB = function(json,textStatus){
    if(textStatus != 'success'){
	alert('Update failed: system error. Please try again');
    }else{
	var mMsg = json.desc; 
	if(json.friend_status){
	    this.rec.friend_status = json.friend_status;
	}
	this.changePageHome();
    }
};

///////////////////////////////////////////
// ActOwnerPhoto - User Photo Upload/View/Delete
///////////////////////////////////////////
ActOwnerPhoto.prototype = new ActClass();
ActOwnerPhoto.prototype.constructor = ActOwnerPhoto;
function ActOwnerPhoto() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgOwnerPhoto);
    this.statusTitle = 'Change Your Profile Photo';
}

ActOwnerPhoto.prototype.changePageUrlSource = function(){
    return 'userPhoto';
};

ActOwnerPhoto.prototype.detailHeader = function(){
    var myThis = this;
    $('#mobDetailHeader').html('My Profile Photo');
    $('#mobDetailHome').off().on('click', function(){ myThis.changePageHome();return false; });
    $('#mobDetailMenu').off().on('click', function(){ myThis.changePageTo('#mobMenu?s=account');return false; });
};

ActOwnerPhoto.prototype.detailBody = function(){
    var myThis = this;
    var mRec = this.rec;
    var mWidth = '300';
    var mHeight = '300';
    var mFields = this.readFields();
    var $mBody = $(document.createElement('div')).addClass('fbBorder1 pad5');
    var $mRow = $(document.createElement('p'));
    var $mImg = $( document.createElement('img') ).attr( {'src':imageSource(myThis.photoId(),mWidth + 'x' + mHeight),'width':mWidth,'height':mHeight} ).addClass('uImg');
    $mRow.append($mImg);
    $mBody.append($mRow);
    return $mBody;
};

ActOwnerPhoto.prototype.detailButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Back', 'attr':mAttr, 'sub':function(){ myThis.changePageTo('#mobMenu?s=account'); } } );
    mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'New', 'attr':mAttr, 'sub':function(){ myThis.newOpen();return false; } } );
    if(this.rec.photo_id){
	mAttr = this.defaultButtonAttr();
	mList.push( { 'label':'Delete', 'attr':mAttr, 'sub':function(){ myThis.del(); } } );
    }
    return this.buildButtons(mList);
};

ActOwnerPhoto.prototype.newOpen = function(){
    var myThis = this;
    var mObj = this.childObjGet('photo');
    if( ! mObj){
	mObj = this.childObjNew('photo');
    }
    mObj.uploadType = 'profile';
    mObj.urlUpload = '/user/a/upload';
    mObj.cancelSub = function(){ myThis.changePageTo('#mobDetail?s=userPhoto'); };
    mObj.newHeader = function(){
	var myThis = this;
	$('#mobFormHeader').html('Upload New Profile Photo');
	$('#mobFormHome').off().on('click', function(){ myThis.changePageTo('#mobDetail?s=userPhoto');return false;} );
    };
    mObj.uploadOpen();
};

ActOwnerPhoto.prototype.del = function(){
    var myThis = this;
    if( confirm('Are you sure you want to remove your Profile photo?') ){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	$.ajax({'url':'/user/a/aDeletePhoto', data:{ photo_id:this.rec.photo_id }, 
		    success: function(json,textStatus){ myThis.delCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); },
		    'dataType': 'json'
			});
    }
};

ActOwnerPhoto.prototype.delCB = function(json,textStatus){
    this.ajaxBusy = false;
    if(json.error){
	alert(json.desc);
    }else{
	fbUser.photo_id = false;
	this.changePageTo('#mobDetail?s=userPhoto');
    }
};
//////////////////
/// end ActOwnerPhoto
/////////////////

///////////////////////////////////////////
// ActLogin - user Login form
///////////////////////////////////////////
ActLogin.prototype = new ActClass();
ActLogin.prototype.constructor = ActLogin;
function ActLogin() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgLogin);
    this.statusTitle = 'Login';
}

ActLogin.prototype.newHeader = function(){
    var myThis = this;
    $('#mobFormHeader').html('Login to FishBlab');
    $('#mobFormHome').unbind().bind('click', function(){ myThis.changePageHome();return false; });
};

ActLogin.prototype.newTitle = function(){
    return 'Login to FishBlab';
};

ActLogin.prototype.newContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(myThis.loginCreateNode());
    $main.append(this.errorDivCreate());
    $main.append(this.editForm());
    $main.append(myThis.loginResetNode());
    $main.append(myThis.newButtons());
    return $main;
};

ActLogin.prototype.newButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'sub':function(){ myThis.changePageHome(); } } );
    mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Login', 'attr':mAttr, 'sub':function(){ myThis.loginSubmit(); } } );
    return this.buildButtons(mList);
};

ActLogin.prototype.validate = function(){
    this.errorClear();
    var mUsername = this.getDomInputVal('username');
    var mPassword = this.getDomInputVal('password');
    if( ! mUsername ){
	this.errorMsg = 'Please enter a Username';
	this.setFocusError('username');
	return false;
    }else if( ! mPassword ){
	this.errorMsg = 'Please enter a Password';
	this.setFocusError('password');
	return false;
    }
    return true;
};

ActLogin.prototype.loginSubmit = function(){
    if(this.validate()){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	var myThis = this;
	var mData = {'username':this.getDomInputVal('username'),'password':this.getDomInputVal('password')};
	$.ajax({ url: '/user/a/aLoginUser',	dataType: 'json', data:mData,
		    success: function(json,textStatus){ myThis.loginSubmitCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }else{
	this.errorDisplay();
    }
};

ActLogin.prototype.loginSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    if(json.error_desc == 'user_not_found'){
		this.errorMsg = 'Username not found';
		this.setFocusError('username');
	    }else if(json.error_desc == 'password_invalid'){
		this.errorMsg = 'Password is invalid';
		this.setFocusError('password');
	    }else{
		this.errorMsg = json.desc;
	    }
	    this.errorDisplay();
	}else{
	    fbUser = json.record;
	    loadUser(fbUser);
	    mobHomeRefresh();
	    this.changePageHome();
	}
    }
};

///////////////////////////////////////////
// ActLoginReset - user Login reset multi-form process
///////////////////////////////////////////
ActLoginReset.prototype = new ActClass();
ActLoginReset.prototype.constructor = ActLoginReset;
function ActLoginReset() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgLoginReset);
    this.statusTitle = 'Login Reset';
}

ActLoginReset.prototype.newHeader = function(){
    $('#mobFormHeader').html('Reset Your FishBlab Password');
};

ActLoginReset.prototype.editTitle = function(){
    return 'Reset Your Password';
};

ActLoginReset.prototype.resetStartOpen = function(){
    if(userValid()){ return false; }
    var myThis = this;
    this.reset();
    this.newHeader();
    this.resetStartContent();
    this.newFooter();
    this.changePage();
};

ActLoginReset.prototype.resetStartContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    $main.append(myThis.loginCreateNode());
    $main.append(this.errorDivCreate());
    $main.append(this.editForm());
    $main.append(this.resetStartButtons());
    return $main;
};

ActLoginReset.prototype.resetStartButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'sub':function(){ myThis.changePageHome(); } } );
    mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Reset', 'attr':mAttr, 'sub':function(){ myThis.resetStartSubmit(); } } );
    return this.buildButtons(mList);
};

ActLoginReset.prototype.resetStartValidate = function(){
    this.errorClear();
    var mEmail = this.getDomInputVal('email');
    if( ! mEmail ){
	this.errorMsg = 'Please enter an email';
	this.setFocusError('email');
	return false;
    }
    return true;
};

ActLoginReset.prototype.resetStartSubmit = function(){
    if(this.resetStartValidate()){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	var myThis = this;
	var mData = {'email':this.getDomInputVal('email')};
	$.ajax({ url: '/user/a/aInitReset',	dataType: 'json', data:mData,
		    success: function(json,textStatus){ myThis.resetStartSubmitCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }else{
	this.errorDisplay();
    }
};

ActLoginReset.prototype.resetStartSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.resetConfirmOpen();
	}
    }
};

// User Reset found and sent
ActLoginReset.prototype.resetConfirmOpen = function(){
    if(userValid()){ return false; }
    var myThis = this;
    this.reset();
    this.newHeader();
    this.resetConfirmContent();
    this.changePage();
};

ActLoginReset.prototype.resetConfirmButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Close', 'attr':mAttr, 'sub':function(){ myThis.changePageHome(); } } );
    return this.buildButtons(mList);
};

ActLoginReset.prototype.resetConfirmContent = function(){
    var myThis = this;
    var $main = this.getRootContent();
    var $mRow = $( document.createElement('h1') ).html('Account Confirmed - Reset Message sent');
    $main.append($mRow);
    $mRow = $( document.createElement('div') ).html('Your FishBlab Account was found and a message has been sent to your email account.<br />The message contains a link that will allow you to reset your password.<br />The message may take a few minutes to be delivered.');
    $main.append($mRow);
    $main.append( myThis.resetConfirmButtons() );
    return $main;
};

// end ActLoginResetReset
//////////////////////////

///////////////////////////////////////////
// ActOwnerEditPass - edit user password
///////////////////////////////////////////
ActEditPass.prototype = new ActClass();
ActEditPass.prototype.constructor = ActEditPass;
function ActEditPass() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgEditPass);
    this.statusTitle = 'Edit Password';
}

ActEditPass.prototype.changePageUrlSource = function(){
    return 'userEditPassword';
};

ActEditPass.prototype.editTitle = function(){
    return 'Change Your Password';
};

ActEditPass.prototype.editHeader = function(){
    var myThis = this;
    $('#mobFormHeader').html('Change My Password');
    $('#mobFormHome').off().on('click', function(){ myThis.changePageHome();return false; });
    $('#mobFormMenu').off().on('click', function(){myThis.changePageTo('#mobMenu?s=account');return false; });
};

ActEditPass.prototype.editButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'sub':function(){ myThis.changePageTo('#mobMenu?s=account'); } } );
    mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Save', 'attr':mAttr, 'sub':function(){ myThis.editSubmit(); } } );
    return this.buildButtons(mList);
};

ActEditPass.prototype.editSubmit = function(){
    if(this.editPassValidate()){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	var myThis = this;
	var mData = {'password':this.getDomInputVal('password')};
	$.ajax({ url: '/user/a/aSaveUserPassword',	dataType: 'json', data:mData,
		    success: function(json,textStatus){ myThis.editSubmitCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }else{
	this.errorDisplay();
    }
};

ActEditPass.prototype.editSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.changePageTo('#mobMenu?s=account');
	}
    }
};

// Reset Password final
ActEditPass.prototype.resetOpen = function(){
    var myThis = this;
    if(userValid()){ return false;}
    var mData = {};
    if(this.rid){
	mData['reset_id'] = this.rid;
    }
    if(this.rCode){
	mData['reset_code'] = this.rCode;
    }
    $.ajax({ url: '/user/a/aResetTest', dataType: 'json', data:mData,
		success: function(json,textStatus){ myThis.resetOpenCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActEditPass.prototype.resetOpenCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	this.json = json;
	this.resetOpen2();
    }
};

ActEditPass.prototype.resetOpen2 = function(){
    if(userValid()){ return false; }
    this.editTitle = function(){return 'Reset Your Password';};
    this.reset();
    this.newHeader();
    this.resetContent();
    this.newFooter();
    this.changePage();
};

ActEditPass.prototype.resetContent = function(){
    var myThis = this;
    this.changePageUrlSource = function(){return 'loginReset2';};
    var $main = this.getRootContent();
    $main.append(this.errorDivCreate());
    if(this.json.error){
	$main.append( $( document.createElement('div') ).html(this.json.desc) );
    }else{
	$main.append(this.editForm());
	$main.append(this.resetButtons());
    }
    return $main;
};

ActEditPass.prototype.resetButtons = function(){
    var myThis = this;
    var mList = [];
    var mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Cancel', 'attr':mAttr, 'sub':function(){ myThis.changePageHome();return false; } } );
    mAttr = this.defaultButtonAttr();
    mList.push( { 'label':'Set Password', 'attr':mAttr, 'sub':function(){ myThis.resetSubmit(); return false} } );
    return this.buildButtons(mList);
};

ActEditPass.prototype.resetSubmit = function(){
    if(this.editPassValidate()){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	var myThis = this;
	var mData = {'password':this.getDomInputVal('password')};
	if(this.rid){
	    mData['reset_id'] = this.rid;
	}
	if(this.rCode){
	    mData['reset_code'] = this.rCode;
	}
	$.ajax({ url: '/user/a/aReset', dataType: 'json', data:mData,
		    success: function(json,textStatus){ myThis.resetSubmitCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }else{
	this.errorDisplay();
    }
};

ActEditPass.prototype.resetSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.changePageHome();
	}
    }
};

//////////////////
// end actEditPass
//////////////////


///////////////////////////////////////////
// ActFeed - user feedback
///////////////////////////////////////////

ActFeed.prototype = new ActClass();
ActFeed.prototype.constructor = ActFeed;
function ActFeed() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgFeed);
    this.statusTitle = 'FeedBack';
}

ActFeed.prototype.newHeader = function(){
    var myThis = this;
    $('#mobFormHeader').html('Send Feedback');
    $('#mobFormHome').off().on('click', function(){ myThis.changePageHome();return false; });
};

ActFeed.prototype.ajaxNewCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.changePageHome();
	    showMsg('Thanks for your Feedback!');
	}
    }
};
    
//var $mRow = $( document.createElement('div') ).addClass('fbFormHead').html('Have a question or suggestion?<br>Let us know!');
// end feed

///////////////////////////////////////////
// ActGroup - FishBlab Group Activity
///////////////////////////////////////////
ActGroup.prototype = new ActClass();
ActGroup.prototype.constructor = ActGroup;
function ActGroup() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgGroup);
    this.statusTitle = 'FishBlab Group Status';
}

ActGroup.prototype.readButtons = function(){
    var myThis = this;
    var mRec = this.rec;
    var mBut = {};
    if(mRec.is_admin){
	mBut['Edit'] = function(){ myThis.editOpen(mRec); return false; };
    }else{
	if(mRec.is_member){
	    mBut['Your Status'] = function(){ myThis.statusOpen(mRec); };
	}else if(mRec.sec == 1){
	    mBut['Join Group'] = function(){ myThis.statusOpen(mRec); };
	}else if(mRec.sec == 5){
	    mBut['Request Membership'] = function(){ myThis.statusOpen(mRec); };
	}
    }
    mBut['Close'] = function(){ myThis.close(); };
    return mBut;
};

ActGroup.prototype.groupSecOptions = function(){
    var myThis = this;
    var mRec = this.rec;
    var mSec = (mRec.sec ? mRec.sec : 1);
    var $mBox = $(document.createElement('div')).addClass('secSwitchForm fbBorder2');

    var $mRow = $(document.createElement('div')).addClass('pad2 bold').html('Membership');
    $mBox.append($mRow);

    $mRow = $(document.createElement('div')).addClass('pad2');
    var $mBut = $(document.createElement('input')).attr({'type':'radio','name':'secOpt','value':1,'id':'sec_pub'});
    $mBut.bind('change',function(){ myThis.groupSecSet(1); });
    if(mSec == 1){ $mBut.attr({'checked':true}); }
    $mRow.append($mBut);
    var $mLab = $(document.createElement('span')).html('Open - User chooses to Join').attr('for','sec_pub').addClass('jrjLabelGroupOpt');
    $mRow.append($mLab,this.clearBr());
    $mBox.append($mRow);
    
    $mRow = $(document.createElement('div')).addClass('pad2');
    $mBut = $(document.createElement('input')).attr({'type':'radio','name':'secOpt','value':5,'id':'sec_req'});
    $mBut.bind('change',function(){ myThis.groupSecSet(5); });
    if(mSec == 5){ $mBut.attr({'checked':true}); }
    $mRow.append($mBut);
    $mLab = $(document.createElement('span')).html('Request - User asks to join, Admin must Approve').attr('for','sec_req').addClass('jrjLabelGroupOpt');
    $mRow.append($mLab,this.clearBr());
    $mBox.append($mRow);

    $mRow = $(document.createElement('div')).addClass('pad2');
    $mBut = $(document.createElement('input')).attr({'type':'radio','name':'secOpt','value':10,'id':'sec_pri'});
    $mBut.bind('change',function(){ myThis.groupSecSet(10); });
    if(mSec == 10){ $mBut.attr({'checked':true}); }
    $mRow.append($mBut);
    $mLab = $(document.createElement('span')).html('Closed - Admin must Add User').attr('for','sec_pri').addClass('jrjLabelGroupOpt');
    $mRow.append($mLab,this.clearBr());
    $mBox.append($mRow);

    var mInp = document.createElement('input');	    
    $( mInp ).attr( {'type':'hidden','name':'sec','value':mSec,'id':'jrjtest'} );
    this.fieldByName('sec')['domElement'] = mInp;
    $mBox.append(mInp);
    return $mBox;
};

ActGroup.prototype.groupSecSet = function(secNew){
    var myThis = this;
    $(myThis.fieldByName('sec')['domElement']).val(secNew);
    return true;
};

ActGroup.prototype.groupSecRead = function(){
    var myThis = this;
    var mRec = this.rec;
    var mSec = (mRec.sec ? mRec.sec : 1);
    var mSecRead = (mRec.sec == 10 ? 'Closed' : (mRec.sec == 5 ? 'Request' : 'Open') );
    var $mRow = $(document.createElement('p'));
    var $mLab = $(document.createElement('span')).addClass('jrjReadLabel');
    $mLab.html('Membership:');
    $mRow.append($mLab);
    $mVal = $(document.createElement('span')).addClass('jrjReadValue');
    $mVal.html(mSecRead);
    $mRow.append($mVal);
    $mRow.append(this.clearDiv());
    return $mRow;
};

ActGroup.prototype.inputName = function(){
    var myThis = this;
    var mInp;
    if(this.isNew()){
	mInp = document.createElement('input');
	$( mInp ).attr( {'type':'text','name':'name','value':myThis.rec['name']} ).addClass(this.inputClassName);
	this.fieldByName('name')['domElement'] = mInp;
	return $(mInp);
    }else{
	var mDiv = document.createElement('div');
	var mInp = document.createElement('input');
	$( mInp ).attr( {'type':'hidden','name':'name','value':myThis.rec['name']} );
	var mSpan = document.createElement('span');
	$( mSpan ).html(myThis.rec['name']);
	$(mDiv).append(mSpan,mInp);
	this.fieldByName('name')['domElement'] = mInp;
	return $(mDiv);
    }
};

ActGroup.prototype.statusOpen = function(mRec){
    var myThis = this;
    this.rec = mRec;
    this.reset();
    var $main = this.statusContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: this.statusTitle, buttons: this.statusButtons()
		});
};

ActGroup.prototype.statusButtons = function(){
    var myThis = this;
    var mBut = {'Back':function(){ myThis.readOpen(myThis.rec);}, 'Close': function(){ myThis.close(); } };
    return mBut;
};

ActGroup.prototype.statusContent = function(){
    var myThis = this;
    var rGroup = this.rec;
    var mName = rGroup.name;
    var mStatus = rGroup.member_status;
    var $mRow,$mBox,$mBut;
    var $main = this.getRoot();
    $main.addClass('uDialogRead');
    var $mH1 = $( document.createElement('h1') );
    $mH1.html('Status for Group: ' + mName);
    $main.append($mH1);
    $main.append(myThis.shortContent());
    $mBox = $( document.createElement('div') ).addClass('fbBorder5 mar5 pad5');
    $mRow = $( document.createElement('div') ).addClass('uHead2 red');
    if(mStatus == 'owner'){
	$mRow.html('You are the owner of this Group');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBox.append($mRow);
    }else if(rGroup.member_status.match(/^(admin|member)$/)){
	if(rGroup.is_admin){
	    $mRow.html('You are currently an Administrator of this group');
	}else{
	    $mRow.html('You are currently a Member of this group');
	}
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('mar10 centerText');
	$mBut = $(document.createElement('button')).html('Remove Group Membership').addClass('fbMenuBut');
	$mBut.bind('click',function(){ myThis.statusUpdate(rGroup,'remove'); });
	$mRow.append($mBut);
	$mBox.append($mRow);
	$mBut.button();
    }else if(rGroup.member_status == 'invite'){
	$mRow.html('You have been invited to this Group');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('mar10 centerText');
	$mBut = $(document.createElement('button')).html('Join Group').addClass('fbMenuBut');
	$mBut.bind('click',function(){ myThis.statusUpdate(rGroup,'join'); });
	$mRow.append($mBut);
	$mRow.append(this.clearDiv());
	$mBox.append($mRow);
	$mBut.button();
	$mRow = $(document.createElement('div')).addClass('mar10 centerText');
	$mBut = $(document.createElement('button')).html('Ignore Invite').addClass('fbMenuBut');
	$mBut.bind('click',function(){ myThis.statusUpdate(rGroup,'ignore'); });
	$mRow.append($mBut);
	$mRow.append(this.clearDiv());
	$mBox.append($mRow);
	$mBut.button();
    }else if(rGroup.member_status == 'request'){
	$mRow.html('Your request has been sent to the Administrator');
	$mBox.append($mRow);
    }else if(rGroup.member_status == 'blocked'){
	$mRow.html('This Group is blocking you');
	$mBox.append($mRow);
    }else if(rGroup.member_status == 'blocked'){
	$mRow.html('You are blocking this Group');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button')).html('Remove Block');
	$mBut.bind('click',function(){ myThis.statusUpdate(rGroup,'unblock'); });
	$mRow.append($mBut);
	$mBox.append($mRow);
	$mBut.button();
    }else if(rGroup.sec == 10){
	$mRow.html('Membership for this group is closed');
	$mBox.append($mRow);
	$mBox.append($mRow);
    }else if(rGroup.sec == 5){
	$mRow.html('Request Membership to this Group');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button')).html('Request Membership');
	$mBut.bind('click',function(){ myThis.statusUpdate(rGroup,'join'); });
	$mRow.append($mBut);
	$mBox.append($mRow);
	$mBut.button();
    }else if(rGroup.sec == 1){
	$mRow.html('Open Membership: Join this Group');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button')).html('Join Group');
	$mBut.bind('click',function(){ myThis.statusUpdate(rGroup,'join'); });
	$mRow.append($mBut);
	$mBox.append($mRow);
	$mBut.button();
    }
    $mRow = $(document.createElement('div')).attr({'id':'uMsg2'}).addClass('uMsg2');
    $mBox.append($mRow);
    $main.append($mBox);
    return $main;
};

ActGroup.prototype.statusUpdate = function(rGroup,mRequest){
    var myThis = this;
    $.ajax({ url: '/group/a/aMemberUpdate', dataType: 'json', data: { id:rGroup.id, 'request':mRequest},
		success: function(json,textStatus){ myThis.statusUpdateCB(json,textStatus,rGroup.id); },
		error: function(){myThis.ajaxError();}
	});
};
    
ActGroup.prototype.statusUpdateCB = function(json,tStat){
    if(tStat != 'success'){
	alert('Update failed: system error. Please try again');
    }else if(json.error){
	alert(json.desc);
    }else{
	if(json.record){ 
	    this.editRec(json.record);
	    this.readOpen(json.record);
	}
	return true;
    }
};
