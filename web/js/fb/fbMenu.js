// copyright 2012 DataFree, Inc
// Joe Junkin

function JrjMenuClass(){
    this.changeHash = true;
}

JrjMenuClass.prototype.loadObjSettings = function(rObj){
    for(var mName in rObj){
	this[mName] = rObj[mName];
    }
};

JrjMenuClass.prototype.rootName = 'mobMenuContent';

JrjMenuClass.prototype.rootNamePop = 'mobDetailPopup';

JrjMenuClass.prototype.getRoot = function(){
    return $('#' + this.rootName);
};

JrjMenuClass.prototype.getRootPop = function(){
    return $('#' + this.rootNamePop);
};

JrjMenuClass.prototype.reset = function(){
    var $main = this.getRoot();
    $main.children().remove();
    return $main;
};

JrjMenuClass.prototype.changePageUrlSource = function(){
    return this.name;
};

JrjMenuClass.prototype.changePageUrl = function(){
    var mUrl = '#mobMenu?s=' + this.changePageUrlSource();    
    //var mUrl = '/' + this.appMode + '/' + this.action + '/';
    return mUrl;
};

JrjMenuClass.prototype.changePageHome = function(){
    $.mobile.changePage('/');
};

JrjMenuClass.prototype.display = function(){
    var myThis = this;
    this.mode = 'display';
    this.reset();
    this.buildHeader();
    this.buildContent();
    var $page = $('#' + this.pageId);
    $page.page();
    $page.trigger('create');
    var mUrl = this.changePageUrl();
    var mOpt = {'changeHash':this.changeHash,'dataUrl':mUrl};
    $.mobile.changePage($page,mOpt);
};

JrjMenuClass.prototype.displayPopup = function(){
    var myThis = this;
    this.mode = 'popup';
    var $main = this.getRootPop();
    $main.empty();
    $main.append(this.buildClose());
    $main.append( this.buildUl() );
    $main.trigger('create');
    //$main.off().on({ popupafterclose: function(event, ui) { myThis.popAfterClose(); return false; } });
    $main.popup();
    $main.popup('open');
};

JrjMenuClass.prototype.popAfterClose = function(){
    var mStr = 'test';
    return mStr;
};
JrjMenuClass.prototype.displayHome = function(){
    var myThis = this;
    this.mode = 'display';
    this.reset();
    var $main = this.buildContent();
};
JrjMenuClass.prototype.menuOpen = function(){
    this.subMenu = menuObj('act');
    this.subMenu.rootNamePop = 'mobMenuPopup'; 
    this.subMenu.displayPopup();
};

JrjMenuClass.prototype.buildHeader = function(){
    var myThis = this;
    $('#mobMenuHome').off().on('click', function(){ myThis.changePageHome();return false; });
    //$('#' + this.pageId + 'Header').html(this.header);
    //$('#mobMenuMenu').off().on('click', function(){ myThis.menuOpen(); return false; });
};

JrjMenuClass.prototype.menuList = function(){
    var allMenus = [];
    for(var i=0; i<this.menus.length; i++){
	var mMenu = this.menus[i];
	if(mMenu.disabled !== true){
	    allMenus.push(mMenu);
	}
    }
    return allMenus;
};

JrjMenuClass.prototype.buildContent = function(){
    var mMenus = this.menuList();
    var $main = this.getRoot();
    this.menuNode = document.createElement('ul');
    $(this.menuNode).attr({'id':this.id,'data-role':'listview','data-theme':'c'});
    if(this['data-inset']){
	$(this.menuNode).attr({'data-inset':this['data-inset']});
    }
    for(var i=0;i<mMenus.length; i++){
	var mMenu = mMenus[i];
	$(this.menuNode).append(this.buildRow(mMenu));	    
    }
    $main.append(this.menuNode);
    return $main;
};

JrjMenuClass.prototype.buildClose = function(){
    var myThis = this;
    var $mA = $( document.createElement('a') ).attr({'href':'#','Xdata-rel':'back','data-role':'button','data-theme':'a','data-icon':'delete','data-iconpos':'notext'}).addClass("ui-btn-right").html('Close');
    $mA.on('click',function(){ myThis.popupClose(); } );
    return $mA;
};

JrjMenuClass.prototype.popupClose = function(){
    var myThis = this;
    var $page = this.getRootPop();
    $page.popup('close');
};

JrjMenuClass.prototype.buildUl = function(){
    var mMenus = this.menuList();
    var $mUl = $(document.createElement('ul')).attr({'data-role':'listview','data-theme':'c','data-divider-theme':'b'});
    if(this['data-inset']){
	$mUl.attr({'data-inset':this['data-inset']});
    }
    for(var i=0;i<mMenus.length; i++){
	var mMenu = mMenus[i];
	$mUl.append(this.buildRow(mMenu));	    
    }
    return $mUl;
};

JrjMenuClass.prototype.buildRow = function(mMenu){
    var $mA, $mLi = $(document.createElement('li'));
    if(mMenu['data-role']){
	$mLi.attr({'data-role':mMenu['data-role']});
    }
    if(mMenu.sub){
	$mA = $(document.createElement('a')).html(mMenu.label).attr({'href':'/'});
	$mA.on('click',mMenu.sub);
	$mLi.append($mA);
    }else if(mMenu.href){
	$mA = $(document.createElement('a')).html(mMenu.label).attr({'href':mMenu.href});
	$mLi.append($mA);
    }else if(mMenu['data-rel'] == 'back'){
	$mA = $(document.createElement('a')).html(mMenu.label).attr({'data-rel':'back'});
	$mLi.append($mA);
    }else{
	$mLi.html(mMenu.label).attr({'data-role':'list-divider'});
    }
    return $mLi;
};

JrjMenuClass.prototype.refresh = function(){
    if(this.menuNode){
	$(this.menuNode).listview();
	return false;
	var $main = this.getRoot();
	$main.trigger('create');
    }
};

///////////////////////////////////////////
// MenuGuest - Guest Menu
///////////////////////////////////////////
MenuGuest.prototype = new JrjMenuClass();
MenuGuest.prototype.constructor = MenuGuest;
function MenuGuest() {
    JrjMenuClass.call(this);
    this.loadObjSettings(jrjMenuGuest);
}

///////////////////////////////////////////
// MenuUser - logged in user menu
///////////////////////////////////////////
MenuUser.prototype = new JrjMenuClass();
MenuUser.prototype.constructor = MenuUser;
function MenuUser() {
    JrjMenuClass.call(this);
    this.loadObjSettings(jrjMenuUser);
}

///////////////////////////////////////////
// MenuAccount - Manage Account
///////////////////////////////////////////
MenuAccount.prototype = new JrjMenuClass();
MenuAccount.prototype.constructor = MenuAccount;
function MenuAccount() {
    JrjMenuClass.call(this);
    this.loadObjSettings(jrjMenuAccount);
}

///////////////////////////////////////////
// MenuAct - Activity Menu
///////////////////////////////////////////
MenuAct.prototype = new JrjMenuClass();
MenuAct.prototype.constructor = MenuAct;
function MenuAct() {
    JrjMenuClass.call(this);
    this.loadObjSettings(jrjMenuAct);
}

MenuAct.prototype.buildUl = function(){
    var mMenus = this.menuList();
    var $mUl = $(document.createElement('ul')).attr({'data-role':'listview','data-theme':'c','data-divider-theme':'b'});
    if(this['data-inset']){
	$mUl.attr({'data-inset':this['data-inset']});
    }
    var $mLi = $( document.createElement('li') ).attr({'data-role':'List-divider'}).html(this.label + ' Menu');
    $mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    var $mA = $(document.createElement('a')).html('List').attr({'href':'#mobList?s=' + this.source});
    $mLi.append($mA);
    $mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Map').attr({'href':'#mobMap?s=' + this.source});
    $mLi.append($mA);
    $mUl.append($mLi);
    if(this.source != 'user'){
	$mLi = $( document.createElement('li') );
	$mA = $(document.createElement('a')).html('New').attr({'href':'#mobForm?s=' + this.source});
	$mLi.append($mA);
	$mUl.append($mLi);
    }
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Detail').attr({'href':'#mobDetail?s=' + this.source});
    $mLi.append($mA);
    //$mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Search').attr({'href':'#mobSearch?s=' + this.source});
    $mLi.append($mA);
    //$mUl.append($mLi);
    $mLi = $( document.createElement('li') );
    $mA = $(document.createElement('a')).html('Filter').attr({'href':'#mobFilter?s=' + this.source});
    $mLi.append($mA);
    //$mUl.append($mLi);    
    return $mUl;
};

///////////////////////////////////////////
// MenuActNew - Create new Activity Menu
///////////////////////////////////////////
MenuActNew.prototype = new JrjMenuClass();
MenuActNew.prototype.constructor = MenuActNew;
function MenuActNew() {
    JrjMenuClass.call(this);
    this.loadObjSettings(jrjMenuActNew);
}

///////////////////////////////////////////
// MenuActSelect - Select Activity Menu
///////////////////////////////////////////
MenuActSelect.prototype = new JrjMenuClass();
MenuActSelect.prototype.constructor = MenuActSelect;
function MenuActSelect() {
    JrjMenuClass.call(this);
    this.loadObjSettings(jrjMenuActSelect);
}

MenuActSelect.prototype.buildUl = function(){
    var myThis = this;
    var mMenus = this.menuList();
    var mMode = 'List';
    if(this.listMode == 'map'){
	mMode = 'Map';
    }
    var $mUl = $(document.createElement('ul')).attr({'data-role':'listview','data-theme':'c','data-divider-theme':'b'});
    if(this['data-inset']){
	$mUl.attr({'data-inset':this['data-inset']});
    }
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
    return $mUl;
};
