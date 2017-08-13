/*
* api v1.0
* rely on jQuery
* created by HuangZhao at 2017/07/21
*
* */

;(function($,window,document,undefiend){
    'use strict';
    /*
    * @api 封装常用方法
    * */
    /*********api 开始*********/
    var api = (function(){
        var version = 'v1.0';

        var apply = {// 运用公用库方法去进行相关操作
            createBg:function(){// 创建透明背景
                var _body = $('body'),
                    _div = $('<div></div>',{'class':'uzai-trabg'});
                if(!_body.data('isTrabg')){
                    _body.append(_div).data('isTrabg',true);
                    _div.fadeIn(200);
                    return;
                }
                _div.fadeIn(200);
            },
            closeBg:function(){// 关闭透明背景
                var _uzaiTrabg = $('.uzai-trabg');
                _uzaiTrabg.fadeOut(200);
            }
        };
        var pub =  {// 一些公用的库方法
            getSingle:function(fn){// 通用单例
                var _result;
                return function (){
                    return _result || (fn.apply(this,arguments));
                }
            },
            getQueryStr:function(name){// 获取url参数值
                var _reg =  new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
                    _r = window.location.search.substr(1).match(_reg);
                if(_r !== null){
                    return decodeURI(_r[2]);
                }
                return null;
            },
            errorImg:function(ele,imgsrc){// 自动修改破损图像
                $(ele).on('error',function(){
                    $(this).prop('src',imgsrc);
                });
            },
            // 设置cookie
            setCookie: function(name, value, expires, domain, path, secure) {
                var cookieText = "";
                cookieText += encodeURIComponent(name) + "=" + encodeURIComponent(value);
                if (expires instanceof Date) {
                    cookieText += "; expires=" + expires.toGMTString();
                }
                if (path) {
                    cookieText += "; path=" + path;
                }
                if (domain) {
                    cookieText += "; domain=" + domain;
                }
                if (secure) {
                    cookieText += "; secure";
                }
                document.cookie = cookieText;
            },
            // name=value; expires=expiration_time; path=domain_path; domain=domain_name; secure
            // 获取cookie
            getCookie: function(name) {
                var cookieName = encodeURIComponent(name) + "=",
                    cookieStart = document.cookie.indexOf(cookieName),
                    cookieValue = "";
                if (cookieStart > -1) {
                    var cookieEnd = document.cookie.indexOf(";", cookieStart);
                    if (cookieEnd == -1) {
                        cookieEnd = document.cookie.length;
                    }
                    cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
                }
                return cookieValue;
            },
            // 删除cookie
            unsetCookie: function(name, domain, path, secure) {
                this.setCookie(name, "", new Date(0), domain, path, secure);
            }
        };
        return {
            apply:apply,
            pub:pub
        }
    })();
    window.api = window.api || api ;
    /*******api 结束********/

    /**
     * @1900-2100区间内的公历、农历互转
     * @charset UTF-8
     * @Author  andyHuang
     * @Time    2014-7-21
     * @Time    2016-8-13 Fixed 2033hex、Attribution Annals
     * @Time    2016-9-25 Fixed lunar LeapMonth Param Bug
     * @Time    2017-7-24 Fixed use getTerm Func Param Error.use solar year,NOT lunar year
     * @Version 1.0.3
     * @公历转农历：calendar.solar2lunar(1987,11,01); //[you can ignore params of prefix 0]
     * @农历转公历：calendar.lunar2solar(1987,09,10); //[you can ignore params of prefix 0]
     */
    var calendar = {

        /**
         * 农历1900-2100的润大小信息表
         * @Array Of Property
         * @return Hex
         */
        lunarInfo:[0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,//1900-1909
            0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,//1910-1919
            0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,//1920-1929
            0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,//1930-1939
            0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,//1940-1949
            0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,//1950-1959
            0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,//1960-1969
            0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,//1970-1979
            0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,//1980-1989
            0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,//1990-1999
            0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,//2000-2009
            0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,//2010-2019
            0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,//2020-2029
            0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,//2030-2039
            0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,//2040-2049
        /**Add By JJonline@JJonline.Cn**/
            0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50, 0x06b20,0x1a6c4,0x0aae0,//2050-2059
            0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,//2060-2069
            0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,//2070-2079
            0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,//2080-2089
            0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,//2090-2099
            0x0d520],//2100

        /**
         * 公历每个月份的天数普通表
         * @Array Of Property
         * @return Number
         */
        solarMonth:[31,28,31,30,31,30,31,31,30,31,30,31],

        /**
         * 天干地支之天干速查表
         * @Array Of Property trans["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
         * @return Cn string
         */
        Gan:["\u7532","\u4e59","\u4e19","\u4e01","\u620a","\u5df1","\u5e9a","\u8f9b","\u58ec","\u7678"],

        /**
         * 天干地支之地支速查表
         * @Array Of Property
         * @trans["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
         * @return Cn string
         */
        Zhi:["\u5b50","\u4e11","\u5bc5","\u536f","\u8fb0","\u5df3","\u5348","\u672a","\u7533","\u9149","\u620c","\u4ea5"],

        /**
         * 天干地支之地支速查表<=>生肖
         * @Array Of Property
         * @trans["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]
         * @return Cn string
         */
        Animals:["\u9f20","\u725b","\u864e","\u5154","\u9f99","\u86c7","\u9a6c","\u7f8a","\u7334","\u9e21","\u72d7","\u732a"],

        /**
         * 24节气速查表
         * @Array Of Property
         * @trans["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
         * @return Cn string
         */
        solarTerm:["\u5c0f\u5bd2","\u5927\u5bd2","\u7acb\u6625","\u96e8\u6c34","\u60ca\u86f0","\u6625\u5206","\u6e05\u660e","\u8c37\u96e8","\u7acb\u590f","\u5c0f\u6ee1","\u8292\u79cd","\u590f\u81f3","\u5c0f\u6691","\u5927\u6691","\u7acb\u79cb","\u5904\u6691","\u767d\u9732","\u79cb\u5206","\u5bd2\u9732","\u971c\u964d","\u7acb\u51ac","\u5c0f\u96ea","\u5927\u96ea","\u51ac\u81f3"],

        /**
         * 1900-2100各年的24节气日期速查表
         * @Array Of Property
         * @return 0x string For splice
         */
        sTermInfo:['9778397bd097c36b0b6fc9274c91aa','97b6b97bd19801ec9210c965cc920e','97bcf97c3598082c95f8c965cc920f',
            '97bd0b06bdb0722c965ce1cfcc920f','b027097bd097c36b0b6fc9274c91aa','97b6b97bd19801ec9210c965cc920e',
            '97bcf97c359801ec95f8c965cc920f','97bd0b06bdb0722c965ce1cfcc920f','b027097bd097c36b0b6fc9274c91aa',
            '97b6b97bd19801ec9210c965cc920e','97bcf97c359801ec95f8c965cc920f','97bd0b06bdb0722c965ce1cfcc920f',
            'b027097bd097c36b0b6fc9274c91aa','9778397bd19801ec9210c965cc920e','97b6b97bd19801ec95f8c965cc920f',
            '97bd09801d98082c95f8e1cfcc920f','97bd097bd097c36b0b6fc9210c8dc2','9778397bd197c36c9210c9274c91aa',
            '97b6b97bd19801ec95f8c965cc920e','97bd09801d98082c95f8e1cfcc920f','97bd097bd097c36b0b6fc9210c8dc2',
            '9778397bd097c36c9210c9274c91aa','97b6b97bd19801ec95f8c965cc920e','97bcf97c3598082c95f8e1cfcc920f',
            '97bd097bd097c36b0b6fc9210c8dc2','9778397bd097c36c9210c9274c91aa','97b6b97bd19801ec9210c965cc920e',
            '97bcf97c3598082c95f8c965cc920f','97bd097bd097c35b0b6fc920fb0722','9778397bd097c36b0b6fc9274c91aa',
            '97b6b97bd19801ec9210c965cc920e','97bcf97c3598082c95f8c965cc920f','97bd097bd097c35b0b6fc920fb0722',
            '9778397bd097c36b0b6fc9274c91aa','97b6b97bd19801ec9210c965cc920e','97bcf97c359801ec95f8c965cc920f',
            '97bd097bd097c35b0b6fc920fb0722','9778397bd097c36b0b6fc9274c91aa','97b6b97bd19801ec9210c965cc920e',
            '97bcf97c359801ec95f8c965cc920f','97bd097bd097c35b0b6fc920fb0722','9778397bd097c36b0b6fc9274c91aa',
            '97b6b97bd19801ec9210c965cc920e','97bcf97c359801ec95f8c965cc920f','97bd097bd07f595b0b6fc920fb0722',
            '9778397bd097c36b0b6fc9210c8dc2','9778397bd19801ec9210c9274c920e','97b6b97bd19801ec95f8c965cc920f',
            '97bd07f5307f595b0b0bc920fb0722','7f0e397bd097c36b0b6fc9210c8dc2','9778397bd097c36c9210c9274c920e',
            '97b6b97bd19801ec95f8c965cc920f','97bd07f5307f595b0b0bc920fb0722','7f0e397bd097c36b0b6fc9210c8dc2',
            '9778397bd097c36c9210c9274c91aa','97b6b97bd19801ec9210c965cc920e','97bd07f1487f595b0b0bc920fb0722',
            '7f0e397bd097c36b0b6fc9210c8dc2','9778397bd097c36b0b6fc9274c91aa','97b6b97bd19801ec9210c965cc920e',
            '97bcf7f1487f595b0b0bb0b6fb0722','7f0e397bd097c35b0b6fc920fb0722','9778397bd097c36b0b6fc9274c91aa',
            '97b6b97bd19801ec9210c965cc920e','97bcf7f1487f595b0b0bb0b6fb0722','7f0e397bd097c35b0b6fc920fb0722',
            '9778397bd097c36b0b6fc9274c91aa','97b6b97bd19801ec9210c965cc920e','97bcf7f1487f531b0b0bb0b6fb0722',
            '7f0e397bd097c35b0b6fc920fb0722','9778397bd097c36b0b6fc9274c91aa','97b6b97bd19801ec9210c965cc920e',
            '97bcf7f1487f531b0b0bb0b6fb0722','7f0e397bd07f595b0b6fc920fb0722','9778397bd097c36b0b6fc9274c91aa',
            '97b6b97bd19801ec9210c9274c920e','97bcf7f0e47f531b0b0bb0b6fb0722','7f0e397bd07f595b0b0bc920fb0722',
            '9778397bd097c36b0b6fc9210c91aa','97b6b97bd197c36c9210c9274c920e','97bcf7f0e47f531b0b0bb0b6fb0722',
            '7f0e397bd07f595b0b0bc920fb0722','9778397bd097c36b0b6fc9210c8dc2','9778397bd097c36c9210c9274c920e',
            '97b6b7f0e47f531b0723b0b6fb0722','7f0e37f5307f595b0b0bc920fb0722','7f0e397bd097c36b0b6fc9210c8dc2',
            '9778397bd097c36b0b70c9274c91aa','97b6b7f0e47f531b0723b0b6fb0721','7f0e37f1487f595b0b0bb0b6fb0722',
            '7f0e397bd097c35b0b6fc9210c8dc2','9778397bd097c36b0b6fc9274c91aa','97b6b7f0e47f531b0723b0b6fb0721',
            '7f0e27f1487f595b0b0bb0b6fb0722','7f0e397bd097c35b0b6fc920fb0722','9778397bd097c36b0b6fc9274c91aa',
            '97b6b7f0e47f531b0723b0b6fb0721','7f0e27f1487f531b0b0bb0b6fb0722','7f0e397bd097c35b0b6fc920fb0722',
            '9778397bd097c36b0b6fc9274c91aa','97b6b7f0e47f531b0723b0b6fb0721','7f0e27f1487f531b0b0bb0b6fb0722',
            '7f0e397bd097c35b0b6fc920fb0722','9778397bd097c36b0b6fc9274c91aa','97b6b7f0e47f531b0723b0b6fb0721',
            '7f0e27f1487f531b0b0bb0b6fb0722','7f0e397bd07f595b0b0bc920fb0722','9778397bd097c36b0b6fc9274c91aa',
            '97b6b7f0e47f531b0723b0787b0721','7f0e27f0e47f531b0b0bb0b6fb0722','7f0e397bd07f595b0b0bc920fb0722',
            '9778397bd097c36b0b6fc9210c91aa','97b6b7f0e47f149b0723b0787b0721','7f0e27f0e47f531b0723b0b6fb0722',
            '7f0e397bd07f595b0b0bc920fb0722','9778397bd097c36b0b6fc9210c8dc2','977837f0e37f149b0723b0787b0721',
            '7f07e7f0e47f531b0723b0b6fb0722','7f0e37f5307f595b0b0bc920fb0722','7f0e397bd097c35b0b6fc9210c8dc2',
            '977837f0e37f14998082b0787b0721','7f07e7f0e47f531b0723b0b6fb0721','7f0e37f1487f595b0b0bb0b6fb0722',
            '7f0e397bd097c35b0b6fc9210c8dc2','977837f0e37f14998082b0787b06bd','7f07e7f0e47f531b0723b0b6fb0721',
            '7f0e27f1487f531b0b0bb0b6fb0722','7f0e397bd097c35b0b6fc920fb0722','977837f0e37f14998082b0787b06bd',
            '7f07e7f0e47f531b0723b0b6fb0721','7f0e27f1487f531b0b0bb0b6fb0722','7f0e397bd097c35b0b6fc920fb0722',
            '977837f0e37f14998082b0787b06bd','7f07e7f0e47f531b0723b0b6fb0721','7f0e27f1487f531b0b0bb0b6fb0722',
            '7f0e397bd07f595b0b0bc920fb0722','977837f0e37f14998082b0787b06bd','7f07e7f0e47f531b0723b0b6fb0721',
            '7f0e27f1487f531b0b0bb0b6fb0722','7f0e397bd07f595b0b0bc920fb0722','977837f0e37f14998082b0787b06bd',
            '7f07e7f0e47f149b0723b0787b0721','7f0e27f0e47f531b0b0bb0b6fb0722','7f0e397bd07f595b0b0bc920fb0722',
            '977837f0e37f14998082b0723b06bd','7f07e7f0e37f149b0723b0787b0721','7f0e27f0e47f531b0723b0b6fb0722',
            '7f0e397bd07f595b0b0bc920fb0722','977837f0e37f14898082b0723b02d5','7ec967f0e37f14998082b0787b0721',
            '7f07e7f0e47f531b0723b0b6fb0722','7f0e37f1487f595b0b0bb0b6fb0722','7f0e37f0e37f14898082b0723b02d5',
            '7ec967f0e37f14998082b0787b0721','7f07e7f0e47f531b0723b0b6fb0722','7f0e37f1487f531b0b0bb0b6fb0722',
            '7f0e37f0e37f14898082b0723b02d5','7ec967f0e37f14998082b0787b06bd','7f07e7f0e47f531b0723b0b6fb0721',
            '7f0e37f1487f531b0b0bb0b6fb0722','7f0e37f0e37f14898082b072297c35','7ec967f0e37f14998082b0787b06bd',
            '7f07e7f0e47f531b0723b0b6fb0721','7f0e27f1487f531b0b0bb0b6fb0722','7f0e37f0e37f14898082b072297c35',
            '7ec967f0e37f14998082b0787b06bd','7f07e7f0e47f531b0723b0b6fb0721','7f0e27f1487f531b0b0bb0b6fb0722',
            '7f0e37f0e366aa89801eb072297c35','7ec967f0e37f14998082b0787b06bd','7f07e7f0e47f149b0723b0787b0721',
            '7f0e27f1487f531b0b0bb0b6fb0722','7f0e37f0e366aa89801eb072297c35','7ec967f0e37f14998082b0723b06bd',
            '7f07e7f0e47f149b0723b0787b0721','7f0e27f0e47f531b0723b0b6fb0722','7f0e37f0e366aa89801eb072297c35',
            '7ec967f0e37f14998082b0723b06bd','7f07e7f0e37f14998083b0787b0721','7f0e27f0e47f531b0723b0b6fb0722',
            '7f0e37f0e366aa89801eb072297c35','7ec967f0e37f14898082b0723b02d5','7f07e7f0e37f14998082b0787b0721',
            '7f07e7f0e47f531b0723b0b6fb0722','7f0e36665b66aa89801e9808297c35','665f67f0e37f14898082b0723b02d5',
            '7ec967f0e37f14998082b0787b0721','7f07e7f0e47f531b0723b0b6fb0722','7f0e36665b66a449801e9808297c35',
            '665f67f0e37f14898082b0723b02d5','7ec967f0e37f14998082b0787b06bd','7f07e7f0e47f531b0723b0b6fb0721',
            '7f0e36665b66a449801e9808297c35','665f67f0e37f14898082b072297c35','7ec967f0e37f14998082b0787b06bd',
            '7f07e7f0e47f531b0723b0b6fb0721','7f0e26665b66a449801e9808297c35','665f67f0e37f1489801eb072297c35',
            '7ec967f0e37f14998082b0787b06bd','7f07e7f0e47f531b0723b0b6fb0721','7f0e27f1487f531b0b0bb0b6fb0722'],

        /**
         * 数字转中文速查表
         * @Array Of Property
         * @trans ['日','一','二','三','四','五','六','七','八','九','十']
         * @return Cn string
         */
        nStr1:["\u65e5","\u4e00","\u4e8c","\u4e09","\u56db","\u4e94","\u516d","\u4e03","\u516b","\u4e5d","\u5341"],

        /**
         * 日期转农历称呼速查表
         * @Array Of Property
         * @trans ['初','十','廿','卅']
         * @return Cn string
         */
        nStr2:["\u521d","\u5341","\u5eff","\u5345"],

        /**
         * 月份转农历称呼速查表
         * @Array Of Property
         * @trans ['正','一','二','三','四','五','六','七','八','九','十','冬','腊']
         * @return Cn string
         */
        nStr3:["\u6b63","\u4e8c","\u4e09","\u56db","\u4e94","\u516d","\u4e03","\u516b","\u4e5d","\u5341","\u51ac","\u814a"],

        /**
         * 返回农历y年一整年的总天数
         * @param lunar Year
         * @return Number
         * @eg:var count = calendar.lYearDays(1987) ;//count=387
         */
        lYearDays:function(y) {
            var i, sum = 348;
            for(i=0x8000; i>0x8; i>>=1) { sum += (calendar.lunarInfo[y-1900] & i)? 1: 0; }
            return(sum+calendar.leapDays(y));
        },

        /**
         * 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
         * @param lunar Year
         * @return Number (0-12)
         * @eg:var leapMonth = calendar.leapMonth(1987) ;//leapMonth=6
         */
        leapMonth:function(y) { //闰字编码 \u95f0
            return(calendar.lunarInfo[y-1900] & 0xf);
        },

        /**
         * 返回农历y年闰月的天数 若该年没有闰月则返回0
         * @param lunar Year
         * @return Number (0、29、30)
         * @eg:var leapMonthDay = calendar.leapDays(1987) ;//leapMonthDay=29
         */
        leapDays:function(y) {
            if(calendar.leapMonth(y))  {
                return((calendar.lunarInfo[y-1900] & 0x10000)? 30: 29);
            }
            return(0);
        },

        /**
         * 返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
         * @param lunar Year
         * @return Number (-1、29、30)
         * @eg:var MonthDay = calendar.monthDays(1987,9) ;//MonthDay=29
         */
        monthDays:function(y,m) {
            if(m>12 || m<1) {return -1}//月份参数从1至12，参数错误返回-1
            return( (calendar.lunarInfo[y-1900] & (0x10000>>m))? 30: 29 );
        },

        /**
         * 返回公历(!)y年m月的天数
         * @param solar Year
         * @return Number (-1、28、29、30、31)
         * @eg:var solarMonthDay = calendar.leapDays(1987) ;//solarMonthDay=30
         */
        solarDays:function(y,m) {
            if(m>12 || m<1) {return -1} //若参数错误 返回-1
            var ms = m-1;
            if(ms==1) { //2月份的闰平规律测算后确认返回28或29
                return(((y%4 == 0) && (y%100 != 0) || (y%400 == 0))? 29: 28);
            }else {
                return(calendar.solarMonth[ms]);
            }
        },

        /**
         * 农历年份转换为干支纪年
         * @param  lYear 农历年的年份数
         * @return Cn string
         */
        toGanZhiYear:function(lYear) {
            var ganKey = (lYear - 3) % 10;
            var zhiKey = (lYear - 3) % 12;
            if(ganKey == 0) ganKey = 10;//如果余数为0则为最后一个天干
            if(zhiKey == 0) zhiKey = 12;//如果余数为0则为最后一个地支
            return calendar.Gan[ganKey-1] + calendar.Zhi[zhiKey-1];

        },

        /**
         * 公历月、日判断所属星座
         * @param  cMonth [description]
         * @param  cDay [description]
         * @return Cn string
         */
        toAstro:function(cMonth,cDay) {
            var s   = "\u9b54\u7faf\u6c34\u74f6\u53cc\u9c7c\u767d\u7f8a\u91d1\u725b\u53cc\u5b50\u5de8\u87f9\u72ee\u5b50\u5904\u5973\u5929\u79e4\u5929\u874e\u5c04\u624b\u9b54\u7faf";
            var arr = [20,19,21,21,21,22,23,23,23,23,22,22];
            return s.substr(cMonth*2 - (cDay < arr[cMonth-1] ? 2 : 0),2) + "\u5ea7";//座
        },

        /**
         * 传入offset偏移量返回干支
         * @param offset 相对甲子的偏移量
         * @return Cn string
         */
        toGanZhi:function(offset) {
            return calendar.Gan[offset%10] + calendar.Zhi[offset%12];
        },

        /**
         * 传入公历(!)y年获得该年第n个节气的公历日期
         * @param y公历年(1900-2100)；n二十四节气中的第几个节气(1~24)；从n=1(小寒)算起
         * @return day Number
         * @eg:var _24 = calendar.getTerm(1987,3) ;//_24=4;意即1987年2月4日立春
         */
        getTerm:function(y,n) {
            if(y<1900 || y>2100) {return -1;}
            if(n<1 || n>24) {return -1;}
            var _table = calendar.sTermInfo[y-1900];
            var _info = [
                parseInt('0x'+_table.substr(0,5)).toString() ,
                parseInt('0x'+_table.substr(5,5)).toString(),
                parseInt('0x'+_table.substr(10,5)).toString(),
                parseInt('0x'+_table.substr(15,5)).toString(),
                parseInt('0x'+_table.substr(20,5)).toString(),
                parseInt('0x'+_table.substr(25,5)).toString()
            ];
            var _calday = [
                _info[0].substr(0,1),
                _info[0].substr(1,2),
                _info[0].substr(3,1),
                _info[0].substr(4,2),

                _info[1].substr(0,1),
                _info[1].substr(1,2),
                _info[1].substr(3,1),
                _info[1].substr(4,2),

                _info[2].substr(0,1),
                _info[2].substr(1,2),
                _info[2].substr(3,1),
                _info[2].substr(4,2),

                _info[3].substr(0,1),
                _info[3].substr(1,2),
                _info[3].substr(3,1),
                _info[3].substr(4,2),

                _info[4].substr(0,1),
                _info[4].substr(1,2),
                _info[4].substr(3,1),
                _info[4].substr(4,2),

                _info[5].substr(0,1),
                _info[5].substr(1,2),
                _info[5].substr(3,1),
                _info[5].substr(4,2),
            ];
            return parseInt(_calday[n-1]);
        },

        /**
         * 传入农历数字月份返回汉语通俗表示法
         * @param lunar month
         * @return Cn string
         * @eg:var cnMonth = calendar.toChinaMonth(12) ;//cnMonth='腊月'
         */
        toChinaMonth:function(m) { // 月 => \u6708
            if(m>12 || m<1) {return -1} //若参数错误 返回-1
            var s = calendar.nStr3[m-1];
            s+= "\u6708";//加上月字
            return s;
        },

        /**
         * 传入农历日期数字返回汉字表示法
         * @param lunar day
         * @return Cn string
         * @eg:var cnDay = calendar.toChinaDay(21) ;//cnMonth='廿一'
         */
        toChinaDay:function(d){ //日 => \u65e5
            var s;
            switch (d) {
                case 10:
                    s = '\u521d\u5341'; break;
                case 20:
                    s = '\u4e8c\u5341'; break;
                    break;
                case 30:
                    s = '\u4e09\u5341'; break;
                    break;
                default :
                    s = calendar.nStr2[Math.floor(d/10)];
                    s += calendar.nStr1[d%10];
            }
            return(s);
        },

        /**
         * 年份转生肖[!仅能大致转换] => 精确划分生肖分界线是“立春”
         * @param y year
         * @return Cn string
         * @eg:var animal = calendar.getAnimal(1987) ;//animal='兔'
         */
        getAnimal: function(y) {
            return calendar.Animals[(y - 4) % 12]
        },

        /**
         * 传入阳历年月日获得详细的公历、农历object信息 <=>JSON
         * @param y  solar year
         * @param m  solar month
         * @param d  solar day
         * @return JSON object
         * @eg:console.log(calendar.solar2lunar(1987,11,01));
         */
        solar2lunar:function (y,m,d) { //参数区间1900.1.31~2100.12.31
            //年份限定、上限
            if(y<1900 || y>2100) {
                return -1;// undefined转换为数字变为NaN
            }
            //公历传参最下限
            if(y==1900&&m==1&&d<31) {
                return -1;
            }
            //未传参  获得当天
            if(!y) {
                var objDate = new Date();
            }else {
                var objDate = new Date(y,parseInt(m)-1,d)
            }
            var i, leap=0, temp=0;
            //修正ymd参数
            var y = objDate.getFullYear(),
                m = objDate.getMonth()+1,
                d = objDate.getDate();
            var offset = (Date.UTC(objDate.getFullYear(),objDate.getMonth(),objDate.getDate()) - Date.UTC(1900,0,31))/86400000;
            for(i=1900; i<2101 && offset>0; i++) {
                temp    = calendar.lYearDays(i);
                offset -= temp;
            }
            if(offset<0) {
                offset+=temp; i--;
            }

            //是否今天
            var isTodayObj = new Date(),
                isToday    = false;
            if(isTodayObj.getFullYear()==y && isTodayObj.getMonth()+1==m && isTodayObj.getDate()==d) {
                isToday = true;
            }
            //星期几
            var nWeek = objDate.getDay(),
                cWeek  = calendar.nStr1[nWeek];
            //数字表示周几顺应天朝周一开始的惯例
            if(nWeek==0) {
                nWeek = 7;
            }
            //农历年
            var year   = i;
            var leap   = calendar.leapMonth(i); //闰哪个月
            var isLeap = false;

            //效验闰月
            for(i=1; i<13 && offset>0; i++) {
                //闰月
                if(leap>0 && i==(leap+1) && isLeap==false){
                    --i;
                    isLeap = true; temp = calendar.leapDays(year); //计算农历闰月天数
                }
                else{
                    temp = calendar.monthDays(year, i);//计算农历普通月天数
                }
                //解除闰月
                if(isLeap==true && i==(leap+1)) { isLeap = false; }
                offset -= temp;
            }
            // 闰月导致数组下标重叠取反
            if(offset==0 && leap>0 && i==leap+1)
            {
                if(isLeap){
                    isLeap = false;
                }else{
                    isLeap = true; --i;
                }
            }
            if(offset<0)
            {
                offset += temp; --i;
            }
            //农历月
            var month      = i;
            //农历日
            var day        = offset + 1;
            //天干地支处理
            var sm         = m-1;
            var gzY        = calendar.toGanZhiYear(year);

            // 当月的两个节气
            // bugfix-2017-7-24 11:03:38 use lunar Year Param `y` Not `year`
            var firstNode  = calendar.getTerm(y,(m*2-1));//返回当月「节」为几日开始
            var secondNode = calendar.getTerm(y,(m*2));//返回当月「节」为几日开始

            // 依据12节气修正干支月
            var gzM        = calendar.toGanZhi((y-1900)*12+m+11);
            if(d>=firstNode) {
                gzM        = calendar.toGanZhi((y-1900)*12+m+12);
            }

            //传入的日期的节气与否
            var isTerm = false;
            var Term   = null;
            if(firstNode==d) {
                isTerm  = true;
                Term    = calendar.solarTerm[m*2-2];
            }
            if(secondNode==d) {
                isTerm  = true;
                Term    = calendar.solarTerm[m*2-1];
            }
            //日柱 当月一日与 1900/1/1 相差天数
            var dayCyclical = Date.UTC(y,sm,1,0,0,0,0)/86400000+25567+10;
            var gzD         = calendar.toGanZhi(dayCyclical+d-1);
            //该日期所属的星座
            var astro       = calendar.toAstro(m,d);

            return {'lYear':year,'lMonth':month,'lDay':day,'Animal':calendar.getAnimal(year),'IMonthCn':(isLeap?"\u95f0":'')+calendar.toChinaMonth(month),'IDayCn':calendar.toChinaDay(day),'cYear':y,'cMonth':m,'cDay':d,'gzYear':gzY,'gzMonth':gzM,'gzDay':gzD,'isToday':isToday,'isLeap':isLeap,'nWeek':nWeek,'ncWeek':"\u661f\u671f"+cWeek,'isTerm':isTerm,'Term':Term,'astro':astro};
        },

        /**
         * 传入农历年月日以及传入的月份是否闰月获得详细的公历、农历object信息 <=>JSON
         * @param y  lunar year
         * @param m  lunar month
         * @param d  lunar day
         * @param isLeapMonth  lunar month is leap or not.[如果是农历闰月第四个参数赋值true即可]
         * @return JSON object
         * @eg:console.log(calendar.lunar2solar(1987,9,10));
         */
        lunar2solar:function(y,m,d,isLeapMonth) {   //参数区间1900.1.31~2100.12.1
            var isLeapMonth = !!isLeapMonth;
            var leapOffset  = 0;
            var leapMonth   = calendar.leapMonth(y);
            var leapDay     = calendar.leapDays(y);
            if(isLeapMonth&&(leapMonth!=m)) {return -1;}//传参要求计算该闰月公历 但该年得出的闰月与传参的月份并不同
            if(y==2100&&m==12&&d>1 || y==1900&&m==1&&d<31) {return -1;}//超出了最大极限值
            var day  = calendar.monthDays(y,m);
            var _day = day;
            //bugFix 2016-9-25
            //if month is leap, _day use leapDays method
            if(isLeapMonth) {
                _day = calendar.leapDays(y,m);
            }
            if(y < 1900 || y > 2100 || d > _day) {return -1;}//参数合法性效验

            //计算农历的时间差
            var offset = 0;
            for(var i=1900;i<y;i++) {
                offset+=calendar.lYearDays(i);
            }
            var leap = 0,isAdd= false;
            for(var i=1;i<m;i++) {
                leap = calendar.leapMonth(y);
                if(!isAdd) {//处理闰月
                    if(leap<=i && leap>0) {
                        offset+=calendar.leapDays(y);isAdd = true;
                    }
                }
                offset+=calendar.monthDays(y,i);
            }
            //转换闰月农历 需补充该年闰月的前一个月的时差
            if(isLeapMonth) {offset+=day;}
            //1900年农历正月一日的公历时间为1900年1月30日0时0分0秒(该时间也是本农历的最开始起始点)
            var stmap   =   Date.UTC(1900,1,30,0,0,0);
            var calObj  =   new Date((offset+d-31)*86400000+stmap);
            var cY      =   calObj.getUTCFullYear();
            var cM      =   calObj.getUTCMonth()+1;
            var cD      =   calObj.getUTCDate();

            return calendar.solar2lunar(cY,cM,cD);
        }
    };



    /*
    * @SetTab 处理tab切换
    * */
    function SetTab(ele,opt){
        this.$element = ele;// 当前选中的元素
        this.dafaults = {
            event:'mouseover',// 默认事件
            activeClass:'choose-active',//tab激活状态时的class
            timeout:0,
            auto:0,
            callback:null// 执行回调事件
        };
        this.options = $.extend({},this.dafaults,opt);
        this.version = 'v1.0';// 版本1.0
        this.timer= null;
    }
    SetTab.prototype = {
        constructor:SetTab,
        getTab:function(){
            var _this = this;
            this.$element.find('.tab-bar b').bind(this.options.event,function(){
                _this.delay($(this),_this.options.timeout);
                if(_this.options.callback){
                    _this.options.callback(_this.$element);
                }
            });
            if(this.options.auto){
                this.start($(this));
                this.$element.hover(function(){
                    clearInterval( _this.timer );
                    _this.timer = undefiend;
                },function(){
                    _this.start($(this));
                });
            }
        },
        tanHandle:function(elem){
            elem.siblings('b')
                .removeClass(this.options.activeClass)
                .end()
                .addClass(this.options.activeClass);
            elem.parents('.tab-container').find('.tab-conts .nums').siblings('.nums')
                .addClass('zHide')
                .end()
                .eq(elem.index())
                .removeClass('zHide');
        },
        delay:function(elem,time){
            var _this = this;
            time ? setTimeout(function(){_this.tanHandle(elem)},time) : this.tanHandle(elem);
        },
        autoGo:function(elem){
            var _this = this;
            var _cur = this.$element.find('.'+this.options.activeClass),
                _tabB = this.$element.find('.tab-bar b'),
                _firstTab = _tabB.eq(0),
                _len = _tabB.length,
                _index = _cur.index() + 1,
                _item = (_index === _len) ? _firstTab : _cur.next('b'),
                _i = _index === _len ? 0 : _index;
            _cur.removeClass(this.options.activeClass);
            _item.addClass(this.options.activeClass);
            _tabB.parents('.tab-container').find('.tab-conts .nums').siblings('.nums')
                .addClass('zHide')
                .end()
                .eq(_i)
                .removeClass('zHide');
        },
        start:function(elem){
            var _this = this;
            if(!this.options.auto){
                return;
            }
            this.timer = setInterval(function(){_this.autoGo(elem)},this.options.auto);
        }
    };
    /*
    *@ChangePopUp 处理弹窗
    * */
    function ChangePopUp(ele,opt){
        this.$element = ele;//当前选中的元素
        this.defaults = {
            event:'click',// 默认是click事件
            popContClass:'popup-conts',// 弹窗内容div
            popBgClass:'popup-bg',// 透明背景
            btnClass:'popup-btn',// 点击显示按钮
            bgTime:200,// 背景出现时长
            popContTime:800,// 弹窗出现时长
            callback:null// 执行回调函数
        };
        this.options = $.extend({},this.defaults,opt);
        this.version = 'v1.0';
    }
    ChangePopUp.prototype = {
        constructor:ChangePopUp,
        setPop:function(){
            var _this = this;
            $('.'+this.options.btnClass).bind(this.options.event,function(){// 点击按钮显示
                _this.popHandle($('.'+_this.options.popBgClass));
            });
            this.$element.find('.close').bind(this.options.event,function(){// 点击关闭按钮
                _this.closePop($('.'+_this.options.popBgClass));
                if(_this.options.callback){
                    _this.options.callback(_this.$element);
                }
            })
        },
        popHandle:function(elem){// 显示背景和弹窗
            elem.fadeIn(this.options.bgTime);
            $('.'+this.options.popContClass).fadeIn(this.options.popContTime);

        },
        closePop:function(elem){// 关闭背景和弹窗
            elem.fadeOut(this.options.bgTime);
            $('.'+this.options.popContClass).hide();
        }
    };

    /*
    *@ChangeTop 回到顶部
    * */
    function ChangeTop(ele,opt){
        this.$element = ele;// 执行元素
        this.isHide = true;// 默认是隐藏状态
        this.win = $(window);
        this.doc = $('html,body');
        this.dafaults = {
            event:'click',
            speed:300,// 滚动速度时间
            showTime:200,// 显示的时间
            offset:400,// 距离顶部的距离
            callback:null// 回调事件
        };
        this.options = $.extend({},this.dafaults,opt);
        this.version = 'v1.0';
    }
    ChangeTop.prototype = {
        constructor:ChangeTop,
        getTop:function(){
            var _this = this;
            if(this.options.isHide){
                this.$element.css('display','none');
            }
            this.$element.bind(this.options.event,function(){
                _this.tabHandle(_this.doc);
                if(_this.options.callback){
                    _this.options.callback(_this.$element);
                }
            });
            this.win.scroll(function(){
                _this.topScroll(_this.$element);
            });
            _this.topScroll(_this.$element);
        },
        tabHandle:function(elem){
            var _this = this;
            elem.animate({
                scrollTop:0
            },_this.options.speed);
        },
        topScroll:function(elem){
            var _scrolling = this.win.scrollTop();
            if(this.options.isHide){
                return _scrolling > this.options.offset ? elem.fadeIn(this.options.showTime) : elem.fadeOut(this.options.showTime);
            }
        }
    };

    /*
    *@GetNavBar 处理智能导航栏定位
    * */
    function GetNavbar(ele,opt){
        this.$element = ele;// 执行元素
        this.win = $(window);
        this.doc = $('html,body');
        this.defaults = {
            event:'click',
            speed:300,
            offset:400,
            active:'active',
            callback:null// 执行回调
        };
        this.options = $.extend({},this.defaults,opt);
        this.version = 'v1.0';
    }
    GetNavbar.prototype = {
        constructor:GetNavbar,
        getBar:function(){
            var _this = this;
            this.$element.find('.bar-sin').bind(this.options.event,function(e){
                e.stopPropagation();
                var _that = $(this),
                    _index = _that.index();
                _this.tabHandle(_this.doc,'.nav-content',_index);
                if(_this.options.callback){// 回调函数
                    _this.options.callback(_this.$element);
                }
            });
            this.setBarCookie();
            this.win.scroll(function(){
                _this.topScroll(_this.$element.find('.bar-sin'),'.nav-content');
            });
        },
        tabHandle:function(elem,conts,i){
            var _this = this;
            elem.animate({
                scrollTop:$(conts).eq(i).offset().top
            },_this.options.speed);
        },
        topScroll:function(elem,conts){
            var _num = 0,
                _this = this,
                _top = $(document).scrollTop();
            elem.each(function(i){
                if(_top >= $(conts).eq(i).offset().top){
                    _num = i;
                }
            });
            _this.fixCurNum(elem,_num);
            api.pub.setCookie('saleindex',_num);
            if(_top > this.options.offset){
                this.$element.fadeIn(this.options.speed);
                api.pub.setCookie('showBar',true);
            }else{
                this.$element.fadeOut(this.options.speed);
                api.pub.setCookie('showBar',false);
            }
        },
        fixCurNum:function(elem,index){
            var _this = this;
            elem.eq(index)
                .addClass(_this.options.active)
                .siblings()
                .removeClass(_this.options.active);
        },
        setBarCookie:function(){// 处理刷新页面保持当前状态
            var _top = $(document).scrollTop();
            if((api.pub.getCookie('saleindex')!==''&& api.pub.getCookie('saleindex')!==undefiend)&&(api.pub.getCookie('showBar')==='true')&&(_top!==0)){
                this.$element.show();
                this.$element.find('.bar-sin')
                            .eq(api.pub.getCookie('saleindex'))
                            .addClass(this.options.active)
                            .siblings()
                            .removeClass(this.options.active);
            }else{
                this.$element.hide();
            }
        }
    };
    /*
    * @GetLazyImg 处理图片懒加载
    * */
    function GetLazyImg(ele,opt){
        this.$element = ele;
        this.dafaults = {
            time:300,// 显示时间
            callback:null// 执行回调
        };
        this.options = $.extend({},this.dafaults,opt);
        this.win = $(window);
        this.version = 'v1.0';
    }
    GetLazyImg.prototype = {
        constructor:GetLazyImg,
        init:function(){
            var _this = this;
            this.win.scroll(function(){
                _this.isVisible(_this.$element);
                if(_this.options.callback){
                    _this.options.callback(_this.$element);
                }
            });
            _this.isVisible(_this.$element);
        },
        isVisible:function(elem){
            var _this = this;
            var _winHeight = $(window).height(),// 窗口的高度
                _scrollHeight = $(document).scrollTop(),// 滚动的高度
                _top;

            elem.each(function(){
                var $this = $(this);
                _top = $this.offset().top;
                if( _top < _winHeight + _scrollHeight){
                    if(!$this.data('isloaded')){
                        setTimeout(function(){
                            _this.showImg($this);
                        },_this.options.time);
                    }
                }
            });
        },
        showImg:function(elem){
            elem.attr('src',elem.attr('data-src'));
            elem.data('isloaded',true);
        }
    };
    /*
    *@InterRolling 处理不断间隙向上滚动信息
    * */
    function InterRolling(ele,opt){
        this.$element = ele;
        this.defaults = {
            offset:-100,// 向上移动的距离
            speed:500,// 滚动的速度
            interTime:2000,// 间隔时间
            isHover:true// 默认鼠标划过的时候暂停
        };
        this.options = $.extend({},this.defaults,opt);
        this.timer = null;// 计时器
        this.version ='v1.0';
    }
    InterRolling.prototype = {
        constructor:InterRolling,
        getRolling:function(){
            var _this = this;
            $(document).ready(function(){
                _this.timer = setInterval(function(){
                    _this.tabHandle(_this.$element);
                },_this.options.interTime);

                //鼠标划过是否停止
                if(_this.options.isHover){
                    _this.$element.hover(function(){
                        clearInterval(_this.timer);
                        _this.timer = undefiend;
                    },function(){
                        _this.timer = setInterval(function(){
                            _this.tabHandle(_this.$element);
                        },_this.options.interTime);
                    });
                }
            });
        },
        tabHandle:function(elem){
            var _this = this;
            elem.find('.conts .ul-cont').animate({
                marginTop:_this.options.offset +'px'
            },_this.options.speed,function(){
                $(this).css('margin-top',0)
                        .find("li:first")
                        .appendTo(this);
            });
        }
    };
    /**
     * CreateCalendar 日历控件
     * */
    function CreateCalendar(ele,opt){
        this.$element = ele;// 执行元素
        this.dafaults = {
            time:'2017-6',// 默认渲染日期
            container:'.box-center',// 包裹日历的元素
            week:'.week-list',// 星期元素
            event:'click',
            isWeekColor:true,// 星期周六日颜色是否着重显示
            isDayColor:true,// 周六日所在的日历天 是否着重显示
            isTaday:true,// 是否显示今天
            callback:null
        };
        this.options = $.extend({},this.dafaults,opt);
        this.version = 'v1.1';// 新增 今天--2017/07/19
    }
    CreateCalendar.prototype = {
        constructor:CreateCalendar,
        init:function(time,obj){
            var _this = this;
            $(document).ready(function(){
                _this.renderCal(_this.options.time,_this.options.container);

                // 周六日颜色是否变红
                if(_this.options.isWeekColor){
                    _this.addWeekColor($(_this.options.week));
                }

                // 日期在周六日的颜色是否着重显示
                if(_this.options.isDayColor){
                    _this.addDayColor();
                }

                // 是否显示今天
                if(_this.options.isTaday){
                    _this.getDateCur();
                }
                // 回调
                if(_this.options.callback){
                    _this.options.callback(_this.$element);
                }
            });
        },
        renderCal:function(time,obj){
            var _this = this;
            console.log(time);
            var obj = obj || 'body';
            var _NewDate = new Date(time.split('-')[0],time.split('-')[1]-1) || new Date(),
                _nYear = _NewDate.getFullYear(),// 年
                _nMonth = _NewDate.getMonth() +1,// 月
                _nDay = _NewDate.getDate(),// 日
                _nWeek = _NewDate.getDay();// 星期

            // 某月有多少天--todo
            var _curMonthDate = this.getDayNum(_nYear,_nMonth);

            console.log(_nYear,_nMonth);

            // box
            var _calendarBox = $('<div></div>',{'class':'calendar-box zShow'}),
                _htmlWeek = '<li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li>',
                _dayBox = $('<ul></ul>',{'class':'day-list'}),// 日
                _dayLi = '';
            // 渲染星期
            $(this.options.week).html(_htmlWeek);

            // 求当月一号是星期几
            var _newDate = new Date(_nYear,_nMonth-1,1),
                _curMonthWeek = _newDate.getDay();

            for(var i = 1;i<=42;i++){
                if(i <= _curMonthWeek){
                    _dayLi += '<li class="new"></li>';
                }else if(i >= _curMonthWeek && i <= _curMonthDate + _curMonthWeek){
                    _dayLi += '<li data-time="'+_nYear+'-'+(_nMonth)+'-'+(i-_curMonthWeek)+'">' +
                            '<p class="text">'+(i-_curMonthWeek)+'</p>'+
                            '<p class="end"></p>'+
                            '<p class="price"></p>'+
                            '<p class="dingwei">'+
                                '<i class="chinas zHide">●</i>'+
                                '<i class="locals zHide">●</i>'+
                            '</p>'+
                            '<p class="jieqi"></p>'+
                        '</li>';
                }else{
                    _dayLi += '<li class="old"></li>';
                }
            }
            _dayBox.html(_dayLi);
            // 插入星期
            _calendarBox.append(_dayBox);// 天
            $(obj).append(_calendarBox);//
        },
        getDayNum:function(year,month){
            // 闰月
            var _veadar = !(year % 400) || (!(year % 4) && (year % 100)),
                _num;
            switch (month) {
                case 2:
                    _num = _veadar ? 29 : 28;
                    break;
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    _num = 31;
                    break;
                default:
                    _num = 30;
            }
            return _num;
        },
        addZero:function(num){ // 处理数字小于10的 前面是否加上前缀 '0'
            return num <= 9 ? '0' + num : '' + num;
        },
        addWeekColor:function(elem){
            elem.find('li').each(function(i){
                var $this = $(this);
                return (i==0 || i==6) ? $this.css('color','red') : '';
            });
        },
        addDayColor:function(){
            this.$element.find('.calendar-box').each(function(){
                var $this = $(this),
                    _index = $this.index();
                $this.find('.day-list li').each(function(e){
                    switch (e){
                        case 0:
                        case 6:
                        case 7:
                        case 13:
                        case 14:
                        case 20:
                        case 21:
                        case 27:
                        case 28:
                        case 34:
                        case 35:
                        case 41:
                            return ($(this).hasClass('new') || $(this).hasClass('old')) ? '': $(this).css('color','#76C3EC');
                        default :
                    }
                });
            });
        },
        getDateCur:function(){
            var _this = this;
            this.$element.find('.calendar-box li').each(function(i){
                var $this = $(this),
                    _date = $this.attr('data-time');
                if(_date === _this.getDateStr(0)){
                    $this.addClass('now')
                        .find('.text')
                        .html('今天');
                }
            });
        },
        getDateStr:function(){
            var _day = new Date();
            _day.setDate(_day.getDate());
            var _y = _day.getFullYear(),
                _m = _day.getMonth() +1,
                _d = _day.getDate();
            return _y+'-'+_m+'-'+_d;
        },
        returnDateStr:function(date){
            var _year = date.getFullYear(),
                _month = date.getMonth() +1,
                _day = date.getDate();

            _month = _month <10 ? ('0'+_month) : (''+_month);
            _day = _day < 10 ? ('0'+_day) : (''+_day);
            return _year + _month + _day;
        }
    };

    /**
     * @
     * */
    function CreateNewCalendar(ele,opt){
        this.$element = ele;
        this.dafaults = {
            time:null,// 默认调取当月日历
            event:'click',
            isSun:true,// 在周六日上日历是否标注颜色
            isLunar:false,// 是否显示农历日期以及二十四节气/属相/天干地支/星座
            callback:null
        };
        this.options = $.extend({},this.dafaults,opt);
        this.version = 'v1.0';
    }
    CreateNewCalendar.prototype = {
        constructor:CreateNewCalendar,
        showCalendar:function(){// 输入数据显示
            var _this = this,
                _dateObj = this.options.time === null ? new Date() : new Date(this.options.time.split('-')[0],this.options.time.split('-')[1]-1),
                _year = _dateObj.getFullYear(),
                _month = _dateObj.getMonth() +1,
                _dateStr = this.returnDateStr(_dateObj),
                _firstDay = new Date(_year,_month - 1, 1);// 当月第一天
            this.$calendarTitle_text.text(_year + '/' + _dateStr.substr(4,2));
            this.$calendarDate_item.each(function(i){
                var _allDay = new Date(_year,_month - 1, i+1 - _firstDay.getDay()),
                    _allDayStr = _this.returnDateStr(_allDay);

                $(this).attr('data-time',_allDayStr.substr(0,4)+'-'+ _allDayStr.substr(4,2)+'-'+_allDayStr.substr(6,2))
                        .find('.text')
                        .html(_allDay.getDate());

                if(_this.returnDateStr(new Date()) === _allDayStr){
                    $(this).attr('class','item item-curMonth item-curDay');
                }else if(_this.returnDateStr(_firstDay).substr(0,6) === _allDayStr.substr(0,6)){
                    $(this).attr('class','item item-curMonth');
                }else{
                    $(this).attr('class','item item-frozen');
                }
            });

            // 显示农历相关数据
            if(this.options.isLunar){
                var _splint,
                    _lunarObject;
                this.$calendarDate_item.each(function(i){
                    _splint = $(this).attr('data-time').split('-');
                    _lunarObject = calendar.solar2lunar(_splint[0],_splint[1],_splint[2]);
                    console.log(_lunarObject);
                    $(this).find('.lundar').html(_lunarObject.IDayCn);
                });
            }
        },
        renderDOM: function () { // 渲染DOM
            this.$calender_cont = $('<div></div>',{'class':'calendar'});
            this.$calendar_title = $('<div></div>',{'class':'calendar-title'});
            this.$calendar_week = $('<ul></ul>',{'class':'calendar-week'});
            this.$calendar_date = $('<ul></ul>',{'class':'calendar-date'});
            this.$calendar_today = $('<div></div>',{'class':'calendar-today'});

            var _titleStr = '<a href="#" class="title"></a>'+
                            '<a href="javascript:void(0);" id="backToday"></a>'+
                            '<div class="arrow">' +
                                '<span class="arrow-prev"><</span>'+
                                '<span class="arrow-next">></span>'+
                            '</div>';
            var _weekStr = '<li class="item sun">日</li>'+
                            '<li class="item">一</li>'+
                            '<li class="item">二</li>'+
                            '<li class="item">三</li>'+
                            '<li class="item">四</li>'+
                            '<li class="item">五</li>'+
                            '<li class="item sun">六</li>';
            var _dateStr = '',
                _dayStr = '<i class="triangle"></i>'+
                        '<p class="date"></p>'+
                        '<p class="week"></p>';
            for(var i = 0;i<42;i++){
                _dateStr += '<li class="item">' +
                                '<p class="text"></p>'+
                                '<p class="price"></p>'+
                                '<p class="lundar"></p>'+
                            '</li>';
            }

            this.$calendar_title.html(_titleStr);
            this.$calendar_week.html(_weekStr);
            this.$calendar_date.html(_dateStr);
            this.$calendar_today.html(_dayStr);

            this.$calender_cont.append(this.$calendar_title,this.$calendar_week,this.$calendar_date,this.$calendar_today);
            this.$element.append(this.$calender_cont);
            this.$calender_cont.show();
        },

        inital: function () { // 初始化
            var _this = this;
            this.renderDOM();

            this.$calendarTitle_text = this.$calendar_title.find('.title');
            this.$calendarDate_item = this.$calendar_date.find('.item');
            this.$arrow_prev = this.$calendar_title.find('.arrow-prev');
            this.$arrow_next = this.$calendar_title.find('.arrow-next');
            this.$calendarToday_date = this.$calendar_today.find('.date');
            this.$calendarToday_week = this.$calendar_today.find('.week');
            this.showCalendar();

            if(this.options.isSun){
                this.addDayColor();
            }
        },
        returnDateStr:function(date){
            var _year = date.getFullYear(),
                _month = date.getMonth() +1,
                _day = date.getDate();

            _month = _month <10 ? ('0'+_month) : (''+_month);
            _day = _day < 10 ? ('0'+_day) : (''+_day);
            return _year + _month + _day;
        },
        addDayColor:function(){
            this.$element.find('.calendar').each(function(){
                $(this).find('.calendar-date .item').each(function(e){
                    switch (e){
                        case 0:
                        case 6:
                        case 7:
                        case 13:
                        case 14:
                        case 20:
                        case 21:
                        case 27:
                        case 28:
                        case 34:
                        case 35:
                        case 41:
                            return $(this).addClass('special');
                        default:
                    }
                });
            });
        }
    };

    $.fn.extend({
        changeTab:function (options){// tab切换
            var setTab = new SetTab(this,options);
            return setTab.getTab();
        },
        setPopUp:function(options){// 弹窗显示与隐藏
            var setPopUp = new ChangePopUp(this,options);
            return setPopUp.setPop();
        },
        goTop:function(options){// 回到顶部
            var gotop = new ChangeTop(this,options);
            return gotop.getTop();
        },
        getNavBar:function(options){// 智能导航栏
            var goNavBar = new GetNavbar(this,options);
            return goNavBar.getBar();
        },
        lazyload:function(options){// 处理图片懒加载
            var myLazy = new GetLazyImg(this,options);
            return myLazy.init();
        },
        interRolling:function(options){// 不断向上滚动的信息
            var myRolling = new InterRolling(this,options);
            return myRolling.getRolling();
        },
        getCalendar:function(options){// 日历控件
            var myCalender = new CreateCalendar(this,options);
            return myCalender.init();
        },
        createCalendar:function(options){// 新版日历控件-包括之前和之后日期的显示
            var calendar = new CreateNewCalendar(this, options);
            return calendar.inital();
        }
    });
})(jQuery,window,document);




















