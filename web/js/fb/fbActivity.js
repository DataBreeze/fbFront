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
}

ActClass.prototype.dataFetched = false;
ActClass.prototype.mode = 'read';
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
	}
    }
    return this.actHash;
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
    //$('#jrjActionRow').css({'display':'block'});
    var $mBox = $('#jrjActActionBar');
    $mBox.css({'display':'block'});
    $mBox.children().remove();
    $mBox.addClass('fbBorder2R');
    return $mBox;
};

ActClass.prototype.actionBarUpdate = function(){
    if( ! mapIsOpen() ){ return false; }
    var myThis = this;
    var $mBox = this.actionBarReset();
    var $mCell = $(document.createElement('div')).addClass('jrjActBarCell1 bold ').css({'font-size':fbActBarLabel});
    $mCell.html(this.labelPlural + ' (' + this.count + ')');
    $mBox.append($mCell);
    var $mCell = $(document.createElement('div')).addClass('jrjActBarCell2').css({'font-size':fbActBarText});
    if(this.countTotal > this.count){
	$mCell.append( $(document.createElement('div') ).addClass('jrjActBarCell3').html('Total:') );
	$mCell.append( $(document.createElement('div') ).addClass('jrjActBarCell3 bold').html(this.countTotal) );
	// $mCell.append( $(document.createElement('div') ).addClass('jrjActBarCell3').html('Viewing:') );
	// $mCell.append( $(document.createElement('div') ).addClass('jrjActBarCell3 bold').html(this.count) );
    }
    $mCell.append( this.clearBr() );
    $mBox.append($mCell);
    var $mCell = $(document.createElement('div')).addClass('jrjActBarCell');
    if(fbActActionMenuSize == 'compact'){
	$mBut = $( document.createElement('button') ).addClass(fbActButClass).html('Action');
	$mBut.bind('click',function(){ myThis.actionBarMenuOpen();return false; } );
	$mBut.button();
	$mCell.append($mBut);
    }else{
	if(this.allowSearch !== false){
	    $mBut = $(document.createElement('button')).html('Search').addClass(fbActButClass);
	    $mBut.bind('click',function(){myThis.searchOpen();});
	    $mBut.button();
	    $mCell.append($mBut);
	}
	if(this.allowList !== false){
	    $mBut = $(document.createElement('button')).html('List').addClass(fbActButClass);
	    $mBut.bind('click',function(){myThis.listOpen();});
	    $mBut.button();
	    $mCell.append($mBut);
	}
	if( this.recList && (this.recList.length > 0) && (this.allowDetail !== false) ){
	    $mBut = $(document.createElement('button')).html('Detail').addClass(fbActButClass);
	    $mBut.bind('click',function(){myThis.readOpen(myThis.recList[0]);});
	    $mBut.button();
	    $mCell.append($mBut);
	}
	if(this.allowNew !== false){
	    $mBut = $(document.createElement('button')).html('New').addClass(fbActButClass);
	    $mBut.bind('click',function(){myThis.newOpen();});
	    $mBut.button();
	    $mCell.append($mBut);
	}
	if(this.filterList()){
	    $mBut = $(document.createElement('button')).html('Filter').addClass(fbActButClass);
	    $mBut.bind('click',function(){myThis.filterOpen();});
	    $mBut.button();
	    $mCell.append($mBut);
	}
    }
    $mCell.buttonset();
    $mCell.append( this.clearBr() );
    $mBox.append($mCell);
    if(this.filtersCur.length > 0){
	for(var i=0; i<this.filtersCur.length; i++){
	    var mFilter = this.filtersCur[i];
	    var $mRow = $(document.createElement('div')).attr({'id':'jrjFilterBox'}).addClass('fbBorder2R');
	    $mRow.append($(document.createElement('span')).addClass('bold marRight5 black').html('Filter:'));
	    $mRow.append( $(document.createElement('span')).addClass('bold marRight5 blue').html( (mFilter.labelCur || mFilter.label)) );
	    var $mAnc = $(document.createElement('a')).attr({'href':'/'}).addClass('red italic').html('Remove');
	    $mAnc.bind('click',function(){myThis.filterOff(mFilter.id);return false;});
	    $mRow.append($mAnc);
	    $mBox.append(this.clearBr());
	    $mBox.append($mRow);
	}
    }
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
		allFields.push(mF.fields[j]);
	    }
	}else{
	    allFields.push(mF);
	}
    }
    return allFields;
};
 
ActClass.prototype.fieldByName = function(mName){
    var mFields = this.fieldList();
    for(var i=0; i<mFields.length; i++){
	var mF = mFields[i];
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
	return $(mDom).addClass('fbFormErr').focus();
    }
    return false;
};

ActClass.prototype.loadRecords = function(newObj){
    this.recList = [];
    this.recHash = {};
    this.recList = newObj.records;
    for(var i=0; i<this.recList.length; i++){
	var recId = this.recList[i].id;
	this.recList[i].array_index = i;
	this.recHash[recId] = this.recList[i];
    }
    this.count = this.recList.length;
    this.countTotal = newObj.count_total;
    this.recordOffset = newObj.record_offset;
    this.recordLimit = newObj.record_limit;
    if(this.allowActionBar !== false){
	this.actionBarUpdate();
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
    return 'jrjDialogForm';
};

ActClass.prototype.formNode = function(){
    var myThis = this;
    this.form =  document.createElement('form');
    $(this.form).attr('id',myThis.formId);
    $(this.form).bind('submit',function(){return false;});
    return $(this.form);
};

ActClass.prototype.errorClear = function(){
    $(this.errorDiv).css('display','none');
    var mFields = this.fieldList();
    for(var i = 0;i < mFields.length; i++){
	var mDom = mFields[i].domElement;
	if(mDom){
	    $(mDom).removeClass('fbFormErr');
	}
    }
};

ActClass.prototype.errorDisplay = function(mMsg){
    $(this.errorDiv).css('display','block');
    $(this.errorDiv).html(mMsg || this.errorMsg);
};

ActClass.prototype.errorDivCreate = function(){
    this.errorDiv = document.createElement('div');
    $( this.errorDiv ).attr('id','jrjDialogError').addClass('fbBorder5');
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

ActClass.prototype.mapEdit = function(){
    var mPoint,myThis = this;
    this.close();
    this.mapWinClose();
    this.mode = 'mapEdit';
    if( ! this.mapEditTitle){
	this.mapEditTitle = 'Change '+ this.label +' Location';
    }
    if( ! this.mapEditIcon){
	this.mapEditIcon = '/images/map/setLoc40.png';
    }
    if( ! this.mapEditCaption){
	this.mapEditCaption = 'Your Post Will Go Here';
    }
    if(this.rec.lat && this.rec.lon){
	mPoint = new google.maps.LatLng(this.rec.lat,this.rec.lon);
    }else{
	mPoint = JRJ.map.googleMap.getBounds().getCenter();
    }
    if(this.mapEditMarker){
	this.mapEditMarker.setMap(null);
    }
    this.mapEditMarker = new google.maps.Marker({ position: mPoint, title:this.mapEditTitle, draggable:true, icon: this.mapEditIcon });
    this.mapEditMarker.setMap(JRJ.map.googleMap);
    google.maps.event.addListener(this.mapEditMarker, 'drag', function(){ myThis.mapEditDrag(); });
    this.mapEditOpen();
};

ActClass.prototype.mapEditOpen = function(){
    var myThis = this;
    var mCenter = this.mapEditMarker.getPosition();
    var mBox = document.createElement('div');
    $(mBox).addClass('discLoc fbBorder2');
    var $mRow = $(document.createElement('div'));
    $mRow.addClass('discLocHead').html(this.mapEditCaption);
    $(mBox).append($mRow);
    $mRow = $(document.createElement('div')).addClass('discLocBody').html('Change the location by dragging the icon');
    $(mBox).append($mRow);
    $mRow = $(document.createElement('div')).addClass('discLocCoord');
    var $mSpan = $(document.createElement('span')).attr({'id':'locLat'}).addClass('discLocLL').html('Lat:' + mCenter.lat().toFixed(6));
    $mRow.append($mSpan);
    $mSpan = $(document.createElement('span')).attr({'id':'locLon'}).addClass('discLocLL').html('Lon:' + mCenter.lng().toFixed(6));
    $mRow.append($mSpan);
    $(mBox).append($mRow);
    $mRow = $(document.createElement('div')).addClass('discLocFoot');
    var $mBut = $(document.createElement('button')).addClass('discLocBut').html('Set Location');
    $mBut.bind('click',function(){myThis.mapEditSubmit();});
    $mBut.button();
    $mRow.append($mBut);
    $mBut = $(document.createElement('button')).addClass('discLocBut').html('Cancel');
    $mBut.bind('click',function(){myThis.mapEditClose();});
    $mBut.button();
    $mRow.append($mBut);
    $(mBox).append($mRow);
    this.mapWin = new google.maps.InfoWindow({ content: mBox });
    this.mapWin.open(JRJ.map.googleMap,this.mapEditMarker);
    google.maps.event.addListener(this.mapWin, 'closeclick', function(){ myThis.mapEditClose(); });
};

ActClass.prototype.mapEditDrag = function(){
    if(this.mapEditMarker){
	var mLoc = this.mapEditMarker.getPosition();
	$('#locLat').html('Lat:' + mLoc.lat().toFixed(6));
	$('#locLon').html('Lon:' + mLoc.lat().toFixed(6));
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
	    this.close();
	}
    }
};

ActClass.prototype.mapDisplay = function(){
    this.mode = 'map';
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

ActClass.prototype.ajaxGetRecs = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mData = { bounds:JRJ.map.googleMap.getBounds().toUrlValue(),'offset':this.recordOffset };
    var mUrl = myThis.ajaxGetRecsUrl();
    $.ajax({ url:mUrl, dataType:'json', data:mData,
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
	    this.mapClear();
	    this.loadRecords(json);
	    this.mapDisplay2();
	    if(this.isList()){
		this.listOpen2();
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
    if(this.count > 0){
	for(var i=0; i<this.recList.length; i++){
	    var mMarker = this.recList[i].map_marker;
	    if(mMarker != undefined){
		mMarker.setMap(null);
	    }
	}
    }
};

ActClass.prototype.mapLoad = function(){
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
    return mMarker;
};

ActClass.prototype.mapContent = function(){
    var $mRow, myThis = this;
    var mBox = document.createElement('div');
    $( mBox ).addClass('jrjMapWin');
    var mRec = this.rec;
    mRec.dc = mRec.date_create;
    if(this.allowHead !== false){
	$(mBox).append(this.head());
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
		$(mBox).append($mRow);
	    }
	}else if(mF.type == 'image'){
	    mF.widthTemp = '100';
	    mF.heightTemp = '100';
	    $mRow = $(document.createElement('p'));	    
	    $mRow.append(myThis.readRowImage(mF));
	    $mRow.append(this.clearBr());
	    $(mBox).append($mRow);
	    mF.widthTemp = false;
	    mF.heightTemp = false;
	}else{
	    $mRow = $(document.createElement('p'));
	    if(mF.label){
		var $mLab = $(document.createElement('span')).addClass('jrjReadLabel');
		$mLab.html(mF.label+':');
		$mRow.append($mLab);
	    }
	    $mVal = $(document.createElement('span')).addClass('jrjReadValue');
	    $mVal.html(mRec[mF.name]);
	    $mRow.append($mVal);
	    $mRow.append(this.clearBr());
	    $(mBox).append($mRow);
	}
    }
    var mButtons = this.mapActionBut();
    if(mButtons){
	$(mBox).append(mButtons);
    }
    return mBox;
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
    var mContent = this.mapContent();
    fbActMapWin = new google.maps.InfoWindow({ content: mContent });
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
    var mBox = $( document.createElement('div')).addClass('discCap fbBorder1');
    var imgId = fbDefaultProfileId;
    if(mRec.photo_id && (mRec.photo_id != 0) ){
	imgId = mRec.photo_id;
    }
    var imgSrc = imageSource(imgId,'32');
    var $mCell = $(document.createElement('div')).addClass('discHeadCell');
    var $mImg = $(document.createElement('img')).attr({src:imgSrc,width:32,height:32}).addClass('uImg');
    $mImg.bind('click',function(){ userPubShow(mRec.username);return false; });
    $mCell.append($mImg);
    $(mBox).append($mCell);
    $mCell = $(document.createElement('div')).addClass('discHeadCell');
    var $mRow = $(document.createElement('div')).addClass('discCapTxt');
    $mRow.append( $( document.createElement('span') ).html(this.label + ': ').addClass('black') );
    var mDisplay = mRec[this.displayField];
    if(mDisplay){
	$mRow.append( $( document.createElement('span') ).html(mDisplay).addClass('darkGreen') );
    }
    $mCell.append($mRow);
    $mCell.append(this.headUserStat());
    $(mBox).append($mCell);
    $(mBox).append(this.clearDiv());
    if(this.allowHeadLink !== false){
	$mRow = $(document.createElement('div'));
	$mRow.append( $( document.createElement('span') ).html('WWW:').addClass('floatLeft') );
	var mUrl = this.host + '.fishblab.com/' + mRec[this.keyField];
	$mRow.append( $(document.createElement('a')).addClass('discStatLink').attr({href:'http://' + mUrl,'target':'www'}).html(mUrl) );
	$(mBox).append($mRow);
	$(mBox).append(this.clearDiv());
    }
    return mBox;
};

ActClass.prototype.headUserStat = function(){
    var myThis = this;
    var mRec = this.rec;
    var $mBox = $(document.createElement('div')).addClass('discStatBox');
    var $mCell = $(document.createElement('div')).addClass('discStatLink').html(mRec.date_create || mRec.dc);
    $mBox.append($mCell);
    $mCell = $(document.createElement('div')).addClass('discStatLink').html(this.secDisplay());
    $mBox.append($mCell);
    var $mAnc = $(document.createElement('a')).addClass('discStatLink').attr({href:'/'}).html(mRec.username);
    $mAnc.bind('click',function(){ myThis.close();userPubShow(mRec.username);return false; });
    $mBox.append($mAnc);
    if(this.statLinkFlagShow){
	if(mRec.username != fbUser.username){
	    $mAnc = $(document.createElement('a')).addClass('discStatCell').html('Flag').attr({href:'/'});
	    $mAnc.bind('click',myThis.statLinkFlag());
	    $mBox.append($mAnc);
	}
    }
    if(this.isRead() && (this.allowGeo !== false) ){
	$mAnc = $( document.createElement('a') );
	$mAnc.addClass('discStatLink').html('Map').attr({href:'/'});
	$mAnc.bind('click', function(){ myThis.close();myThis.mapWinOpen(mRec);return false; } );
	$mBox.append($mAnc);
    }
    $mBox.append(this.clearDiv());
    return $mBox;
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
    if(false){  //this.allowNew !== false){
	$mBut = $(document.createElement('button')).html('New').addClass('marLeft10');
	$mBut.bind('click',function(){myThis.newOpen();});
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

ActClass.prototype.rootName = 'jrjDialog';

ActClass.prototype.getRoot = function(){
    return $('#' + this.rootName);
};

ActClass.prototype.close = function(){
    var $main = this.getRoot();
    if( $main.dialog('isOpen') ){
    	$main.dialog('close'); 
    }
    return $main;
};

ActClass.prototype.reset = function(){
    var $main = this.getRoot();
    $main.children().remove();
    $main.html('');
    $main.removeClass();
    if(this.rootClass){
	$main.addClass(this.rootClass);
    }
    return $main;
};

ActClass.prototype.rootName2 = 'jrjDialog2';

ActClass.prototype.getRoot2 = function(){
    return $('#' + this.rootName2);
};

ActClass.prototype.close2 = function(){
    return true;
    var $main = this.getRoot2();
    if($main.dialog('isOpen')){
    	$main.dialog('close'); 
    }
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
    if($main.dialog('isOpen')){
    	$main.dialog('close'); 
    }
    return $main;
};

ActClass.prototype.reset3 = function(){
    var $main = this.getRoot3();
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
    if($main.dialog('isOpen')){
	$main.dialog('close'); 
    }
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
    return (this.mode == 'read' ? true : false);
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
    this.modeInit = 'detail';
    this.ajaxGetRec(mId);
};

ActClass.prototype.editOpenById = function(mId){
    this.modeInit = 'edit';
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
	    var mLatLon = new google.maps.LatLng(mRec.lat,mRec.lon);
	    this.mapClear();
	    this.loadRecords(mRecs);
	    JRJ.map.googleMap.panTo(mLatLon);
	    this.mapDisplay2();
	    this.mapWinOpen(mRec);
	    if(this.modeInit == 'detail'){
		this.readOpen(mRec);
	    }else if(this.modeInit == 'edit'){
		this.editOpen(mRec);
	    }
	}
    }
};

ActClass.prototype.readOpen = function(mRec){
    var myThis = this;
    this.mode = 'read';
    this.rec = mRec;
    this.reset();
    var $main = this.readContent();
    if(this.target !== 'gw'){
	$main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		    position: 'center', closeOnEscape: true, title: this.title(), buttons: this.readButtons()
		    });
    }
};

ActClass.prototype.editOpen = function(mRec){
    if(this.allowEdit === false){ return false; }
    var myThis = this;
    this.mode = 'edit';
    this.rec = mRec;
    this.reset();
    var $main = this.editContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: this.title(), buttons: myThis.editButtons()
		});
    this.focus();
};

ActClass.prototype.newHeaderShow = false;

ActClass.prototype.newOpen = function(){
    var myThis = this;
    if(this.allowNew === false){ return false; }
    this.mode = 'new';
    this.mapWinClose();
    this.setGeo = true;
    this.rec = {};
    this.reset();
    var $main = this.newContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: this.title(), buttons: this.newButtons()
		});
    this.focus();
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
   if(this.allowList === false){ return false; }
    var myThis = this;
    this.mode = 'map';
    this.mapWinClose();
    this.rec = {};
    this.reset();
    var $main = this.listContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, height:400, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: this.title(), buttons: this.listButtons()
		});
    this.focus();
};

ActClass.prototype.searchOpen = function(){
    var myThis = this;
    if(this.allowSearch === false){ return false; }
    this.mode = 'search';
    this.reset();
    var $main = this.searchContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', height:400, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: this.searchTitle(), buttons: this.searchButtons()
		});
    this.focus();
    $main.keyup(function(e) {
	    if (e.keyCode == 13) {
		myThis.searchSubmit();
	    }
	});
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

ActClass.prototype.editButtons = function(){
    var myThis = this;
    var mRec = this.rec;
    var mOpt = {};
    if(this.allowDelete && (fbUser.jrjSec || (mRec.username) == fbUser.username)){
	mOpt['Delete'] = function(){ myThis.del(mRec.id); };
    }
    mOpt['Save'] = function(){ myThis.editSubmit(); };
    mOpt['Cancel'] = function(){ myThis.close(); };
    return mOpt;
};

ActClass.prototype.newButtons = function(){
    var myThis = this;
    var mOpt = {};
    mOpt['Create'] = function(){ myThis.newSubmit(); };
    mOpt['Cancel'] = function(){ myThis.close(); };
    return mOpt;
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
    var $mBox = $(document.createElement('div')).attr({id:'secEOptions'}).addClass('fbBorder2 secSwitchForm');
    var $mRow = $(document.createElement('div'));
    var $mTip = $(document.createElement('div')).html('Who can view this?').addClass('frmTip');
    $mRow.append($mTip);
    var $mInp = $(document.createElement('input')).attr({type:'radio',name:'secOpt',value:1,id:'sec_pub'}).addClass('jrjRadio').css({'width':mWidth});
    $mInp.bind('click',function(){ myThis.secSet(1); });
    if(mSec == 1){ $mInp.attr({checked:true}); }
    $mRow.append($mInp);
    var $mLab = $(document.createElement('span')).attr({htmlFor:'sec_all'}).html('Public').addClass('jrjRadioLabel');
    $mRow.append($mLab);
    $mInp = $(document.createElement('input')).attr({type:'radio',name:'secOpt',value:5,id:'sec_fri'}).addClass('jrjRadio').css({'width':mWidth});
    $mInp.bind('click',function(){ myThis.secSet(5); });
    if(mSec == 5){ $mInp.attr({checked:true}); }
    $mRow.append($mInp);
    $mLab = $(document.createElement('span')).attr({htmlFor:'sec_fri'}).html('Friends').addClass('jrjRadioLabel');
    $mRow.append($mLab);
    $mInp = $(document.createElement('input')).attr({type:'radio',name:'secOpt',value:10,id:'sec_pri'}).addClass('jrjRadio').css({'width':mWidth});
    $mInp.bind('click',function(){ myThis.secSet(10); });
    if(mSec == 10){ $mInp.attr({checked:true}); }
    $mRow.append($mInp);
    $mLab = $(document.createElement('span')).attr({htmlFor:'sec_pri'}).html('Private').addClass('jrjRadioLabel');
    $mRow.append($mLab);
    $mInp = $(document.createElement('input')).attr({type:'radio',name:'secOpt',value:15,id:'sec_grp'}).addClass('jrjRadio').css({'width':mWidth});
    $mInp.bind('click',function(){ myThis.secSet(15); });
    if(mSec == 15){ $mInp.attr({checked:true}); }
    $mRow.append($mInp);
    this.secGroupRadio = $mInp;
    $mLab = $(document.createElement('span')).attr({htmlFor:'sec_grp'}).html('Group').addClass('jrjRadioLabel');
    $mRow.append($mLab);
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

ActClass.prototype.editForm = function(){
    var $mNode,$mRow,$mCell;
    var mFields = this.fieldsAll();
    var $mFrm = this.formNode();
    var showFieldName = 'editShow';
    if(this.isNew()){
	if(this.newHeader){
	    $mFrm.append(this.newHeader());
	}
	showFieldName = 'newShow';
    }
    for(var i=0;i<mFields.length; i++){
	var mF = mFields[i];
	if(mF[showFieldName] !== false){
	    if(mF.type == 'row'){
		if(mF.fields.length > 0){
		    $mRow = $(document.createElement('p')) ;
		    for(var j=0;j<mF.fields.length; j++){	    
			var mF2 = mF.fields[j];
			if(mF2[showFieldName] !== false){
			    $mRow.append(this.editCell(mF2));
			}
		    }
		    if($mRow.children().length > 0){
			$mRow.append(this.clearBr());
			$mFrm.append($mRow);
		    }
		}
	    }else{
		$mFrm.append(this.editContentRow(mF));	    
	    }
	}
    }
    return $mFrm;
};

ActClass.prototype.editContent = function(){
    var $mSpan,mTip;
    var myThis = this;
    var $main = this.getRoot();
    $main.append(this.errorDivCreate());
    $main.append(this.editForm());
    return $main;
};

ActClass.prototype.editContentRow = function(mF){
    var $mRow = $(document.createElement('p'));
    return this.editNode(mF,$mRow);
};

ActClass.prototype.editCell = function(mF){
    var $mCell = $(document.createElement('div')).addClass('jrjEditCell');
    return this.editNode(mF,$mCell);    
};

ActClass.prototype.editNode = function(mF,$mNode){
    var isNew = this.isNew();
    if(mF.type == 'hidden'){
	return this.editInput(mF);
    }else{
	if(mF.label){
	    $mLab = $( document.createElement('label') ).html(mF.label);
	    if(mF.required === true){
		$mLab.attr({'title':'Required'}).addClass('jrjLabelRequired');
	    }
	    $mNode.append($mLab);
	}
	$mNode.append(this.editInput(mF));
	$mNode.append(this.clearBr());
	if(this.tipShow !== false){
	    mTip = (isNew ? mF.tipNew || mF.tip : mF.tipEdit || mF.tip);
	    if(mTip){
		$mSpan = $( document.createElement('span') ).addClass('jrjTip').html(mTip);
		$mNode.append($mSpan);
	    }
	}
    }
    return $mNode;
};

ActClass.prototype.newContent = function(){
    var $mSpan,mTip;
    var myThis = this;
    var $main = this.getRoot();
    $main.append(this.errorDivCreate());
    $main.append(this.editForm());
    return $main;
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
	    $( mInp ).css('display','block').attr( {'rows':(mF.rows ? mF.rows : 4),'Xcols':(mF.cols? mF.Cols : '30'),'name':mF.name} ).addClass(this.inputClassName + ' jrjTextarea');
	}else if(mF.type == 'select'){
	    mInp = document.createElement('select');
	    $( mInp ).css('display','block').attr( {'name':mF.name} ).addClass(this.inputClassName);
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
	    $( mInp ).attr( {'type':'text','name':mF.name} ).addClass(this.inputClassName);
	    $( mInp ).datepicker();
	}else if(mF.type == 'hour'){
	    mInp = document.createElement('input');
	    $( mInp ).attr( {'type':'text','name':mF.name} ).addClass(this.inputClassName);
	}else if(mF.type == 'hidden'){
	    mInp = document.createElement('input');
	    $( mInp ).attr( {'type':mF.type,'name':mF.name} );
	}else{
	    mInp = document.createElement('input');
	    $( mInp ).attr( {'type':(mF.type ? mF.type : 'text'),'name':mF.name,'size':(mF.size ? mF.size : 20) }).addClass(this.inputClassName);
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
	mHash.center = JRJ.map.googleMap.getCenter().toUrlValue();
    }
    return mHash;
};

ActClass.prototype.editFieldsAndValues = function(){
    var mHash = {},mFields;
    if(this.isNew()){
	mFields = this.newFields();
	if(this.allowGeo !== false){
	    if(JRJ.map.googleMap){
		mHash['center'] = JRJ.map.googleMap.getCenter().toUrlValue();
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
	    this.close();
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
		this.mapEdit();
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
	mData['bounds'] = JRJ.map.googleMap.getBounds().toUrlValue();
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

ActClass.prototype.listContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var mCaption = 'Listing all ' + this.labelPlural + ' in current map';
    var $mRow = $( document.createElement('div') ).addClass('fbFormHead').html(mCaption);
    $main.append($mRow);
    $main.append(this.recTableNode());
    if(this.count > 0){
	this.recTableLoad();
    }
    return $main;
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
	var $mLab = $(document.createElement('label')).html('In current Map Only').attr('htmlFor','searchMap');
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
    var $mLab = $(document.createElement('span')).addClass('jrjReadLabel');
    $mLab.html('Website:');
    $mRow.append($mLab);
    $mVal = $(document.createElement('span')).addClass('jrjReadValue');
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

ActClass.prototype.readContent = function(){
    var myThis = this;
    var mRec = this.rec;
    this.secType = 'tab';
    var isGate = false;
    if(this.target === 'gw'){
	this.secType = 'box';
	isGate = true;
    }
    var mHasChildren = false;
    if(this.children && (this.children.length > 0) ){
	mHasChildren = true;
    }
    mRec.dc = mRec.date_create;
    var $main = this.getRoot().addClass('jrjDialogRead');
    if(this.allowHead !== false){
	if(isGate){
	    $main.append(this.headGW());
	}else{
	    $main.append(this.head());
	}
    }
    var $mRow,$mLab,$mVal;
    var mFields = this.readFields();
    var $mCell = $(document.createElement('div')).addClass('fbBorder1');
    this.readNavInit();
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
		$mLab = $(document.createElement('span')).addClass('jrjReadLabel');
		$mLab.html(mF.label);
		$mRow.append($mLab);
	    }
	    $mVal = $(document.createElement('span')).addClass('jrjReadVal');
	    $mVal.html(mRec[mF.name]);
	    $mRow.append($mVal);
	    $mRow.append(this.clearBr());
	    $mCell.append($mRow);
	}
    }
    if(mHasChildren){
	var mObj = false;
	var secHead = [];
	var secBody = [];
	secHead.push(this.secHead());
	secBody.push(this.secBody($mCell));
	for(var k = 0;k < this.children.length; k++){
	    var mKey = this.children[k];
	    mObj = this.childObjGet(mKey);
	    if( ! mObj){
		mObj = this.childObjNew(mKey);
	    }
	    if(mObj){
		secHead.push(mObj.secHeadChild());
		secBody.push(mObj.secBodyChild());
	    }
	}
	if(isGate){
	    var $mBox = $(document.createElement('div'));
	    for(var j=0;j < secHead.length; j++){
		$mBox.append(secHead[j]);
		$mBox.append(secBody[j]);
	    }
	    this.accordionLike($mBox);
	    $mCell = $mBox;
	}else{
	    var $mTabs = $(document.createElement('div'));
	    var $mUl = $(document.createElement('ul'));
	    for(var j=0;j < secHead.length; j++){
		$mUl.append(secHead[j]);
	    }
	    $mTabs.append($mUl);
	    for(var j=0;j < secBody.length; j++){
		$mTabs.append(secBody[j]);
	    }
	    $mTabs.tabs({'selected':0});
	    $mCell = $mTabs;
	}
    }
    if(this.navPrev || this.navNext){
	var $mTable = $(document.createElement('table')).addClass('jrjTableMin').attr({'cellpadding':0,'cellspacing':0});
	if(this.navPrev){
	    var $mA = $(document.createElement('a')).addClass('prev browse left').bind('click',myThis.navPrevSub);
	    var $mLeft = $(document.createElement('td')).addClass('jrjTdLeft');
	    $mLeft.append($mA);
	    $mTable.append($mLeft);
	}
	var $mCenter = $(document.createElement('td')).addClass('jrjTdCenter');
	$mCenter.append($mCell);
	$mTable.append($mCenter);
	if(this.navNext){
	    var $mA = $(document.createElement('a')).addClass('next browse right').bind('click',myThis.navNextSub);
	    var $mRight = $(document.createElement('td')).addClass('jrjTdRight');
	    $mRight.append($mA);
	    $mTable.append($mRight);
	}
	$main.append($mTable);
    }else{
	$main.append($mCell);
    }
    if(mHasChildren){
	for(var k = 0;k < this.childList.length; k++){
	    this.childList[k].parentLoadInit();
	}
    }
    return $main;
};

ActClass.prototype.readRowImage = function(mF){
    var myThis = this;
    var mRec = this.rec;
    var mWidth = (mF.widthTemp || mF.width || '400');
    var mHeight = (mF.heightTemp || mF.height || '400');
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
    }else if( mPassword.length < 6 ){
	this.errorMsg = 'Password must be at least 6 characters';
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
	showMsg('You need to Login or Create a New Account before you can upload a Photo');
	ownerNew();
	return false;
    }
};

ActClass.prototype.uploadTitle = 'Upload a Photo';

ActClass.prototype.uploadOpen = function(){
    if( ! this.uploadAllow()){ return false; }
    this.mode = 'new';
    var $main = this.uploadContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:300, modal: true, show:null,
	    	position: 'center', closeOnEscape: true, title: this.uploadTitle, buttons: this.uploadButtons()
		});
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
    if( ! this.disableUploadSec){
	$main.append(this.editSec());
    }
    var $mFrm = this.uploadFormInit();    
    var $mRow = $( document.createElement('div') );
    var $mLab = $( document.createElement('label') ).html('Select Photo');
    $mRow.append($mLab);
    var mInp = document.createElement('input');
    $( mInp ).attr( {'type':'file','name':'file'} ).addClass(this.inputClassName());
    $mRow.append( mInp );
    mFields.file['domElement'] = mInp;
    $mFrm.append($mRow);
    $mRow = $( document.createElement('div') );
    $mLab = $( document.createElement('label') ).html('Caption (optional)');
    $mRow.append($mLab);
    mInp = document.createElement('input');
    $( mInp ).attr( {'type':'text','name':'caption'} ).addClass(this.inputClassName());
    $mRow.append($(mInp));
    mFields.caption['domElement'] = mInp;
    $mFrm.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('marTop10');
    $mLab = $( document.createElement('label') ).html('Detail (optional)');
    $mRow.append($mLab);
    mInp = document.createElement('textarea');
    $( mInp ).css('display','block').attr( {'rows':'2','cols':'30','name':'detail'} ).addClass(this.inputClassName());
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
    
    var $mFrame = $( document.createElement('iFrame') ).attr({'id':'upIFrame','name':'upIFrame'});
    $main.append($mFrame);

    return $main;
};

ActClass.prototype.uploadSubmit = function(){
    if(this.uploadValidate()){
	var mPoint = JRJ.map.googleMap.getBounds().getCenter();
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
	$mFile.addClass('fbFormErr').focus();
	return false;
    }
};

ActClass.prototype.uploadButtons = function(){
    var myThis = this;
    return { 'Upload File':function(){ myThis.uploadSubmit(); }, 'Cancel': function(){ myThis.close(); } };
};

ActClass.prototype.editFishLookup = function(){
    var mInp = document.createElement('input');
    $( mInp ).attr( {'type':'text','name':'fish_name','value':this.rec.fish_name} );
    $(mInp).autocomplete({ minLength:1, source: function(request, response) { $.ajax({ url:"/fish/a/aLookup", dataType:"json", data:request, success: function(data) { response( data ); } }); } });
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

ActFish.prototype.initAsChild = function(){
    this.cache = {};
    this.rootName ='jrjDialog2';
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
// ActCatch - Fish Catch Activity
///////////////////////////////////////////
ActCatch.prototype = new ActClass();
ActCatch.prototype.constructor = ActCatch;
function ActCatch() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgCatch);
    this.filterInit();
}

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
		ownerEditPhoto();
	    }else if(this.pid){
		this.parentLoad();
	    }else if(this.allowGeo !== false){
		this.mode = 'edit';
		this.mapEdit();
	    }
	}
    }
};

ActPhoto.prototype.listContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var mCaption = 'Showing all Photos in current map';
    var $mRow = $( document.createElement('div') ).addClass('fbFormHead').html(mCaption);
    $main.append($mRow);
    $mRow = $( document.createElement('div') ).addClass('mar5');
    this.imgWidth = '100';
    this.imgHeight = '100';
    this.imgClassname = 'jrjActListPhoto';
    for(var i=0; i<this.recList.length; i++){
	$mRow.append(myThis.listContentCell(this.recList[i]));
    }
    $mRow.append(this.clearBr());
    $main.append($mRow);
    return $main;
};

ActPhoto.prototype.listContentCell = function(mRec){
    var myThis = this;
    var $mImg = $( document.createElement('img') ).attr( {'src':imageSource( mRec.id ,this.imgWidth +'x'+ this.imgHeight),'width':this.imgWidth,'height':this.imgHeight} ).addClass(this.imgClassname);
    $mImg.bind('click',function(){ myThis.readOpen(mRec);return false; });
    return $mImg;
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
    this.rootName ='jrjDialog2';
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
    this.rootName ='jrjDialog3';
    this.allowGeo = false;
    this.target = 'map';
}

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

ActUser.prototype.friendStatOpenById = function(mId){
    this.modeInit = 'status';
    this.ajaxGetRec(mId);
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
	    this.mapClear();
	    this.loadRecords(mRecs);
	    JRJ.map.googleMap.panTo(mLatLon);
	    this.mapDisplay2();
	    this.mapWinOpen(mRec);
	    if(this.modeInit == 'detail'){
		this.readOpen(mRec);
	    }else if(this.modeInit == 'status'){
		this.friendStatOpen(mRec);
	    }
	}
    }
};

ActUser.prototype.friendReadStatus = function(){
    var mStatus = 'None';
    if(this.rec){
	if(this.rec.friend_status){
	    if(this.rec.friend_status == 'block_from'){
		mStatus = 'User is Blocking You';
	    }else if(this.rec.friend_status == 'block_to'){
		mStatus = 'User Blocked by You';
	    }else if(this.rec.friend_status == 'friend'){
		mStatus = 'User is Your Friend';
	    }else if(this.rec.friend_status == 'request_to'){
		mStatus = 'User Requested to be Your Friend';
	    }
	}
    }
    return mStatus;
};

ActUser.prototype.friendReadStatusRow = function(){
    var $mRow = $(document.createElement('p'));
    var $mLab = $(document.createElement('span')).addClass('jrjReadLabel').html('Friend Status');
    $mRow.append($mLab);
    var $mVal = $(document.createElement('span')).addClass('jrjReadVal').html(this.friendReadStatus());
    $mRow.append($mVal);
    $mRow.append(this.clearBr());
    return $mRow;
};

ActUser.prototype.friendStatButtons = function(){
    var myThis = this;
    var mBut = {'Close': function(){ myThis.close(); } };
    return mBut;
};

ActUser.prototype.friendInfo = function(){
    var myThis = this;
    var $main = $(document.createElement('div')).addClass('mar5');
    var $mCell = $(document.createElement('div')).addClass('uCellLeft');
    var mWebsite = '';
    if(this.rec.website){
	mWebsite = urlFix(this.rec.website);
    }
    
    var $mRow = $(document.createElement('div')).addClass('uRow2');
    $mRow.append( $(document.createElement('div')).html('Username').addClass('uLab2') )
    $mRow.append( $(document.createElement('div') ).addClass('uVal2').html(this.rec.username) );
    $mRow.append(this.clearDiv());
    $mCell.append($mRow);
    
    $mRow = $(document.createElement('div')).addClass('uRow2');
    $mRow.append( $(document.createElement('div')).html('Name').addClass('uLab2') )
    $mRow.append( $(document.createElement('div') ).addClass('uVal2').html(this.rec.firstname+' '+this.rec.lastname) );
    $mRow.append(this.clearDiv());
    $mCell.append($mRow);

    $mRow = $(document.createElement('div')).addClass('uRow2');
    $mRow.append( $(document.createElement('div')).html('Title').addClass('uLab2') )
    $mRow.append( $(document.createElement('div') ).addClass('uVal2').html(this.rec.title) );
    $mRow.append(this.clearDiv());
    $mCell.append($mRow);
    
    $mRow = $(document.createElement('div')).addClass('uRow2');
    $mRow.append( $(document.createElement('div')).html('Website').addClass('uLab2') )
    $mRow.append( $(document.createElement('div') ).addClass('uVal2').html(this.rec.website) );
    $mRow.append(this.clearDiv());
    $mCell.append($mRow);
    
    $mRow = $(document.createElement('div')).addClass('uRow2');
    $mRow.append( $(document.createElement('div')).html('Type').addClass('uLab2') )
    $mRow.append( $(document.createElement('div') ).addClass('uVal2').html(this.rec.utype_text) );
    $mRow.append(this.clearDiv());
    $mCell.append($mRow);
    
    $mRow = $(document.createElement('div')).addClass('uRow2');
    $mRow.append( $(document.createElement('div')).html('Joined').addClass('uLab2') )
    $mRow.append( $(document.createElement('div') ).addClass('uVal2').html(this.rec.date_create) );
    $mRow.append(this.clearDiv());
    $mCell.append($mRow);

    $main.append($mCell);
    
    $mCell = $(document.createElement('div')).addClass('uCellRight');
    var $mImg = $( document.createElement('img') ).attr( {'src':imageSource(myThis.photoId(),'100'),'width':100,'height':100} ).addClass('center');
    $mCell.append($mImg);
    $main.append($mCell);

    $main.append(this.clearDiv());
    return $main;
};

ActUser.prototype.friendStatOpen = function(){
    var myThis = this;
    this.mode = 'read';
    this.reset();
    var $main = this.friendStatContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Current Friend Status', buttons: this.friendStatButtons()
		});
};

ActUser.prototype.friendStatContent = function(){
    var myThis = this;
    var mUsername = this.rec.username;
    var mStatus = this.rec.friend_status;
    var $mRow,$mBox,$mBut;
    var $main = this.getRoot();
    $main.addClass('uDialogRead');
    var $mH1 = $( document.createElement('h1') );
    $mH1.html('Your Friend Status for: ' + mUsername);
    $main.append($mH1);
    $main.append(this.friendInfo());
    $mBox = $( document.createElement('div') ).addClass('fbBorder5 mar5 pad5');
    $mRow = $( document.createElement('div') ).addClass('uHead2 red');
    if(mStatus == 'friend'){
	$mRow.html(mUsername + ' is currently your Friend');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button')).html('Remove Friend').addClass('fbMenuBut');
	$mBut.bind('click',function(){ myThis.friendConfirmOpen('remove'); });
	$mRow.append($mBut);
	$mBox.append($mRow);
	$mBut.button();
    }else if(mStatus == 'request_to'){	
	$mRow.html(mUsername + ' has requested to be your Friend on FishBlab');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('mar10 centerText');
	$mBut = $(document.createElement('button')).html('Add Friend').addClass('fbMenuBut');
	$mBut.bind('click',function(){ myThis.friendConfirmOpen('allow'); });
	$mRow.append($mBut);
	$mRow.append(this.clearDiv());
	$mBox.append($mRow);
	$mBut.button();
	$mRow = $(document.createElement('div')).addClass('mar10 centerText');
	$mBut = $(document.createElement('button')).html('Ignore Request').addClass('fbMenuBut');
	$mBut.bind('click',function(){ myThis.friendConfirmOpen('ignore'); });
	$mRow.append($mBut);
	$mRow.append(this.clearDiv());
	$mBox.append($mRow);
	$mBut.button();
	$mRow = $(document.createElement('div')).addClass('mar10 centerText');
	$mBut = $(document.createElement('button')).html('Block User').addClass('fbMenuBut');
	$mBut.bind('click',function(){ myThis.friendConfirmOpen('block'); });
	$mRow.append($mBut);
	$mRow.append(this.clearDiv());
	$mBox.append($mRow);
	$mBut.button();
    }else if(mStatus == 'request_from'){
	$mRow.html('Your Friend request to ' + mUsername + ' is currently pending');
	$mBox.append($mRow);
    }else if(mStatus == 'block_from'){
	$mRow.html('This User is blocking you');
	$mBox.append($mRow);
    }else if(mStatus == 'block_to'){
	$mRow.html('You are blocking ' + mUsername);
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button')).html('Remove Block');
	$mBut.bind('click',function(){ myThis.friendConfirmOpen('unblock'); });
	$mRow.append($mBut);
	$mBox.append($mRow);
	$mBut.button();
    }else if(fbUser.username == mUsername){
	$mRow.html('You will always be Your own Friend!');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('uHead2 centerText');
	$mBox.append($mRow);
    }else if(fbUser.username != mUsername){
	$mRow.html('Add ' + mUsername + ' as Your Friend on FishBlab?');
	$mBox.append($mRow);
	$mRow = $(document.createElement('div')).addClass('uHead2 centerText');
	$mBut = $(document.createElement('button')).html('Add Friend');
	$mBut.bind('click',function(){ myThis.friendConfirmOpen('add'); });
	$mRow.append($mBut);
	$mBox.append($mRow);
	$mBut.button();
    }
    $mRow = $(document.createElement('div')).attr({'id':'uMsg2'}).addClass('uMsg2');
    $mBox.append($mRow);
    $main.append($mBox);
    return $main;
};

ActUser.prototype.friendConfirmOpen = function(mAction){
    var myThis = this;
    this.action = mAction;
    this.mode = 'read';
    this.reset();
    var $main = this.friendConfirmContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title:'Confirm Friend Status', buttons: this.friendStatButtons()
		});
};

ActUser.prototype.friendConfirmContent = function(){
    var myThis = this;
    var mUsername = this.rec.username;
    var mStatus = this.action;
    var $mRow,$mBox,$mBut,mMsg;
    var $main = this.getRoot();
    $main.addClass('uDialogRead');
    var $mH1 = $( document.createElement('h1') );
    $mH1.html('Change FishBlab Status for User: ' + mUsername);
    $main.append($mH1);
    $main.append(this.friendInfo());
    var $mFrm = this.formNode();
    $mFrm.addClass('fbBorder5 mar5 pad5');
    $mRow = $( document.createElement('div') ).addClass('uHead2 red');
    if(mStatus == 'allow'){
	$mRow.html('You are allowing this Users Friend request');
	$mFrm.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button')).html('Confirm Add Friend');
	$mBut.bind('click',function(){ myThis.friendStatEdit('allow'); } );
	$mRow.append($mBut);
	$mFrm.append($mRow);
	$mBut.button();
	mMsg = 'This User will be able to view all of your \'Friends Only\' information.';
    }else if(mStatus == 'ignore'){
	$mRow.html('You are Ignoring this Friend request from this User');
	$mFrm.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button')).html('Confirm Ignore');
	$mBut.bind('click',function(){ myThis.friendStatEdit('ignore'); });
	$mRow.append($mBut);
	$mFrm.append($mRow);
	$mBut.button();
	mMsg = 'This Friend request will be ignored, the User will not be notified';
    }else if(mStatus == 'block'){
	$mRow.html('You are Blocking this User from contacting you');
	$mFrm.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button'));
	$mBut.html('Confirm Block');
	$mBut.bind('click',function(){ myThis.friendStatEdit('block'); });
	$mRow.append($mBut);
	$mFrm.append($mRow);
	$mBut.button();
	mMsg = 'This User will be blocked from sending you Friend requests and will be notified of this action';
    }else if(mStatus == 'unblock'){
	$mRow.html('You are UnBlocking this User');
	$mFrm.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button'));
	$mBut.html('Confirm UnBlock');
	$mBut.bind('click',function(){ myThis.friendStatEdit('unblock'); });
	$mRow.append($mBut);
	$mFrm.append($mRow);
	$mBut.button();
	mMsg = 'This User will be able to send you Friend requests';
  }else if(mStatus == 'remove'){
	$mRow.html('You are removing the User as your FishBlab.com Friend');
	$mFrm.append($mRow);
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button'));
	$mBut.html('Confirm Remove');
	$mBut.bind('click',function(){ myThis.friendStatRemove(); });
	$mRow.append($mBut);
	$mFrm.append($mRow);
	$mBut.button();
	mMsg = 'This User will be removed as your FishBlab.com Friend and will not be notified.';
    }else if(mStatus == 'add'){
	$mRow.html('You are adding '+ mUsername +' as your FishBlab.com Friend');
	$mFrm.append($mRow);
	mMsg = 'This User will need to confirm this request.';
	var $mFrm = this.formNode();
	$mRow = $(document.createElement('div')).addClass('bold mar5').html('Send a message with your request (optional)');
	$mFrm.append($mRow);
	var mNote = this.fieldByName('friend_note');
	$mFrm.append(this.editContentRow(mNote));
	$mRow = $(document.createElement('div')).addClass('centerText');
	$mBut = $(document.createElement('button')).html('Confirm Add Friend');
	$mBut.bind('click',function(){ myThis.friendStatAdd(); });
	$mRow.append($mBut);
	$mFrm.append($mRow);
	$mBut.button();
    }
    $mRow = $(document.createElement('div')).addClass('uHead2').html(mMsg);
    $mFrm.append($mRow);
    $mRow = $(document.createElement('div')).attr({id:'uMsg2'}).addClass('uMsg2');
    $mFrm.append($mRow);
    $main.append($mFrm);
    return $main;
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
    this.close();
    if(textStatus != 'success'){
	alert('Update failed: system error. Please try again');
    }else{
	var mMsg = json.desc; 
	if(json.friend_status){
	    this.rec.friend_status = json.friend_status;
	}
	showMsg(mMsg);
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
    this.close();
    if(textStatus != 'success'){
	alert('Update failed: system error. Please try again');
    }else{
	var mMsg = json.desc; 
	if(json.friend_status){
	    this.rec.friend_status = json.friend_status;
	}
	showMsg(mMsg);
    }
};

///////////////////////////////////////////
// ActOwner - FishBlab Current User
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

ActOwner.prototype.loginOpen = function(){
    if(userValid()){ return false; }
    var myThis = this;
    this.reset();
    var $main = this.loginContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'FishBlab Login', buttons: this.loginButtons()
		});
    this.setFocus('username');
};

ActOwner.prototype.loginContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var $mRow = $( document.createElement('div') ).addClass('frmSwitchLookup fbBorder5');
    var $mCell = $( document.createElement('div') ).addClass('floatLeft marRight5').html('Don\'t have an Account?');
    $mRow.append($mCell);
    $mCell = $( document.createElement('div') );
    var $mAnc = $( document.createElement('a') ).attr('href','/').addClass('bold floatLeft blue').html('Create a New Account');
    $mAnc.bind('click',function(){ ownerNew();return false; } );
    $mCell.append($mAnc);
    $mCell.append(this.clearDiv());
    $mRow.append($mCell);
    $main.append($mRow);

    $main.append(this.errorDivCreate());
    var $mFrm = this.formNode();
    var mUsername = this.fieldByName('username');
    var mPassword = this.fieldByName('password');
    $mFrm.append(this.editContentRow(mUsername));
    $mFrm.append(this.editContentRow(mPassword));
    $main.append($mFrm);

    $mRow = $( document.createElement('div') ).addClass('frmSwitchLink fbBorder5');
    $mCell = $( document.createElement('div') ).html('Forgot Your Password or Username?');
    $mRow.append($mCell);
    $mCell = $( document.createElement('div') );
    $mAnc = $( document.createElement('a') ).attr('href','/').addClass('bold blue').html('Find My Login or Password');
    $mAnc.bind('click',function(){ ownerResetStart();return false; } );
    $mCell.append($mAnc);
    $mRow.append($mCell);
    $main.append($mRow);
    return $main;
};

ActOwner.prototype.loginButtons = function(){
    var myThis = this;
    return { 'Back':function(){uDashGuest();}, 'Login':function(){ myThis.loginSubmit(); }, 'Cancel': function(){ myThis.close(); } };
};

ActOwner.prototype.loginValidate = function(){
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

ActOwner.prototype.loginSubmit = function(){
    if(this.loginValidate()){
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

ActOwner.prototype.loginSubmitCB = function(json,mStatus){
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
	    menuInit();
	    actUpdate();
	    showMsg(fbUser.username + ' you have been logged into FishBlab.com');
	    this.close();
	}
    }
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

ActOwner.prototype.newHeaderShow = true;

ActOwner.prototype.newHeader = function(){
    var $mRow = $( document.createElement('div') ).addClass('frmSwitchLookup fbBorder5');
    var $mCell = $( document.createElement('div') ).addClass('floatLeft marRight5').html('Already have an Account?');
    $mRow.append($mCell);
    $mCell = $( document.createElement('div') );
    var $mAnc = $( document.createElement('a') ).attr('href','/').addClass('bold floatLeft blue').html('Login');
    $mAnc.bind('click',function(){ ownerLogin();return false; } );
    $mCell.append($mAnc);
    $mCell.append(this.clearDiv());
    $mRow.append($mCell);
    return $mRow;
};

ActOwner.prototype.newValidate = function(){
    return this.newUserValidate();
};

ActOwner.prototype.editValidate = function(){
    return this.editUserValidate();
};

ActOwner.prototype.editButtons = function(){
    var myThis = this;
    var mOpt = {};
    if(this.mode == 'edit'){
	mOpt['Back'] = function(){ uDashAccount(); };
	mOpt['Save'] = function(){ myThis.editSubmit(); };
    }else{
	mOpt['Back'] = function(){ uDashGuest(); };
	mOpt['Create'] = function(){ myThis.editSubmit(); };
    }
    mOpt['Cancel'] = function(){ myThis.close(); };
    return mOpt;
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
	    menuInit();
	    this.close();
	    showMsg(fbUser.username + ' your Account settings were changed');
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
	    menuInit();
	    this.close();
	    showMsg(fbUser.username + ' your Account was created on FishBlab.com');
	}
    }
};


//////////////////////
// begin edit password
///////////////////////
ActOwner.prototype.editPassOpen = function(){
    if( ! userValid()){ return false; }
    var myThis = this;
    this.reset();
    var $main = this.editPassContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Edit Password', buttons: this.editPassButtons()
		});
    this.setFocus('password');
};

ActOwner.prototype.editPassContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var mPassword = this.fieldByName('password');
    var mVerify = this.fieldByName('password_verify');
    $main.append(this.errorDivCreate());
    var $mFrm = this.formNode();
    $mFrm.append(this.editContentRow(mPassword));
    $mFrm.append(this.editContentRow(mVerify));
    $main.append($mFrm);
    return $main;
};

ActOwner.prototype.editPassButtons = function(){
    var myThis = this;
    return { 'Back':function(){uDash();}, 'Change':function(){ myThis.editPassSubmit(); }, 'Cancel': function(){ myThis.close(); } };
};

ActOwner.prototype.editPassSubmit = function(){
    if(this.editPassValidate()){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	var myThis = this;
	var mData = {'password':this.getDomInputVal('password')};
	$.ajax({ url: '/user/a/aSaveUserPassword',	dataType: 'json', data:mData,
		    success: function(json,textStatus){ myThis.editPassSubmitCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }else{
	this.errorDisplay();
    }
};

ActOwner.prototype.editPassSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    showMsg(fbUser.username + ' your FishBlab.com password was changed');
	    this.close();
	}
    }
};

////////////////
// end edit password
//////

////////////////////
// begin reset login
////////////////////
/// start Reset Login

ActOwner.prototype.resetStartOpen = function(){
    if(userValid()){ return false; }
    var myThis = this;
    this.reset();
    var $main = this.resetStartContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Reset Password', buttons: this.resetStartButtons()
		});
    this.setFocus('email');
};

ActOwner.prototype.resetStartContent = function(){
    var myThis = this;
    var $main = this.getRoot();

    var $mRow = $( document.createElement('div') ).addClass('frmSwitchLookup fbBorder5');
    var $mCell = $( document.createElement('div') ).addClass('floatLeft marRight5').html('Don\'t have an Account?');
    $mRow.append($mCell);
    $mCell = $( document.createElement('div') );
    var $mAnc = $( document.createElement('a') ).attr('href','/').addClass('bold floatLeft blue').html('Create a New Account');
    $mAnc.bind('click',function(){ ownerNew();return false; } );
    $mCell.append($mAnc);
    $mCell.append(this.clearDiv());
    $mRow.append($mCell);
    $main.append($mRow);
    $main.append(this.errorDivCreate());
    var $mFrm = this.formNode();
    var mEmail = this.fieldByName('email');
    $mFrm.append(this.editContentRow(mEmail));
    $main.append($mFrm);
    return $main;
};

ActOwner.prototype.resetStartButtons = function(){
    var myThis = this;
    return { 'Back':function(){uDashGuest();},'Reset Password':function(){ myThis.resetStartSubmit(); }, 'Cancel': function(){ myThis.close(); } };
};

ActOwner.prototype.resetStartValidate = function(){
    this.errorClear();
    var mEmail = this.getDomInputVal('email');
    if( ! mEmail ){
	this.errorMsg = 'Please enter an email';
	this.setFocusError('email');
	return false;
    }
    return true;
};

ActOwner.prototype.resetStartSubmit = function(){
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

ActOwner.prototype.resetStartSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    ownerResetConfirm();
	}
    }
};

// User Reset found and sent
ActOwner.prototype.resetConfirmOpen = function(){
    if(userValid()){ return false; }
    var myThis = this;
    this.reset();
    var $main = this.resetConfirmContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Password Reset Sent', buttons: this.resetConfirmButtons()
		});
};

ActOwner.prototype.resetConfirmButtons = function(){
    var myThis = this;
    return { 'Close': function(){ myThis.close(); } };
};

ActOwner.prototype.resetConfirmContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var $mRow = $( document.createElement('h1') ).html('Account Confirmed - Reset Message sent');
    $main.append($mRow);
    $mRow = $( document.createElement('div') ).html('Your FishBlab Account was found and a message has been sent to your email account.<br />The message contains a link that will allow you to reset your password.<br />The message may take a few minutes to be delivered.');
    $main.append($mRow);
    return $main;
};

// Reset Password final
ActOwner.prototype.resetFinalOpen = function(){
    if(userValid()){ return false; }
    var myThis = this;
    this.reset();
    var $main = this.resetFinalContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Reset your FishBlab password', buttons: this.resetFinalButtons()
		});
};

ActOwner.prototype.resetFinalContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var mPassword = this.fieldByName('password');
    var mVerify = this.fieldByName('password_verify');
    $main.append(this.errorDivCreate());
    var $mFrm = this.formNode();
    $mFrm.append(this.editContentRow(mPassword));
    $mFrm.append(this.editContentRow(mVerify));
    $main.append($mFrm);
    return $main;
};

ActOwner.prototype.resetFinalButtons = function(){
    var myThis = this;
    return { 'Set New Password':function(){ myThis.resetFinalSubmit(); }, 'Cancel': function(){ myThis.close(); } };
};

ActOwner.prototype.resetFinalSubmit = function(){
    if(this.editPassValidate()){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	var myThis = this;
	var mData = {'password':this.getDomInputVal('password')};
	mData['reset_id'] = this['rid'];
	mData['reset_code'] = this['rcode'];
	$.ajax({ url: '/user/a/aReset', dataType: 'json', data:mData,
		    success: function(json,textStatus){ myThis.resetFinalSubmitCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }else{
	this.errorDisplay();
    }
};

ActOwner.prototype.resetFinalSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    ownerLogin();
	}
    }
};
// end reset

////////////
// feedback
ActOwner.prototype.feedOpen = function(){
    var myThis = this;
    this.reset();
    var $main = this.feedContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'FishBlab Feedback', buttons: this.feedButtons()
		});
};

ActOwner.prototype.feedButtons = function(){
    var myThis = this;
    return { 'Back':function(){uDashFB();}, 'Send':function(){myThis.feedSubmit();},'Close': function(){ myThis.close(); } };
};

ActOwner.prototype.feedValidate = function(){
    this.errorClear();
    var mFeed = this.getDomInputVal('feed');
    if( ! mFeed ){
	this.errorMsg = 'Please enter feedback';
	this.setFocusError('feed');
	return false;
    }
    return true;
};

ActOwner.prototype.feedSubmit = function(){
    if(this.feedValidate){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	var myThis = this;
	var mData = {'feed':this.getDomInputVal('feed')};
	$.ajax({ url: '/user/a/aFeedSubmit',dataType: 'json', data:mData,
		    success: function(json,textStatus){ myThis.feedSubmitCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); }
	    });
    }
};

ActOwner.prototype.feedSubmitCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.close();
	    showMsg('Thanks for your Feedback!');
	}
    }
}

ActOwner.prototype.feedContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var $mRow = $( document.createElement('div') ).addClass('fbFormHead').html('Have a question or suggestion?<br>Let us know!');
    $main.append($mRow);
    $main.append(this.errorDivCreate());
    var $mFrm = this.formNode();
    var mFeed = this.fieldByName('feed');
    $mFrm.append(this.editContentRow(mFeed));
    $main.append($mFrm);
    return $main;
};
// end feed

// owner photo
ActOwner.prototype.photoOpen = function(){
    var myThis = this;
    this.reset();
    var $main = this.photoContent();
    $main.dialog({ autoOpen: true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: 'Your FishBlab Profile Photo', buttons: this.photoButtons()
		});
};

ActOwner.prototype.photoContent = function(){
    var myThis = this;
    var $main = this.getRoot();
    var $mRow = $( document.createElement('div') ).addClass('fbFormHead').html('Your FishBlab profile Photo');
    $main.append($mRow);
    $main.append(this.errorDivCreate());
    var $mFrm = this.formNode();
    $mRow = $( document.createElement('div') );
    var $mImg = $( document.createElement('img') ).attr( {'src':imageSource(myThis.photoId(),'300x300'),'width':300,'height':300} ).addClass('uImg');
    $mRow.append($mImg);
    $mFrm.append($mRow);
    $main.append($mFrm);
    return $main;
};

ActOwner.prototype.photoButtons = function(){
    var myThis = this;
    var mBut = {};
    mBut['Back'] = function(){ uDashAccount(); };
    mBut['Upload'] = function(){ myThis.uploadPhoto(); };
    if(this.rec.photo_id){
	mBut['Delete'] = function(){ myThis.photoRemove(); };
    }
    mBut['Cancel'] = function(){ myThis.close(); };
    return mBut;
};

ActOwner.prototype.uploadPhoto = function(){
    var mObj = this.childObjGet('photo');
    if( ! mObj){
	mObj = this.childObjNew('photo');
    }
    mObj.uploadType = 'profile';
    mObj.urlUpload = '/user/a/upload';
    mObj.uploadOpen();
};

ActOwner.prototype.photoRemove = function(){
    var myThis = this;
    if( confirm('Are you sure you want to remove your Profile photo?') ){
	if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
	$.ajax({'url':'/user/a/aDeletePhoto', data:{ photo_id:this.rec.photo_id }, 
		    success: function(json,textStatus){ myThis.photoRemoveCB(json, textStatus); },
		    error: function(){ myThis.ajaxError(); },
		    'dataType': 'json'
			});
    }
};

ActOwner.prototype.photoRemoveCB = function(json,textStatus){
    this.ajaxBusy = false;
    if(json.error){
	alert(json.desc);
    }else{
	fbUser.photo_id = false;
	this.photoOpen();
    }
};
/// end photo

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

ActOwnerEmail.prototype.buttons = function(){
    var myThis = this;
    return { 'Back':function(){uDash();}, 'Save': function(){ myThis.editSubmit(); }, 'Close': function(){ myThis.close(); } };
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
	    this.close();
	}
    }
}

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
    var $mLab = $(document.createElement('span')).html('Open - User chooses to Join').attr('htmlFor','sec_pub').addClass('jrjLabelGroupOpt');
    $mRow.append($mLab,this.clearBr());
    $mBox.append($mRow);
    
    $mRow = $(document.createElement('div')).addClass('pad2');
    $mBut = $(document.createElement('input')).attr({'type':'radio','name':'secOpt','value':5,'id':'sec_req'});
    $mBut.bind('change',function(){ myThis.groupSecSet(5); });
    if(mSec == 5){ $mBut.attr({'checked':true}); }
    $mRow.append($mBut);
    $mLab = $(document.createElement('span')).html('Request - User asks to join, Admin must Approve').attr('htmlFor','sec_req').addClass('jrjLabelGroupOpt');
    $mRow.append($mLab,this.clearBr());
    $mBox.append($mRow);

    $mRow = $(document.createElement('div')).addClass('pad2');
    $mBut = $(document.createElement('input')).attr({'type':'radio','name':'secOpt','value':10,'id':'sec_pri'});
    $mBut.bind('change',function(){ myThis.groupSecSet(10); });
    if(mSec == 10){ $mBut.attr({'checked':true}); }
    $mRow.append($mBut);
    $mLab = $(document.createElement('span')).html('Closed - Admin must Add User').attr('htmlFor','sec_pri').addClass('jrjLabelGroupOpt');
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

///////////////////////////////////////////
// ActSelect - Create new Activity Wizard
///////////////////////////////////////////
ActSelect.prototype = new ActClass();
ActSelect.prototype.constructor = ActSelect;
function ActSelect() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgSelect);
    this.statusTitle = 'Select a Fishing Activity';
}

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
    this.changePageMenu('actNew');
    return false;
};

ActAll.prototype.editOpen = function(){
    return false;
};

ActAll.prototype.detailOpen = function(){
    return false;
};
