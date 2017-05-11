///////////////////////////////////////////
// MobPop - Dialog base class
///////////////////////////////////////////
function MobPop() {
    
}

MobPop.prototype.title = 'FishBlab';
MobPop.prototype.dataThemeHead = 'b';
MobPop.prototype.dataThemeBody = 'c';
MobPop.prototype.okButton = true;
MobPop.prototype.cancelButton = false;
MobPop.prototype.content = 'Content';
MobPop.prototype.dataMini = 'false';
MobPop.prototype.rootName = 'mobDetail';
MobPop.prototype.formId = 'mobPopForm';

MobPop.prototype.getRoot = function(){
    return $('#' + this.rootName + 'Popup');
};

MobPop.prototype.reset = function(){
    this.getRoot().empty();
};

MobPop.prototype.formNode = function(){
    var myThis = this;
    this.jrjForm =  document.createElement('form');
    $(this.jrjForm).attr({'id':myThis.formId,'action':'#','method':'get'});
    $(this.jrjForm).bind('submit',function(){return false;});
    return $(this.jrjForm);
};

MobPop.prototype.popClose = function(){
    var myThis = this;
    var $mA = $( document.createElement('a') ).attr({'href':'#','data-role':'button','data-theme':'a','data-icon':'delete','data-iconpos':'notext'}).addClass("ui-btn-right").html('Close');
    $mA.on('click',function(){ myThis.close(); } );
    this.getRoot().append($mA);
};

MobPop.prototype.open = function(mOpt){
    var myThis = this;
    this.reset();
    var $pop = this.getRoot();
    $pop.attr({'data-theme':"b",'data-overlay-theme':'a'}).addClass('ui-corner-all');
    this.popClose();
    this.popHeader();
    this.popContent();
    //$pop.page();
    JRJ.popupIsActive = true;
    $pop.trigger('create');
    //$pop.popup();
    $pop.popup('open',{'transition':'none','history':false});
    $pop.off().on('popupafterclose', function(event, ui) { JRJ.popupWasClosed = true;} );
    this.afterOpen();
};

MobPop.prototype.afterOpen = function(){

};

MobPop.prototype.popHeader = function(){
    var myThis = this;
    var $mDiv = $( document.createElement('div') ).attr({'data-role':'header','data-theme':myThis.dataThemeHead}).addClass('ui-corner-top');
    $mDiv.append( $( document.createElement('h2') ).html(this.title).addClass('center ui-title') );
    this.getRoot().append($mDiv);
};

MobPop.prototype.popContent = function(){
    var myThis = this;
    var $mDiv = $( document.createElement('div') ).attr({'data-role':'content'}).html(myThis.content)
    $mDiv.append( this.popButtons() );
    this.getRoot().append($mDiv);
};

MobPop.prototype.popButtons = function(){
    var myThis = this, $mBut;
    var $mDiv = $( document.createElement('div') );
    if(this.okButton){
	$mBut = $( document.createElement('a') ).attr({'data-role':'button','data-inline':'true', 'data-mini':this.dataMini, 'href':'/'}).html('OK').on('click', function(){ myThis.ok(); return false;});
	$mDiv.append($mBut);
    }
    if(this.cancelButton){
	$mBut = $( document.createElement('a') ).attr({'data-role':'button','data-inline':'true', 'data-mini':this.dataMini, 'href':'/'}).html('Cancel').on('click', function(){ myThis.close(); return false;});
	$mDiv.append($mBut);
    }
    return $mDiv;
};

MobPop.prototype.ok = function(){
    var myThis = this;
    this.close();
};

MobPop.prototype.close = function(){
    this.getRoot().popup('close');
};

///////////////////////////////////////////
// PopFriend - Friend status dialog
///////////////////////////////////////////
MobPopFriend.prototype = new MobPop();
MobPopFriend.prototype.constructor = MobPopFriend;
function MobPopFriend() {
    MobPop.call(this);
    this.title = 'Friend Status';
}

MobPopFriend.prototype.okButton = false;
MobPopFriend.prototype.cancelButton = true;

MobPop.prototype.popHeader = function(){
    return true;
};

MobPopFriend.prototype.popContent = function(){
    var $mBut,mStr;
    var mRec = this.rec;
    var myThis = this;
    var mUsername = mRec.username;
    var mStatus = mRec.friend_action;
    var $mDiv = $( document.createElement('div') ).attr({'data-role':'content'}).addClass('ui-corner-bottom ui-content');
    if(mRec.friend_action == 'add'){
	//$mRow = $(document.createElement('div')).addClass('bold mar5').html('Send a message with your request (optional)');
	//$mDiv.append($mRow);
	//var mNote = this.fieldByName('friend_note');
	//$mFrm.append(this.editContentRow(mNote));
    }
    var $mRow = $( document.createElement('div') ).addClass('ui-grid-solo ui-bar ui-bar-e').html(myThis.msg);
    $mDiv.append($mRow);
    $mDiv.append( this.popButtons() );
    this.getRoot().append($mDiv);
};

MobPopFriend.prototype.popButtons = function(){
    var myThis = this, $mBut;
    var $mDiv = $( document.createElement('div') );
    if(this.butSub){
	$mBut = $( document.createElement('a') ).attr({'data-role':'button','data-theme':'b','data-inline':'false', 'data-mini':this.dataMini, 'href':'/'}).html(myThis.butLabel).on('click', myThis.butSub);
	$mDiv.append($mBut);
    }
    $mBut = $( document.createElement('a') ).attr({'data-role':'button','data-inline':'false', 'data-mini':this.dataMini, 'href':'/'}).html('Cancel').on('click', function(){ myThis.close(); return false;});
    $mDiv.append($mBut);
    return $mDiv;
};


///////////////////////////////////////////
// PopSearch - Search popup on map page
///////////////////////////////////////////
MobPopSearch.prototype = new MobPop();
MobPopSearch.prototype.constructor = MobPopSearch;
function MobPopSearch() {
    MobPop.call(this);
    this.title = 'Location Search';
}

MobPopSearch.prototype.rootName = 'mobMap';
MobPopSearch.prototype.okButton = false;
MobPopSearch.prototype.cancelButton = true;

MobPopSearch.prototype.popContent = function(){
    var myThis = this;
    var $mForm = this.formNode();
    $mForm.addClass('ui-content').on('submit',function(){ mobSearchSubmit();return false;});
    var $mRow = $(document.createElement('div')).attr({'data-role':'fieldcontain'});
    var $mLab = $( document.createElement('label') ).attr({'for':'locInput'}).html('New Location:').addClass('mobSearchLabel');
    $mRow.append($mLab);
    var mInp = document.createElement('input');
    $(mInp).attr( {'type':'search','name':'locInput','id':'locInput' });
    $mRow.append(mInp);
    this.searchInput = mInp;
    $mForm.append($mRow);
    $mBut = $(document.createElement('a')).attr({'data-role':'button','data-theme':'b','href':'#'}).html('Search').on('click',function(){mobSearchSubmit();return false;});
    $mForm.append($mBut);
    $mBut = $( document.createElement('a') ).attr({'data-role':'button','data-inline':'false', 'data-mini':this.dataMini, 'href':'/'}).html('Cancel').on('click', function(){ myThis.close(); return false;});
    $mForm.append($mBut);
    this.getRoot().append($mForm);
};

MobPopSearch.prototype.popButtons = function(){
    return false;
};

MobPopSearch.prototype.afterOpen = function(){
    $(this.searchInput).focus();
};

///////////////////////////////////////////
// PopSimple - Simple
///////////////////////////////////////////
MobPopSimple.prototype = new MobPop();
MobPopSimple.prototype.constructor = MobPopSimple;
function MobPopSimple(mOpt) {
    MobPop.call(this);
    this.title = mOpt.title;
    this.content = mOpt.content;
}

