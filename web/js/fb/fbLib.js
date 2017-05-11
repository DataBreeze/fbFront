/** COPYRIGHT 2011 DATAFREE INC **/
var fbNote;
var fbCluster;
var fbCfg;
var fbWait = false;
var fbMapWin = undefined;
var fbMapWindow = undefined;
var fbTilesLoaded = false;
var fbDoEvents = true;
var fbSite = new Array();
var fbMobile = false;
var fbGeo = undefined;
var fbGeoBlock = false;
var fbZoomListener;
var fbZoomChanged = false;
var fbZoom = 12;
var fbCenter = null;
var fbCheckFish = false;
var fbMonthMin = 0;
var fbMonthMax = 11;
var fbActiveTab = 0;
var fbLat = 27.9658533;
var fbLon = -82.8001026;
var fbInput = 'Clearwater, FL';
var fbInitLoc = false;
var fbCenterPoint = undefined;
var fbCenterMarker = undefined;
var fbCancelMsgWin = false;
var secSLast = null;
var fbRegionMapActive = false;
var stateConvertHash = {'alabama':'AL', 'alaska':'AK', 'arizona':'AZ', 'arkansas':'AR', 'california':'CA', 'colorado':'CO', 'connecticut':'CT', 'delaware':'DE', 'district of columbia':'DC', 'washington dc':'DC', 'florida':'FL', 'georgia':'GA', 'hawaii':'HI', 'idaho':'ID', 'illinois':'IL', 'indiana':'IN', 'iowa':'IA', 'kansas':'KS', 'kentucky':'KY', 'louisiana':'LA', 'maine':'ME', 'maryland':'MD', 'massachusetts':'MA', 'michigan':'MI', 'minnesota':'MN', 'mississippi':'MS', 'missouri':'MO', 'montana':'MT', 'nebraska':'NE', 'nevada':'NV', 'new hampshire':'NH', 'new jersey':'NJ', 'new mexico':'NM', 'new york':'NY', 'north carolina':'NC', 'north dakota':'ND', 'ohio':'OH', 'oklahoma':'OK', 'oregon':'OR', 'pennsylvania':'PA', 'rhode island':'RI', 'south carolina':'SC', 'south dakota':'SD', 'tennessee':'TN', 'texas':'TX', 'utah':'UT', 'vermont':'VT', 'virginia':'VA', 'washington':'WA', 'west virginia':'WV', 'wisconsin':'WI', 'wyoming':'WY'};
var monthName = new Array("January","February","March","April","May","June","July","August","September","October","November","December");
var monthNameShort = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
var hourDisplay = new Array('12 am','1 am','2 am','3 am','4 am','5 am','6 am','7 am','8 am','9 am','10 am','11 am','12 pm','1 pm','2 pm','3 pm','4 pm','5 pm','6 pm','7 pm','8 pm','9 pm','10 pm','11 pm');
var hourValue = new Array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23);
var minuteValue = new Array(0,5,10,15,20,25,30,35,40,45,50,55);
var flagDisplay = new Array('Spam/Remove','Offensive/Remove','Not Believable/False','Believable/Trustworthy source','Like this','Nominate for Best of FishBlab');
var flagValue = new Array(5,10,15,50,55,60);
var fbAlerts = new Array('alertMap','alertDataPhoto');
var fbChartTimeout = -1;
var fbLocSetTimeout = -1;
var fbChartDataChange = true;
var fbChartConfig = {};
var fbFetchCatch = false;
var fbFetchingCatchAnnual = false;
var fbCatchAnnual = new Object();
var fbDiscuss = new Array();
var fbIconSiteURL = '/images/map/site3.png';
var fbIconSiteBgURL = '/images/map/site3Shadow.png';
var fbIconSite = null;
var fbIconSiteBg = null;
var fbIconDiscURL = '/images/map/disc.png';
var fbIconDiscLocURL = '/images/map/disc24.png';
var fbIconDisc = null;
var fbIconRepURL = '/images/map/hook16.png';
var fbIconRepLocURL = '/images/map/hook24.png';
var fbIconRep = null;
var fbIconBlogURL = '/images/map/reportMark.png';
var fbIconBlogLocURL = '/images/map/reportLoc.png';
var fbIconBlog = null;
var fbFishId = null;
var fbFieldHash = {};
var fbForm = null;
var fbFormSec;
var fbCurField = null;
var fbLocMarker = null;
var fbFishAC;
var qFishName = '';
var fbGuest = true;
var fbPage;
var fbMsg;
var fbErrorDivId = 'jrjDialogError';
var fbButClass = 'gHeadBut14';
var fbActButClass = 'gHeadBut12';
var fbActMenuSize = 'normal';
var fbActActionMenuSize = 'normal';
var fbActBarLabel = '16px';
var fbActBarText = '14px';

/////////////////

function bigQ(){
  var mQ = document.createElement('span');
  mQ.className = 'bigQuote';
  mQ.innerHTML = '"';
  return mQ;
}
function windowWidth(){
    return $(window).width();
}
function curHost(){
  return window.location.host;
}
function curSubDomain(){
    var mParts = window.location.host.split('.');
    return mParts[0];
}
function curPath(){
  return window.location.pathname;
}
function curArgs(){
  return window.location.search;
}
function hostIsMap(){
   if( curSubDomain() == 'map' ){
	return true;
    }else if ( curSubDomain() == 'admin' ){
	return true;
    }
    return false;
}
function hostIsWww(){
    return ( curSubDomain() == 'www' ? true : false);
}
function mapIsOpen(){
    if ( hostIsMap() ){
	return true;
    }else{
	var $mMap = $('#fbMap');
	if( ($mMap.css('width') != '0px') && ($mMap.css('display') != 'none') ){
	    return true;
	}
    }
    return false;
}
function mapModeActive(){
    return ( curSubDomain() == 'map' ? true : false);
}
function mapModeSwitch(){
    window.location.href = 'http://map.fishblab.com';
}
function switchToMap(mArg){
    //window.location = 'http://map.fishblab.com/'+mArg;
    if(fbMapWindow){
	//	fbMapWindow.focus();
    }
    fbMapWindow = window.open('http://map.fishblab.com/'+mArg,'map');
}
function switchToWww(){
    alert(window.name);
}
function initGlobal(){  
    detectBrowser();
    fbIconDisc = new google.maps.MarkerImage(fbIconDiscURL, new google.maps.Size(14,13),
					     new google.maps.Point(0,0), new google.maps.Point(7,7)
					     );
    fbIconDiscLoc = new google.maps.MarkerImage(fbIconDiscLocURL, new google.maps.Size(24,24),
				           new google.maps.Point(0,0), new google.maps.Point(18,18)
                                          );
  fbIconRep = new google.maps.MarkerImage(fbIconRepURL, new google.maps.Size(16,16),
				           new google.maps.Point(0,0), new google.maps.Point(8,8)
                                          );
  fbIconRepLoc = new google.maps.MarkerImage(fbIconRepLocURL, new google.maps.Size(24,24),
				           new google.maps.Point(0,0), new google.maps.Point(12,12)
                                          );
  fbIconBlog = new google.maps.MarkerImage(fbIconBlogURL, new google.maps.Size(16,16),
				           new google.maps.Point(0,0), new google.maps.Point(8,8)
                                          );
  fbIconBlogLoc = new google.maps.MarkerImage(fbIconBlogLocURL, new google.maps.Size(24,24),
				           new google.maps.Point(0,0), new google.maps.Point(12,12)
                                          );

//  fbIconSite = new google.maps.MarkerImage(fbIconSiteURL, new google.maps.Size(10,16),new google.maps.Point(0,0),new google.maps.Point(0,16));
  fbIconSite = new google.maps.MarkerImage(fbIconSiteURL, new google.maps.Size(15,24),new google.maps.Point(0,0),new google.maps.Point(0,24));
//  fbIconSite = new google.maps.MarkerImage(fbIconSiteURL, new google.maps.Size(20,32),new google.maps.Point(0,0),new google.maps.Point(0,32));
  fbIconSiteBg = new google.maps.MarkerImage(fbIconSiteBgURL, new google.maps.Size(18,16),
				           new google.maps.Point(0,0), new google.maps.Point(0,16)
                                          );
  secSInit();
  resizeInit();
  jrjResize();
}
function initJQG(){
  fbMonthMin = defStartMonth();
  fbMonthMax = defStopMonth();
  $('#secRadio').buttonset();
  $('.fbButton').button();
  $("#repNewLink").button();
  $("#areaSubBut").button();
  $("#areaMenuBut").button();
  $("#photoMenuBut").button();
  $("#homebMenuBut").button();
  $("#fbMenuFB2").button();
  $("#fbMenuAccount2").button();
  $("#mapZoomOut").button("option", "icons", {primary:'ui-icon-plusthick'});
  $("#mapZoomIn").button("option", "icons", {primary:'ui-icon-minusthick'});
  $('.fg-button').hover(
    function(){ $(this).removeClass('ui-state-default').addClass('ui-state-focus'); },
    function(){ $(this).removeClass('ui-state-focus').addClass('ui-state-default'); }
  );
  $(function() {
   $("#fbTabs").tabs( { selected:fbActiveTab, select: function(event,ui){tabClick(ui.index);return true;} });
  });
  var minM = defStartMonth();
  var maxM = defStopMonth();
  var monthSlideVal = document.getElementById('monthSlideVal');
  if( (monthSlideVal != undefined) && (monthSlideVal != null) ){
    monthSlideVal.innerHTML = monthName[minM] + ' - ' + monthName[maxM];
  }
  var monthMsg = document.getElementById('monthRangeMsg');
  if( (monthMsg != undefined) && (monthMsg != null) ){
    monthMsg.innerHTML = monthNameShort[minM] + ' - ' + monthNameShort[maxM];
  }
  var monthSlide = document.getElementById('date_slide');
  if( (monthSlide != undefined) && (monthSlide != null) ){
    $(monthSlide).slider({ range: true, min:0, max:11, step:1, animate:true, values: [minM, maxM],
     			   change: function(event, ui) { dateSlideChange(ui.values[0],ui.values[1]); },
                           slide: function(event, ui) { return dateSlideSlide(ui.values[0],ui.values[1]); }
			 });
  }
//  $("#monthSlideVal").html(monthName[minM] + ' - ' + monthName[maxM]);
//  $("#date_slide").slider({ range: true, min:0, max:11, step:1, animate:true, values: [minM, maxM],
//     			      change: function(event, ui) { dateSlideChange(ui.values[0],ui.values[1]); },
//                            slide: function(event, ui) { return dateSlideSlide(ui.values[0],ui.values[1]); }
//			    });
//  $("#fishName").autocomplete({ minLength: 1, source: function(request, response) { $.ajax({ url: "/fish/a/aLookup", dataType: "json", data: request, success: function( data ) { response( data ); }  });  },  change: function(){ loadFish(); }  }); }
  loadUser(fbUser);
  $('#fbFooterLinks').buttonset();
}
function accordionLike($mBox){
    if( ! $mBox){ return false; }
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
}

function tabClick(){
    return true;
}
function pageShow(cName,mName){
    dialogClose();
    curDialog = new DialogUPage(cName);
    if(mName){
	curDialog.name = mName;
    }
    curDialog.display('cName');
    return false;
}
function closeMapWin(){
  if(fbMapWin != undefined){
    fbMapWin.close();
  }
}
function tilesLoaded(){
  fbTilesLoaded = true;
}
function dragEnd(){
  saveCurMap();
  fetchDataBB();
}
function userValid(){
  var uStat = getCookie('fbValid');
  if(uStat == 'true'){
    return true;
  }
  return false;
}
function loadUser(newUser){
  if(newUser == undefined){
      newUser = { 'username':'Guest','name':'Guest'};
  }
  var uValid = userValid();
  var aLink = document.getElementById('accountLink');
  if(aLink){
    if(uValid){
      aLink.onclick = function(){userLoadProfile();return false; };
      aLink.innerHTML = 'My Profile';
      aLink.className = 'gHeadBut';
    }else{
      aLink.onclick = function(){showCreate();return false; };
      aLink.innerHTML = 'Sign In';
      aLink.className = 'gHeadBut2';
    }
  }
  noteInit();
  fbUser = newUser;
  aLink = document.getElementById('toolUsername');
  if(aLink){
      $(aLink).html(newUser.username);
  }
}
function userLoadProfile(){
  if(userValid()){
    window.location = 'http://user.fishblab.com/' + escape(fbUser.username);
  }
}
function menuInit(){
    var $mMenus = $('#fbMenu');
    $mMenus.children().remove();
    $mMenus.append(menuFB());
    //$mMenus.append(menuActivity());
    $mMenus.append(menuAccount());
    $('#fbMenu').buttonset();
    initButtons();
    actMenuUpdate();
    actBarUpdate();
}

function initButtons(){
    var $mBox = $('#jrjGoButBox');
    $mBox.children().remove();
    var $mBut = $(document.createElement('button') ).addClass(fbButClass);
    $mBut.bind('click',function(){locSearchSubmit();return false;});
    $mBut.button();
    $mBut.button('option','label','GoTo');
    $mBox.append($mBut);
}

function menuFB(){
    var $mBut = $(document.createElement('a') ).attr({href:'#'}).addClass(fbButClass);
    $mBut.bind('click',function(){uDashFB();return false;});
    $mBut.button();
    $mBut.button('option','label','FishBlab');
    return $mBut;
}

function menuActivity(){
    var $mBut = $(document.createElement('a') ).attr({href:'#'}).addClass(fbButClass);
    $mBut.bind('click',function(){uDashAct();return false;});
    $mBut.button();
    $mBut.button('option','label','Activity');
    return $mBut;
}

function menuAccount(){
    var $mBut = $(document.createElement('a') ).attr({href:'#'}).addClass(fbButClass);
    var menuText = 'Sign In';
    if(userValid()){
	menuText = 'My Account';
	$mBut.removeClass('gHeadAlert');
	$mBut.css('color','#33FF00');
	$mBut.unbind().bind('click',function(){uDash();return false;});
    }else{
	$mBut.unbind().bind('click',function(){uDashGuest();return false;});
	$mBut.css('color','yellow');
    }
    $mBut.button();
    $mBut.button('option','label',menuText);
    return $mBut;
}

function showMsg(msg,msgClass,mDelay){
    alert(msg);
}
function monthMin(){
  if(isNaN(fbMonthMin)){
    fbMonthMin = 0;
  }
  return parseInt(fbMonthMin);
}
function monthMax(){
  if(isNaN(fbMonthMax)){
    fbMonthMax = 11;
  }
  return parseInt(fbMonthMax);
}

function setCookie(cName,cValue){
  var options = { path: '/', domain:'.fishblab.com', expires: 365 };
  $.cookie(cName,cValue,options);
}
function deleteCookie(cName){
  var options = { path: '/', domain:'.fishblab.com', expires: -1 };
  $.cookie(cName,null,options);
}
function getCookie(cName){
  return $.cookie(cName);
}
function createTableCell(cellVal){
  var td = document.createElement('td');
  td.appendChild(document.createTextNode(cellVal));
  return td;
}
function defStartMonth(){
  var startMonth = getCookie('fbMonthMin');
  if(! startMonth){ startMonth = fbMonthMin; }
  if( isNaN(startMonth) || (startMonth === null) || (startMonth === undefined) || (startMonth < 0) || (startMonth > 11) ){
    var today = new Date();
    var curMonth = today.getMonth(); 
    startMonth = (curMonth - 2);
    startMonth = (startMonth < 0 ? 0 : startMonth);
    startMonth = 0;
  }
  return startMonth;
}

function defStopMonth(){
  var stopMonth = getCookie('fbMonthMax');
  if( isNaN(stopMonth) || (stopMonth === null) || (stopMonth === undefined) || (stopMonth < 0) || (stopMonth > 11) ){
    var today = new Date();
    var curMonth = today.getMonth(); 
    stopMonth = (curMonth + 2);
    stopMonth = (stopMonth > 11 ? 11 : stopMonth);
    stopMonth = 11;
  }
  return stopMonth;
}
function dateSlideChange(vMin,vMax){
  if(vMin < vMax){
    if( (vMin != fbMonthMin) || (vMax != fbMonthMax) ){
      if( (vMin >= 0) && (vMax < 12) ){
        monthRangeChange(vMin,vMax);
        fetchDataDateChange();
      }
    }
  }
}
function dateSlideSlide(vMin,vMax){
  if(vMin >= vMax){
    return false;
  }else{
    $("#monthSlideVal").html(monthName[vMin] + ' - ' + monthName[vMax]);
    $("#monthRangeMsg").html(monthNameShort[vMin] + '-' + monthNameShort[vMax]);
  }
}

function monthRangeChange(vMin,vMax){
  fbMonthMin = vMin;
  fbMonthMax = vMax;
  setCookie('fbMonthMin',fbMonthMin);
  setCookie('fbMonthMax',fbMonthMax);
}
function drawChart(mData){
  var rec,key;
  if(mData == undefined){
    mData = fbCatchAnnual;
  }
  var mChart = document.getElementById('catchChart');
  if(mChart == null){ return false; }
  var cfg = fbChartConfig;
  if(!fbChartDataChange){
    return false;
  }
  fbChartDataChange = false;
  if(mData.length < 1){ return false; }
  var fNames = [];
  for(var mKey in mData){
    rec = mData[mKey];
    fNames.push(rec.name);
  }
  var data = new google.visualization.DataTable(); 
  data.addColumn('string','Month');
  for(key in fNames){
    data.addColumn('number',fNames[key]);
  }
  var mMin = (cfg.monthMin == undefined ? monthMin() : cfg.monthMin);
  var mMax = (cfg.monthMax == undefined ? monthMax() : cfg.monthMax)
  var mRange = (mMax - mMin) + 1;
  data.addRows(mRange);
  var cMax = 2;
  var cMin = 1;
  var k = 0;
  for(i=mMin; i<=mMax; i++){
    var monthName = monthNameShort[i];
    data.setValue(k, 0, monthName);
    var j = 1;
    for(var mKey in mData){
      rec = mData[mKey];
      var mCCount = rec.month_list[i];
      cMax = (mCCount > cMax ? mCCount : cMax);
      cMin = (mCCount < cMin ? mCCount : cMin);
      data.setValue(k, j, mCCount);
      j++;
    }
    k++;
  }
  cMax += 100;
  var chart;
  if(cfg.type == 'ImageAreaChart'){
    chart = new google.visualization.ImageAreaChart(mChart);
  }else{
    chart = new google.visualization.ImageLineChart(mChart);
  }
  var mHeight = (cfg.height == undefined ? 240 : cfg.height);
  var mWidth = (cfg.width == undefined ? 450 : cfg.width);
  var mLegend = (cfg.legend == undefined ? 'right' : cfg.legend);
  chart.draw(data, {legend:mLegend,width: mWidth, height: mHeight, min: cMin, max: cMax, title: cfg.title, backgroundColor:'#FFFFFF00'} );
}
function clearChart(){
  var mChart = document.getElementById('catchChart');
  $(mChart).children().remove();
}
function locSearchSubmit() {
    var address = $('#locInput').val();
    if(!address){
	alert('Please enter a location to search');
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
			  $('locInput').val(mInput);
			  var geom = mResult.geometry;
			  var geo = {};
			  geo.input = mInput;
			  geo.lat = geom.location.lat();
			  geo.lon = geom.location.lng();
			  geo.bounds = geom.viewport;
			  setCookie('fbInput',mInput);
			  setCookie('fbLat',geo.lat);
			  setCookie('fbLon',geo.lon);
			  mapChange(geo);
		      }else{
			  alert("Geocode Error: status:" + status);
		      }
		  });
    fbGeoBlock = false;
    return false;
}
function fishMode(){
  if(fbFishId){
    return true;
  }
  return false;
}
function setExploreText(newTxt){
  newTxt = newTxt.replace(/,\s*USA$/i,'');
  fbInput = newTxt;
  var expDiv = document.getElementById("expText");
  if(!expDiv){ return false; }
  var curClass = 'fsz28';
  if(newTxt.length > 25){
    curClass = 'fsz12';
  }else if(newTxt.length > 20){
    curClass = 'fsz18';
  }else if(newTxt.length > 15){
    curClass = 'fsz24';
  }
  expDiv.className = curClass;
  myGroup = document.getElementById('expGrp');
  var oldClass = myGroup.className;
  myGroup.className += ' bgAlert';
  setTimeout(function() { myGroup.className = oldClass; },2000);
  expDiv.innerHTML = newTxt;
}
function setCurLoc(){
  if (fbGeo == undefined) { fbGeo = new google.maps.Geocoder(); }
  var latLon = JRJ.map.googleMap.getCenter();
  fbLat = latLon.lat();
  fbLon = latLon.lng();
  var mLoc = '';
  fbGeo.geocode({ 'latLng': latLon},
                function(results, status) {
		 if(status == google.maps.GeocoderStatus.OK){
                   for(var i=0; i<results.length; i++){
                     var res = results[i];
                     var str = res.types.join('-');
                     if(str == 'locality-political'){
                       mLoc = cleanLoc(res.formatted_address);
                       setCookie('fbInput',mLoc);
                       setExploreText(mLoc);
                       return true;
                     }
                   }
                   for(var i=0; i<results.length; i++){
                     var res = results[i];
                     for(var j=0; j<res.types.length; j++){
                       var mType = res.types[j];
                       if(mType == 'administrative_area_level_3'){
                         mLoc = cleanLoc(res.formatted_address);
                         setCookie('fbInput',mLoc);
                         setExploreText(mLoc);
                         return true;
                       }
                     }
                   }
		 }else{
		   //alert("Geocode was not successful: " + status);
		 }
	         });
}
function cleanLoc(mLoc){
  mLoc = mLoc.replace(/\s*\d+$/i,'');
  mLoc = mLoc.replace(/,\s*USA$/i,'');
  return mLoc;
}
function detectBrowser() {
  var useragent = navigator.userAgent;
  var mapDiv = document.getElementById("fbMap");
  var dataDiv = document.getElementById("fbData");
  var dateDiv = document.getElementById("monthSlide");
  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    fbMobile = true;
    //mapDiv.className = 'mapMob';
    //dataDiv.className = 'dataMob';
    //dateDiv.style.width = '90%';
  } else {
    fbMobile = false;
  }
}

function getDialog(){
  fbForm = document.getElementById('fbDialog');
  return fbForm;
}
function resetDialog(){
  fbForm = document.getElementById('fbDialog');
  //if($(fbForm).dialog('isOpen')){
  //  $(fbForm).dialog('close'); 
  //}
  $(fbForm).children().remove();
  return fbForm;
}
function fbHome(){
  window.location.href = 'http://www.fishblab.com';
}
function fbHomeMap(){
  window.location.href = 'http://map.fishblab.com';
}
function fbAdminMap(){
  window.location.href = 'http://admin.fishblab.com';
}
function redirectToState(mState){
    window.location.href = 'http://www.fishblab.com/' + escape(mState);    
}
function redirectToCity(mState){
    window.location.href = 'http://www.fishblab.com/' + escape(mState);    
}
function pageShowCB(mHTML,mStatus){
  fbForm = resetDialog();
  $(fbForm).dialog({ autoOpen:false, height:600, width: 'auto', modal: true,
                     closeOnEscape: true, title:'FishBlab', show:null,
		     buttons: {'OK': function() { $(this).dialog('close'); } }, close: function() { }
                   });
  $(fbForm).html(mHTML);
  $(fbForm).dialog('open');
}
function setDialog(mHTML){
  $(fbForm).html(mHTML);
}
function openDialog(){
  $(fbForm).dialog('open');
}
function nDiv(cfg){
  var newDiv = document.createElement('div'); 
  if(cfg != undefined){
    if(cfg.cl != undefined){
      newDiv.className = cfg.cl;
    }
    if(cfg.id != undefined){
      newDiv.id = cfg.id;
    }
  }
  return newDiv;
}

function updateTips(mText) {
  var mErr = document.getElementById('validateError');
  mErr.style.display = 'block';
  mErr.innerHTML = mText;
  //tips.text(t).addClass('ui-state-highlight');
  //setTimeout(function() { tips.removeClass('ui-state-highlight', 2000); }, 500);
}

function checkLength(o,n,min,max) {
  if ( o.value.length > max || o.value.length < min ) {
    $(o).addClass('fbFormErr');
    o.focus();
    updateTips("Length of " + n + " must be between "+min+" and "+max+".");
    return false;
  }else{
    return true;
  }
}

function checkEqual(p1,p2) {
  if ( p1.value != p2.value ) {
    $(p2).addClass('fbFormErr');
    p2.focus();
    updateTips("Password Verify does not match Password");
    return false;
  }else{
    return true;
  }
}

function checkRegexp(o,regexp,n) {
  if ( !( regexp.test( o.value ) ) ) {
    $(o).addClass('fbFormErr');
    o.focus();
    updateTips(n);
    return false;
  } else {
    return true;
  }
}

function userCanPost(){
  if(userValid()){
    return true;
  }else{
    showMsg('You need to Login or Create a New Account before you can post a message');
    showCreate();
    return false;
  }
}
function userLoggedIn(mMsg){
  if(userValid()){
    return true;
  }else{
    if( (mMsg == undefined) || (mMsg == null) ){
      mMsg = 'You need to Login or Create a New Account before you can post a message';
    }
//    showMsg(mMsg);
    showCreate();
    return false;
  }
}
function clearDiv(){
  var cDiv = document.createElement('div');
  cDiv.className = 'clear';
  return cDiv;
}

// FLAG
function flagForm(cfg){
  var id = cfg.id;
  var mDiv = resetDialog();
  var mFrm = document.createElement('form');
  var mLab = document.createElement('div');
  mLab.className = 'frmLab';
  mLab.innerHTML = cfg.caption
  mLab.style.width = '80px';
  mFrm.appendChild(mLab);
  var mSel = document.createElement('select');
  mSel.name = 'flag';
  mSel.size = 6;
  mSel.multiple = true;
  for(var i=0; i<flagValue.length; i++){
    var opt = document.createElement('option');
    opt.value = flagValue[i];
    opt.innerHTML = flagDisplay[i];
    mSel.appendChild(opt);
  }
  mFrm.appendChild(mSel);
  mFrm.appendChild(clearDiv());
  if(cfg.desc){
    var mTip = document.createElement('div');
    mTip.className = 'frmTip';
    mTip.innerHTML = cfg.desc;
    mFrm.appendChild(mTip);
  }
  var mHid = document.createElement('input');
  mHid.type = 'hidden';
  mHid.name = 'id';
  mHid.value = id;
  mFrm.appendChild(mHid);
  mDiv.appendChild(mFrm);
  fbCurField = {};
  fbCurField.flag = mSel;
  fbCurField.id = mHid;
  return mDiv;
}

// FLAG END

function upWait(msg){
  if( (msg == undefined) || (msg == null) ){
    msg = 'Please wait';
  }
  fbUpWait = upWaitWin();
  $(fbUpWait).dialog({ autoOpen: true, height: 250, width: 250, modal: true, show:null,
                       zIndex: 2001, resizable:false, draggable:false,
                       closeOnEscape: false, title:msg });
}
function upWaitWin(){
  var mWin = document.createElement('div');
  mWin.className = 'upWait';
  var mImg = document.createElement('img');
  mImg.src = '/images/fb/loading.gif';
  mImg.className = 'upWait';
  mWin.appendChild(mImg);
  return mWin;
}
function upWaitClose(){
  $(fbUpWait).dialog('close');
}
function msgAlert(mMsg){
  showMsg(mMsg);
}
function alertDismiss(mTag){
  if(mTag){
    var mDiv = document.getElementById(mTag);
    if(mDiv){
      mDiv.style.display = 'none';
      setCookie(mTag,'off');
    }
  }
}
function alertShow(mTag){
  if(mTag){
    var mDiv = document.getElementById(mTag);
    if(mDiv){
      if(getCookie(mTag) == 'off'){
        mDiv.style.display = 'none';
      }else{
        mDiv.style.display = 'block';
        return true;
      }
    }
  }
  return false;
}
function getURLParameters() {
    var searchString = window.location.search.substring(1);
    var params = searchString.split("&");
    var hash = false;
    var mCount = params.length;
    if(mCount > 0){
	hash = {};
	for (var i = 0; i < mCount; i++) {
	    var val = params[i].split("=");
	    hash[unescape(val[0])] = unescape(val[1]);
	}
    }
    return hash;
}

function getURLAction() {
    var mPath = window.location.pathname;
    var mSec = mPath.split("/");
    if(mSec){
	if(mSec.length > 0){
	    if(mSec[0] == ''){
		mSec.shift();
	    }
	    return mSec;
	}
    }
    return false;
}
function alertInit(){
  return false;
  for(var i=0; i<fbAlerts.length; i++){
    var mStr = fbAlerts[i];
    if(alertShow(mStr)){
     break;
    }
  }
}
function getNotes(){
  if(fbNote){
    if(fbNote.records){
      return fbNote.records;
    }
  }
  return [];
}
var fbNoteHash;
var fbNoteInterval = false;
function noteHash(){
    if(fbNoteHash == undefined){
	fbNoteHash = {};
	var mNotes = getNotes();
	for(var i=0; i<mNotes.length; i++){
	    var rec = mNotes[i];
	    fbNoteHash[rec.id] = rec;
	}
    }
    return fbNoteHash;
}
function noteById(noteId){
  var hsh = noteHash();
  return hsh[noteId];
}
function noteInit(){
    if(userValid()){
	if(fbNoteInterval){
	    clearInterval(fbNoteInterval);
	}
	uNotifyAlert();
	fbNoteInterval = setInterval(uNotifyAlert,1000000);
    }
}
function hasNote(){
  if(fbNote != undefined){
    if(fbNote.count > 0){
      return true;
    }
  }
  return false;
}
function removeNote(noteId){
  if(noteId > 0){
    var rec = noteById(noteId);
    for(var i=0;i<fbNote.records.length;i++){
      if(fbNote.records[i].id == noteId){
        fbNote.records.splice(i,1);      
        break;
      }
    }
    fbNote.count = fbNote.records.length;
    delete fbNoteHash[noteId];
    return true;
  }
  return false;
}
function noteReadCB(json,textStatus){
  if(textStatus != 'success'){
    alert('System error: ' + json.desc);
  }else{
    if(json.error == true){
      alert(json.desc);
    }else{
      var noteId = json.note_id;
      removeNote(noteId);
      uNotifyAlert();
    }
  }
}
function noteRead(noteId){
  $.ajax({ url:'/user/a/aNoteRead', dataType:'json', data:{ note_id:noteId }, success:noteReadCB });
}
function noteReadUpdateCB(json,textStatus){
    if(textStatus != 'success'){
	alert('System error: ' + json.desc);
    }else{
	if(json.error == true){
	    alert(json.desc);
	}else{
	    var noteId = json.note_id;
	    removeNote(noteId);
	    if(hasNote()){
		uNotifyAlert();
		//var oldNode = document.getElementById('noteListRow' + noteId);
		//var pNode = oldNode.parentNode;
		//pNode.removeChild(oldNode);
	    }else{
		dialogClose();
	    }
	}
    }
}
function noteReadUpdate(noteId){
  $.ajax({ url:'/user/a/aNoteRead', dataType:'json', data:{ note_id:noteId }, success:noteReadUpdateCB });
}
function noteReadUpdate2CB(json,textStatus,url){
  if(textStatus != 'success'){
    alert('System error: ' + json.desc);
  }else{
    if(json.error == true){
      alert(json.desc);
    }else{
      var noteId = json.note_id;
      removeNote(noteId);
      if(hasNote()){
        var oldNode = document.getElementById('noteListRow' + noteId);
        var pNode = oldNode.parentNode;
        pNode.removeChild(oldNode);
      }else{
        closeDialog();
      }
      uNotifyAlert();
    }
  }
}
function noteReadUpdate2(rNote){
  $.ajax({ url:'/user/a/aNoteRead', dataType:'json', data:{ note_id:rNote.id }, success:function(){window.location.href=rNote.url} });
}
function noteListExpand(noteId){
  var curRow = document.getElementById('noteListRow' + noteId);
  var curExpand = document.getElementById('noteListX');
  if(curExpand){
    curExpand.parentNode.removeChild(curExpand);
  }
  if(curRow.fbExpanded){
    curRow.fbExpanded = false;
  }else{
    mNote = noteById(noteId);
    curRow.fbExpanded = true;
    var mBody = document.getElementById('noteListBody');
    var newRow = document.createElement('tr');
    newRow.id = 'noteListX';
    var mTd = document.createElement('td');
    mTd.className = 'centerText';
    mTd.colSpan = "3";
    var mRow = document.createElement('div');
    mRow.innerHTML = mNote.content;
    mTd.appendChild(mRow);
    mRow = document.createElement('button');
    mRow.className = 'mar10 centerText center';
    mRow.innerHTML = 'OK';
    if(mNote.mtype == 10){
      mRow.innerHTML = 'View Request';
      mRow.onclick = function(){ uFriendStatus(mNote.username_from); };
    }
    $(mRow).button();
    mTd.appendChild(mRow);
    newRow.appendChild(mTd);
    mBody.insertBefore(newRow, curRow.nextSibling);
  }
}
function noteList(){
  var mAnc,mTab,mTr,mTh,mTd;
  var mDiv = resetDialog();
  var mRow = document.createElement('div');
  mRow.className = 'fbBorder1 uInfoHead';
  mRow.innerHTML = 'Your FishBlab Notifications';
  mDiv.appendChild(mRow);
  mRow = document.createElement('div');
  mTab = document.createElement('table');
  mTab.id = 'noteList';
  mTab.className = 'noteList';
  mTr = document.createElement('tr');
  mTh = document.createElement('th');
  mTh.innerHTML = 'Action';
  mTr.appendChild(mTh);
  mTh = document.createElement('th');
  mTh.innerHTML = 'Date';
  mTr.appendChild(mTh);
  mTh = document.createElement('th');
  mTh.innerHTML = 'From';
  mTr.appendChild(mTh);
  mTh = document.createElement('th');
  mTh.innerHTML = 'caption';
  mTr.appendChild(mTh);
  mTab.appendChild(mTr)
  var mTbody = document.createElement('tbody');
  mTbody.id = 'noteListBody';
  var mNotes = getNotes();
  for(var i=0; i<mNotes.length; i++){
    var rNote = mNotes[i];
    mTr = document.createElement('tr');
    mTr.id = 'noteListRow' + rNote.id;
    mTr.fbExpanded = false;
    mTd = document.createElement('td');
    mTd.className = 'noteListLink';
    if(rNote.mtype == 10){
      mTd.innerHTML = 'View Request';
      mTd.onclick = noteViewFriReq(rNote);
    }else if(rNote.mtype == 50){
      mAnc = document.createElement('a'); 
      mAnc.href = rNote.url;
      mAnc.innerHTML = 'View';
      mAnc.onclick = noteOK2(rNote);
      mTd.appendChild(mAnc);
    }else{
      mTd.innerHTML = 'OK';
      mTd.onclick = noteOK(rNote.id);
    }
    mTr.appendChild(mTd);
    mTd = document.createElement('td');
    mTd.innerHTML = rNote.date_create;
    mTr.appendChild(mTd);
    mTd = document.createElement('td');
    mTd.innerHTML = rNote.username_from;
    mTr.appendChild(mTd);
    mTd = document.createElement('td');
    mTd.innerHTML = rNote.caption;
    mTr.appendChild(mTd);
    mTbody.appendChild(mTr);
  }
  mTab.appendChild(mTbody);
  mRow.appendChild(mTab);
  mDiv.appendChild(mRow);
  return mDiv;
}
function noteViewFriReq(rNote){
    return function(){ closeDialog(); noteRead(rNote.id); uFriendStatus(rNote.username_from); };
}
function noteOK(noteId){
  return function(){ noteReadUpdate(noteId); };
}
function noteOK2(rNote){
  return function(){ noteReadUpdate2(rNote); return false; };
}
function noteShow(){
  fbForm = noteList();
  var mBut = {};
  mBut['Close'] = closeDialog;
  $(fbForm).dialog({ autoOpen: true, height: 'auto', width: 500, modal: true, buttons: mBut,
                     closeOnEscape: true, title: 'FishBlab.com Notifications',
                  });
}
function msgTextSet(mMsg){
  if(mMsg){
    var mDiv = document.getElementById('msgDataCap');
    if(mDiv){
      mDiv.innerHTML = mMsg;
    }
  }
  return false;
}
function secSSet(secNew){
  if(secSLast != null){
    if(secSLast == secNew){
      return false;
    }
  }
  secSLast = secNew;
  setCookie('fbSec',secNew);
  if(secNew == 15){
    var gidCur = secSGroupId();
    if(gidCur){
      setCookie('fbSecGid',gidCur);
    }else{
      secSGroupInit(secNew);
    }
  }else{
    secSGroupClear();
  }
  fetchDataSecChange();
  secSSetMsg(secNew);
  return false;
}
function secSSetGroup(){
  var gidCur = secSGroupId();
  if(gidCur){
    setCookie('fbSecGid',gidCur);
    fetchDataSecChange();
  }else{
    alert('Error fetching group value');
  }
  return false;
}
function secSGroupId(){
  var mSel = document.getElementById('secSGroupSelect');
  if( (mSel != undefined) && (mSel != null) ){
    return $(mSel).val();
  }
  return false;
}
function secSGroupClear(){
  var mBox = document.getElementById('secSOption');
  $(mBox).children().remove();
  mBox.style.display = 'none';
  var mDiv = document.getElementById('msgDataBox');
  mDiv.className = 'dataMsg';
}
function secSGroupInit(secNew){
  var mBox = document.getElementById('secSOption');
  $(mBox).children().remove();
  mBox.style.display = 'block';
  var groupId = getCookie('fbSecGid');
  var mSel = secGroupSelect({ sec:secNew, domId:'secSGroupSelect', onchange:secSSetGroup, gid:groupId });
  var mDiv = document.getElementById('msgDataBox');
  if(mSel){
    mDiv.className = 'dataMsgX';
    mBox.appendChild(mSel);
  }
}
function secSInit(newSec){
  var mGrp = userGroups();
  var secBox = document.getElementById('secRadio');
  if( (secBox == null) && (secBox == undefined) ){ return false; }
  if(newSec != undefined){
    fbSec = newSec;
  }else{
    fbSec = getCookie('fbSec');
  }
  if( (! userValid()) || (fbSec == undefined) || (fbSec == null) ){
    fbSec = 1;
  }
  if(mGrp){
    document.getElementById('secGrp').enabled = true;
    document.getElementById('secGrp').onclick = function(){ secSSet(15);};
  }else{
    document.getElementById('secGrp').onclick = function(){ alert('You are not a Member of any Groups yet');};
  }
  if( mGrp && (fbSec == 15)){
    document.getElementById('secGrp').checked = true;
    secSGroupInit(fbSec);
  }else if(fbSec == 10){
    document.getElementById('secPri').checked = true;
  }else if(fbSec == 5){
    document.getElementById('secFri').checked = true;
  }else{
    document.getElementById('secPub').checked = true;
  }
  secSSetMsg(fbSec);
}
function secSSetMsg(mSec){
  var mMsg = 'Viewing Public Posts Only';
  var mMsg2 = 'Public only';
  if(mSec == 15){
    mMsg = 'Viewing Member Group Posts Only';
    mMsg2 = 'Group only';
  }else if(mSec == 10){
    mMsg = 'Viewing Your Posts Only';
    mMsg2 = 'Private only';
  }else if(mSec == 5){
    mMsg = 'Viewing Your Friends Posts Only';
    mMsg2 = 'Friends only';
  }
  var mVal = document.getElementById('secMsg');
  if( (mVal != undefined) && (mVal != null) ){
    mVal.innerHTML = mMsg;
  }
  mVal = document.getElementById('secHeadMsg');
  if( (mVal != undefined) && (mVal != null) ){
    mVal.innerHTML = mMsg2;
  }
  return false;
}
function secEValue(){
  var secBox = document.getElementById('secEOptions');
  if( (secBox == null) || (secBox == undefined) ){ return 0; }
  var mSec = 1;
  if(document.getElementById('sec_grp').checked){
    mSec = 15;
  }else if(document.getElementById('sec_pri').checked){
    mSec = 10;
  }else if(document.getElementById('sec_fri').checked){
    mSec = 5;
  }
  return mSec;
}
function secEGroupInit(secNew){
  var mSelect = document.getElementById('secEGroupSelect');
  if(mSelect){
    if(secNew == 15){
      mSelect.disabled = false;
    }else{
      mSelect.disabled = true;
    }
  }
}
function secEGroupId(){
  var mSelect = document.getElementById('secEGroupSelect');
  if(mSelect && (mSelect.value > 0) ){
    return mSelect.value;
  }
  return 0;
}
function secESet(secNew){
  setCookie('fbSecE',secNew);
  secEGroupInit(secNew);
  return true;
}
function secEOptions(rec){
  var mSec,groupId;
  if( (rec != undefined) && (rec != null) ){
    mSec = rec.sec;
    groupId = rec.group_id;
  }
  if( (mSec == undefined) || (mSec == null) ){
    mSec = getCookie('fbSecE');
    if( (mSec == undefined) || (mSec == null) ){
      mSec = 1;
    }
  }
  var mDiv = document.createElement('div');
  mDiv.id = 'secEOptions';
  mDiv.className = 'secSwitchForm';

  mTip = document.createElement('div');
  mTip.innerHTML = 'Who can view this?';
  mTip.className = 'frmTip';
  mDiv.appendChild(mTip);

  var mBut = document.createElement('input');
  mBut.type = 'radio';
  mBut.name = 'sec';
  mBut.value = 1;
  mBut.id = 'sec_pub';
  mBut.onclick = function(){ secESet(1); };
  if(mSec == 1){ mBut.checked = true; }
  var mLab = document.createElement('label');
  mLab.innerHTML = 'Public';
  mLab.htmlFor = 'sec_all';
  mDiv.appendChild(mBut);
  mDiv.appendChild(mLab);

  mBut = document.createElement('input');
  mBut.type = 'radio';
  mBut.name = 'sec';
  mBut.value = 5;
  mBut.id = 'sec_fri';
  mBut.onclick = function(){ secESet(5); };
  if(mSec == 5){ mBut.checked = true; }
  mLab = document.createElement('label');
  mLab.innerHTML = 'Friends';
  mLab.htmlFor = 'sec_fri';
  mDiv.appendChild(mBut);
  mDiv.appendChild(mLab);

  mBut = document.createElement('input');
  mBut.type = 'radio';
  mBut.name = 'sec';
  mBut.value = 10;
  mBut.id = 'sec_pri';
  if(mSec == 10){ mBut.checked = true; }
  mBut.onclick = function(){ secESet(10); };
  mLab = document.createElement('label');
  mLab.innerHTML = 'Private';
  mLab.htmlFor = 'sec_pri';
  mDiv.appendChild(mBut);
  mDiv.appendChild(mLab);

  mBut = document.createElement('input');
  mBut.type = 'radio';
  mBut.name = 'sec';
  mBut.value = 15;
  mBut.id = 'sec_grp';
  if(mSec == 15){ mBut.checked = true; }
  mLab = document.createElement('label');
  mLab.innerHTML = 'Group';
  mLab.htmlFor = 'sec_pri';
  mDiv.appendChild(mBut);
  mDiv.appendChild(mLab);
  var mSel = secGroupSelect({ sec:mSec, gid:groupId, domId:'secEGroupSelect' });
  if(mSel){
    mDiv.appendChild(mSel);
    mBut.onclick = function(){ secESet(15); };
  }else{
    mBut.onclick = function(){ alert('You are not a Member of any Groups yet');return false; };
  }
  return mDiv;
}
function secGroupSelect(mArg){
  var mGrp = userGroups();
  if(mGrp){
    var mOpt;
    var mSel = document.createElement('select');
    mSel.name = 'group_id';
    mSel.id = mArg.domId;
    mSel.size = 1;
    if(mArg.size != undefined){
      mSel.size = mArg.size;
    }
    mSel.className = 'secGroupSelect';
    if(mArg.onchange != undefined){
      mSel.onchange = mArg.onchange;
    }
    for(var i=0; i <mGrp.length; i++){
      rGroup = mGrp[i];
      mOpt = document.createElement('option');
      mOpt.value = rGroup.id;
      mOpt.innerHTML = rGroup.name;
      mSel.appendChild(mOpt);
      if(mArg.gid){
        if(rGroup.id == mArg.gid){
          mOpt.selected = true;
        }
      }
    }
    if(mArg.sec == 15){
      mSel.disabled = false;
    }else{
      mSel.disabled = true;
    }
    return mSel;
  }
  return false;
}
function doNothing(){
  return true;
}
function urlFix(mUrl){
  if(mUrl){
    if(! mUrl.match(/^http:\/\//i)){
      mUrl = 'http://' + mUrl;
    }
  }
  return mUrl;
}
function loadCatchTable(mCatch){
  var tBody = document.getElementById('catch_body');
  $(tBody).children().remove();
  var catchCount = mCatch.count;
  for(i=0; i<catchCount; i++){
    var rec = mCatch.records[i];
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.appendChild(document.createTextNode(rec.name));
    td.className = 'blue';
    tr.appendChild(td);
    td = document.createElement('td');
    td.appendChild(document.createTextNode(rec.count));
    tr.appendChild(td);
    td = document.createElement('td');
    td.appendChild(document.createTextNode(rec.avg_weight));
    tr.appendChild(td);
    td = document.createElement('td');
    td.appendChild(document.createTextNode(rec.avg_length));
    tr.appendChild(td);
    tr.onclick = new Function( 'fishDetail(' + rec.id + ')' );
    tr.onmouseover = function(){ this.className='dataRowSelect';};
    tr.onmouseout = function(){ this.className='';};
    tBody.appendChild(tr);
  }
}
function clearCatchTable(){
  $('#catch_body').children().remove();
}
function hasBounds(mGeo){
  if( (mGeo != undefined) && (mGeo != null) ){
    if(mGeo.sw_lat && mGeo.sw_lon && mGeo.ne_lat && mGeo.ne_lon){
      return true;
    }
  }
  return false;
}

var photoSize = {'16':'16x16','25':'25x25', '32':'32x32','50':'50x50', '75':'75x50', '100':'100x100','100x100':'100x100', '200':'200x200', '200x200':'200x200', '300':'300x300', '300x300':'300x300','400':'400x300', '400x400':'400x400', '600':'600x400','800':'800x600'};

function imageSource(fileId,fSize){
  fSize = photoSize[fSize];
  if( (fSize == undefined) || (fSize == null) ){
    fSize = '100x75';
  }
  var mPath = '/fbfs/F/';
  var fid = fileId.toString();
  mPath +=  fid.substr(0,1) + '/';
  if(fid.length > 1){
    mPath += fid.substr(1,1) + '/';
    if(fid.length > 2){
      mPath += fid.substr(2,1) + '/';
      if(fid.length > 3){
        mPath += fid.substr(3,1) + '/';
      }
    }
  }
  mPath += 'f' + fid + '/' + fSize + '.jpg';
  return mPath;
}
function userGroups(){
    var mGrp = fbUser.groups;
    if(mGrp && (mGrp.count > 0) ){
	return mGrp.records;
    }
    return false;
}

////// NEW STUFF 2/12

function actMenuInit(){
    JRJ.menu.activity = new DialogAMenu();
    JRJ.menu.activity.display();
}

function actMenuUpdate(){
    if(JRJ.menu.activity){
	JRJ.menu.activity.update();
    }else{
	actMenuInit();
    }
}

var resizeTimer;
function resizeInit(){
    $(window).bind('resize',function(){	clearTimeout(resizeTimer);
	    resizeTimer = setTimeout(function(){jrjResize();}, 100);
	});
}

function jrjResize(){
    var mWidth = windowWidth();
    var mapWidth = $('#fbMap').width();
    var newLogoClass = 'gLogo';
    var newHeight = '60px';
    var mImg = '/images/fb/fishLogo54x50.png';
    fbActMenuSize = 'normal';
    fbActActionMenuSize = 'normal';
    fbButClass = 'gHeadBut14';
    fbActButClass = 'gHeadBut12';
    fbActBarText = '14px';
    fbActBarLabel = '14px';
    var newButMargin = '12px';
    var newInpMargin = '4px';
    var newInpSize = '14px';
    stateSelectRedraw = false;
    if(mWidth < 325){
	newInpSize = '10px';
	newInpMargin = '0px';
	newButMargin = '4px';
	fbActMenuSize = 'compact';
	fbActActionMenuSize = 'compact';
	fbButClass = 'gHeadBut8';
	fbActButClass = 'gHeadBut8';
	fbActBarText = '8px';
	fbActBarLabel = '10px';
	newLogoClass = 'gLogo6';
	newHeight = '30px';
	mImg = '/images/fb/fishLogo27x25.png';
	stateSelectRedraw = true;
    }else if(mWidth < 390){
	newInpSize = '10px';
	newInpMargin = '2px';
	newButMargin = '6px';
	fbActMenuSize = 'compact';
	fbActActionMenuSize = 'compact';
	fbButClass = 'gHeadBut10';
	fbActButClass = 'gHeadBut9';
	fbActBarText = '8px';
	fbActBarLabel = '10px';
	newLogoClass = 'gLogo5';
	newHeight = '38px';
	mImg = '/images/fb/fishLogo27x25.png';
	stateSelectRedraw = true;
    }else if(mWidth < 490){
	newInpSize = '12px';
	newInpMargin = '3px';
	newButMargin = '8px';
	fbActMenuSize = 'compact';
	fbActActionMenuSize = 'normal';
	fbActBarText = '10px';
	fbActBarLabel = '12px';
	fbButClass = 'gHeadBut12';
	fbActButClass = 'gHeadBut10';
	newLogoClass = 'gLogo4';
	newHeight = '50px';
	mImg = '/images/fb/fishLogo43x40.png';
	stateSelectRedraw = true;
    }else if(mWidth < 550){
	newInpSize = '12px';
	newInpMargin = '5px';
	newButMargin = '7px';
	fbActMenuSize = 'normal';
	fbActActionMenuSize = 'normal';
	fbActBarText = '12px';
	fbActBarLabel = '14px';
	fbButClass = 'gHeadBut13';
	fbActButClass = 'gHeadBut11';
	newLogoClass = 'gLogo3';
	newHeight = '50px';
	mImg = '/images/fb/fishLogo43x40.png';
    }else if(mWidth < 700){
	newInpSize = '14px';
	newInpMargin = '4px';
	newButMargin = '8px';
	fbActMenuSize = 'normal';
	fbActActionMenuSize = 'normal';
	fbButClass = 'gHeadBut14';
	fbActButClass = 'gHeadBut12';
	newLogoClass = 'gLogo2';
	newHeight = '50px';
	mImg = '/images/fb/fishLogo43x40.png';
    }
    if(mapWidth < 400){
	fbActActionMenuSize = 'compact';
    }
    $('#gLogoBox').removeClass().addClass(newLogoClass);
    $('#gLogoImg').attr('src',mImg);
    $('#width').html(mWidth);
    $('#gHead').css({'height':newHeight});
    $('#fbMenu').css({'margin-top':newButMargin});
    $('#jrjGoBox').css({'margin-top':newButMargin});
    $('#locInput').css({'margin-top':newInpMargin,'font-size':newInpSize});
    menuInit();
    if(fbRegionMapActive){
	if( stateSelectRedraw ){
	    // drawRegionMap();
	}
    }
}
function actBarUpdate(){
    if(JRJ.obj.activity){
	JRJ.obj.activity.actionBarUpdate();
    }
}

function actObj(mKey){
    if(mKey == 'report'){
	JRJ.obj.activity = new ActReport();
    }else if(mKey == 'photo'){
	JRJ.obj.activity = new ActPhoto();	
    }else if(mKey == 'catch'){
	JRJ.obj.activity = new ActCatch();	
    }else if(mKey == 'spot'){
	JRJ.obj.activity = new ActSpot();
    }else if(mKey == 'disc'){
	JRJ.obj.activity = new ActDiscuss();
    }else if(mKey == 'user'){
	JRJ.obj.activity = new ActUser();
    }else if(mKey == 'group'){
	JRJ.obj.activity = new ActGroup();
    }else if(mKey == 'fish'){
	JRJ.obj.activity = new ActFish();
    }else if(mKey == 'adminUser'){
	JRJ.obj.activity = new ActAdminUser();
    }else if(mKey == 'adminFish'){
	JRJ.obj.activity = new ActAdminFish();
    }else if(mKey == 'promo'){
	JRJ.obj.activity = new ActPromo();
    }else if(mKey == 'promoSent'){
	JRJ.obj.activity = new ActPromoSent();
    }else if(mKey == 'promoSentUser'){
	JRJ.obj.activity = new ActPromoSentUser();
    }else if(mKey == 'login'){
	JRJ.obj.activity = new ActLogin();
    }else if(mKey == 'feed'){
	JRJ.obj.activity = new ActFeed();
    }else{ // default is all
	JRJ.obj.activity = new ActAll();
    }
    return JRJ.obj.activity;
}

function actObjRef(mKey){
    if(mKey == 'report'){
	return new ActReport();
    }else if(mKey == 'catch'){
	return new ActCatch();	
    }else if(mKey == 'spot'){
	return new ActSpot();
    }else if(mKey == 'disc'){
	return new ActDiscuss();
    }else if(mKey == 'user'){
	return new ActUser();
    }else if(mKey == 'group'){
	return new ActGroup();
    }else if(mKey == 'photo'){
	return new ActPhoto();
    }else if(mKey == 'fish'){
	return new ActFish();
    }else if(mKey == 'reply'){
	return new ActReply();
    }else if(mKey == 'adminUser'){
	return new ActAdminUser();
    }else if(mKey == 'adminFish'){
	return new ActAdminFish();
    }else if(mKey == 'promo'){
	return new ActPromo();
    }else if(mKey == 'promoSent'){
	return new ActPromoSent();
    }else if(mKey == 'login'){
	return new ActLogin();
    }else if(mKey == 'feed'){
	return new ActFeed();
    }else if(mKey == 'promoSentUser'){
	return new ActPromoSentUser();
    }else{
	return new ActAll();
    }
    return false;
}

function actCfg(mKey){
    if(mKey == 'report'){
	return jrjCfgReport;
    }else if(mKey == 'catch'){
	return jrjCfgCatch;
    }else if(mKey == 'spot'){
	return jrjCfgSpot;
    }else if(mKey == 'disc'){
	return jrjCfgDisc;
    }else if(mKey == 'user'){
	return jrjCfgUser;
    }else if(mKey == 'group'){
	return jrjCfgGroup;
    }else if(mKey == 'photo'){
	return jrjCfgPhoto;
    }else if(mKey == 'fish'){
	return jrjCfgFish;
    }else if(mKey == 'adminUser'){
	return jrjCfgAdminUser;
    }else if(mKey == 'adminFish'){
	return jrjCfgAdminFish;
    }else if(mKey == 'promo'){
	return jrjCfgPromo;
    }else if(mKey == 'promoSent'){
	return jrjCfgPromoSent;
    }else if(mKey == 'login'){
	return jrjCfgLogin;
    }else if(mKey == 'feed'){
	return jrjCfgFeed;
    }else if(mKey == 'all'){
	return jrjCfgAll;
    }
    return false;
}

// menu
function menuObj(mKey){
    if(mKey == 'actNew'){
	return new MenuActNew();
    }else if(mKey == 'guest'){
	return new MenuGuest();
    }else if(mKey == 'user'){
	return new MenuUser();
    }else if(mKey == 'account'){
	return new MenuAccount();
    }else if(mKey == 'act'){
	return new MenuAct();
    }else if(mKey == 'actNew'){
	return new MenuActNew();
    }else{ // default is Activity Select
	return new MenuActSelect();
    }
    return false;
}
// menu

function actMapInit(mKey){
    return mapOnCB( function(){ mapResize(); actMap(mKey); } );
}
function actMapInitAdmin(mKey){
    return mapOnCB( function(){ mapResize(); actMapAdmin(mKey); } );
}

function actMap(mKey){
    mapOn();
    dialogClose();
    if(JRJ.obj.activity){
	if(JRJ.obj.activity.ajaxBusy === true){
	    return false;
	}
	JRJ.obj.activity.clear();
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
    JRJ.obj.activity.mapDisplay();
    return false;
}

function actMapAdmin(mKey){
    mapOn();
    dialogClose();
    if(JRJ.obj.activity){
	if(JRJ.obj.activity.ajaxBusy === true){
	    return false;
	}
	JRJ.obj.activity.clear();
    }
    if(mKey){
	setCookie('fbActAdmin',mKey);
    }else{
	mKey = getCookie('fbActAdmin');
	if( ! mKey){
	    mKey = 'adminUser';
	}
    }
    JRJ.obj.activity = actObj(mKey);
    JRJ.obj.activity.mapDisplay();
    return false;
}

function actMapNoCookie(mKey){
    mapOn();
    dialogClose();
    if(JRJ.obj.activity){
	if(JRJ.obj.activity.ajaxBusy === true){
	    return false;
	}
	JRJ.obj.activity.clear();
    }
    if(mKey){
	JRJ.obj.activity = actObj(mKey);
	JRJ.obj.activity.mapDisplay();
    }
    return false;
}

function actFilter(mOpt){
    if( ! mOpt.key && ! mOpt.filterName){
	alert('actFilter missing param');
	return false;
    }
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    setCookie('fbAct',mOpt.key);
    JRJ.obj.activity = actObj(mOpt.key);
    JRJ.obj.activity.filterOn(mOpt.filterName);
    JRJ.obj.activity.mapDisplay();
    return false;
}
function actHomeMapInit(mName){
    $('#usMapText').css('display','none');
    $('#usMap').animate({width:0,height:0},'slow','swing',function(){ actHomeMapNew(mName);});
}
function actHomeMapNew(mName){
    $('#usMap').css('display','none');
    mapShrink();
    mapShow();
    $('#fbMap').animate({width:'100%',height:'300px'},'slow','swing',function(){ mapResize();actNew(mName);} );
}

function actMapNew(mName){
    mapOnCB( function(){ mapResize();actNew(mName);} );
}

function actNew(mKey){
    if( ! userCanPost()){ return false; }
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    if(mKey){
	setCookie('fbAct',mKey);
    }else{
	mKey = getCookie('fbAct');
    }
    JRJ.obj.activity = actObj(mKey);
    JRJ.obj.activity.newOpen();
    return false;
}
function actList(mKey){
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    if(mKey){
	setCookie('fbAct',mKey);
    }else{
	mKey = getCookie('fbAct');
    }
    JRJ.obj.activity = actObj(mKey);
    JRJ.obj.activity.listDisplay();
    return false;
}
function actSearch(mKey){
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    if(mKey){
	setCookie('fbAct',mKey);
    }else{
	mKey = getCookie('fbAct');
    }
    JRJ.obj.activity = actObj(mKey);
    JRJ.obj.activity.searchOpen();
    return false;
}
function actMapOne(mName,mKey){
    mapOnCB( function(){ mapResize();actOne({'key':mName,'id':mKey }); } );
}

function actOne(mOpt){
    if( ! mOpt.key && ! mOpt.id){
	alert('actOne missing param');
	return false;
    }
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    setCookie('fbAct',mOpt.key);
    JRJ.obj.activity = actObj(mOpt.key);
    JRJ.obj.activity.id = mOpt.id;
    JRJ.obj.activity.readOpenById(mOpt.id);
    return false;
}

function actOneNoCookie(mOpt){
    if( ! mOpt.key && ! mOpt.id){
	alert('actOne missing param');
	return false;
    }
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    JRJ.obj.activity = actObj(mOpt.key);
    JRJ.obj.activity.id = mOpt.id;
    JRJ.obj.activity.readOpenById(mOpt.id);
    return false;
}

function actMapEdit(mName,mKey){
    if(mName == 'user'){
	if(userValid()){
	    ownerEdit();
	}
    }else{
	mapOnCB( function(){ mapResize();actEdit({'key':mName,'id':mKey }); } );
    }
}

function actEdit(mOpt){
    if( ! mOpt.key && ! mOpt.id){
	alert('actEdit missing param');
	return false;
    }
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    setCookie('fbAct',mOpt.key);
    JRJ.obj.activity = actObj(mOpt.key);
    JRJ.obj.activity.id = mOpt.id;
    JRJ.obj.activity.editOpenById(mOpt.id);
    return false;
}

function actReplyInitGW(mName,mKey){
    if( ! mName && ! mKey){
	alert('actReply missing param');
	return false;
    }
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    setCookie('fbAct',mName);
    JRJ.obj.activityGW = actObj(mName);
    JRJ.obj.activityGW.id = mKey;
    JRJ.obj.activityGW.replyInitGW(mKey);
    return false;
}

function actOneGW(mName,mKey){
    if( ! mName && ! mKey){
	alert('actOneGW missing param');
	return false;
    }
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    setCookie('fbAct',mName);
    JRJ.obj.activityGW = actObj(mName);
    JRJ.obj.activityGW.id = mKey;
    JRJ.obj.activityGW.rootName = 'gwOne';
    JRJ.obj.activityGW.target = 'gw';
    JRJ.obj.activityGW.rootClass = 'gwBoxAct';
    JRJ.obj.activityGW.detailOpenById(mKey);
    //accordionLike($('#gwActChildBox'));
    return false;
}

function actUpdate(){
    dialogClose();
    if(JRJ.obj.activity && mapIsOpen()){
	JRJ.obj.activity.clear();
	JRJ.obj.activity.update();
    }
    return false;
}

function actDetail(mOpt){
    if( ! mOpt.key && ! mOpt.id){
	alert('actDetail missing param');
	return false;
    }
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    JRJ.obj.activity = actObj(mOpt.key);
    JRJ.obj.activity.id = mOpt.id;
    JRJ.obj.activity.detailOpenById(mOpt.id);
    return false;
}

function actUploadResponse(){
    if(JRJ.obj.activity){
	if(JRJ.obj.activity.name == 'photo'){
	    return JRJ.obj.activity.uploadResponse();
	}else if(JRJ.obj.activity.children){
	    var mObj = JRJ.obj.activity.childHash['photo'];
	    return mObj.uploadResponse();
	}
    }
    alert('Upload response object not found');
    return false;
}

function ownerObj(){
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }else{
	JRJ.user.obj = new ActOwner();
    }
    return JRJ.user.obj;
}

function ownerMapEdit(){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.mapEdit();
    return false;
}

function ownerMapWinOpen(){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }else{
	JRJ.user.obj = new ActOwner();
    }
    JRJ.user.obj.mapWinOpenInit();
    return false;
}

function ownerMapWinClose(){
    if(JRJ.user.obj){
	JRJ.user.obj.mapWinClose();
    }
    return false;
}

function ownerResetStart(){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.mode = 'reset';
    JRJ.user.obj.titleStr = 'Reset My FishBlab Password';
    JRJ.user.obj.resetStartOpen();
    return false;
}

function ownerResetConfirm(){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.mode = 'confirm';
    JRJ.user.obj.titleStr = 'Password reset sent';
    JRJ.user.obj.resetConfirmOpen();
    return false;
}
function ownerResetFinal(mOpt){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.mode = 'edit';
    JRJ.user.obj.titleStr = 'Create new FishBlab.com Password';
    JRJ.user.obj.rid = mOpt.rid;
    JRJ.user.obj.rcode = mOpt.rcode;
    JRJ.user.obj.resetFinalOpen();
    return false;
}

function ownerLogin(){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.mode = 'new';
    JRJ.user.obj['tipShow'] = false;
    JRJ.user.obj.loginOpen();
    return false;
}

function showCreate(){
    ownerNew();
}
function ownerNew(){
    if(userValid()){ return false; }
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.mode = 'new';
    JRJ.user.obj.titleStr = 'Create New Account';
    JRJ.user.obj.newOpen();
    return false;
}

function ownerEdit(){
    if( ! userValid()){ return false; }
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.mode = 'edit';
    JRJ.user.obj.titleStr = 'Edit My Account';
    JRJ.user.obj.ajaxGetUserEdit();
    return false;
}

function ownerEditPass(){
    dialogClose();
    JRJ.user.obj = ownerObj();
    JRJ.user.obj.mode = 'edit';
    JRJ.user.obj.editPassOpen();
    return false;
}

function ownerEditPhoto(){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj.mode = 'edit';
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.photoOpen();
    return false;
}

function ownerEditEmail(){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj.mode = 'edit';
    JRJ.user.obj = new ActOwnerEmail();
    JRJ.user.obj.editOpen(fbUser);
    return false;
}

function ownerEmailStop(mEmail){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj.mode = 'edit';
    JRJ.user.obj = new ActOwner();
    JRJ.user.obj.emailStop(mEmail);
    return false;
}

function ownerUploadResponse(){
    if(JRJ.user.obj){
	var mObj = JRJ.user.obj.childHash['photo'];
	if(mObj){
	    return mObj.uploadResponse();
	}
    }
    alert('Upload response not found for owner');
    return false;
}

function ownerFeed(){
    dialogClose();
    if(JRJ.user.obj){
	JRJ.user.obj.clear();
    }
    JRJ.user.obj.mode = 'new';
    JRJ.user.obj = new ActFeed();
    JRJ.user.obj.newOpen();
    return false;
}

function friendStatus(mUsername){
    dialogClose();
    if(JRJ.obj.activity){
	JRJ.obj.activity.clear();
    }
    JRJ.obj.activity = actObj('user');
    JRJ.obj.activity.id = mUsername;
    JRJ.obj.activity.friendStatOpenById(mUsername);
    return false;
}

function mapChange(mGeo){
    if(hostIsMap()){
	JRJ.map.obj.geoChange(mGeo);
    }else{
	if(mapIsOpen()){
	    JRJ.map.obj.geoChange(mGeo);
	}else{
	    mapOnCB( function(){ mapResize(); JRJ.map.obj.geoChange(mGeo); } );
	}
    }
    // var mUrl = 'http://map.fishblab.com?lat=' + mGeo.lat + '&lon=' + mGeo.lon +'&input=' + escape(mGeo.input);
    // window.location.href = mUrl;
}

function mapEventZoomDisable(){
    JRJ.map.obj.eventZoomDisable();
}

function mapEventZoomEnable(){
    JRJ.map.obj.eventZoomEnable();
}

var jrjDialog = false;
var jrjDialog2 = false;
function dialogGetRoot(){
    return document.getElementById('jrjDialog');
}
function dialogGetRoot2(){
    return document.getElementById('jrjDialog2');
}
function dialogGet(){
    return jrjDialog;
}
function dialogGet2(){
    return jrjDialog2;
}
function dialogReset(){
    if(jrjDialog){
	jrjDialog.close();
	$(jrjDialog).children().remove();
    }
    return dialogGetRoot;
}
function dialogReset2(){
    if(jrjDialog2){
	jrjDialog2.close();
	$(jrjDialog2).children().remove();
    }
    return dialogGetRoot2;
}
function dialogClose(){
    if(jrjDialog){
	jrjDialog.close();
    }
    return jrjDialog;
}
function dialogClose2(){
    if(jrjDialog2){
	jrjDialog2.close();
    }
    return jrjDialog2;
}

///////////////
// USER
///////////////
// NEW 1/16/12
var fbDefaultProfileId = 332;
function userPubShow(username){
    return uPubShow({'username':username});
}
function uDashFB(){
    dialogClose();
    jrjDialog = new DialogUDashFB();
    jrjDialog.display();
    return false;
}

function uDashAct(){
    dialogClose();
    jrjDialog = new DialogADash();
    jrjDialog.display();
    return false;
}

function actDash(mKey){
    dialogClose();
    jrjDialog = new DialogADashAct(mKey);
    jrjDialog.display();
    return false;
}

function DELETEuShowLogin(){
    dialogClose();
    jrjDialog = new DialogULogin();
    jrjDialog.display();
    return false;
}

function DELETEuShowCreate(){
    dialogClose();
    jrjDialog = new DialogUCreate();
    jrjDialog.display();
    return false;
}

function uDash(){
    dialogClose();
    jrjDialog = new DialogUDash();
    jrjDialog.display();
    return false;
}

function uDashGuest(){
    dialogClose();
    jrjDialog = new DialogUDashGuest();
    jrjDialog.display();
    return false;
}

function uDashAccount(){
    dialogClose();
    jrjDialog = new DialogUDashAccount();
    jrjDialog.display();
    return false;
}

function uFriendDash(){
    dialogClose();
    jrjDialog = new DialogUFriendDash();
    jrjDialog.display();
    return false;
}

function uFriendList(){
    dialogClose();
    jrjDialog = new DialogUFriendList();
    jrjDialog.display();
    return false;
}

function uFriendListReq(){
    dialogClose();
    var mOpt = {caption:'Friend Requests from other Users','ajaxUrl':'/user/a/aGetRequests','mode':'request'};
    jrjDialog = new DialogUFriendList(mOpt);
    jrjDialog.display();
    return false;
}

function uFriendListBlock(){
    dialogClose();
    var mOpt = {caption:'Users I have Blocked','ajaxUrl':'/user/a/aGetBlocked','mode':'block'};
    jrjDialog = new DialogUFriendList(mOpt);
    jrjDialog.display();
    return false;
}


function uGroupDash(){
    dialogClose();
    jrjDialog = new DialogUGroupDash();
    jrjDialog.display();
    return false;
}

function uGroupSearch(){
    dialogClose();
    jrjDialog = new ActGroup();
    jrjDialog.searchOpen();
    return false;
}

function uGroupStatus(groupId){
    dialogClose();
    jrjDialog = new DialogUGroupStatus(groupId);
    jrjDialog.display();
    return false;
}

function uGroupStatus2(groupId){
    dialogClose2();
    jrjDialog2 = new DialogUGroupStatus(groupId);
    jrjDialog2.display();
    return false;
}

function uGroupList(){
    dialogClose();
    jrjDialog = new DialogUGroupList();
    jrjDialog.display();
    return false;
}

function uGroupListReq(){
    dialogClose();
    var mOpt = {caption:'Invitations to Join FishBlab groups','ajaxUrl':'/group/a/aGetRequests','mode':'request'};
    jrjDialog = new DialogUGroupList(mOpt);
    jrjDialog.display();
    return false;
}

function uGroupListBlock(){
    dialogClose();
    var mOpt = {caption:'Groups I have Blocked','ajaxUrl':'/group/a/aGetBlocked','mode':'block'};
    jrjDialog = new DialogUGroupList(mOpt);
    jrjDialog.display();
    return false;
}

function uShowFeed(){
    dialogClose();
    jrjDialog = new DialogUFeed();
    jrjDialog.display();
    return false;
}

function uPubShow(mOpt){
    actOneNoCookie({'id':mOpt.username,'key':'user'});
    return false;
}

function uPubShow2(mOpt){
    dialogClose2();
    mOpt['rootName'] = 'jrjDialog2';
    jrjDialog2 = new DialogUPShow(mOpt);
    jrjDialog2.display();
    return false;
}

function uFriendStatus(mOpt){
    dialogClose();
    jrjDialog = new DialogUFriendStatus(mOpt);
    jrjDialog.display();
    return false;
}

function uFriendConfirm(mOpt){
    dialogClose();
    jrjDialog = new DialogUFriendConfirm(mOpt);
    jrjDialog.display();
    return false;
}

function uNotifyAlert(){
    var jrjDialogTemp = new DialogUNotifyAlert();
    jrjDialogTemp.display();
    return false;
}

function uNotifyList(){
    dialogClose();
    jrjDialog = new DialogUNotifyList();
    jrjDialog.display();
    return false;
}


function uPubLoad(rUsers){
    for(var i=0;i < rUsers.length; i++){
	var rUser = rUsers[i];
	fbUserPub[rUser.username] = rUser;
    }
}

function logoutCB(json,textStatus){
  loadUser();
  menuInit();
  showMsg('You have been Logged out of FishBlab.com');
  actUpdate();
}

function logout(){
  $.ajax({ url: '/user/a/aLogoutUser', dataType: 'json',
           success: function(json,textStatus){ logoutCB(json, textStatus); },
           error: function(){ }
         });
  return false;
}


////////////////
// END USER
////////////////
var fbMapCurHeight = 0;
var fbMapCurWidth = 0;
var fbMapCurDisplay = 'block';
var fbDefaultMapHeight = '250px';
var fbDefaultMapWidth = '300px';

function map(mArg){
    //window.location = 'http://map.fishblab.com/'+mArg;
    if(fbMapWindow){
	//	fbMapWindow.focus();
    }
    fbMapWindow = window.open('http://map.fishblab.com/'+mArg,'map');
}

function mapResize(){
    var oldCenter = JRJ.map.googleMap.getCenter();
    google.maps.event.trigger(JRJ.map.googleMap, 'resize');
    JRJ.map.googleMap.panTo(oldCenter);
    jrjResize();
}
function mapShow(){
    $('#fbMap').css({'display':'block'});
}
function mapHide(){
    $('#fbMap').css({'display':'none'});
}
function mapRestoreDisplay(){
    $('#fbMap').css({'display':fbMapCurDisplay});
    jrjResize();
}
function mapShrink(){
    $('#fbMap').css({'width':0,'height':0});
}
function mapOn(){
    var $mMap = $('#fbMap');
    if($mMap.width() == 0){
	mapShow();
	$mMap.animate({width:'90%',height:'100%'},'slow','swing',mapResize);
	$('#jrjMapToggle').show();
	return true;
    }
    return false;
}
function mapOnCB(callBack){
    var $mMap = $('#fbMap');
    fbMapCurHeight = $mMap.height();
    fbMapCurWidth = $mMap.width();
    fbMapCurDisplay = $mMap.css('display');
    if( ($mMap.width() < 400) || ($mMap.css('display') == 'none') ){
	mapShow();
	$mMap.animate({width:'100%',height:'90%'},'slow','swing',callBack);
	$('#jrjMapToggle').show();
	return true;
    }
    return callBack();
}
function mapOff(){
    var $mMap = $('#fbMap');
    //$mMap.animate({width: fbMapCurWidth,height:fbMapCurHeight},'slow','swing',mapRestoreDisplay);
    $mMap.animate({width: fbDefaultMapWidth,height:fbDefaultMapHeight},'slow','swing',mapRestoreDisplay);
    $('#jrjActionBar').hide();
    $('#jrjMapToggle').hide();
    return false;
}

function stateConvert(stateFull){
    stateFull = stateFull.toLowerCase();
    var mState = stateConvertHash[stateFull];
    if(mState){
	return mState;
    }
    return false;
}

function drawRegionMap() {
    return false;
    if(fbAreaSelect && fbAreaSelect.records){
	var mData = google.visualization.arrayToDataTable(fbAreaSelect.records);
	var mChart = new google.visualization.GeoChart(document.getElementById('usMap'));
	mChart.draw(mData, fbAreaSelect.options);
	google.visualization.events.addListener(mChart, 'select', function() {
		var mRow = mChart.getSelection()[0].row;
		var mStateFull = mData.getValue(mRow, 0);
		var mState = stateConvert(mStateFull);
		redirectToState(mState);
	    });
    }
}