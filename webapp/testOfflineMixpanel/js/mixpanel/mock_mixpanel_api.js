/**
 * Created by solomon on 14-2-25.
 */

var token;
var userId;
var superProperties = {};
var cookieSchema = "OfflineSP=";

/**
* Cookie严格按照 OfflineSP=key1:value1|key2:value2|key3:value3| 的格式来存储
*/
function getSP(){
	var sp = {};
	var cookie  = document.cookie;
	var mixpanelIndex = cookie.indexOf(cookieSchema);

    if (cookie.length>0 && mixpanelIndex > -1){
    	var previousIndex = cookie.indexOf(cookieSchema)+cookieSchema.length;
    	do{
    		var cusorIndex = cookie.indexOf("|",previousIndex);
    		var property = cookie.substring(previousIndex,cusorIndex);
    		var propertyName = property.substring(0,property.indexOf(":"));
            var propertyValue = property.substring(property.indexOf(":")+1,property.lastIndex);
            sp[propertyName] = propertyValue;
    		previousIndex = cusorIndex+1; 
    	}while(cookie.indexOf("|",previousIndex)>-1)
    	console.log("currentSP ==> " + JSON.stringify(sp))
    }else{
    	console.log("there's no sp");
    }
    return sp;
}

function saveCookie(){
	var spStrings = "";
	if(JSON.stringify(superProperties)!='{}'){
		for (var key in superProperties){
			spStrings += key + ":" + superProperties[key] + "|"; 
		}
		document.cookie = cookieSchema + spStrings;
	}else{
		console.log("sp is empty");
		document.cookie = cookieSchema + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // clear sp immediately
	}
}

function generateMixpanelJson(eventName, properties){
	var map_header = {
		"distinct_id": userId,
		"ip":"",
		"token": token,
		"time": new Date().getTime()
	};

    // add super properties to properties to be tracked.
    var map_all_properties = {};
    if(properties!=undefined){
    	for(var key in properties){
    		map_all_properties[key] = properties[key];
    	}
    }

	var sp = getSP();
	if(JSON.stringify(sp)!='{}'){
		for (var key in sp){
			map_all_properties[key] = sp[key];
		}	
	}

	var map_data = {
		"event": eventName,
		"properties": map_all_properties 
	};

	var mixpanelJson = {"headers": map_header, "data": map_data};

	console.log(eventName+"-=-=-=-=-=-=> "+JSON.stringify(mixpanelJson));

	return mixpanelJson;
}

var offline_mixpanel = {
    
    setMixpanelTokenAndUserId: function(mixpanelToken,id){
    	token = mixpanelToken; 
    	userId = id;
    },

    track: function(eventName, properties){
		$.ajax({
		  type: "POST",
		  contentType: "application/json; charset=UTF-8",
		  url: "/tracks",
		  data: JSON.stringify(generateMixpanelJson(eventName,properties)),
		  success: function(data, textStatus, jqXHR) {console.log("Post "+'\"'+eventName+'\"'+"==>" + JSON.stringify(data));},
		  dataType: "json",
		  complete: function(jqXHR,textStatus){console.log("post result ==> " + textStatus);}
		}); 
	},

	register: function(properties){
		superProperties = getSP();
		for (var key in properties){
            superProperties[key] = properties[key];
		}
		console.log("after registerSP ==>" + JSON.stringify(superProperties));
        saveCookie();
	},

	unregister: function(property){
        superProperties = getSP();
        if(JSON.stringify(superProperties)!='{}'){
        	for(var key in superProperties){
	        	if(property == key){
	                delete superProperties[key];
	        	}
        	}
        }
        saveCookie();
	}
} 