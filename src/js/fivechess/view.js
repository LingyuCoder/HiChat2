define(function(require, exports, module) {
    var $ = require("jquery");
    var Event = require("event");
    var model = require("../mods/model");
    
    var $el = $("#J_fivechess");

    require("./fivechess.css");

    $el.dialog({
        autoOpen: false,
        closeOnEscape: true,
        closeText: "关闭",
        draggable: true,
        resizable: false,
        width: 920,
        height: 800,
        modal: false,
        title: "五子棋游戏"
    });


    Event.on({
        "chess/show": function() {
            $el.find('iframe').attr('src', 'http://localhost:3000/app/chess.html#' + model.get('self').toString());
            $el.dialog('open');
        }
    });
});