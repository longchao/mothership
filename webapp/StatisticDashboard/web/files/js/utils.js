/**
 * Created by solomon on 14-2-8.
 */

var roomIndex = 0;
var chapterIndex = 0;
var giveParams = function(_roomIndex,_chapterIndex){
    roomIndex = _roomIndex;
    chapterIndex = _chapterIndex;
}

$(document).ready(function(){
    $('.close').click(function() {
        $("#right-panel").fadeOut("slow")
    });
});
