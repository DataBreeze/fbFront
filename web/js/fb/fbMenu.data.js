var jrjActOpt = {'admin':false};
var jrjMenuGuest = {'appMode':'u','name':'guest','host':'m','keyField':'id','label':'Sign In','header':'Sign In to FishBlab',
		    'pageId':'mobMenu',
		     'type':'ul','data-role':'listview','data-inset':'true',
		     'menus': [
{'type':'li','data-role':'list-divider','label':'Sign In'},
{'type':'li','label':'Login','href':'#mobForm?s=login'},
{'type':'li','label':'Create Account','href':'#mobForm?s=loginNew'},
{'type':'li','label':'Reset Account','href':'#mobForm?s=loginReset'},
			       ]
};

var jrjMenuUser = {'appMode':'u','id':'user','name':'user','host':'m','keyField':'id','label':'Account','header':'FishBlab Account Settings',
		      'pageId':'mobMenu',
		      'type':'ul','data-role':'listview','data-inset':'true',
		      'menus': [
{'type':'li','data-role':'list-divider','label':'Account'},
{'type':'li','label':'My Profile','href':'#mobDetail?s=userDetail'},
{'type':'li','label':'Settings','href':'#mobMenu?s=account'},
{'type':'li','label':'Logout','sub':function(){mobLogout();return false;} }
				]
			  };

var jrjMenuAccount = {'appMode':'u','id':'mobMenu','name':'account','host':'m','keyField':'id','label':'Options','header':'FishBlab Account Options',
		      'pageId':'mobMenu',
		      'type':'ul','data-role':'listview','data-inset':'true',
		      'menus': [
{'type':'li','data-role':'list-divider','label':'Account Options'},
{'type':'li','label':'Edit Account','href':'#mobForm?s=userEdit'},
{'type':'li','label':'Change Password','href':'#mobForm?s=userEditPassword' },
{'type':'li','label':'Email Options','href':'#mobForm?s=userEditEmail' },
{'type':'li','label':'Profile Photo','href':'#mobDetail?s=userPhoto' },
{'type':'li','label':'Logout','sub':function(){mobLogout();return false;} }
				]
			  };

var jrjMenuActNew = {'appMode':'act','action':'new','name':'actNew','host':'m','keyField':'id','label':'Share','header':'Share New Activity',
		     'pageId':'mobMenu',
		     'type':'ul','data-role':'listview','data-inset':'true',
		     'menus': [
{'type':'li','data-role':'list-divider','label':'Select Activity'},
{'type':'li','label':'Fishing Photo','href':'#mobForm?s=photo'},
{'type':'li','label':'Fish Catch','href':'#mobForm?s=catch'},
{'type':'li','label':'Fishing Report','href':'#mobForm?s=report'},
{'type':'li','label':'Fishing Spot','href':'#mobForm?s=spot'},
{'type':'li','label':'Fishing Discussion','href':'#mobForm?s=disc'}
			       ]
};

var jrjMenuAct = {'appMode':'act','name':'actMenu','host':'m','keyField':'id','label':'Activity','header':'Activity Menu',
		  'id':'actMenu','pageId':'mobPopup',
		  'type':'ul','data-role':'listview','data-inset':'true',
		  'menus': [
{'type':'li','data-role':'list-divider','label':'Activity Menu'},
{'type':'li','label':'List','href':'#mobList'},
{'type':'li','label':'Search','href':'#mobSearch'},
{'type':'li','label':'Detail','href':'#mobDetail'},
{'type':'li','label':'Map','href':'#mobMap'},
{'type':'li','label':'New','href':'#mobForm'},
{'type':'li','label':'Filter','href':'#mobFilter'}
			    ]
};

var jrjMenuActSelect = {'appMode':'act','name':'actSelect','host':'m','keyField':'id','label':'Select Activity','header':'Activity Menu',
			'id':'actMenuSelect','pageId':'mobPopup',
			'type':'ul','data-role':'listview','data-inset':'true',
			'menus': [
{'type':'li','data-role':'list-divider','label':'Activity Select'},
{'type':'li','label':'All','href':'#mobMap?s=all'},
{'type':'li','label':'Photos','href':'#mobMap?s=photo'},
{'type':'li','label':'Spots','href':'#mobMap?s=spot','sub':function(){ actListOrMapInit('spot'); return false;} },
{'type':'li','label':'Reports','href':'#mobMap?s=report'},
{'type':'li','label':'Catch','href':'#mobMap?s=catch'},
{'type':'li','label':'Discussion','href':'#mobMap?s=disc'}
				  ]
};
