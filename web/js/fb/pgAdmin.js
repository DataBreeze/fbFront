$(document).ready( function(){
	$('#fbMap').css({'display':'block'});
	initGlobal();
	initJQG();
	initAdmin();
	window.name = 'admin';
    });

function initAdmin(){
    JRJ.map.obj = new MapApp();
    JRJ.map.obj.display();
}

function jrjLoadMap(){
    actMapAdmin();
}

ActClass.prototype.parentLoadPromo = function(){
    var myThis = this;
    $(this.countNode).html(this.countTotal);
    var $mBox = $(this.bodyNode);
    $mBox.children().remove();
    var $mRow = $(document.createElement('div')).addClass('centerText mar5');
    var $mBut = $(document.createElement('button')).html('New Promo Send');
    $mBut.bind('click',function(){myThis.newOpen();});
    $mBut.button();
    $mRow.append($mBut);
    $mBox.append($mRow);
    var $mTab = $(document.createElement('table')).attr( {'cellspacing':0,'cellpadding':0}).addClass('jrjTable padTop5');
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('th') ).html('Date') );
    $mTr.append( $( document.createElement('th') ).html('Promo') );
    $mTr.append( $( document.createElement('th') ).html('Status') );
    $mTab.append($mTr);
    $mTbody = $(document.createElement('tbody'));
    if(this.count == 0){
	$mTr = $( document.createElement('tr') ).addClass('jrjInactive');
	$mTr.append( $( document.createElement('td') ).attr({'colspan':2}).html('No Sents yet') );
	$mTbody.append($mTr);
    }else{
	for(var i=0; i<this.recList.length; i++){
	    $mTbody.append(this.parentLoadRow(this.recList[i]));
	}
    }
    $mTab.append($mTbody);
    $mBox.append($mTab);
};

ActClass.prototype.parentLoadPromoRow = function(mRec){
    var myThis = this;
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('td') ).html(mRec.date_create) );
    $mTr.append( $( document.createElement('td') ).html(mRec.caption) );
    $mTr.append( $( document.createElement('td') ).html(mRec.status_text) );
    $mTr.bind('click',function(){myThis.readOpen(mRec);return false; } );
    $mTr.bind('mouseover',function(){$(this).removeClass().addClass('jrjActive');});
    $mTr.bind('mouseout',function(){$(this).removeClass().addClass('jrjInactive');});
    return $mTr;
};

///////////////////////////////////////////
// ActAdminUser - Admin Users
///////////////////////////////////////////
ActAdminUser.prototype = new ActClass();
ActAdminUser.prototype.constructor = ActAdminUser;
function ActAdminUser() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgAdminUser);
    //this.filterInit();
}

ActAdminUser.prototype.validate = function(){
    if(this.mode == 'new'){
	return this.newUserValidate();
    }else if(this.mode == 'edit'){
	return this.editUserValidate();
    }
};

///////////////////////////////////////////
// ActPromo - Promotion
///////////////////////////////////////////
ActPromo.prototype = new ActClass();
ActPromo.prototype.constructor = ActPromo;
function ActPromo() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgPromo);
}

///////////////////////////////////////////
// ActPromoSent - Promotion Sent
///////////////////////////////////////////
ActPromoSent.prototype = new ActClass();
ActPromoSent.prototype.constructor = ActPromoSent;
function ActPromoSent() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgPromoSent);
    this.rootName ='jrjDialog3';
}

ActPromoSent.prototype.newOpen = function(){
    ActClass.prototype.newOpen.call(this);
    this.setDomInputVal('pid',this.pid);
};

ActPromoSent.prototype.initAsChild = function(){
    this.cache = {};
};

ActPromoSent.prototype.parentLoad = function(){
    return ActClass.prototype.parentLoadPromo.call(this);

    var myThis = this;
    $(this.countNode).html(this.countTotal);
    var $mBox = $(this.bodyNode);
    $mBox.children().remove();
    var $mRow = $(document.createElement('div')).addClass('centerText mar5');
    var $mBut = $(document.createElement('button')).html('New Promo Send');
    $mBut.bind('click',function(){myThis.newOpen();});
    $mBut.button();
    $mRow.append($mBut);
    $mBox.append($mRow);
    var $mTab = $(document.createElement('table')).attr( {'cellspacing':0,'cellpadding':0}).addClass('jrjTable padTop5');
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('th') ).html('Date') );
    $mTr.append( $( document.createElement('th') ).html('Email To') );
    $mTr.append( $( document.createElement('th') ).html('Email From') );
    $mTab.append($mTr);
    $mTbody = $(document.createElement('tbody'));
    if(this.count == 0){
	$mTr = $( document.createElement('tr') ).addClass('jrjInactive');
	$mTr.append( $( document.createElement('td') ).attr({'colspan':2}).html('No Sents yet') );
	$mTbody.append($mTr);
    }else{
	for(var i=0; i<this.recList.length; i++){
	    $mTbody.append(this.parentLoadRow(this.recList[i]));
	}
    }
    $mTab.append($mTbody);
    $mBox.append($mTab);
};

ActPromoSent.prototype.parentLoadRow = function(mRec){
    return ActClass.prototype.parentLoadPromoRow.call(this,mRec);

    var myThis = this;
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('td') ).html(mRec.date_create) );
    $mTr.append( $( document.createElement('td') ).html(mRec.email_to) );
    $mTr.append( $( document.createElement('td') ).html(mRec.email_from) );
    $mTr.bind('click',function(){myThis.readOpen(mRec);return false; } );
    $mTr.bind('mouseover',function(){$(this).removeClass().addClass('jrjActive');});
    $mTr.bind('mouseout',function(){$(this).removeClass().addClass('jrjInactive');});
    return $mTr;
};

ActPromoSent.prototype.ajaxNewCB = function(json,mStatus){
    ActClass.prototype.ajaxNewCB.call(this,json,mStatus);
    if(this.pid){
	delete this.cache[this.pid];
	this.parentLoad();
	pageShow('promoInit','admin');
    }
};

ActPromoSent.prototype.ajaxEditCB = function(json,mStatus){
    ActClass.prototype.ajaxEditCB.call(this,json,mStatus);
    if(this.pid){
	delete this.cache[this.pid];
	this.parentLoad();
    }
};

///////////////////////////////////////////
// ActPromoSentUser - Promotion Sent
///////////////////////////////////////////
ActPromoSentUser.prototype = new ActClass();
ActPromoSentUser.prototype.constructor = ActPromoSentUser;
function ActPromoSentUser() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgPromoSentUser);
    this.rootName ='jrjDialog3';
    this.promoList = [];
}

ActPromoSentUser.prototype.newOpen = function(){
    ActClass.prototype.newOpen.call(this);
    this.setDomInputVal('promo_user_id',this.pid);
};

ActPromoSentUser.prototype.initAsChild = function(){
    this.cache = {};
};

ActPromoSentUser.prototype.parentLoad = function(){
    return ActClass.prototype.parentLoadPromo.call(this);

    var myThis = this;
    $(this.countNode).html(this.countTotal);
    var $mBox = $(this.bodyNode);
    $mBox.children().remove();
    var $mRow = $(document.createElement('div')).addClass('centerText mar5');
    var $mBut = $(document.createElement('button')).html('New Promo Send');
    $mBut.bind('click',function(){myThis.newOpen();});
    $mBut.button();
    $mRow.append($mBut);
    $mBox.append($mRow);
    var $mTab = $(document.createElement('table')).attr( {'cellspacing':0,'cellpadding':0}).addClass('jrjTable padTop5');
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('th') ).html('Date') );
    $mTr.append( $( document.createElement('th') ).html('Promo') );
    $mTr.append( $( document.createElement('th') ).html('Status') );
    $mTab.append($mTr);
    $mTbody = $(document.createElement('tbody'));
    if(this.count == 0){
	$mTr = $( document.createElement('tr') ).addClass('jrjInactive');
	$mTr.append( $( document.createElement('td') ).attr({'colspan':2}).html('No Sents yet') );
	$mTbody.append($mTr);
    }else{
	for(var i=0; i<this.recList.length; i++){
	    $mTbody.append(this.parentLoadRow(this.recList[i]));
	}
    }
    $mTab.append($mTbody);
    $mBox.append($mTab);
};

ActPromoSentUser.prototype.parentLoadRow = function(mRec){
    return ActClass.prototype.parentLoadPromoRow.call(this,mRec);

    var myThis = this;
    var $mTr = $( document.createElement('tr') ).addClass('jrjInactive');
    $mTr.append( $( document.createElement('td') ).html(mRec.date_create) );
    $mTr.append( $( document.createElement('td') ).html(mRec.caption) );
    $mTr.append( $( document.createElement('td') ).html(mRec.status_text) );
    $mTr.bind('click',function(){myThis.readOpen(mRec);return false; } );
    $mTr.bind('mouseover',function(){$(this).removeClass().addClass('jrjActive');});
    $mTr.bind('mouseout',function(){$(this).removeClass().addClass('jrjInactive');});
    return $mTr;
};

ActPromoSentUser.prototype.ajaxNewCB = function(json,mStatus){
    ActClass.prototype.ajaxNewCB.call(this,json,mStatus);
    if(this.pid){
	delete this.cache[this.pid];
	this.parentLoad();
	this.readOpen(json.record);
    }
};

ActPromoSentUser.prototype.ajaxEditCB = function(json,mStatus){
    ActClass.prototype.ajaxEditCB.call(this,json,mStatus);
    if(this.pid){
	delete this.cache[this.pid];
	this.parentLoad();
    }
};

ActPromoSentUser.prototype.delCB = function(json,mStatus){
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

ActPromoSentUser.prototype.newOpen = function(){
    var myThis = this;
    var mData = {};
    $.ajax({ 'url': '/admin/a/aPromoAll', dataType:'json', 'data': mData,
		success: function(json,textStatus){ myThis.newOpenCB(json, textStatus); },
		error: function(){}
	});
};

ActPromoSentUser.prototype.newOpenCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    this.promoList = json.records;
	    this.close();
	    ActClass.prototype.newOpen.call(this);
	}
    }
};

ActPromoSentUser.prototype.newContent = function(){
    var $main = ActClass.prototype.newContent.call(this);
    this.setDomInputVal('promo_user_id',this.pid);
    return $main;
};

ActPromoSentUser.prototype.promoEditSelect = function(){
    var mInp = document.createElement('select');
    $( mInp ).css('display','block').attr( {'name':'pid'} ).addClass(this.inputClassName);
    //var $mOpt = $( document.createElement('option')).attr({value:false}).html('');
    // $(mInp).append($mOpt);
    for(var i=0; i<this.promoList.length; i++){
	var mPromo = this.promoList[i];
	var $mOpt = $( document.createElement('option')).attr({value:mPromo.id}).html(mPromo.caption);
	$(mInp).append($mOpt);
    }
    this.fieldByName('pid')['domElement'] = mInp;
    return mInp;
};

ActPromoSentUser.prototype.promoProcessInit = function(){
    var mStatus = this.rec.status;
    if(mStatus == 5){
	alert('This promo has been sent');
    }else{
	this.previewShow();
    }
}

ActPromoSentUser.prototype.previewShow = function(){
    window.open('http://admin.fishblab.com/promo/' + this.rec.id,'adminpop');
    return false;
};

ActPromoSentUser.prototype.promoSend = function(){
    var mData = {'id':this.rec.id};
    $.ajax({ url: '/admin/a/promoSend', dataType: 'json', 'data':mData,
		success: function(html,textStatus){ myThis.promoSendCB(json,textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

ActPromoSentUser.prototype.promoSendCB = function(json,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    alert(json.desc);
	}else{
	    alert('Promo Sent');
	    this.close();
	}
    }
};

///////////////////////////////////////////
// ActAdminFish - Fish
///////////////////////////////////////////
ActAdminFish.prototype = new ActClass();
ActAdminFish.prototype.constructor = ActAdminFish;
function ActAdminFish() {
    ActClass.call(this);
    this.loadObjSettings(jrjCfgAdminFish);
}
