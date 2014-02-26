/**
 * Created by solomon on 14-2-25.
 */
//var mixpanelToken = "";
var mixpanelToken = "30c340455d48ef0a86f0de60dd01a4bb";
var userId;

function generateMixpanelString(eventName, properties){
	var map_header = {
		"distinct_id": userId,
		"ip":"192.168.3.100",
		"token": mixpanelToken,
		"time": new Date().getTime()
	};

	var map_data = {
		"event":eventName,
		"properties":properties
	};

	var mixpanelString = {"header": map_header, "data": map_data};

	console.log(mixpanelString);

	return JSON.stringify(mixpanelString);
}

var offline_mixpanel = {
    
    setUserId: function(id){
    	userId = id;
    },

    track: function(eventName, properties){
    	$.post( "/tracks", generateMixpanelString(eventName,properties), function(data) {
    		console.log("Post result==>" + data);
		}, "json");
	},

	register: function(properties){

	},

	unregister: function(property){

	}
} 
