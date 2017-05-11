var emailRegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/

function DialogClass(){
    this.fields = {};
    this.opt = {};
    this.enforceDirty = false;
    this.requireLogin = false;
    this.ajaxBusy = false;
    this.enterKeySubmit = false;
}
DialogClass.prototype.init = function(){};

DialogClass.prototype.rootName = 'jrjDialog';

DialogClass.prototype.getRoot = function(){
    return $('#' + this.rootName);
};

DialogClass.prototype.close = function(){
    var $main = this.getRoot();
    if($main.dialog('isOpen')){
	$main.dialog('close'); 
    }
    return $main;
};

DialogClass.prototype.reset = function(){
    var $main = this.getRoot();
    $main.children().remove();
    $main.html('');
    $main.removeClass();
    return $main;
};

DialogClass.prototype.display = function(){
    var myThis = this;
    if( this.requireLogin && ( ! userValid()) ){ return false; }
    this.reset();
    var $main = this.content();
    $main.dialog({ 'autoOpen': true, height: 'auto', width: 'auto', minWidth:200, modal: true, show:'slide',
		position: 'center', closeOnEscape: true, title: this.title(), buttons: this.buttons()
		});
    this.focus();
    if(this.enterKeySubmit){
	$main.keyup(function(e) {
		if (e.keyCode == 13) {
		    myThis.submit();
		}
	    });
    }
    return false;
};

DialogClass.prototype.content = function(){
};

DialogClass.prototype.buttons = function(){
    var myThis = this;
    return { 'Save Changes':function(){ myThis.submit(); }, 'Cancel': function(){ myThis.close(); } };
};

DialogClass.prototype.inputClassName = function(){
    return 'text ui-widget-content ui-corner-all';
};

DialogClass.prototype.formId = function(){
    return 'jrjDialogForm';
};

DialogClass.prototype.formNode = function(){
    var myThis = this;
    this.form =  document.createElement('form');
    $(this.form).attr('id',myThis.formId);
    $(this.form).bind('submit',function(){return false;});
    return $(this.form);
};

DialogClass.prototype.dirty = function(){
    var myThis = this;
    if(this.enforceDirty){
	if(this.rec){
	    for(var mName in this.fields){
		//alert( this.rec[mName] +'!='+ $(myThis.fields[mName]).val() );
		if( this.rec[mName] != $(myThis.fields[mName]).val() ){
		    return true;
		}
	    }
	}
	return false;
    }else{
	return true;
    }
};

DialogClass.prototype.clearDiv = function(){
    return $( document.createElement('div') ).addClass('clear');
};

DialogClass.prototype.clearBr = function(){
    return $( document.createElement('br') ).addClass('clear');
};

DialogClass.prototype.errorClear = function(){
    $(this.errorDiv).css('display','none');
    for(var name in this.fields){
	$(this.fields[name]).removeClass('fbFormErr');
    }
};

DialogClass.prototype.errorDisplay = function(){
    $(this.errorDiv).css('display','block');
    $(this.errorDiv).html(this.errorMsg);
};

DialogClass.prototype.errorDivCreate = function(){
    this.errorDiv = document.createElement('div');
    $( this.errorDiv ).attr('id','jrjDialogError').addClass('fbBorder5');
    return this.errorDiv;
};

DialogClass.prototype.submit = function(){
    if( ! this.ajaxBusy){
	if(this.dirty()){
	    if(this.validate()){
		this.ajaxSend();
	    }else{
		this.errorDisplay();
	    }
	}
    }
};

DialogClass.prototype.fieldsAndValues = function(){
    var mHash = {};
    for(var mName in this.fields){
	mHash[mName] = $(this.fields[mName]).val();
    }
    return mHash;
};

DialogClass.prototype.title = function(){
    return 'FishBlab';
};

DialogClass.prototype.focus = function(){
    return false; 
};

DialogClass.prototype.ajaxError = function(){
    this.ajaxBusy = false;
    //alert('Ajax system error');
    return false;
};

DialogClass.prototype.validate = function(){
    return true;
};

DialogClass.prototype.photoId = function(){
    if(this.rec.photo_id){
	this.photo_id = this.rec.photo_id;
    }else{
	this.photo_id = fbDefaultProfileId;
    }
    return this.photo_id;
};

DialogClass.prototype.ajaxGetUserCB = function(json,textStatus){
    if(textStatus != 'success'){
	this.errorDisplay('Error retrieving User Settings: '+json.desc);
    }else{
	if(json.error){
	    this.errorDisplay('System error retrieving User Settings');
	}else{
	    this.rec = json.user;
	    fbUserPub[this.rec.username] = this.rec;
	    this.display2();
	}
    }
};


//////////////////////////
// DialogUDash - user dashboard (account options) dialog
//////////////////////////
DialogUDash.prototype = new DialogClass();
DialogUDash.prototype.constructor = DialogUDash;
function DialogUDash() {
    DialogClass.call(this);
    this.requireLogin = true;
}

DialogUDash.prototype.title = function(){
    return 'My Profile Home';
};

DialogUDash.prototype.focus = function(){
    $('.fbMenuBut').blur();
    return false; 
};

DialogUDash.prototype.buttons = function(){
    var myThis = this;
    return { 'Close': function(){ myThis.close(); } };
};

DialogUDash.prototype.display = function(){
    if( ! userValid() ){ return false; }
    DialogClass.prototype.display.call(this);
};

DialogUDash.prototype.content = function(){
    var myThis = this;
    var $main = this.getRoot();
    var mapMode = mapModeActive();
    var $mRow = $( document.createElement('div') ).addClass('mar10');
    var $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('My Account Settings');
    $mBut.bind('click',function(){ uDashAccount();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Manage Email Options');
    $mBut.bind('click',function(){ ownerEditEmail();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);
    if(false){
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mRow.html('To manage Groups/Friends<br />You must switch to Map View');
	$main.append($mRow);
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Switch to Map View');
	$mBut.bind('click',function(){ myThis.close(); mapModeSwitch();return false; } );
	$mBut.button();
	$mRow.append($mBut);
	$main.append($mRow);
    }
    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Manage Friends');
    $mBut.bind('click',function(){ uFriendDash();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    //$main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Manage Groups');
    $mBut.bind('click',function(){ uGroupDash();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    //$main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Logout');
    $mBut.bind('click',function(){ logout();myThis.close();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);
    
    return $main;
};

DialogUDash.prototype.submit = function(){
    this.close();
};



//////////////////////////
// DialogUDashGuest - user dashboard (account options) dialog
//////////////////////////
DialogUDashGuest.prototype = new DialogClass();
DialogUDashGuest.prototype.constructor = DialogUDashGuest;
function DialogUDashGuest() {
    DialogClass.call(this);
}

DialogUDashGuest.prototype.title = function(){
    return 'Guest Options';
};

DialogUDashGuest.prototype.focus = function(){
    $('.fbMenuBut').blur();
    return false; 
};

DialogUDashGuest.prototype.buttons = function(){
    var myThis = this;
    return { 'Close': function(){ myThis.close(); } };
};

DialogUDashGuest.prototype.display = function(){
    if( userValid() ){ return false; }
    DialogClass.prototype.display.call(this);
};

DialogUDashGuest.prototype.content = function(){
    var myThis = this;
    var $main = this.getRoot();

    var $mRow = $( document.createElement('div') ).addClass('mar10');
    var $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Login');
    $mBut.bind('click',function(){ ownerLogin();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Create Account');
    $mBut.bind('click',function(){ ownerNew();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Lookup/Reset Account');
    $mBut.bind('click',function(){ ownerResetStart();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);
    
    return $main;
};

DialogUDashGuest.prototype.submit = function(){
    this.close();
};


//////////////////////////
// DialogUDashFB - user dashboard (account options) dialog
//////////////////////////
DialogUDashFB.prototype = new DialogClass();
DialogUDashFB.prototype.constructor = DialogUDashFB;
function DialogUDashFB() {
    DialogClass.call(this);
}

DialogUDashFB.prototype.title = function(){
    return 'FishBlab Menu';
};

DialogUDashFB.prototype.focus = function(){
    $('.fbMenuBut').blur();
    return false; 
};

DialogUDashFB.prototype.buttons = function(){
    var myThis = this;
    return { 'Close': function(){ myThis.close(); } };
};

DialogUDashFB.prototype.display = function(){
    DialogClass.prototype.display.call(this);
};

DialogUDashFB.prototype.content = function(){
    var myThis = this;
    var $main = this.getRoot();

    var $mRow = $( document.createElement('div') ).addClass('mar10');
    var $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Home');
    $mBut.bind('click',function(){ fbHome();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    var $mRow = $( document.createElement('div') ).addClass('mar10');
    var $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Map Home');
    $mBut.bind('click',function(){ fbHomeMap();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('a') ).addClass('fbMenuBut').html('Mobile Home').attr({'href':'http://m.fishblab.com'});
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    if(fbUser.jrjSec){
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Admin Home');
	$mBut.bind('click',function(){ fbAdminMap();return false; } );
	$mBut.button();
	$mRow.append($mBut);
	$main.append($mRow);
    }
    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Activity');
    $mBut.bind('click',function(){ uDashAct();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Feedback');
    $mBut.bind('click',function(){ ownerFeed();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('About');
    $mBut.bind('click',function(){ pageShow("about");return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Contact');
    $mBut.bind('click',function(){ pageShow("contact");return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Terms');
    $mBut.bind('click',function(){ pageShow("terms");return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);
 
    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Privacy');
    $mBut.bind('click',function(){ pageShow("privacy");return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    return $main;
};

DialogUDashFB.prototype.submit = function(){
    this.close();
};


//////////////////////////
// DialogUDashAccount - user dashboard (account options) dialog
//////////////////////////
DialogUDashAccount.prototype = new DialogClass();
DialogUDashAccount.prototype.constructor = DialogUDashAccount;
function DialogUDashAccount() {
    DialogClass.call(this);
    this.requireLogin = true;
}

DialogUDashAccount.prototype.title = function(){
    return 'My Account Settings';
};

DialogUDashAccount.prototype.focus = function(){
    $('.fbMenuBut').blur();
    return false; 
};

DialogUDashAccount.prototype.buttons = function(){
    var myThis = this;
    return { 'Back':function(){ uDash(); }, 'Close': function(){ myThis.close(); } };
};

DialogUDashAccount.prototype.display = function(){
    if( ! userValid() ){ return false; }
    DialogClass.prototype.display.call(this);
};

DialogUDashAccount.prototype.content = function(){
    var myThis = this;
    var $main = this.getRoot();
    var mapMode = mapModeActive();

    var $mRow = $( document.createElement('div') ).addClass('mar10');
    var $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Edit Account Info');
    $mBut.bind('click',function(){ ownerEdit();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Change Password');
    $mBut.bind('click',function(){ ownerEditPass();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Manage Profile Photo');
    $mBut.bind('click',function(){ ownerEditPhoto();return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);
    if(false){
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mRow.html('To view/edit your map location<br />You must switch to Map View');
	$main.append($mRow);
	$mRow = $( document.createElement('div') ).addClass('mar10');
	$mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Switch to Map View');
	$mBut.bind('click',function(){ myThis.close(); mapModeSwitch();return false; } );
	$mBut.button();
	$mRow.append($mBut);
	$main.append($mRow);
    }
    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Show My Map Location');
    $mBut.bind('click',function(){ myThis.close();  mapOnCB( function(){ mapResize();ownerMapWinOpen(); } ); return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Change My Map Location');
    $mBut.bind('click',function(){ myThis.close(); mapOnCB( function(){ mapResize();ownerMapEdit(); } ); return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    return $main;
};

DialogUDashAccount.prototype.submit = function(){
    this.close();
};


//////////////////////////
// DialogUPage - dialog with server fetched HTML content 
//////////////////////////
DialogUPage.prototype = new DialogClass();
DialogUPage.prototype.constructor = DialogUPage;
function DialogUPage(htmlKey) {
    DialogClass.call(this);
    this.enforceDirty = false;
    this.htmlSource = htmlKey;
    this.name = 'page';
}

DialogUPage.prototype.ajaxSend = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    $.ajax({ url: '/'+ this.name +'/a/' + this.htmlSource, dataType: 'html',
		success: function(html,textStatus){ myThis.ajaxCB(html,textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

DialogUPage.prototype.ajaxCB = function(mHtml,mStatus){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	this.html = mHtml;
	this.display2();
    }
}

DialogUPage.prototype.buttons = function(){
    var myThis = this;
    return { 'Back':function(){uDashFB();}, 'Close': function(){ myThis.close(); } };
};

DialogUPage.prototype.display = function(){
    this.ajaxSend();
};

DialogUPage.prototype.display2 = function(){
    DialogClass.prototype.display.call(this);
};

DialogUPage.prototype.title = function(){
    return 'FishBlab';
};

DialogUPage.prototype.content = function(){
    var $main = this.getRoot();
    $main.html(this.html);
    return $main;
};

//////////////////////////
// DialogUFriendDash - Friend dashboard dialog
//////////////////////////
DialogUFriendDash.prototype = new DialogClass();
DialogUFriendDash.prototype.constructor = DialogUFriendDash;
function DialogUFriendDash() {
    DialogClass.call(this);
    this.requireLogin = true;
}

DialogUFriendDash.prototype.title = function(){
    return 'Friends Dashboard';
};

DialogUFriendDash.prototype.focus = function(){
    $('.fbMenuBut').blur();
    return false;
};

DialogUFriendDash.prototype.buttons = function(){
    var myThis = this;
    return { 'Back':function(){uDash();}, 'Close': function(){ myThis.close(); } };
};

DialogUFriendDash.prototype.display = function(){
    if( ! userValid() ){ return false; }
    DialogClass.prototype.display.call(this);
};

DialogUFriendDash.prototype.content = function(){
    var myThis = this;
    var $main = this.getRoot();

    var $mRow = $( document.createElement('div') ).addClass('mar10');
    var $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Search For Friend');
    $mBut.bind('click',function(){ actSearch('user');return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('My Current Friends');
    $mBut.bind('click',function(){ actFilter({'key':'user','filterName':'friend'});return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);
    
    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Friend Requests To Me');
    $mBut.bind('click',function(){ actFilter({'key':'user','filterName':'request'});return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Blocked Users');
    $mBut.bind('click',function(){ actFilter({'key':'user','filterName':'block'});return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    return $main;
};

DialogUFriendDash.prototype.submit = function(){
    this.close();
};


//////////////////////////
// DialogUNotifyAlert - User Notifications - NOT A DIALOG
//////////////////////////
DialogUNotifyAlert.prototype = new DialogClass();
DialogUNotifyAlert.prototype.constructor = DialogUNotifyAlert;
function DialogUNotifyAlert() {
    DialogClass.call(this);
    this.enforceDirty = false;
    this.requireLogin = true;
    fbNote = {count:0,records:[]};
}

DialogUNotifyAlert.prototype.rootName = 'fbNote';

DialogUNotifyAlert.prototype.title = function(){
    return 'FishBlab Notification';
};

DialogUNotifyAlert.prototype.content = function(){
    var $mRow = $( document.createElement('div') );
    var $mSpan = $( document.createElement('span') ).html('You have ' + fbNote.count + ' notification' + (fbNote.count == 1 ? '.' : 's.') ).addClass('marRight10');
    $mRow.append($mSpan);
    var $mAnc = $( document.createElement('a') ).html('View Notifications').attr('href','/');
    $mAnc.bind('click',function(){uNotifyList();return false});
    $mRow.append($mAnc);
    return $mRow;
};

DialogUNotifyAlert.prototype.display = function(){
    this.ajaxGetNotes();
};

DialogUNotifyAlert.prototype.display2 = function(){
    var $main = this.reset();
    if( fbNote.count > 0){
	$main.append(this.content());
	$main.addClass('noteOn');	    
    }
};

DialogUNotifyAlert.prototype.ajaxGetNotes = function(){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    $.ajax({ url: '/user/a/aGetNotes', dataType: 'json',
		success: function(json,textStatus){ myThis.ajaxGetNotesCB(json, textStatus); },
		error: function(){ myThis.ajaxError(); }
	});
};

DialogUNotifyAlert.prototype.ajaxGetNotesCB = function(json,textStatus){
    if(textStatus != 'success'){
	//alert('Error retrieving Notifications');
    }else{
	if(json.error){
	    //alert('System error retrieving User Settings');
	}else{
	    fbNote = json.notes;
	    this.display2();
	}
    }
};

DialogUNotifyAlert.prototype.reset = function(){
    var myThis = this;
    var $main = this.getRoot();
    $main.children().remove();
    $main.removeClass().addClass('noteOff');
    return $main;
};

DialogUNotifyAlert.prototype.close = function(){
    var myThis = this;
    var $main = this.getRoot();
    $main.addClass('noteOff');
    return $main;
};

//////////////////////////
// DialogUNotifyList - User Notification List
//////////////////////////
DialogUNotifyList.prototype = new DialogClass();
DialogUNotifyList.prototype.constructor = DialogUNotifyList;
function DialogUNotifyList() {
    DialogClass.call(this);
    this.enforceDirty = false;
    this.requireLogin = true;
    this.recs = getNotes();
}

DialogUNotifyList.prototype.buttons = function(){
    var myThis = this;
    return { 'Close': function(){ myThis.close(); } };
};

DialogUNotifyList.prototype.ajaxRead = function(noteId,callBack){
    if(this.ajaxBusy){ return false; }else{ this.ajaxBusy = true;}
    var myThis = this;
    var mData = this.fieldsAndValues();
    $.ajax({ url:'/user/a/aNoteRead', dataType:'json',data:{ note_id:noteId },
		success: function(json,textStatus){ myThis.ajaxReadCB(json,textStatus,callBack); }
	});
    return false;
};

DialogUNotifyList.prototype.ajaxReadCB = function(json,mStatus,callBack){
    this.ajaxBusy = false;
    if(mStatus != 'success'){
	this.errorMsg = 'System Error!';
	this.errorDisplay();
    }else{
	if(json.error){
	    this.errorMsg = json.desc;
	    this.errorDisplay();
	}else{
	    var noteId = json.note_id;
	    removeNote(noteId);
	    this.close();
	    if(callBack){
		callBack();
	    }else{
		uNotifyAlert();
	    }
	}
    }
}

DialogUNotifyList.prototype.title = function(){
    return 'FishBlab Notification';
};

DialogUNotifyList.prototype.content = function(){
    var $mAnc,$mTab,$mTr,$mTd,$mRow,rNote;
    var myThis = this;
    var $main = this.getRoot();
    $mRow = $( document.createElement('div') ).addClass('fbBorder1 uInfoHead').html('Your FishBlab Notifications');
    $main.append($mRow);
    $mTab = $( document.createElement('table') ).attr( {'id':'jrjDialogTable','cellspacing':0,'cellpadding':0});
    $mTr = $( document.createElement('tr') );
    $mTr.append( $( document.createElement('th') ).html('Action') );
    $mTr.append( $( document.createElement('th') ).html('Date') );
    $mTr.append( $( document.createElement('th') ).html('From') );
    $mTr.append( $( document.createElement('th') ).html('Caption') );
    $mTab.append($mTr);
    this.tbody = document.createElement('tbody');
    $(this.tbody).attr('id','noteListBody');
    for(var i=0; i<this.recs.length; i++){
	$(this.tbody).append(this.tableRow(this.recs[i]));
    }
    $mTab.append(this.tbody);
    $main.append($mTab);
    return $main;
};

DialogUNotifyList.prototype.tableRow = function(rNote){
    var myThis = this;
    $mTr = $(document.createElement('tr')).attr({'id':'noteListRow' + rNote.id,'fbExpanded':false});
    $mTd = $(document.createElement('td')).addClass('noteListLink');
    if(rNote.mtype == 10){
	$mTd.html('View Request');
	$mTd.bind('click', function(){myThis.close(); myThis.ajaxRead(rNote.id); friendStatus(rNote.username_from); });
    }else if(rNote.mtype == 50){
	var cb = false;
	if(rNote.url){
	    cb = function(){window.location.href=rNote.url;};
	}
	$mAnc = $(document.createElement('a')).attr({'href':rNote.url}).html('View');
	$mTd.bind('click',function(){ myThis.ajaxRead(rNote.id,cb);return false;});
	$mTd.append($mAnc);
    }else{
	$mTd.html('OK');
	$mTd.bind('click',function(){ myThis.ajaxRead(rNote.id);});
    }
    $mTr.append($mTd);
    $mTr.append($(document.createElement('td')).html(rNote.date_create));
    $mTr.append($(document.createElement('td')).html(rNote.username_from));
    $mTr.append($(document.createElement('td')).html(rNote.caption));
    return $mTr;
};


//////////////////////////
// DialogUGroupDash - Group Dashboard dialog
//////////////////////////
DialogUGroupDash.prototype = new DialogClass();
DialogUGroupDash.prototype.constructor = DialogUGroupDash;
function DialogUGroupDash() {
    DialogClass.call(this);
    this.requireLogin = true;
}

DialogUGroupDash.prototype.title = function(){
    return 'Groups Dashboard';
};

DialogUGroupDash.prototype.focus = function(){
    $('.fbMenuBut').blur();
    return false;
};

DialogUGroupDash.prototype.buttons = function(){
    var myThis = this;
    return { 'Back':function(){uDash();}, 'Close': function(){ myThis.close(); } };
};

DialogUGroupDash.prototype.display = function(){
    if( ! userValid() ){ return false; }
    DialogClass.prototype.display.call(this);
};

DialogUGroupDash.prototype.content = function(){
    var myThis = this;
    var $main = this.getRoot();

    var $mRow = $( document.createElement('div') ).addClass('mar10');
    var $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Search For Group');
    $mBut.bind('click',function(){ myThis.close(); actSearch('group');return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('My Current Groups');
    $mBut.bind('click',function(){ actFilter({'key':'group','filterName':'member'});return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);
    
    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Group Requests');
    $mBut.bind('click',function(){ actFilter({'key':'group','filterName':'request'});return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Create Group');
    $mBut.bind('click',function(){ actNew('group');return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    return $main;
};

DialogUGroupDash.prototype.submit = function(){
    this.close();
};

//////////////////////////////////////////////////////
/// ACTIVITIES
//////////////////////////////////////////////////////


//////////////////////////
// Initial activity dash
//////////////////////////
DialogADash.prototype = new DialogClass();
DialogADash.prototype.constructor = DialogADash;
function DialogADash() {
    DialogClass.call(this);
}

DialogADash.prototype.title = function(){
    return 'Fishing Activity';
};

DialogADash.prototype.focus = function(){
    $('.fbMenuPop button').blur();
    return false; 
};

DialogADash.prototype.buttons = function(){
    var myThis = this;
    return { 'Close': function(){ myThis.close(); } };
};

DialogADash.prototype.display = function(){
    DialogClass.prototype.display.call(this);
};

DialogADash.prototype.content = function(){
    var myThis = this;
    var $main = this.getRoot();
    $main.addClass('fbMenuPop');
    for(var i=0;i<jrjActList.length;i++){
	var mName = jrjActList[i];
	$main.append(this.contentRow(mName));
    }    
    return $main;
};

DialogADash.prototype.contentRow = function(mName){
    var myThis = this;
    var rAct = actCfg(mName);
    var $mRow = $( document.createElement('p') );
    var $mBox = $( document.createElement('div') );
    var $mBut = $( document.createElement('a') ).html(rAct.label);
    if(jrjActOpt.admin === true){
	$mBut.bind('click',function(){ actMapAdmin(rAct.name);return false; } );
    }else{
	$mBut.bind('click',function(){ actMap(rAct.name);return false; } );
    }
    //$mBut.bind('mouseover',function(){ $('.fbPopSubOn').removeClass('fbPopSubOn').addClass('fbPopSubOff');$('#' + mName + 'Sub').removeClass().addClass('fbPopSubOn');return false; } );
    $mBut.button();
    $mBox.append($mBut);
    $mRow.append($mBox);

    $mBox = $( document.createElement('div') ).addClass('fbPopSubOff').attr({'id':mName + 'Sub'});
    $mBut = $( document.createElement('button') ).html('New');
    $mBut.bind('click',function(){ actNew(rAct.name);return false; } );
    $mBut.button();
    $mBox.append($mBut);
    $mBut = $( document.createElement('button') ).html('List');
    $mBut.bind('click',function(){ actList(rAct.name);return false; } );
    $mBut.button();
    $mBox.append($mBut);
    $mBut = $( document.createElement('button') ).html('Map');
    $mBut.bind('click',function(){ actMap(rAct.name);return false; } );
    $mBut.button();
    //$mBox.append($mBut);
    
    $mRow.append($mBox);
    $mRow.append(this.clearBr());
    return $mRow;
};

DialogADash.prototype.submit = function(){
    this.close();
};


//////////////////////////
// Specific Activity Dashboard
//////////////////////////
DialogADashAct.prototype = new DialogClass();
DialogADashAct.prototype.constructor = DialogADashAct;
function DialogADashAct(mKey) {
    DialogClass.call(this);
    var rAct = actCfg(mKey);
    for(var mName in rAct){
	this[mName] = rAct[mName];
    }
}

DialogADashAct.prototype.title = function(){
    return this.label;
};

DialogADashAct.prototype.focus = function(){
    $('.fbMenuBut').blur();
    return false; 
};

DialogADashAct.prototype.buttons = function(){
    var myThis = this;
    return { 'Back':function(){ uDashAct(); }, 'Close': function(){ myThis.close(); } };
};

DialogADashAct.prototype.display = function(){
    DialogClass.prototype.display.call(this);
};

DialogADashAct.prototype.content = function(){
    var myThis = this;
    var $main = this.getRoot();
    var $mRow = $( document.createElement('div') ).addClass('mar10');
    var $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Show '+this.label+' in Map');
    $mBut.bind('click',function(){ actMapInit(myThis.name);return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Search by Location');
    $mBut.bind('click',function(){ actFindLoc(myThis.name);return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Search by Fish Species');
    $mBut.bind('click',function(){ actFindFish(myThis.name);return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    $mRow = $( document.createElement('div') ).addClass('mar10');
    $mBut = $( document.createElement('button') ).addClass('fbMenuBut').html('Filter Options');
    $mBut.bind('click',function(){ actFilter(myThis.name);return false; } );
    $mBut.button();
    $mRow.append($mBut);
    $main.append($mRow);

    return $main;
};

DialogADashAct.prototype.submit = function(){
    this.close();
};


//////////////////////////
// Activity Menu Bar
//////////////////////////
DialogAMenu.prototype = new DialogClass();
DialogAMenu.prototype.constructor = DialogAMenu;
function DialogAMenu(menuSize) {
    DialogClass.call(this);
    this.enforceDirty = false;
    this.requireLogin = false;
    this.size = (menuSize ? menuSize : 'normal');
    this.className = fbActButClass;
}

DialogAMenu.prototype.rootName = 'jrjActBar';

DialogAMenu.prototype.reset = function(){
    var myThis = this;
    var $main = this.getRoot();
    $main.children().remove();
    return $main;
};

DialogAMenu.prototype.display = function(){
    var $main = this.reset();
    this.className = fbActButClass;
    this.size = fbActMenuSize;
    $main.append(this.content());
};

DialogAMenu.prototype.update = function(){
    return this.display();
};

DialogAMenu.prototype.content = function(){
    var myThis = this;
    var $mBox = $( document.createElement('div') );
    if(this.size == 'compact'){
	var $mBut = $( document.createElement('button') ).addClass(this.className).html('Activity');
	$mBut.bind('click',function(){ uDashAct();return false; } );
	$mBut.button();
	$mBox.append($mBut);
    }else{
	for(var i=0;i<jrjActList.length;i++){
	    var mName = jrjActList[i];
	    $mBox.append(this.contentRow(mName));
	}
	$mBox.append(this.clearDiv());
	$mBox.buttonset();
    }
    return $mBox;
};

DialogAMenu.prototype.contentRow = function(mName){
    var myThis = this;
    var rAct = actCfg(mName);
    var $mRow = $( document.createElement('div') ).addClass('floatLeft');
    var $mBut = $( document.createElement('button') ).addClass(this.className).html(rAct.label);
    if(jrjActOpt.admin === true){
	$mBut.bind('click',function(){ actMapInitAdmin(rAct.name);return false; } );
    }else{
	$mBut.bind('click',function(){ actMapInit(rAct.name);return false; } );
    }
    $mBut.button();
    $mRow.append($mBut);
    return $mRow;
};

DialogAMenu.prototype.submit = function(){
    this.close();
};

//////////////////////////
// Activity Select
//////////////////////////
DialogASelect.prototype = new DialogClass();
DialogASelect.prototype.constructor = DialogASelect;
function DialogASelect() {
    DialogClass.call(this);
    this.requireLogin = true;
}

DialogASelect.prototype.rootName = 'dialogContent';

DialogASelect.prototype.reset = function(){
    var myThis = this;
    var $main = this.getRoot();
    $main.children().remove();
    return $main;
};

DialogASelect.prototype.display = function(){
    var $main = this.reset();
    $main.append(this.content());
    alert($main.html());
};

DialogASelect.prototype.update = function(){
    return this.display();
};

DialogASelect.prototype.content = function(){
    var myThis = this;
    var $mBox = $( document.createElement('div') );
    var $mBut = $( document.createElement('button') ).addClass(this.className).html('Activity 1');
    $mBut.bind('click',function(){ uDashAct();return false; } );
    $mBut.button();
    $mBox.append($mBut);
    $mBox = $( document.createElement('div') );
    $mBut = $( document.createElement('button') ).addClass(this.className).html('Activity 2');
    $mBut.bind('click',function(){ uDashAct();return false; } );
    $mBut.button();
    $mBox.append($mBut);
    return $mBox;
};


DialogASelect.prototype.submit = function(){
    this.close();
};

