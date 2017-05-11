var fbTilesLoaded = false;
var fbZoomChanged = false;
var fbZoomListener;
var mapDefaultPoint = new google.maps.LatLng(26.7488889,-82.2619444);
var mapDefaultLoc = 'Boca Grande, FL';
var mapDefaultZoom = 12;

function MapClass(){
    this.eventTilesLoadedDone = false;
    this.eventZoomChangeDone =  false;
    this.busy = false;
}

MapClass.prototype.init = function(){
    if( ! fbLoc){ return false; }
    this.cfg = {};
    var mH = getURLParameters();
    var mGeo = fbLoc.geo;
    if(mH.lat && mH.lon){
	mGeo = {'lat':parseFloat(mH.lat),'lon':parseFloat(mH.lon),'input':mH.input};
	if(mH.zoom){
	    mGeo['zoom'] = mH.zoom;
	}
    }
    if(mGeo.lat && mGeo.lon){
	this.cfg.center_point = new google.maps.LatLng(mGeo.lat, mGeo.lon);
	this.cfg.zoom = 12;
    }else{
	this.cfg.center_point = mapDefaultPoint;
	mGeo.input = mapDefaultLoc;
	mGeo.zoom = mapDefaultZoom;
    }
    mGeo.zoom = (mGeo.zoom ? mGeo.zoom : mapDefaultZoom);
    this.cfg.loc = mGeo.loc;
    this.cfg.zoom = mGeo.zoom;
};

MapClass.prototype.getUserLoc = function(){
    var myThis = this;
    this.devLoc = false;
    if(navigator.geolocation) {
	var mOptions = {timeout:60000};
	navigator.geolocation.getCurrentPosition(myThis.initCurLoc, myThis.initCurLocErr, mOptions);
    }
    return false;
};

MapClass.prototype.display = function(){
    var mapDiv = document.getElementById('fbMap');
    if( ! mapDiv){ return false; }
    var mOpt = { center:this.cfg.center_point, zoom:this.cfg.zoom, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false, panControl:false };
    JRJ.map.googleMap = new google.maps.Map(mapDiv, mOpt);
    this.eventsAdd();
    return true;
};

MapClass.prototype.reload = function(){
    if( (JRJ.map.googleMap != undefined) && (JRJ.map.googleMap != null) ){
	google.maps.event.trigger(JRJ.map.googleMap, 'resize');
    }
};

MapClass.prototype.afterResize = function(){
    alert('ResizeAfter');
    if(this.curCenter){
	//	JRJ.map.googleMap.panTo(this.curCenter);
    }
    this.curCenter = false;
};

MapClass.prototype.reloadAndUpdate = function(){
    this.eventIdleEnable();
    this.reload();
};

MapClass.prototype.geoChange = function(mGeo){
    if(mGeo.bounds){
	JRJ.map.googleMap.fitBounds(mGeo.bounds);
    }
};

MapClass.prototype.markerCenterCreate = function(){
    if( ! this.cfg.title){
	this.cfg.title = 'Center of Search';
    }
    if(this.marker){
	this.marker.setMap(null);
    }
    this.marker = new google.maps.Marker({ position:this.cfg.center_point, title:this.cfg.title });
    this.marker.setMap(JRJ.map.googleMap);
    return this.marker;
};

MapClass.prototype.markerCreate = function(cfg){
    var mPoint = new google.maps.LatLng(cfg.lat,cfg.lon);
    var mMarker = new google.maps.Marker({ position: mPoint, title:cfg.map_title, icon:cfg.map_icon });
    mMarker.setMap(JRJ.map.googleMap);
    return mMarker;
};

MapClass.prototype.eventTilesLoaded = function(){
    if(this.eventTilesLoadedDone == false){
	this.eventTilesLoadedDone = true;
	jrjLoadMap();
    }
};

MapClass.prototype.eventDragEnd = function(){
    this.save();
    this.update();
};

MapClass.prototype.eventIdleDisable = function(){
    if(this.eventIdleChangeListener){
	google.maps.event.removeListener(this.eventIdleChangeListener);
    }
};

MapClass.prototype.eventIdleEnable = function(){
    var myThis = this;
    this.eventIdleChangeListener = google.maps.event.addListener(JRJ.map.googleMap, 'idle', function(){myThis.eventOnIdle();});
};

MapClass.prototype.eventAfterResizeEnable = function(){
    var myThis = this;
    this.eventAfterResizeDisable();
    this.eventAfterResizeListener = google.maps.event.addListener(JRJ.map.googleMap, 'idle', function(){myThis.eventAfterResize();});
};

MapClass.prototype.eventAfterResize = function(){
    this.afterResize();
    this.eventAfterResizeDisable();
};

MapClass.prototype.eventAfterResizeDisable = function(){
    if(this.eventAfterResizeListener){
	google.maps.event.removeListener(this.eventAfterResizeListener);
    }
};

MapClass.prototype.eventZoomDisable = function(){
    if(this.eventZoomChangeListener){
	google.maps.event.removeListener(this.eventZoomChangeListener);
    }
};

MapClass.prototype.eventZoomEnable = function(){
    var myThis = this;
    this.eventZoomChangeListener = google.maps.event.addListener(JRJ.map.googleMap, 'zoom_changed', function(){myThis.eventZoomChange();} );
};

MapClass.prototype.eventZoomChange = function(){
    if( (!this.busy) && this.eventTilesLoadedDone){
	this.eventZoomChangeDone = true;
	this.eventIdleEnable();
    }
};

MapClass.prototype.eventOnIdle = function(){
    if(this.eventZoomChangeDone && this.eventTilesLoadedDone){
	this.eventZoomChangeDone = false;
	this.eventIdleDisable();
	this.save();
	this.update();
    }
};

MapClass.prototype.eventsAdd = function(){
    var myThis = this;
    google.maps.event.addListener(JRJ.map.googleMap, 'tilesloaded', function(){myThis.eventTilesLoaded();});
    google.maps.event.addListener(JRJ.map.googleMap, 'dragend', function(){myThis.save();myThis.update();});
    this.eventZoomEnable();
};

MapClass.prototype.zoomIn = function(){
    var curZoom = JRJ.map.googleMap.getZoom();
    var newZoom = curZoom;
    if(curZoom < 24){
	newZoom++;
	JRJ.map.googleMap.setZoom(newZoom);
	curZoom = JRJ.map.googleMap.getZoom();
    }
    return curZoom;
};

MapClass.prototype.zoomOut = function(){
    var curZoom = JRJ.map.googleMap.getZoom();
    var newZoom = curZoom;
    if(curZoom > 0){
	newZoom--;
	JRJ.map.googleMap.setZoom(newZoom);
	curZoom = JRJ.map.googleMap.getZoom();
    }
    return curZoom;
};

MapClass.prototype.zoomCur = function(){
    var mZoom = fbLoc.geo.zoom;
    if(mZoom == undefined){
	mZoom = 12;
    }
    return mZoom;
};

MapClass.prototype.save = function(){
    setCookie('fbBounds',JRJ.map.googleMap.getBounds().toUrlValue());
    setCookie('fbCenter',JRJ.map.googleMap.getCenter().toUrlValue());
    setCookie('fbZoom',JRJ.map.googleMap.getZoom());
    //  setCookie('fbInput',fbInput);
};

MapClass.prototype.update = function(){
    if(JRJ.obj.activity){
	JRJ.obj.activity.update();
    }
};

//////////////////////////
// MapGate
//////////////////////////
MapGate.prototype = new MapClass();
MapGate.prototype.constructor = MapGate;
function MapGate() {
    MapClass.call(this);
    this.init();
};


//////////////////////////
// MapApp
//////////////////////////
MapApp.prototype = new MapClass();
MapApp.prototype.constructor = MapApp;
function MapApp() {
    MapClass.call(this);
    this.init();
}

MapApp.prototype.markerCreate = function(rec){
    rec.map_title = rec.date_catch;
    rec.map_icon = fbIconRep;
    var mMarker = MapClass.markerCreate.call(this,rec);
    google.maps.event.addListener(mMarker, 'click', function(){ openRepWin(rec.id); } );
    rec.map_marker = mMarker;
    return mMarker;
};

MapApp.prototype.markerClear = function(){
    var reports = getReports();
    for(var i=0; i<reports.length; i++){
	var marker = reports[i].map_marker;
	if(marker != undefined){
	    marker.setMap(null);
	}
    }
};

MapApp.prototype.markerLoad = function(){
    var reports = getReports();
    for(var i=0; i<reports.length; i++){
	var rec = reports[i];
	this.markerCreate(rec);
    }
};

MapApp.prototype.listenerAdd = function(){

};

//////////////////////////
// MapMob
//////////////////////////
MapMob.prototype = new MapClass();
MapMob.prototype.constructor = MapMob;
function MapMob() {
    MapClass.call(this);
    this.init();
};

MapMob.prototype.init = function(){
    this.cfg = {'lat':false,'lon':false};
    this.initFromCookie();
};

MapMob.prototype.initFromCookie = function(){
    var curBoundsStr = getCookie('fbBounds');
    var curCenterStr = getCookie('fbCenter');
    var curZoom = getCookie('fbZoom');
    if(curCenterStr){
	var latLon = curCenterStr.split(',');
	this.cfg.lat = parseFloat(latLon[0]);
	this.cfg.lon = parseFloat(latLon[1]);
	this.cfg.center_point = new google.maps.LatLng(this.cfg.lat, this.cfg.lon);
	this.cfg.zoom = parseInt(curZoom);
    }
    if( (! this.cfg.lat) && ! (this.cfg.lon)){
	this.initFromDevice();
    }
};

MapMob.prototype.initFromDevice = function(){
    var myThis = this;
    this.devLoc = false;
    if(false){  // navigator.geolocation) {
	var mOptions = {timeout:10000};
	navigator.geolocation.getCurrentPosition(function(position){myThis.initCurLoc(position); }, 
						 function(mErr){ myThis.initCurLocErr(mErr); },
						 mOptions);
    }else{
	this.initFromServer();
    }
    return false;
};

MapMob.prototype.initCurLoc = function(position){
    this.cfg.lat = position.coords.latitude;
    this.cfg.lon = position.coords.longitude;
    this.cfg.center_point = new google.maps.LatLng(this.cfg.lat, this.cfg.lon);
    this.cfg.zoom = 12;
};

MapMob.prototype.initFromServer = function(){
    var mLat,mLon;
    if( ! fbLoc){ return false; }
    var mGeo = fbLoc.geo;
    if(mGeo.lat && mGeo.lon){
	this.cfg.lat = mGeo.lat;
	this.cfg.lon = mGeo.lon;
	this.cfg.center_point = new google.maps.LatLng(mGeo.lat, mGeo.lon);
	this.cfg.zoom = 12;
	this.cfg.loc = mGeo.loc;
    }else{
	this.cfg.center_point = mapDefaultPoint;
	this.cfg.input = mapDefaultLoc;
	this.cfg.zoom = mapDefaultZoom;
    }
};

MapMob.prototype.initCurLocErr = function(error){
    switch (error.code)
	{ case error.PERMISSION_DENIED:
	  // alert('Permission was denied');
	  break;
	case error.POSITION_UNAVAILABLE:
	  // alert('Position is currently unavailable.');
	  break;
	case error.PERMISSION_DENIED_TIMEOUT:
	  // alert('User took to long to grant/deny permission.');
	  break;
	case error.UNKNOWN_ERROR:
	  // alert('An unknown error occurred.')
	  break;
	}
    this.initFromServer();
};
