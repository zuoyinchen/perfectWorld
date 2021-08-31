// colinfo = {
//     filed:"",  //取数据的字段
//     title:"",  //表头名称
//     sWidth:"",    
//     tdalign:"",
//     tdclass:"",   
//     sortFlag:"",/0 不排序 1可排序  2可排序默认asc,  3可排序默认desc
//     sortType:"", //S 字符排序 F 浮点排序
//     fmt:undefined //对列的格式化函数
// }
var nowDate = "";
var yzcbGpdm = "";

function Table($div,opts){
    this.$div = $div;
    this.opts = {
        aoColumns:[],
        data:undefined,
        bfixedHead:0, //0 不固定表头  1固定表头
        fixedHeadPos:undefined,  //固定表头的初始位置{top:0,left:0}
        remoteSort:true, //false 本地排序 true 服务器排序
        bRowStype : 1,// 1 背景色为纯色，2 背景色为2色交替
        isHead:true, //是否有表头
        isBorder:true, //表格是否有边框
        isDblclick:false, //是否 单击双击都支持 false 单击优先级高于双击 true 支持同时绑定单击和双击
        remoteSort:undefined,  //远程排序请求函数
        onClickCell:undefined, //优先级高于clickRow
        onDblClickCell:undefined,
        onClickRow:undefined,
        
    }
    $.extend(true,this.opts,opts)
    this.headObj = undefined;
    this.bodyObj = undefined;
    this.tableObj = undefined;
    this.cloneObj = undefined;
    this.clickTimer = undefined;
    this.columns = this.opts.aoColumns;
    this.data = this.opts.data;
    if(!this.data) return 
    this.create()
}
Table.prototype = {
    create:function()
    {
        var aHtml = [] ;
        aHtml.push("");
        this.$div.append($("<div class='grid-view'><table class='grid-table'><thead></thead><tbody></tbody></table></div>"));
        this.tableObj =this.$div.find(".grid-table"); 
        this.headObj = this.$div.find(".grid-table").find("thead");
        this.bodyObj = this.$div.find(".grid-table").find("tbody");
        if (this.opts.bRowStype == 2)
            this.tableObj.addClass("grid-color2");

        if(this.opts.isBorder)
            this.tableObj.addClass("grid-border");

        if(this.opts.isHead) this.resetHead();
        else this.draw()
    },
    resetHead:function()
    {
        var _self = this;
        this.headObj.empty();
        var thHtml = ""; 
       
        for (var row=0; row<this.columns.length; row++)
        {
            var col = Number(row)+1;
            var title = this.formatTitle(row);
            var sWidth = this.columns[row].sWidth ;
            var align = this.columns[row].align;
            var strAlign = (align == "left" && "text-align:left;") || (align == "right" && "text-align:right;") || (align == "center" && "text-align:center;") || "";
            thHtml += "<th col='"+col+"' width='"+sWidth+"' style='"+strAlign+"'>"+ title+"</th>";
        }
        var headTr = "<tr class=''>"+thHtml+"</tr>";
        this.headObj.append(headTr);

        // this.headObj.on("click","[tdx-role='sort']",function(){
        this.headObj.on("click","th",function(){
            if($(this).find("[sortname]").length == 0) return

            var sorter = $(this).find("[sortname]")
            var sortName = sorter.attr("sortname");
            var sortType = sorter.attr("sorttype") || "S";
            if(!sortName) return 

            var remoteSort = _self.opts.remoteSort;
            var order = "";

            var $theadObj = sorter.closest("thead");

            if(sorter.hasClass("un-sort") || sorter.hasClass("asc-sort")){ // un-->desc  asc-->desc

                $theadObj.find("[sortname]").attr("class","un-sort").text("");
                sorter.attr("class","desc-sort");
                sorter.text("↓")
                order = "desc"

            }else if(sorter.hasClass("desc-sort")){  //desc-->asc

                $theadObj.find("[sortname]").attr("class","un-sort").text("");
                sorter.attr("class","asc-sort");
                sorter.text("↑")
                order = "asc"

            }
           

            if (remoteSort) {
                _self.queryData();
            }else{

                _self.data.sort(function(r1, r2){
                    function fnsort (a, b) {
                            return a == b ? 0 : (a > b ? 1 : -1);
                    };

                    var r = 0;
                    if (sortType == "S")
                        r = fnsort(r1[sortName], r2[sortName]) * (order == "asc" ? 1 : -1);
                    else
                        r = fnsort(fmtFlt(r1[sortName]), fmtFlt(r2[sortName])) * (order == "asc" ? 1 : -1);
                    return r;
                })

                _self.update( _self.data)
            }

           
        })

        if (this.opts.bfixedHead ==1)
        {
            this.fixedHead();
        }
        this.draw();
    },
    fixedHead:function(){
        var clone = this.$div.find(".grid-view .grid-table").clone(true);
        var pos = {};
        if(this.opts.fixedHeadPos.top){
            pos.top = this.opts.fixedHeadPos.top
        }

        if(this.opts.fixedHeadPos.left){
            pos.top = this.opts.fixedHeadPos.left
        }
       
        if (this.$div.find(".grid-head-clone").length < 1)
        {
            this.$div.find(".grid-view").append("<div class='grid-head-clone'></div>");
        }
        this.cloneObj = this.$div.find(".grid-head-clone");

        this.cloneObj.empty();
		this.cloneObj.append(clone).css(pos);
    },
    formatValue:function(rowData, column, row)
    {
        var col=Number(row)+1;
        var key = column.filed;
        var formatter = column.fmt;
        var align = column.align;
        var tdclass = column.tdclass || "";
        var sWidth = column.sWidth;
        var sVal = rowData[key];
        var newVal = sVal;
        if (formatter != undefined)
        {
            newVal = formatter(newVal, rowData);
        }
        var strAlign = (align == "left" && "text-align:left;") || (align == "right" && "text-align:right;") || (align == "center" && "text-align:center;") || "";
        var text = "<td col='"+col+"' width='"+sWidth+"' filed='"+key+"' class='"+tdclass+"' style='"+strAlign+"'>"+newVal+"</td>";
        return text;
    },	
     /*根据当前排序，执行查询*/
    queryData:function(sortName,order){

        if (typeof this.opts.loadFunc == "function")
        {
            this.opts.remoteSort(sortName, order);
        }
    },
    /*
    * 更新表格数据
    * data : [{}] 
    * bClear: 是否清空数据 (1清空 0 不清空)
    */
    update:function(data,bClear){
        bClear = bClear == undefined ? 1 : 0;
        if (bClear == 1)
        {
            this.bodyObj.empty();
            
        }
        for (var i=0; i<data.length; i++)
        {
            var rowData = data[i];
            this.addRow(rowData,i);
            
        }
    },	
    draw:function()
    {
        for (var i=0; i < this.data.length; i++)
        {
            this.addRow(this.data[i],i);
        }

        if(this.opts.bfixedHead == 1){
            // var addWidth = 0;
            // if(this.opts.isBorder && this.opts.bcolor===1){
            //     addWidth = 2
            // }

            // var tableWidth = this.tableObj.width() + addWidth;
            var tableWidth = this.tableObj[0].offsetWidth
            this.cloneObj.css("width",tableWidth);
        }
        
    },
    addRow:function(rowData,i)
    {
        if (typeof rowData != "object") return;
        var _self = this;
        var ahtml = new Array();
        var isodd = i%2==0?"row_odd":"row_even";
        ahtml.push("<tr role='"+isodd+"'>");
        // var aOneRow = [];
        for (var row=0; row<this.columns.length; row++)
        {
            var column = this.columns[row];
            var text = this.formatValue(rowData, column, row);
            ahtml.push(text);
        }
        ahtml.push("</tr>");
        this.bodyObj.append(ahtml.join(" "));
        
        this.bodyObj.find("tr:last-child").bind("click",function(event){
            var $target = $(event.target);
            var $td = $target.closest("td",this);
            var filed = $td.attr("filed");

            if(typeof _self.opts.onClickCell == "function"){
                if(_self.opts.isDblclick){ //支持同时绑定单双击
                    clearTimeout(_self.clickTimer)
                    _self.clickTimer = setTimeout(function(){
                        _self.opts.onClickCell(filed,rowData)
                    },300)
                }else{
                    _self.opts.onClickCell(filed,rowData)
                   
                }
                return 
               
            }

            if(typeof _self.opts.onClickRow == "function"){
                _self.opts.onClickRow(rowData[filed],rowData)
            }
        })

        this.bodyObj.find("tr:last-child").bind("dblclick",function(event){
            var $target = $(event.target);
            var $td = $target.closest("td",this);
            var filed = $td.attr("filed");

            if(typeof _self.opts.onDblClickCell == "function"){
                clearTimeout(_self.clickTimer)
                _self.opts.onDblClickCell(filed,rowData)
              
            }
        })

    },
    formatTitle:function(row)
    {
        var title = this.columns[row].title;
        var sortFlag = this.columns[row].sortFlag 
        var sortType = this.columns[row].sortType
        var sortname = this.columns[row].filed;
        var sort = (sortFlag==1 && "un-sort") || ((sortFlag==2 ) && "asc-sort") || ((sortFlag==3 ) && "desc-sort");
        var sortMark = ((sortFlag==2 ) && "↑") || ((sortFlag==3 ) && "↓") || "";
        var sortText =  (sortFlag > 0 && sortname.length > 0) ? "<span class='"+sort+"' tdx-role='sort' sorttype='"+sortType+"' sortname='"+sortname+"'>"+sortMark+"</span>":"";
        return "<div class='grid-th-cell'><span>"+title+"</span>"+sortText+"</div>";
    },
}

function LhbGgMx($div,opts){
    this.$div = $div;
    this.opts = {
        type:1, 
        code:"",  //需要查询的当前个股 如果不需要初始化执行getData,则此参数必须
        initRq:"", //指定时间某个股的龙虎榜信息
        stime:"",  //统计某一时间段的龙虎榜数据 起始时间  默认统计一年
        etime:"",  //统计某一时间段的龙虎榜数据 结束时间
        bTjlhb:true,  //是否需要多日统计龙虎榜入口
        // bCreateCall:0,   //初始化是否需要执行getData, 1：需要 0：不需要
        bLayout:0, //初始化时，是否需要自己布局， 1：需要 0：不需要
        bRqList:true,  //是否有左边的历史日期列表
        // data:undefined,  
        // rqList:undefined,
        // lhbData:undefined,
        drawView:undefined, //请求数据成功之后
        onInit:undefined  
        
    }
    $.extend(true,this.opts,opts);
    this.$rqDiv = undefined;  //左边 历史龙虎榜时间列表
    this.$ggMxDiv = undefined; //右边 对应日期龙虎榜数据
    this.init()
}

LhbGgMx.prototype = {
		
    init:function(){
        if(this.opts.bLayout == 1){
            var layout = " <div class='gg-left'>"+
                            "<ul class='time-list'>"+
                            "</ul>"+
                        "</div>"+
                        "<div class='gg-right' style='width:550px;'></div>"
            this.$div.html(layout);
        }

        if(typeof this.opts.onInit == "function") this.opts.onInit()

        this.$rqDiv = this.$div.find(".gg-left .time-list")
        this.$ggMxDiv = this.$div.find(".gg-right")

        if(this.opts.code == "")   throw new Error("code参数必须")

        this.getData(this.opts.code)

        // if(this.opts.bCreateCall == 1){
        //     if(this.opts.code == "")  
        //     throw new Error("需要初始化执行getDatacode时,code参数必须")

        //     this.getData(this.opts.code)
        // }else{
        //     // if(!this.opts.data) 
        //     //     throw new Error("不需要初始化执行getDatacode时,data参数必须")
                
        //     this.getData(this.opts.code)

        //     // var rows1 = this.opts.data[0].rows;
        //     // var rows2 = this.opts.data[1].rows;
        //     // var newData = this.group(rows1,rows2);
        //     // // console.log("newData",newData)
        //     // if(JSON.stringify(newData) == "{}"){
        //     //     this.$ggMxDiv.html("近一年该股无上榜数据")
        //     //     return 
        //     // }
        //     // var rqList = Object.keys(newData);
        //     // this.createRqList(rqList,newData)

        // }

       
    },
    getData:function(code){
        var self = this;
        // var rq = this.opts.rq;
        var stime = this.opts.stime || "";
        var etime = this.opts.etime || "";

        showLoad(this.$ggMxDiv);
        CallTQL(function(data){
            hideLoad(self.$ggMxDiv);
            data = FormatResult(data);     
            // console.log(data)     
            if (data.ErrorCode != 0 || data.tables[0].rows.length ==0 || data.tables[1].rows.length==0)
            {
                self.$ggMxDiv.html("无当日龙虎榜数据")
                return;
            }
            // console.log("龙虎榜个股详情",data)
            var rows1 = data.tables[0].rows;
            var rows2 = data.tables[1].rows;


            /*if(fmtdate(date2str(rows2[0]["rq"]),"YYYY-MM-dd") == fmtdate(new Date(),"YYYY-MM-dd")){
                getHq([{"Code":code,"Setcode":rows2[0]["sc"]}],function(hqData){
                    rows2[0]["zdf"] = hqData[code]["zdf"];
                    rows2[0]["close_price"] = hqData[code]["close_price"];
                    rows2[0]["sbcje"] = hqData[code]["sbcje"];
                    self.initData(rows1,rows2)
                  
                })
            }else{*/
                self.initData(rows1,rows2)
                // var newData = self.group(rows1,rows2);
                // // console.log("newData",newData)
                // if(JSON.stringify(newData) == "{}"){
                //     self.$ggMxDiv.html("近一年该股无上榜数据")
                //     return 
                // }
                // var rqList = Object.keys(newData);
                // self.createRqList(rqList,newData)
           // }

           

        }, "cfg_fx_yzlhb", ["yybxq", stime, etime, code, "", 0, 20],{reqtype:"cwserv"})
    },
    initData:function(rows1,rows2){
        var newData = this.group(rows1,rows2);
        // console.log("newData",newData)
        if(JSON.stringify(newData) == "{}"){
            this.$ggMxDiv.html("近一年该股无上榜数据")
            return 
        }
        var rqList = Object.keys(newData);
        if(this.opts.bRqList){
            this.createRqList(rqList,newData);
        }
        // else{
            // this.createRqList(rqList,newData);
        // }

        if(typeof this.opts.drawView == "function")
            this.opts.drawView(this,rqList,newData)  
        

    },
    group:function(data1,data2){
        var groups = {};
        var hash = {};
        var ret = {};
        var except = ["机构专用","深股通专用","港股通专用"]
        data1.forEach(function(row,i){
            var time = fmtdate(date2str(row.rq),"YYYY-MM-dd");
            var yybshow =  fmtYybmc(row["yyb"]);  
            if(!groups[time]){
                groups[time] =  {"dr":{"buy":[],"sale":[]},"3r":{"buy":[],"sale":[]}}; 
                hash[time] =  {"dr":[],"3r":[]} ;
                // groups[time] =  {"dr":[],"3r":[]} 
                // hash[time] =  {"dr":[],"3r":[]} 
            };
               
            if(row.sblx=="dr"){
                if(row.dealtype=="B")
                    groups[time]["dr"]["buy"].push({deallevel:row["deallevel"],yyb:yybshow,_yyb:row["yyb"],yzmc:row["yzmc"],gpdm:row["gpdm"],gpmc:row["gpmc"],mrje:row["mrje"],mcje:row["mcje"],sbcs:row["sbcs"],sl:row["sl"]});
                else
                    groups[time]["dr"]["sale"].push({deallevel:row["deallevel"],yyb:yybshow,_yyb:row["yyb"],yzmc:row["yzmc"],gpdm:row["gpdm"],gpmc:row["gpmc"],mrje:row["mrje"],mcje:row["mcje"],sbcs:row["sbcs"],sl:row["sl"]});
                // if(hash[time]["dr"].indexOf(yybshow) == -1 || except.indexOf(yybshow)>-1){
                //     groups[time]["dr"].push({yyb:yybshow,_yyb:row["yyb"],yzmc:row["yzmc"],gpdm:row["gpdm"],gpmc:row["gpmc"],mrje:row["mrje"],mcje:row["mcje"]})
                //     hash[time]["dr"].push(yybshow)
                // }   
            }else{
                if(row.dealtype=="B")
                    groups[time]["3r"]["buy"].push({deallevel:row["deallevel"],yyb:yybshow,_yyb:row["yyb"],yzmc:row["yzmc"],gpdm:row["gpdm"],gpmc:row["gpmc"],mrje:row["mrje"],mcje:row["mcje"],sbcs:row["sbcs"],sl:row["sl"]});
                else
                    groups[time]["3r"]["sale"].push({deallevel:row["deallevel"],yyb:yybshow,_yyb:row["yyb"],yzmc:row["yzmc"],gpdm:row["gpdm"],gpmc:row["gpmc"],mrje:row["mrje"],mcje:row["mcje"],sbcs:row["sbcs"],sl:row["sl"]});
                // if(hash[time]["3r"].indexOf(yybshow) == -1 || except.indexOf(yybshow)>-1){
                //     groups[time]["3r"].push({yyb:yybshow,_yyb:row["yyb"],yzmc:row["yzmc"],gpdm:row["gpdm"],gpmc:row["gpmc"],mrje:row["mrje"],mcje:row["mcje"]})
                //     hash[time]["3r"].push(yybshow)
                // }   
            }
        })



        data2.forEach(function(row){
            var time = fmtdate(date2str(row.rq),"YYYY-MM-dd");
          
            // row["zdf"] = ((row["close_price"] - row["pre_close_price"])*100/row["pre_close_price"]).toFixed(2);
            ret[time] = {yyb:{"dr":groups[time]["dr"],"3r":groups[time]["3r"]},gginfo:row}   
        })
        
        return ret
    },
    createRqList:function(rqList,data){
        var self = this;
        // console.log("createRqList",data)
       
        var timeItemHtml = "<li class='time-history-title'>上榜历史</li>";
        rqList.forEach(function(val,i){
            timeItemHtml += "<li class='time-point-item' link-rq='"+val+"'>"+
                                "<span>"+val+"</span><b></b>"+
                            "</li>";
        })
        self.$rqDiv.html(timeItemHtml);

        self.$rqDiv.off("click").on("click",".time-point-item",function(){
            var link2rq = $(this).attr("link-rq");
            $(this).addClass("active").siblings().removeClass("active");
            $(".gg-right").empty();
            self.createGgLhb(data[link2rq]);
            nowDate = link2rq;
        })
        // $(".gg-left .time-point-item").eq(0).click();
        if(this.opts.initRq){
            self.$rqDiv.find("li.time-point-item[link-rq='"+this.opts.initRq+"']").click();
        }else{
            self.$rqDiv.find(".time-point-item").eq(0).click();
        }

    },
    createGgLhb:function(res){
        console.log("createGgLhb",res)
        var self = this;
        var gginfo = res["gginfo"];      
        yzcbGpdm = gginfo['gpdm'];
        var close = parseFloat(gginfo['close_price']).toFixed(2);
        var sbcje = fmtBigData(gginfo['sbcje'],2,1);
        var sbmc = self.fmtSbmc(gginfo['sbmc']);
        var tjlhbBtn = self.opts.bTjlhb ? "<div class='tjlhb-btn'><a href='lhb_info.html?sc="+gginfo['sc']+"&code="+gginfo['gpdm']+"&sname="+gginfo["gpmc"]+"&color="+color+"'>多日龙虎榜统计</a></div>" : "";
        var yzcb = "<div style='border: 1px solid #06A0EB; margin-left: 10px; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 12px;'>" +
        		"<a style='color: #cacfd7; text-decoration: none;' onclick='getYzcb();' href='#' onMouseOver=\"this.style.color='#06A0EB'\" onMouseOut=\"this.style.color='#cacfd7'\">查看游资成本</a></div>";
        var zdf_close = "", html = "";
        var tabDiv = "";
        var tWrap = "<div class='table-wrap'></div>";
        var color = $("body").attr("class") == "c-black" ? "0" : "1";

        if(gginfo['zdf']>0){
            zdf_close = "<span class='close_price color-up'>"+close+"</span>"+"<span class='zdf color-up'>"+gginfo['zdf']+"%</span>"
        }else{
            zdf_close = "<span class='close_price color-down'>"+close+"</span>"+"<span class='zdf color-down'>"+gginfo['zdf']+"%</span>"
        }
        var ggDiv = "<div class='lhb-div lhbgg-info'>"+
                        "<div class='gginfo-item'>"+
                            "<div class='gpmc' tdx-sc='"+gginfo['sc']+"' tdx-gpdm='"+gginfo['gpdm']+"'>"+gginfo['gpmc']+"</div>"+
                            "<div class='gpinfo'>"+
                                zdf_close+ "<span class='sbcje'>当日成交额"+sbcje+"元</span>"+
                            "</div>"+tjlhbBtn+yzcb+
                           // "<div class='tjlhb-btn'><a href='lhb_info.html?sc="+gginfo['sc']+"&code="+gginfo['gpdm']+"&sname="+gginfo["gpmc"]+"&color="+color+"'>多日龙虎榜统计</a></div>"+
                        "</div>"+
                        "<div class='sbmc-list'>"+sbmc+"</div>"+
                    "</div>"

        if(res["yyb"]["dr"]["buy"].length>0 && res["yyb"]["3r"]["buy"].length>0){
            var yybmrq5 = res["yyb"]["dr"]["buy"];
            var yybmcq5 = res["yyb"]["dr"]["sale"];
            // self.sortYyb(yybmrq5,"deal");
            // self.sortYyb(yybmcq5,"mcje");
            // yybmrq5 = yybmrq5.slice(0,5);
            // yybmcq5 = yybmcq5.slice(0,5);

            // if(res["yyb"]["3r"].length>0){
                tabDiv = "<div class='lhb-tab'>"+
                    "<ul class='lhb-tab-list'>"+
                        "<li class='lhb-tab-item active' tdx-key='dr'>当日</li>"+
                        "<li class='lhb-tab-item' tdx-key='3r'>连续3日</li>"+
                    "</ul>"+    
                "</div>"
            // }
        }else if(res["yyb"]["dr"]["buy"].length>0){
            var yybmrq5 = res["yyb"]["dr"]["buy"];
            var yybmcq5 = res["yyb"]["dr"]["sale"];
            // self.sortYyb(yybmrq5,"mrje");
            // self.sortYyb(yybmcq5,"mcje");
            // yybmrq5 = yybmrq5.slice(0,5);
            // yybmcq5 = yybmcq5.slice(0,5);
        }else if(res["yyb"]["3r"]["buy"].length>0){
            var yybmrq5 = res["yyb"]["3r"]["buy"];
            var yybmcq5 = res["yyb"]["3r"]["sale"];
            // self.sortYyb(yybmrq5,"mrje");
            // self.sortYyb(yybmcq5,"mcje");
            // yybmrq5 = yybmrq5.slice(0,5);
            // yybmcq5 = yybmcq5.slice(0,5);
        }
        
        html = ggDiv+tabDiv+tWrap
        self.$ggMxDiv.append(html);

        var $tableWrap = self.$ggMxDiv.find(".table-wrap");
        var ggmxTimer = null;
        self.$ggMxDiv.find(".gpmc").unbind("click").bind("click",function(){
            clearTimeout(ggmxTimer);
            var code = $(this).attr("tdx-gpdm");
            var sc = $(this).attr("tdx-sc");
            ggmxTimer = setTimeout(function(){
                jumpStock(code,sc,1)
            },300)
            
        })
        .unbind("dblclick").bind("dblclick",function(){
            clearTimeout(ggmxTimer)
            var code = $(this).attr("tdx-gpdm");
            var sc = $(this).attr("tdx-sc");
            jumpStock(code,sc,2)
        })

        self.$ggMxDiv.find(".lhb-tab-item").unbind("click").bind("click",function(){
            $(this).addClass("active").siblings().removeClass("active");
            // $(".table-wrap").empty();
            $tableWrap.empty();
            var key = $(this).attr("tdx-key");

            var yybmrq5 = res["yyb"][key]["buy"];
            var yybmcq5 = res["yyb"][key]["sale"];
            
            // if(key=="3r"){
            //     var yybmrq5 = res["yyb"]["3r"]["buy"];
            //     var yybmcq5 = res["yyb"]["3r"]["sale"];
            //     // self.sortYyb(yybmrq5,"mrje");
            //     // self.sortYyb(yybmcq5,"mcje");
            //     // yybmrq5 = yybmrq5.slice(0,5);
            //     // yybmcq5 = yybmcq5.slice(0,5);
            // }else{
            //     var yybmrq5 = res["yyb"]["dr"]["buy"];
            //     var yybmcq5 = res["yyb"]["dr"]["sale"];
            //     // self.sortYyb(yybmrq5,"mrje");
            //     // self.sortYyb(yybmcq5,"mcje");
            //     // yybmrq5 = yybmrq5.slice(0,5);
            //     // yybmcq5 = yybmcq5.slice(0,5);
            // }
            self.updataGGRight($tableWrap,yybmrq5,yybmcq5)
            
        })

        self.$ggMxDiv.find(".tjlhb-btn a").unbind("click").bind("click",function(e){
            if(e.preventDefault){
                e.preventDefault()
            }else{
                e.returnValue = false
            }

            var url = $(this).attr("href");
            if(window.TDXQuery){
               
                var locakUrl = window.location.href.split("?")[0]; //避免后面的参数带有/导致URL取错
                var index = locakUrl.lastIndexOf("/");
                locakUrl = locakUrl.substring(0, index)
                var otherUrl = "&myietitle=阶段统计龙虎榜&myiewidth=770&myieheight=650"
                var serverUrl = locakUrl+"/"+url+otherUrl;
                var _url =  "http://www.baidu.com/dlg"+serverUrl
                
                //window.open(_url, "_parent");
            }else{
                open(url,"_blank");
            }
           
        })

        self.updataGGRight($tableWrap,yybmrq5,yybmcq5)

    },
    updataGGRight:function($wrap,yybmrq5,yybmcq5){
        var mrzj = 0, mczj = 0, jezj = 0;
        var jezjStr = "";
        var hjObj = hjMrMc(yybmrq5,yybmcq5);
        var mrzj = hjObj[0];
        var mczj = hjObj[1];

        jezj = mrzj - mczj;
        if(jezj>0){
            jezjStr = "<span class='color-up'>"+fmtBigData(jezj)+"</span>"
        }else{
            jezjStr = "<span class='color-down'>"+fmtBigData(jezj)+"</span>"
        }
        var zjDiv = "<ul class='lhbzj'>"+
            "<li class='lhbzj-mr'>买入总计：<span class='color-up'>"+fmtBigData(mrzj)+"</span></li>"+
            "<li class='lhbzj-mc'>卖出总计：<span class='color-down'>"+fmtBigData(mczj)+"</span></li>"+
            "<li class='lhbzj-je'>净额："+jezjStr+"</li>"+
        "</ul>"
        var mrDiv = "<div class='lhb-div lhbyyb-mr'></div>"
        var mcDiv = "<div class='lhb-div lhbyyb-mc'></div>"
        var html = zjDiv + mrDiv + mcDiv
        $wrap.html(html);

        var $yybBuy = $wrap.find(".lhbyyb-mr");
        var $yybSale = $wrap.find(".lhbyyb-mc");

        var comCols = [
            {filed:"mrje",title:"买入",sWidth:"60",align:"center",fmt:_fmtMr}
            ,{filed:"mcje",title:"卖出",sWidth:"60",align:"center",fmt:_fmtMc}
            ,{filed:"1",title:"净额",sWidth:"60",align:"center",fmt:fmtJe}
            ,{filed:"1",title:"上榜次数",sWidth:"60",align:"center",fmt:fmtSbcs}
            ,{filed:"1",title:"胜率",sWidth:"60",align:"center",fmt:fmtSl}
        ]
        var cols1 = [{filed:"yyb",title:"买入营业部前五",sWidth:"185",align:"left",fmt:fmtyybYz}].concat(comCols)
        var cols2 = [{filed:"yyb",title:"卖出营业部前五",sWidth:"185",align:"left",fmt:fmtyybYz}].concat(comCols)

        if(yybmrq5.length>0){
            new Table($yybBuy,{
                aoColumns:cols1,
                data:yybmrq5,
                // isBorder:false,
                onClickCell:function(filed,rowData){
                    if(filed == "yyb"){
                        // console.log(rowData)
                        queryKLineData(rowData["gpdm"],rowData["_yyb"])
                    }
                }
            })
        }

        if(yybmcq5.length>0){
            new Table($yybSale,{
                aoColumns:cols2,
                data:yybmcq5,
                // isBorder:false,
                onClickCell:function(filed,rowData){
                    if(filed == "yyb"){
                        // console.log(rowData)
                        queryKLineData(rowData["gpdm"],rowData["_yyb"])
                    }
                }
            })
        }

       
        
    },
    updata:function(code){
        this.$rqDiv.empty();
        this.$ggMxDiv.empty();
        this.getData(code);
    },
    /*上榜类型*/
    fmtSbmc:function(val){ 
        var arr = val.split("|");
        var ret = "";
        arr.forEach(function(e){
            ret +="<span class='sbmc-item'>"+e+"</span>"
        })
        return ret;

    },   
     /*买入 卖出 前五营业部*/
    sortYyb:function(arr,key){
        for(var i=1;i<arr.length;i++){
            if(fmtFlt(arr[i][key])>fmtFlt(arr[i-1][key])){
                var target = arr[i];
                var j = i-1; //已排序数列的最后一个数的index
                arr[i] = arr[j];
                while(j>=0 && fmtFlt(arr[j][key])<fmtFlt(target[[key]])){
                    arr[j+1] = arr[j];
                    j--;
                }
                arr[j+1] = target
            }
        }
    }
}

/*****当天行情走客户端及时行情*****/
function getHq(hqlist,callback){
    var param = JSON.stringify({"WantCol":["CLOSE","NOW","AMOUNT"],"Secu":hqlist})
    CallTQL(function(data){
       
        data = JSON.parse(data);
        // console.log("HQServ.CombHQ",data)
        data = fmtHQdata(data);

		var codeHQ = {};
		data.forEach(function(val){
            // codeHQ[val.Code] = {rq:"",close_price:val.NOW,pre_close_price:val.CLOSE,sbcje:val.AMOUNT}
            var zdf = ((val.NOW- val.CLOSE)*100/val.CLOSE).toFixed(2);
            codeHQ[val.Code] = {close_price:val.NOW, zdf:zdf, sbcje:val.AMOUNT}
            
        })
        
        if(typeof callback == "function") callback(codeHQ)
    },"HQServ.CombHQ",param)
}

function fmtHQdata(data){

    var head = data["ListHead"];
    var list = data["List"];
    var newdata = [];
    list.forEach(function(val){
        var item = {}
        val.forEach(function(e,i){
            item[head[i]] = e
        })
       
        newdata.push(item);
    })
    return newdata
}

/****点击营业部 传送对应个股上榜数据给田工画K线***/
function queryKLineData(code,yyb,stime,etime){
    stime = stime == undefined ? fmtdate(dateAdd("y",-1,new Date()),"YYYY-MM-dd") : stime;
    etime = etime == undefined ? fmtdate(new Date(),"YYYY-MM-dd") : etime;

    CallTQL(function(data){
        data = FormatResult(data);
        if(data.ErrorCode == 0){
            var rows1 = data.tables[0].rows; //特定营业部信息
            var rows2 = data.tables[1].rows; //某个股一年上榜日期
            var rqobj = {};
            rows1[0].yyb = fmtYybmc(rows1[0].yyb);
            rows2.forEach(function(val){
               
                if(!val.mrje && !val.mcje)
                    rqobj[val.rq] = ""
                else
                    rqobj[val.rq] = (ifnull(val.mrje,0)-ifnull(val.mcje,0)).toFixed(2);
            })
            var transData = JSON.stringify({info:rows1[0],rqList:rqobj});
            console.log(transData)  


            
        }

    },"cfg_fx_yzlhb",["yybcode", stime, etime, code, yyb, 0, 20],{reqtype:"cwserv"})
}

function getUrlParam() {
    var htmlParam =decodeURI(location.search.substring(1));
    var htmlArray = htmlParam.split("&");
    var objData = {};

    for (var row=0; row<htmlArray.length; row++)
    {
        var a = htmlArray[row].split("=");

        if (a.length >1)
        {
            objData[a[0]] = a[1]
        }
    }
    return objData;
}  
/**
 * @expre1 该值为null 或者 "" 则替换成expre2
 * @expre2 替换的值
 * **/
function ifnull(expre1,expre2){
    if(expre1 === undefined || expre2 === undefined)
        throw new Error("缺少必须参数")

    if(expre1 == null || expre1 == "") return expre2 
    return expre1
}

function fmtStock(val, rowData){
    var ret = "--";
    var dSpan3 = rowData["sblx"]=="3r" ? "<span class='table-sblx-3r'>3日</span>" : ""
    if(val){
        ret = "<span style='color:#26a3f0'>"+val+"</span>"+dSpan3 +"<br/><span style='color:#26a3f0'>"+rowData["gpdm"]+"</span>"
    }
   
    return ret
}

function fmtYybmc(str){
    var ret =  str.replace(/(有限责任|股份有限|有限|股份)公司|(证券营业部)/g,"");
    return ret
}

function fmtFlt(v) {
    var f = parseFloat(v)
    return !isNaN(f) ? f : 0
}


/*将字符串转换成date格式*/
function date2str(str){
    if (!str || str.length < 8) return null;
    if (str.length == 8){
        str = str.substring(0, 4) + "-" + str.substring(4, 6)+  "-" + str.substring(6, 8);
    }
    var e = 'new Date(' + str.replace(/\d+(?=-[^-]+$)/,function (a) { return parseInt(a, 10) - 1; }).replace(/\d+/g,  function(a){return parseInt(a, 10)}).match(/\d+/g) + ')'

    var date = eval(e);
    return date;
}

/*将日期格式化字符串*/
function fmtdate(date, f){
    var str = f;   
    var Week = ['周日','周一','周二','周三','周四','周五','周六'];

    str=str.replace(/yyyy|YYYY/,date.getFullYear());   
    str=str.replace(/yy|YY/,(date.getYear() % 100)>9?(date.getYear() % 100).toString():'0' + (date.getYear() % 100));   

    var month = date.getMonth() + 1;
    str=str.replace(/MM/,month >9?month.toString():'0' + month);   
    str=str.replace(/M/g,month);   

    str=str.replace(/w|W/g,Week[date.getDay()]);   

    str=str.replace(/dd|DD/,date.getDate()>9?date.getDate().toString():'0' + date.getDate());   
    str=str.replace(/d|D/g,date.getDate());   

    str=str.replace(/hh|HH/,date.getHours()>9?date.getHours().toString():'0' + date.getHours());   
    str=str.replace(/h|H/g,date.getHours());   
    str=str.replace(/mm/,date.getMinutes()>9?date.getMinutes().toString():'0' + date.getMinutes());   
    str=str.replace(/m/g,date.getMinutes());   

    str=str.replace(/ss|SS/,date.getSeconds()>9?date.getSeconds().toString():'0' + date.getSeconds());   
    str=str.replace(/s|S/g,date.getSeconds());   
    
    return str;  
}

function  dateAdd(interval,number,date) 
{ 
/* 
 *---------------  DateAdd(interval,number,date)  ----------------- 
 *  DateAdd(interval,number,date)  
 *  参数:interval,字符串表达式，表示要添加的时间间隔. 
 *  参数:number,数值表达式，表示要添加的时间间隔的个数. 
 *  参数:date,时间对象. 
 *  返回:新的时间对象. 
 *  var  now  =  new  Date(); 
 *  var  newDate  =  DateAdd( "d ",5,now); 
 */
     number = isNaN(number)? 0:parseInt(number);
    switch(interval) 
    { 
        case  "y"  :  { 
            date.setFullYear(date.getFullYear()+number); 
            return  date; 
            break; 
        } 
        case  "q"  :  { 
            date.setMonth(date.getMonth()+number*3); 
            return  date; 
            break; 
        }
        case  "m"  :  { 
             var day = date.getDate();
             date.setDate(1); 
             var dayInfo = {
                         0:{0:31, 1:28, 2:31, 3:30, 4:31, 5:30, 6: 31, 7:31, 8: 30, 9:31, 10:30, 11:31},
                         1:{0:31, 1:29, 2:31, 3:30, 4:31, 5:30, 6: 31, 7:31, 8: 30, 9:31, 10:30, 11:31}	
                         };
            date.setMonth(date.getMonth()+number);
            var newYear = date.getFullYear();
            var newMonth = date.getMonth();
            var result =(newYear%4==0 && newYear%100!=0)||(newYear%400==0) ? 1: 0;
            var maxDays = dayInfo[result][newMonth];
            var newDay = day;
            if (newDay > maxDays) 
            {
                newDay = maxDays;
            }
            date.setDate(newDay);

            return  date; 
            break; 
        } 
        case  "w"  :  { 
            date.setDate(date.getDate()+number*7);
            return  date; 
            break; 
        } 
        case  "d"  :  { 
            date.setDate(date.getDate()+number); 
            return  date; 
            break; 
        } 
        case  "h"  :  { 
            date.setHours(date.getHours()+number);
            return  date; 
            break; 
        } 
        case  "min"  :  { 
            date.setMinutes(date.getMinutes()+number); 
            return  date; 
            break; 
        } 
        case  "s"  :  { 
            date.setSeconds(date.getSeconds()+number); 
            return  date; 
            break; 
        } 
        default  :  { 
            date.setDate(date.getDate()+number); 
            return  date; 
            break; 
        } 
    } 
}

function _fmtMr(val, rowData){
    var ret = "--";
    var money = fmtBigData(val);
    if(val!=undefined||val!=null){
        ret = "<span class='color-up'>"+money+"</span>"
    }
    return ret
}

function _fmtMc(val, rowData){
    var ret = "--";
    var money = fmtBigData(val);
    if(val){
        ret = "<span class='color-down'>"+money+"</span><br/>"
    }
    return ret
}

function fmtSl(val, rowData){
    var ret = val;
    if(rowData["sl"].replace('%', '') > 30){
        ret = "<span class='color-up'>" + rowData["sl"] + "</span><br/>"
    } else {
    	ret = "<span class='color-down'>" + rowData["sl"] + "</span><br/>"
    }
    return ret 
}

function fmtSbcs(val, rowData){
	var ret = val;
	if(rowData["sbcs"].replace('次', '') > 10){
		ret = "<span class='color-up'>" + rowData["sbcs"] + "</span><br/>"
	} else {
		ret = "<span class='color-down'>" + rowData["sbcs"] + "</span><br/>"
	}
	return ret 
}

function fmtJe(val, rowData){
    var ret = "--";
    var mr = rowData["mrje"] || 0.00;
    var mc = rowData["mcje"] || 0.00;
    var ret = fmtBigData(mr-mc);
    if(mr-mc>0)
        return  "<span class='color-up'>"+ret+"</div>"
    else if(mr-mc<0)
        return "<span class='color-down'>"+ret+"</div>"
    else
        return ret
}

function fmtRq(val, rowData){
    if(val == "合计" || val == "小计") return val

    if(rowData["sblx"] == "3r"){

        return fmtdate(date2str(val),"YYYYMMdd") + "<span class='sblx-3r'>3日</span>";
    }else{
        return fmtdate(date2str(val),"YYYYMMdd");
    }
}

/**相同席位在买方和卖方都出现只算一次   机构专用等的除外**/
function hjMrMc(arr1,arr2){ 
    var newArr = arr1.concat(arr2);
    var mrzj = 0, mczj = 0;
    var unique = [];
    var hash = [];
    newArr.forEach(function(row){
        if(!hash[row.yyb+"-"+row.mrje+"-"+row.mcje]){
            hash[row.yyb+"-"+row.mrje+"-"+row.mcje] = 1;
            unique.push(row);
        }
    }) 

    unique.forEach(function(val,i){
        mrzj += parseFloat(fmtFlt(val.mrje));
        mczj += parseFloat(fmtFlt(val.mcje));    
    })

    // newArr.forEach(function(val,i){
    //     mrzj += parseFloat(fmtFlt(val.mrje));
    //     mczj += parseFloat(fmtFlt(val.mcje));    
    // })

    return [mrzj,mczj]
}

//标记营业部属于哪个游资
function fmtyybYz(val, rowData){
    var ret = val;
    if(rowData["yzmc"]){
        ret = val + "<span class='yyb-yz'>"+rowData["yzmc"]+"</span>"
    }
    return ret 
}

/*万亿表达法*/
function fmtBigData(v,ws,cs,bz){
    /*
        @param:{v:值,ws:保留位数,cs:最小单位,bz:1:显示0值,0:0值格式--}
        @return 值+单位
        fmtBigData(100000,2,1,true)==>return 10.00万
    */
    ws = ws ? ws : 2;
    cs = cs ? cs : 1;
    bz = bz ? bz : true;
    var f = fmtFlt(v);
    var dw='';

    if(!bz&&f==0) return "--"
    if(cs==1){
        if(Math.abs(f)>=10000 && Math.abs(f)<10000*10000){
            return (f/10000).toFixed(ws)+"万"
        }else if(Math.abs(f)>=10000*10000 && Math.abs(f)<10000*10000*10000){
            return (f/100000000).toFixed(ws)+"亿"
        }else{
            return f.toFixed(ws)
        }
    }else if(cs==2){ /*表中最小单位为万*/
        if(Math.abs(f)>=10000 && Math.abs(f)<10000*10000){
            return (f/10000).toFixed(ws)+"亿"
        }else{
            return f.toFixed(ws)+"万"
        }
    }
    return (f/cs).toFixed(ws)
}

//跳转个股行情  单击小行情 双击小行情大行情
function jumpStock(code,sc,flag){
    flag = flag == undefined ? 1 : flag //1-单击 2-双击
    console.log(flag)
	if(window.TDXQuery){
        var url = "";
        if(flag == 1){ //sc ? "http://www.baidu.com/breed_"+sc+"#"+code : "http://www.baidu.com/code_"+code;
            url = "http://www.baidu.com/code_"+code;     
           // window.open(url,"_self");
        }  
        else{
            url = "http://www.baidu.com/direct_"+sc+"#"+code;
            var url2 = "http://www.baidu.com/code_"+code; 
            window.open(url2,"_self");
            var timerOut = setTimeout(function(){
                clearTimeout(timerOut);
               // window.open(url,"_self");
            },300)
        }
		
	}
    
}

function showError($div,flag){
    flag == flag ? flag : 1
    var s = "<div class='p-hdy-error'>无当日龙虎榜数据</div>";
    if(flag == 1)
        $div.html(s);
    else{
        if($div.find(".p-hdy-error").length>0) $div.find(".p-hdy-error").remove();

        $div.prepend($(s));
    }
}

function getYzcb() {
    Fingerprint2.get(function(components) {
        var murmur = Fingerprint2.x64hash128(components.map(function (pair) { return pair.value }).join(), 31);

        window.open("../yzcb/stockV2.html?stockCode=" + yzcbGpdm + "&initTimeTimes=" + nowDate + "&gphonepredraw=true" + "&s=" + murmur.toUpperCase() + "&o=" + userSignCookie);
    });
}

function showLoad($div){
    $div = $div ? $div : $("body");
    if($div.find(".loading").length>0) $div.find(".loading").show()
    else $div.append("<div class='loading'></div>")
}

function hideLoad($div){
    $div = $div ? $div : $("body");
    $div.find(".loading").remove()
}