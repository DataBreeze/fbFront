var jrjActList = ['photo','catch','report','spot','disc','user','group'];
var jrjActOpt = {'admin':false};

var jrjCfgAll = {name:'all','host':'m','keyField':'id',label:'Acivity',labelPlural:'Activities','displayField':'caption',
		 'fields': [ 
{'type':'hidden','name':'sec','editSub':'editSec','readSub':'secDisplay'},
{'type':'date','name':'date','label':'Date','listShow':true,'shortShow':true},
{'type':'text','name':'caption','label':'Caption','required':true,'listShow':true,'tip':'Description of spot','shortShow':true,'searchShow':true,'searchType':'contain','mapShow':true},
{'type':'text','name':'loc','label':'Location','required':true,'tip':'General location','shortShow':true,'mapShow':true},
{'type':'textarea','name':'content','label':'Detail','searchShow':true,'searchType':'contain','tip':'Required. Maximum 500 characters'},
{'type':'hidden','name':'id'},
{'type':'hidden','name':'user_id'},
{'type':'hidden','name':'group_id'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'}
],
		     'children':[],
		     'recordList':[],
		     'recordHash':{},
		     allowEdit: true,
		     allowDelete: true,
		     allowPhotos: true,
		     allowReply: true,
		     allowFish: true,
		     ajaxUrlBB: '/mob/a/aGetAllBB',
		     ajaxUrlById: '/spot/a/aFetchSpot',
		     ajaxUrlNew: '/spot/a/aSpotPost',
		     ajaxUrlEdit: '/spot/a/aSpotUpdate',
		     ajaxUrlDelete: '/spot/a/aDeleteSpot',
		     ajaxUrlEditGeo: '/spot/a/aSpotEditGeo',
		     ajaxUrlSearch: '/spot/a/aSpotSearch',
		     urlUpload:'/spot/upload',
		     iconUrlSmall: '/images/map/spotSmall.png',
		     iconUrlSmallBg: '/images/map/spotSmallShadow.png',
		     iconUrlSmallSz: [10,16,0,0,5,8],
		     iconUrlMed: '/images/map/spotMed.png',
		     iconUrlMedSz: [15,24,0,0,7,12],
		     iconUrlMedBgSz: [28,24,0,0,14,12],
		     titleField: 'date_create',
		     allowListStat: true,
		     urlAddKey: true
		     };

var jrjCfgSpot = {name:'spot','host':'spot','keyField':'id',label:'Spot',labelPlural:'Spots','displayField':'caption',
		  'fields': [ 
{'type':'hidden','name':'sec','editSub':'editSec','readSub':'secDisplay'},
{'type':'row','fields':[
{'type':'text','name':'caption','label':'Caption','required':true,'listShow':true,'tip':'Description of spot','shortShow':true,'searchShow':true,'searchType':'contain','mapShow':true},
{'type':'text','name':'loc','label':'Location','required':true,'tip':'General location','shortShow':true,'mapShow':true}
			]
},
{'type':'row','fields':[
			{'type':'text','name':'url','label':'Web Link','required':false,'readShow':true,'mapShow':true,'tip':'External website','readSub':'readUrlNode'},
			{'type':'text','name':'url_caption','label':'Website Description','required':false,'editShow':false,'newShow':false,'readShow':false,'tip':'User Friendly name'}
			]
},
{'type':'row','fields':[
			{'type':'text','name':'lat','label':'Lat','required':false,'readShow':true,'mapShow':false,'editShow':false,'newShow':false},
			{'type':'text','name':'lon','label':'Lon','required':false,'readShow':true,'mapShow':false,'editShow':false,'newShow':false}
			]
},
{'type':'textarea','name':'content','label':'Detail','searchShow':true,'searchType':'contain','tip':'Required. Maximum 500 characters'},
{'type':'button','name':'mapEdit','buttonLabel':'Change Location on Map','readShow':false,'clickSub':'mapEdit','newShow':false},
{'type':'hidden','name':'id'},
{'type':'hidden','name':'user_id'},
{'type':'hidden','name':'group_id'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'}
			      ],
		      'children':['reply','photo','fish'],
		  'recordList':[],
		  'recordHash':{},
		      allowEdit: true,
		      allowDelete: true,
		      allowPhotos: true,
		      allowReply: true,
		      allowFish: true,
		  ajaxUrlBB: '/spot/a/aFetchSpotsBB',
		  ajaxUrlById: '/spot/a/aFetchSpot',
		  ajaxUrlNew: '/spot/a/aSpotPost',
		  ajaxUrlEdit: '/spot/a/aSpotUpdate',
		  ajaxUrlDelete: '/spot/a/aDeleteSpot',
		  ajaxUrlEditGeo: '/spot/a/aSpotEditGeo',
		  ajaxUrlSearch: '/spot/a/aSpotSearch',
		      urlUpload:'/spot/upload',
		  iconUrlSmall: '/images/map/spotSmall.png',
		  iconUrlSmallBg: '/images/map/spotSmallShadow.png',
		  iconUrlSmallSz: [10,16,0,0,5,8],
		  iconUrlMed: '/images/map/spotMed.png',
		  iconUrlMedSz: [15,24,0,0,7,12],
		  iconUrlMedBgSz: [28,24,0,0,14,12],
		  titleField: 'date_create',
		      allowListStat: true,
		      urlAddKey: true,
		      'filterCfg':[{'id':'fish','group':'fish','type':'sub','labelMenu':'Fish Species','label':'Fish','cookieName':'fbFishId','sec':'all','sub':'fishFilterInit'},
{'id':'self','group':'sec','type':'cookie','labelMenu':'My - All','label':'My - All','cookieName':'fbSec','cookieValue':20,'sec':'login'},
{'id':'private','group':'sec','type':'cookie','labelMenu':'My - Private','label':'My - Private','cookieName':'fbSec','cookieValue':10,'sec':'login'},
{'id':'friend','group':'sec','type':'cookie','label':'Friends','labelMenu':'Friends Only','cookieName':'fbSec','cookieValue':5,'sec':'login'},
{'id':'group','group':'sec','type':'sub','label':'Group','labelMenu':'Member Groups','cookieName':'fbSec','cookieValue':15,'sec':'login','sub':'selectGroupOpen'}
			       ]
};

var jrjCfgCatch = {name:'catch','host':'catch','keyField':'id',label:'Catch',labelPlural:'Catches','displayField':'caption',
		   'fields': [ 
{'type':'hidden','name':'sec','editSub':'editSec','readSub':'secDisplay'},
{'type':'row','fields':[
{'type':'text','name':'caption','label':'Caption','required':true,'listShow':true,'tip':'Catch description','shortShow':true,'searchShow':true,'mapShow':true,'searchType':'start'},
{'type':'text','name':'loc','label':'Location','required':true,'tip':'General location','shortShow':true},
			]
},
{'disabled':true,'type':'text','name':'fish_name','label':'Fish Name','required':true,'listShow':true,'tip':'Name of the Fish','shortShow':true,'searchShow':true,'mapShow':true,'searchType':'contain','editSub':'editFishLookup'},
{'type':'row','fields':[
{'type':'text','name':'length','label':'Length','required':true,'listShow':true,'size':5},
{'type':'text','name':'weight','label':'Weight','required':true,'listShow':true,'size':5},
{'type':'text','name':'count','label':'Count','required':true,'size':5,'tip':'Count of species caught'}
			]
},
{'type':'row','fields':[
{'type':'date','name':'date_catch','label':'Date','listShow':true,'shortShow':true},
{'type':'hour','name':'hour','label':'Hour'}
			]
},
{'type':'textarea','name':'content','label':'Detail','searchShow':true,'mapShow':false,'tip':'Required. Maximum 500 characters','searchType':'contain'},
{'type':'button','name':'mapEdit','buttonLabel':'Change Location on Map','readShow':false,'clickSub':'mapEdit','newShow':false},
{'type':'hidden','name':'id'},
{'type':'hidden','name':'user_id'},
{'type':'hidden','name':'fish_id'},
{'type':'hidden','name':'group_id'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'}
],
		      'children':['reply','photo'],
		       'recordList':[],
		       'recordHash':{},
		      allowEdit: true,
		      allowDelete: true,
		      allowPhotos: true,
		      allowReply: true,
		      allowFish: false,
		       ajaxUrlBB: '/catch/a/aFetchReportsBB',
		       ajaxUrlById: '/catch/a/aGetReport',
		       ajaxUrlNew: '/catch/a/aReportPost',
		       ajaxUrlEdit: '/catch/a/aReportUpdate',
		       ajaxUrlDelete: '/catch/a/aDeleteReport',
		       ajaxUrlEditGeo: '/catch/a/aReportEditGeo',
		       ajaxUrlSearch: '/catch/a/aReportSearch',
  	          urlUpload:'/catch/upload',
		       iconUrlSmall: '/images/map/catch16.png',
		       iconUrlMed: '/images/map/catch24.png',
		       titleField: 'date_catch',
		      urlAddKey: true,
		      allowListStat: true,
		       'filterCfg':[{'id':'fish','group':'fish','type':'sub','labelMenu':'Fish Species','label':'Fish','cookieName':'fbFishId','sec':'all','sub':'fishFilterInit'},
				    {'id':'self','group':'sec','type':'cookie','labelMenu':'My - All','label':'My - All','cookieName':'fbSec','cookieValue':20,'sec':'login'},
				    {'id':'private','group':'sec','type':'cookie','labelMenu':'My - Private','label':'My - Private','cookieName':'fbSec','cookieValue':10,'sec':'login'},
				    {'id':'friend','group':'sec','type':'cookie','label':'Friends','labelMenu':'Friends Only','cookieName':'fbSec','cookieValue':5,'sec':'login'},
				    {'id':'group','group':'sec','type':'sub','label':'Group','labelMenu':'Member Groups','cookieName':'fbSec','cookieValue':15,'sec':'login','sub':'selectGroupOpen'}
				    ]
		       };

var jrjCfgReport = {name:'report','host':'report','keyField':'id',label:'Report',labelPlural:'Reports','displayField':'caption',
		    'fields': [
{'type':'hidden','name':'sec','editSub':'editSec','readSub':'secDisplay'},
{'type':'row','fields':[
{'type':'text','name':'caption','label':'Caption','required':true,'listShow':true,'shortShow':true,'tip':'Report Description','searchShow':true,'mapShow':true},
{'type':'text','name':'loc','label':'Location','required':true,'listShow':true,'tip':'General location','shortShow':true,'searchShow':true,'mapShow':true}
			]
},
{'type':'row','fields':[
{'type':'text','name':'url','label':'Website','required':false,'readShow':true,'mapShow':true,'readSub':'readUrlNode','tip':'External website'},
{'type':'text','name':'url_caption','label':'Website Description','required':false,'editShow':false,'newShow':false,'readShow':false,'readShow':false,'tip':'User Friendly name'}
			]
},
{'type':'date','name':'date_blog','label':'Date','required':false,'listShow':true,'shortShow':true},
{'type':'textarea','name':'content','label':'Detail','searchShow':true,'tip':'Required. Maximum 500 characters','searchType':'contain'},
{'type':'button','name':'mapEdit','buttonLabel':'Change Location on Map','readShow':false,'clickSub':'mapEdit','newShow':false},
{'type':'hidden','name':'id'},
{'type':'hidden','name':'user_id'},
{'type':'hidden','name':'group_id'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'}
			       ],
		    'children':['reply','photo','fish'],
		    'recordList':[],
		    'recordHash':{},
		      allowEdit: true,
		      allowDelete: true,
		      allowPhotos: true,
		      allowReply: true,
		      allowFish: true,
		    ajaxUrlBB: '/report/a/aFetchBlogsBB',
		    ajaxUrlById: '/report/a/aGetBlog',
		    ajaxUrlNew: '/report/a/aBlogPost',
		    ajaxUrlEdit: '/report/a/aBlogUpdate',
		    ajaxUrlDelete: '/report/a/aDeleteBlog',
		    ajaxUrlEditGeo: '/report/a/aBlogEditGeo',
		    ajaxUrlSearch: '/report/a/aBlogSearch',
   	            urlUpload:'/report/upload',
		    iconUrlSmall: '/images/map/reportSmall.png',
		    iconUrlMed: '/images/map/reportMed.png',
			titleField: 'date_blog',
		      urlAddKey: true,
		      allowListStat: true,
		    'filterCfg':[{'id':'fish','group':'fish','type':'sub','labelMenu':'Fish Species','label':'Fish','cookieName':'fbFishId','sec':'all','sub':'fishFilterInit'},
{'id':'self','group':'sec','type':'cookie','labelMenu':'My - All','label':'My - All','cookieName':'fbSec','cookieValue':20,'sec':'login'},
				     {'id':'private','group':'sec','type':'cookie','labelMenu':'My - Private','label':'My - Private','cookieName':'fbSec','cookieValue':10,'sec':'login'},
				     {'id':'friend','group':'sec','type':'cookie','label':'Friends','labelMenu':'Friends Only','cookieName':'fbSec','cookieValue':5,'sec':'login'},
				     {'id':'group','group':'sec','type':'sub','label':'Group','labelMenu':'Member Groups','cookieName':'fbSec','cookieValue':15,'sec':'login','sub':'selectGroupOpen'}
				     ]
};

var jrjCfgDisc = {name:'disc','host':'discuss','keyField':'id',label:'Discussion',labelPlural:'Discussion','displayField':'caption',
		  'fields': [
{'type':'hidden','name':'sec','editSub':'editSec','readSub':'secDisplay'},
{'type':'text','name':'caption','label':'Caption','required':true,'listShow':true,'tip':'Short Description','shortShow':true,'searchShow':true,'mapShow':true},
{'type':'row','fields':[
{'type':'select','name':'cat_id','label':'Category','required':true,'listShow':true,'selectLabel':'catLabel','selectValue':'catValue','readSub':'readCat','shortShow':true,'searchShow':false},
{'type':'select','name':'wtype','label':'Water Type','required':true,'selectLabel':'waterLabel','selectValue':'waterValue','readSub':'readWaterType','searchShow':false}
]
},
{'type':'textarea','name':'content','label':'Detail','required':true,'mapShow':false,'searchShow':true,'tip':'Required. Maximum 500 characters'},
{'type':'button','name':'mapEdit','buttonLabel':'Change Location on Map','readShow':false,'clickSub':'mapEdit','newShow':false},
{'type':'hidden','name':'id'},
{'type':'hidden','name':'user_id'},
{'type':'hidden','name':'group_id'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'},
			     ],
		      'children':['reply','photo','fish'],
		      'recordList':[],
		      'recordHash':{},
		      allowEdit: true,
		      allowDelete: true,
		      allowPhotos: true,
		      allowReply: true,
		      allowFish: true,
		      ajaxUrlBB: '/disc/a/aFetchDiscsBB',
		      ajaxUrlById: '/disc/a/aFetchDisc',
		      ajaxUrlNew: '/disc/a/aDiscPost',
		      ajaxUrlEdit: '/disc/a/aDiscEdit',
		      ajaxUrlDelete: '/disc/a/aDeleteDisc',
		      ajaxUrlEditGeo: '/disc/a/aEditGeo',
		      ajaxUrlSearch: '/disc/a/aDiscSearch',
   	            urlUpload:'/disc/upload',
		      iconUrlSmall: '/images/map/discSmall.png',
		      iconUrlMed: '/images/map/blab24.png',
		      iconUrlMedSz: [24,23,0,0,12,11],
		      titleField: 'date_create',
		      catLabel:['Fishing General','Fishing Question','Fishing Advice','Fish','Trip','Tackle','Spot','Boats','New Category'],
		      catValue:[1,2,3,5,6,7,8,9,30],
		      waterLabel:['Saltwater','Freshwater'],
		      waterValue:[1,2],
		      urlAddKey: true,
		      allowListStat: true,
		      'filterCfg':[{'id':'fish','group':'fish','type':'sub','labelMenu':'Fish Species','label':'Fish','cookieName':'fbFishId','sec':'all','sub':'fishFilterInit'},
{'id':'self','group':'sec','type':'cookie','labelMenu':'My - All','label':'My - All','cookieName':'fbSec','cookieValue':20,'sec':'login'},
				   {'id':'private','group':'sec','type':'cookie','labelMenu':'My - Private','label':'My - Private','cookieName':'fbSec','cookieValue':10,'sec':'login'},
				   {'id':'friend','group':'sec','type':'cookie','label':'Friends','labelMenu':'Friends Only','cookieName':'fbSec','cookieValue':5,'sec':'login'},
				   {'id':'group','group':'sec','type':'sub','label':'Group','labelMenu':'Member Groups','cookieName':'fbSec','cookieValue':15,'sec':'login','sub':'selectGroupOpen'}
				   ]
		      };

var jrjCfgPhoto = {name:'photo','host':'photo','keyField':'id',label:'Photo',labelPlural:'Photos',
		'fields': [
{'type':'hidden','name':'sec','editSub':'editSec','readSub':'secDisplay'},
{'type':'image','name':'id','mapShow':true,'readShow':true,'editShow':true},
{'type':'text','name':'caption','label':'Caption','required':false,'tip':'Brief description of this Photo','searchShow':true,'mapShow':false,'listShow':true},
{'type':'textarea','name':'detail','label':'Detail','mapShow':false,'searchShow':true},
{'type':'date','name':'date_create','label':'Date','listShow':true},
{'type':'button','name':'mapEdit','buttonLabel':'Change Location on Map','readShow':false,'clickSub':'mapEdit','newShow':false,'newShow':false},
{'type':'hidden','name':'id','mapShow':false,'readShow':false},
{'type':'hidden','name':'pid','mapShow':false,'readShow':false},
{'type':'hidden','name':'group_id'},
{'type':'hidden','name':'user_id'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'}
			   ],
		   'children':['reply','fish'],
		'recordList':[],
		'recordHash':{},
		       allowEdit: true,
		      allowDelete: true,
		      allowPhotos: false,
		      allowReply: true,
		      allowFish: true,
		ajaxUrlBB: '/photo/a/aFetchPhotosBB',
		ajaxUrlById: '/photo/a/aGetPhoto',
		ajaxUrlNew: null,
		ajaxUrlEdit: '/file/a/aPhotoEdit',
		ajaxUrlDelete: '/file/a/aPhotoDelete',
		ajaxUrlEditGeo: '/file/a/aPhotoEditGeo',
		ajaxUrlSearch: '/photo/a/aPhotoSearch',
		       urlUpload:'/file/a/upload',
		iconUrlSmall: null,
		iconUrlMed: null,
		       titleField: 'date',
		      urlAddKey: true,
		      allowListStat: true,
		       'filterCfg':[{'id':'fish','group':'fish','type':'sub','labelMenu':'Fish Species','label':'Fish','cookieName':'fbFishId','sec':'all','sub':'fishFilterInit'},
{'id':'self','group':'sec','type':'cookie','labelMenu':'My - All','label':'My - All','cookieName':'fbSec','cookieValue':20,'sec':'login'},
				    {'id':'private','group':'sec','type':'cookie','labelMenu':'My - Private','label':'My - Private','cookieName':'fbSec','cookieValue':10,'sec':'login'},
				    {'id':'friend','group':'sec','type':'cookie','label':'Friends','labelMenu':'Friends Only','cookieName':'fbSec','cookieValue':5,'sec':'login'},
				    {'id':'group','group':'sec','type':'sub','label':'Group','labelMenu':'Member Groups','cookieName':'fbSec','cookieValue':15,'sec':'login','sub':'selectGroupOpen'}
				    ]
		       };

var jrjCfgUpload = {name:'upload','keyField':'id',label:'Photo',labelPlural:'Photos',
		    'fields': [
{'type':'hidden','name':'sec','editSub':'editSec','readSub':'secDisplay'},
{'type':'image','name':'file','mapShow':true,'readShow':true,'editShow':false},
{'type':'text','name':'caption','label':'Caption','required':false,'tip':'Brief description of this Photo','searchShow':true,'mapShow':false,'listShow':true},
{'type':'textarea','name':'detail','label':'Detail','mapShow':false,'searchShow':true},
{'type':'date','name':'date_create','label':'Date','listShow':true},
{'type':'image','name':'file','readShow':false,'newShow':true},
{'type':'hidden','name':'id'},
{'type':'hidden','name':'pid'},
{'type':'hidden','name':'group_id'},
{'type':'hidden','name':'user_id'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'}
			   ],
		'recordList':[],
		'recordHash':{},
		ajaxUrlBB: '/photo/a/aFetchPhotosBB',
		ajaxUrlById: '/photo/a/aGetPhoto',
		ajaxUrlNew: null,
		ajaxUrlEdit: '/file/a/aEditPhoto',
		ajaxUrlDelete: '/file/a/aDeletePhoto',
		ajaxUrlEditGeo: '/file/a/aPhotoEditGeo',
		ajaxUrlSearch: '/photo/a/aPhotoSearch',
		iconUrlSmall: null,
			iconUrlMed: null,
		    titleField: 'date_create',
		      urlAddKey: true,
		       allowActionBar:false
		       };

var jrjCfgUser = {name:'user','host':'user','keyField':'id',label:'User',labelPlural:'Users','key':'id','displayField':'username',
		  'fields': [ 
{'type':'image','name':'photo_id','mapShow':true,'readShow':true,'editShow':false,'width':200,'height':200,'className':'','newShow':false},
{'type':'text','name':'username','label':'Username','listShow':true,'shortShow':true,'searchShow':true,'required':true},
{'type':'text','name':'firstname','label':'First','listShow':true,'shortShow':true,'searchShow':true},
{'type':'text','name':'lastname','label':'Last','listShow':true,'shortShow':true,'searchShow':true},
{'type':'text','name':'title','label':'title'},
{'type':'text','name':'location','label':'Location','listShow':true,'shortShow':true,'searchShow':false,'searchType':'contain'},
{'type':'text','name':'website','label':'Website','mapShow':true,'readSub':'readUrlNode'},
{'type':'text','name':'utype_text','label':'User Type','searchShow':false},
{'type':'text','name':'date_create','label':'Join Date','listShow':true},
{'type':'textarea','name':'about','mapShow':false,'label':'About'},
{'type':'text','name':'friend_status','mapShow':false,'editShow':false,'readShow':true,'newShow':false,'readSub':'friendReadStatusRow','label':'FriendStatus'},
{'type':'button','name':'friendStatus','buttonLabel':'Edit Friend Status','newShow':false,'readShow':true,'editShow':false,'clickSub':'friendStatOpen'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'},
{'type':'hidden','name':'id'},
{'type':'textarea','name':'friend_note','readShow':false,'editShow':false,'newShow':false,'mapShow':false}
],
		      'children':['fish'],
		      'recordList':[],
		      'recordHash':{},
		      ajaxUrlBB: '/user/a/aFetchUsersBB',
		      ajaxUrlById: '/user/a/aGetUserPub',
		      ajaxUrlEditGeo: '/user/a/aEditUserGeo',
		      ajaxUrlSearch: '/user/a/aUserSearch',
		      ajaxUrlNew: '/user/a/aCreateUser',
		       urlUpload:'/user/a/upload',
		      iconUrlSmall: '/images/map/user16.png',
		      iconUrlMed: '/images/map/user16.png',
		      iconUrlMedSz: [16,24,0,0,8,12],
		      titleField: 'date_create',
		      allowEdit: false,
		      allowNew:false,
		      allowFish: true,
		      urlAddKey: true,
		      allowListStat: true,
		      'filterCfg':[{'id':'fish','group':'fish','type':'sub','labelMenu':'Fish Species','label':'Fish','cookieName':'fbFishId','sec':'all','sub':'fishFilterInit'},
				   {'id':'friend','group':'type','type':'url','label':'Friends','url':'/user/a/aGetFriends','sec':'login'},
				   {'id':'request','group':'type','type':'url','label':'Requests','url':'/user/a/aGetRequests','sec':'login'},
				   {'id':'block','group':'type','type':'url','label':'Blocked','url':'/user/a/aGetBlocked','sec':'login'}
				   ]
		      };

var jrjCfgGroup = {name:'group','host':'group','keyField':'id',label:'Group',labelPlural:'Groups','displayField':'caption',
		   'fields': [
{'type':'text','name':'sec','editSub':'groupSecOptions','readSub':'groupSecRead','shortShow':true,'mapShow':true},
{'type':'row','fields':[
{'type':'text','name':'name','label':'Name','required':true,'tip':'No Change later','regExp':/^[\w-\s]+$/,'listShow':true,'shortShow':true,'searchShow':true,'mapShow':true,'readOnEdit':true},
{'type':'text','name':'caption','label':'Caption','listShow':true,'required':true,'shortShow':true,'mapShow':true,'searchShow':true}
			]
},
{'type':'row','fields':[
{'type':'text','name':'website','label':'Website','readShow':false},
{'type':'text','name':'websiteReadOnly','label':'Website Description','editShow':false,'newShow':false,'readShow':false,'readSub':'readUrlNode'}
			]
},
{'type':'row','fields':[
{'type':'text','name':'location','label':'Location'},
{'type':'select','name':'gtype','label':'Group Type','selectLabel':'gTypeLabel','selectValue':'gTypeValue','readShow':false,'mapShow':false,'searchShow':false},
{'type':'text','name':'gtype_text','label':'Group Type','editShow':false,'newShow':false}
			]
},
{'type':'text','name':'fish','label':'Fish Species','listShow':true,'searchShow':true,'searchType':'contain'},
{'type':'text','name':'date_create','label':'Created','editShow':false,'newShow':false},
{'type':'textarea','name':'about','mapShow':false,'label':'About','searchShow':true,'searchType':'contain'},
{'type':'button','name':'mapEdit','buttonLabel':'Change Location on Map','readShow':false,'clickSub':'mapEdit','newShow':false},
{'type':'hidden','name':'id'},
{'type':'hidden','name':'user_id'},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'}
			      ],
		      'children':['fish'],
		   'recordList':[],
		   'recordHash':{},
		      allowEdit: true,
		      allowDelete: true,
		      allowPhotos: false,
		      allowReply: false,
		      allowFish: true,
		   ajaxUrlBB: '/group/a/aFetchGroupsBB',
		   ajaxUrlById: '/group/a/aGetGroup',
		   ajaxUrlNew: '/group/a/aNewGroup',
		   ajaxUrlEdit: '/group/a/aEdit',
		   ajaxUrlDelete: '/group/a/aDelete',
		   ajaxUrlEditGeo: '/group/a/aGroupEditGeo',
		   ajaxUrlSearch: '/group/a/aGroupSearch',
		   iconUrlSmall: '/images/map/groupSmall.png',
		   iconUrlMed: '/images/map/group24.png',
		   iconUrlMedSz: [24,21,0,0,12,10],
		   titleField: 'date_create',
		   disableSec:true,
		      urlAddKey: true,
		   gTypeLabel:['Recreational','Pro','Commercial','Private'],
		       gTypeValue:[1,5,15,20],
		      allowListStat: true,
		       'filterCfg':[{'id':'fish','group':'fish','type':'sub','labelMenu':'Fish Species','label':'Fish','cookieName':'fbFishId','sec':'all','sub':'fishFilterInit'},
{'id':'member','group':'type','type':'url','label':'My Groups','url':'/group/a/aGetGroups','sec':'login'},
				    {'id':'request','group':'type','type':'url','label':'Group Requests','url':'/group/a/aGetRequests','sec':'login'}
				    ]
		       };

var jrjCfgOwner = {name:'owner','host':'user','keyField':'username',label:'User',labelPlural:'Users','key':'username','displayField':'username',
		   'fields': [
{'type':'image','name':'photo_id','mapShow':true,'readShow':true,'editShow':false,'width':200,'height':200,'className':'','newShow':false},
{'type':'text','name':'username','label':'Username','listShow':true,'shortShow':true,'mapShow':true,'readOnEdit':false,'tipNew':'Length > 2. Alphanumeric or (- . _)','required':true,'tipEdit':'Changing your Username will break external links to your old Username'},
{'type':'row','fields':[
{'type':'password','label':'Password','name':'password','editShow':false,'newShow':true,'readShow':false,'required':true},
{'type':'password','label':'Password Verify','name':'password_verify','editShow':false,'newShow':true,'readShow':false,'required':true}
			]},
{'type':'row','fields':[
{'type':'text','name':'email','label':'Email','listShow':false,'shortShow':false,'required':true},
{'type':'text','name':'title','label':'title'}
			]},
{'type':'row','fields':[
{'type':'text','name':'firstname','label':'First','listShow':true,'shortShow':true,'mapShow':true},
{'type':'text','name':'lastname','label':'Last','listShow':true,'shortShow':true,'mapShow':true}
			]},
{'type':'row','fields':[
{'type':'text','name':'location','label':'Location','listShow':true,'shortShow':true,'searchShow':false,'searchType':'contain'},
{'type':'text','name':'website','label':'Website'}
			]},
{'type':'row','fields':[
			{'type':'select','name':'utype','label':'User Type','newShow':true,'editShow':true,'selectLabel':'utypeLabel','selectValue':'utypeValue'},
{'type':'text','name':'utype_text','label':'User Type','searchShow':false,'editShow':false,'newShow':false},
			{'type':'text','name':'date_create','label':'Join Date','newShow':false,'readOnEdit':true}
			]},
{'type':'textarea','name':'about','mapShow':false,'label':'About'},
{'type':'textarea','name':'feed','mapShow':false,'editShow':false,'newShow':false,'readShow':false},
{'type':'hidden','name':'lat'},
{'type':'hidden','name':'lon'}
],
		       'recordList':[],
		       'recordHash':{},
		       ajaxUrlBB: '/user/a/aFetchUsersBB',
		       ajaxUrlById: '/user/a/aGetUserPub',
		       ajaxUrlEdit: '/user/a/aSaveUser',
		   ajaxUrlEditGeo: '/user/a/aEditUserGeo',
		   ajaxUrlSearch: '/user/a/aUserSearch',
   	           ajaxUrlNew: '/user/a/aCreateUser',
		       urlUpload:'/user/a/upload',
		   iconUrlSmall: '/images/map/user16.png',
		   iconUrlMed: '/images/map/user16.png',
		   iconUrlMedSz: [16,24,0,0,8,12],
		   utypeLabel:['Recreational Fishing','Pro Fishing','Fishing Guide','Charter Fishing'],
		   utypeValue:[1,5,15,20],
		   titleField: 'date_create',
			  allowHead:false,
		   allowMapButtons:false,
		   allowEdit: true,
		   allowNew:true,
		       allowList:false,
		       allowActionBar:false
		       };

var jrjCfgLogin = {name:'login','host':'user','keyField':'username',label:'Login',labelPlural:'Login','key':'username','displayField':'username',
		   'fields': [
{'type':'text','name':'username','label':'Username','listShow':true,'shortShow':true,'mapShow':true,'readOnEdit':false,'tipNew':'Length > 2. Alphanumeric or (- . _)','required':true,'tipEdit':'Changing your Username will break external links to your old Username'},
{'type':'password','label':'Password','name':'password','editShow':false,'newShow':true,'required':true}
			      ],
		   'recordList':[],
		   'recordHash':{},
		   allowMapButtons:false,
		   allowEdit: true,
		   allowNew:false,
		   allowList:false,
		   allowActionBar:false
};

var jrjCfgLoginReset = {name:'loginReset','host':'user','keyField':'email',label:'Reset Account',labelPlural:'Reset Account','key':'email','displayField':'email',
			'fields': [
{'type':'text','label':'Email','name':'email','editShow':true,'newShow':true,'required':true}
				   ],
			'recordList':[],
			'recordHash':{},
			allowMapButtons:false,
			allowEdit: true,
			allowNew:false,
			allowList:false,
			allowActionBar:false
};

var jrjCfgEditPass = {name:'editPass','host':'user','keyField':'password',label:'Change Password',labelPlural:'Change Password','key':'id','displayField':'password',
		      'fields': [
{'type':'password','label':'Password','name':'password','editShow':true,'newShow':false,'required':true},
{'type':'password','label':'Password Verify','name':'password_verify','editShow':true,'newShow':false,'required':true }
],
			  'recordList':[],
			  'recordHash':{},
			  allowHead:false,
			  allowMapButtons:false,
			  allowEdit: true,
			  allowNew:false,
			  allowList:false,
			  allowActionBar:false
			  };

var jrjCfgFeed = {name:'feed','host':'www','keyField':'feed',label:'Feedback',labelPlural:'Feedback','key':'id','displayField':'feed',
		  'fields': [
{'type':'textarea','name':'feed','label':'Message','required':true},
			     ],
		  'recordList':[],
		  'recordHash':{},
		  ajaxUrlNew: '/user/a/aFeedSubmit',
		  allowMapButtons:false,
		  allowEdit:false,
		  allowNew:true,
		  allowList:false,
		  allowActionBar:false
};

var jrjCfgOwnerEmail = {name:'ownerEmail','keyField':'username',label:'My Email',labelPlural:'My Email','key':'username','displayField':'username',
			'fields': [
{'type':'checkbox','label':'Replies to my posts','name':'msg_disc','value':1,'editShow':true,'newShow':true},
{'type':'checkbox','label':'Replies after I reply','name':'msg_reply','value':1,'editShow':true,'newShow':true},
{'type':'checkbox','label':'Weekly Updates','name':'msg_update','value':1,'editShow':true,'newShow':true},
{'type':'checkbox','label':'Stop All Emails','name':'msg_stop','value':1,'editShow':true,'newShow':true}
				   ],
			'recordList':[],
			'recordHash':{},
			ajaxUrlEdit: '/user/a/aMsgUpdate',
			titleField:false,
			allowMapButtons:false,
			allowEdit:true,
			allowNew:false,
			    allowList:false,
			  allowHead:false,
		       allowActionBar:false
};


var jrjCfgOwnerReq = {name:'ownerReq','keyField':'id',label:'Friend Request',labelPlural:'Friend Request','key':'id','displayField':'username',
		      'fields': [],
			'recordList':[],
			'recordHash':{},
			ajaxUrlEdit: '/user/a/aMsgUpdate',
			titleField:false,
			allowMapButtons:false,
			allowEdit:true,
			allowNew:false,
			    allowList:false,
			  allowHead:false,
		      urlAddKey: true,
		       allowActionBar:false
};

var jrjCfgOwnerEmailStop = {name:'ownerEmailStop','keyField':'id',label:'Stop Email',labelPlural:'Stop FishBlab Emails','key':'id','displayField':'username',
		      'fields': [],
			'recordList':[],
			'recordHash':{},
			ajaxUrlEdit: '/user/a/aEmailStop',
			titleField:false,
			allowMapButtons:false,
			allowEdit:true,
			allowNew:false,
			    allowList:false,
			  allowHead:false,
		      urlAddKey: true,
		       allowActionBar:false
};

var jrjCfgOwnerPhoto = {name:'ownerPhoto','keyField':'date',label:'My Profile Photo',labelPlural:'My Profile Photo','key':'id','displayField':'date',
			'fields': [
{'type':'image','name':'file','mapShow':true,'readShow':true,'editShow':false}
				   ],
			'recordList':[],
			'recordHash':{},
			ajaxUrlEdit: '/user/a/aMsgUpdate',
			titleField:false,
			allowMapButtons:false,
			allowEdit:true,
			allowNew:false,
			    allowList:false,
			  allowHead:false,
		       allowActionBar:false
};


var jrjCfgReply = {name:'reply','keyField':'id',label:'Comment',labelPlural:'Comments','key':'id','displayField':'date_create',
		    'fields': [
{'type':'textarea','name':'content','mapShow':true,'label':'Comment','required':true},
{'type':'hidden','name':'id'},
{'type':'hidden','name':'pid'}
			       ],
			'recordList':[],
			'recordHash':{},
			'allowEdit': true,
			allowDelete: true,
			allowPhotos: false,
			allowReply: false,
			titleField: 'date_create',
			allowMapButtons:false,
			allowEdit:true,
			allowNew:true,
		   allowList:false,
		       allowGeo:false,
		       allowGWLink:false,
		       allowActionBar:false
			};

var jrjCfgFish = {'name':'fish','keyField':'id','label':'Fish','labelPlural':'Fish','displayField':'name_common',
		  'fields': [ 
{'type':'text','name':'name','label':'Name','required':true,'listShow':true,'tip':'Name of Fish','shortShow':true,'searchShow':true,'searchType':'contain','mapShow':true},
{'type':'text','name':'name_sci','label':'Scientific','required':false,'tip':'Scientific name if you know it','shortShow':true,'mapShow':true,'searchShow':false,'searchType':'contain'},
{'type':'textarea','name':'alias','label':'Aliases','searchShow':true,'searchType':'contain','tip':'Other names for this Fish'},
{'type':'textarea','name':'detail','label':'Detail','searchShow':false,'searchType':'contain','tip':'Required. Maximum 500 characters'},
{'type':'hidden','name':'id'}
			      ],
		  'recordList':[],
		  'recordHash':{},
		  allowEdit: false,
		  allowDelete: false,
		  allowPhotos: false,
		  allowReply: false,
	          allowGeo:false,
		      allowFish: false,
		      allowSearchBounds:false,
		  allowActionBar:false,
		  allowHead:false,
		  ajaxUrlBB: '/fish/a/aGetBB',
		  ajaxUrlById: '/fish/a/aGet',
		  ajaxUrlNew: '/fish/a/aNew',
		  ajaxUrlEdit: '/fish/a/aEdit',
		  ajaxUrlDelete: '/fish/a/aDelete',
		  ajaxUrlEditGeo: '/fish/a/aEditGeo',
		  ajaxUrlSearch: '/fish/a/aSearch',
		  urlUpload:'/fish/upload',
		  iconUrlSmall: '/images/map/fish16.png',
		  iconUrlSmallSz: [16,16,0,0,5,8],
		  iconUrlMed: '/images/map/fish24.png',
		  iconUrlMedSz: [24,24,0,0,7,12],
		  titleField: 'name'
};

var jrjCfgDialog = {name:'dialog','host':'m','keyField':'caption',label:'FishBlab',labelPlural:'FishBlab','key':'id','displayField':'caption',
		  'fields': [
{'type':'text','name':'caption','label':'Title','required':false},
			     ],
		  'recordList':[],
		  'recordHash':{},
		  ajaxUrlNew: '/user/a/aFeedSubmit',
		  allowMapButtons:false,
		  allowEdit:false,
		  allowNew:true,
		  allowList:false,
		  allowActionBar:false
};

