define(function(require, exports, module) {
    var $ = require("jquery");
    var Event = require("event");
    require("echarts");
    var model = require("../mods/model");
    var GroupChatMessage = require('../mods/groupchatmessage');

    var $el = $("#J_report");
    var $data = $el.find('textarea');

    require("./report.css");

    $el.dialog({
        autoOpen: false,
        closeOnEscape: true,
        closeText: "关闭",
        draggable: true,
        resizable: false,
        width: 960,
        height: 600,
        modal: false,
        title: "配置报表"
    });

    $el.find('.send').click(function() {
        var roomUser = $el.data('self');
        Event.trigger("connect/groupchat/message/send", [new GroupChatMessage(roomUser, {
            type: 'report',
            content: JSON.parse($data.val())
        }, new Date())]);
    });
    $el.find('.show').click(function() {
        var option;
        try {
            option = JSON.parse($data.val());
            chart.setOption(option);
        } catch (e) {
            alert("数据格式不正确");
        }
    });

    var chart = echarts.init($el.find('.report').get()[0]);

    var option = {
        tooltip: {
            show: true
        },
        legend: {
            data: ['销量']
        },
        xAxis: [{
            type: 'category',
            data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            "name": "销量",
            "type": "bar",
            "data": [5, 20, 40, 10, 10, 20]
        }]
    };
    $data.val(JSON.stringify(option));
    chart.setOption(option);

    Event.on({
        "report/show": function(event, self) {
            $el.data('self', self);
            $el.dialog('open');
        },
        "report/draw": function(event, dom, option) {
            var chart = echarts.init(dom);
            chart.setOption(option);
        }
    });
});