(function(){
    $(document).bind("mobileinit", function() {
	    $.mobile.defaultPageTransition = 'slide';
	    $(document).one("pagebeforecreate", function() {
		    mobHomeInit();
		});
	});
})();
