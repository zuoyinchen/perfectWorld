(function(){
  var color = "";
  var gtimers = null;  //游资图谱 使用定时器避免单击双击事件冲突
  
  /**
   * 题材的图
   */
  function View($div, opts){
      this.$div = $div;
      var initOpts = {
          data:[],
          onClick:null,
          onDbClick:null
      };
      this.opts = $.extend(true, initOpts, opts);
      this.width = 1200;
      this.height = 0;
      this.info = {};
      this.textid = 1; 
      var svgId = "t_"+Math.floor(Math.random() * 1000000).toString() + Math.floor(Math.random() * 1000000).toString();
      this.$div.html("<svg id='"+svgId+"'></svg>");
      this.$svg = $("#" + svgId);
      this.svg = d3.select("#" + svgId);   
      this.init();   

  }
  View.prototype = {
      init:function(){
          this.$svg.empty();
          var data = this.filter(this.opts.data);  
          this.update(data);  
          // this.update(this.opts.data);  
          $(window).unbind("resize").bind("resize", function(){
              this.resize(); 
          }.bind(this))  
          this.resize();    
      },
      resize:function(){
          var viewBox="0,0,"+this.width+"," + this.height;
          var parentWidth = this.$div.width();
          var parentHeight = this.$div.height();
          var divWidth = this.$div.width();
          if (divWidth < 1000) divWidth = 1000;
          if (divWidth > 1440) divWidth = 1440;
          // var width = divWidth - 20; 
          var width = divWidth; 
          var height = (width/this.width) * this.height;
          this.$svg.attr("width", width + "px");
          this.$svg.attr("height", height + "px");
          var marignLeft = 0;
          var marignTop = (parentHeight-height)/2
          if (parentWidth - divWidth > 20){
              marignLeft = (parentWidth - divWidth)/2
          }
          this.$svg.css({
              // "margin-left":-20 + 'px'
              // "margin-left":marignLeft + 'px'
              // "margin-top":marignTop + 'px'
          });
          this.$svg[0].setAttribute("viewBox", viewBox);
      
      },     
      getTextId:function(){
          var now = new Date();
          var ret = "id_" + Math.floor(Math.random() * 1000000).toString() + Math.floor(Math.random() * 1000000).toString();
          // this.textid ++ ;
          return ret
      },
      getTextWidth:function(str){
          var curLen = 0;
          for(var i=0;i<str.length;i++){
              var code = str.charCodeAt(i);
              var pixelLen = code > 255 ? 12 : 6;
              curLen += pixelLen;
          }
          return curLen;        
      },
      getRectWidth:function(str){
          var width = this.getTextWidth(str) + 20 ;
          return width;
      },
      update:function(row){
          var _self = this;
          var root = this.format(row);
          console.log("root",root);
          var g = this.svg.append("g").attr("transform", "translate(0, 0)");
          this.height += root.height;
          // this.height += root.height + 10;
          // var diagonal=  d3.svg.diagonal();

          var link = g.selectAll(".p-view-link")
          .data(root.links)
          .enter().append("path")
          .attr("class", "p-view-link")
          .attr("d",this.diagonal(root));

          var rect = g.selectAll(".p-view-rect")
              .data(root.rects)
              .enter()
              .append("g")
              .attr("class", function(d) { 
                  
                  if (d.bCenter == 1){
                      return 'p-view-rect p-view-rect-1';
                  }
                  //游资
                  else if(d.bCenter == 2){
                      return 'p-view-rect p-view-rect-2';
                  }  
                  // 个股
                  else if(d.bCenter == 3){
                      var appClas = (d.flag == 1 && "p-view-up") || (d.flag == 2 && "p-view-down") || "p-view-normal" ;
                      return 'p-view-rect p-view-rect-3 ' + appClas;
                  } 
                  //营业部
                  else if(d.bCenter == 4){
                      return 'p-view-rect p-view-rect-4';
                  }                                          
              })
              .attr("transform", function(d) { return "translate(" + d.left + "," + d.top + ")"; })
              .on("click", function(evt){
                  
                  if (_self.opts.onClick){
                      _self.opts.onClick(evt)
                  }
              })

          g.selectAll(".p-view-rect-3").on("dblclick",function(evt){
              if (_self.opts.onDbClick){
                  _self.opts.onDbClick(evt)
              }
          })
      
          rect.append("rect")
          .attr("width", function(d){return d.width})
          .attr("height", function(d){return d.height})
          .attr("y", 15)
          .attr("rx", 4)
          .attr("ry", 4)

          rect.append("rect")
          .attr("class",function(d){
              if(d.mark == "3日"){
                  return  "p-view-rect-mark"
              }
              if(d.bCenter == 4 && d.yybRet !== undefined){
                  return  "p-view-rect-yybRet"
              }
          })
          .attr("width", function(d){return 25})
          .attr("height", function(d){return 16})
          .attr("y", 20)
          .attr("x", 6)
         


          rect.append("text")
              .attr("dy", 3)
              .attr("y", 15)
              .attr("x", function(d) { return 0; })
              .attr("class", function(d){
                  return d.index;
              })
              .style("text-anchor", function(d) {return "start";})

          rect.append("text")
          .attr("dy", 3)
          .attr("y", function(d) { 
              if(d.mark == "3日")  return 16; 
              if(d.yybRet) return 15
          })
          .attr("x", function(d) { return 0; })
          .attr("class", function(d){
              // if(d.mark == "3日"){
                  return d.index+"_f";
              // }
          })
          .style("text-anchor", function(d) {return "start";})
          .style("fill", function(d) {
              if(d.mark == "3日"){
                  return "#fff600";
              }

              if(d.bCenter == 4 && d.yybRet !== undefined){
                  if(parseFloat(d.yybRet)>0){
                      return "#b42f32";
                  }else if(parseFloat(d.yybRet)<0){
                      return "#2fb438";
                  }else{
                      return "#fff";
                  }
              }
          })


          root.rects.forEach(function(element) {
              var index = element.index;
              var _mark = element.mark || "";
              var _yybRet = element.yybRet || "";
              var strs = [root.texts[index]]
              var width = element.width;
              d3.select("." + index )
              .selectAll("tspan")
              .data(strs)
              .enter()
              .append("tspan")
              .attr("x", function(d, c){
                  var left = (width  - _self.getTextWidth(d))/2;
                  if (left < 0) {
                      left = 0;
                  }
                  if(_mark){
                      left +=15
                  }
                  if(_yybRet){
                      left = 10;
                  }
                  return left

              })
              .attr("dy",function(d){
                  var top = "1.4em";
                  return top;
              })
              .text(function(d, c){
                 
                  return d
              })   
              
              if(_mark){
                  d3.select("." + index +"_f" )
                  .selectAll("tspan")
                  .data([_mark])
                  .enter()
                  .append("tspan")
                  .attr("x", function(d, c){
                      return 10

                  })
                  .attr("dy",function(d){
                      var top = "1.4em";
                      return top;
                  })
                  .text(function(d, c){
                      return d
                  }) 
              }
              
              if(element.bCenter == 4){
                  d3.select("." + index +"_f" )
                  .selectAll("tspan")
                  .data([_yybRet])
                  .enter()
                  .append("tspan")
                  .attr("x", function(d, c){
                      var a = root.texts[index];
                      var b = _self.getTextWidth(root.texts[index]);
                      var left = _self.getTextWidth(root.texts[index]) + 15;
                      return left

                      

                  })
                  .attr("dy",function(d){
                      var top = "1.4em";
                      return top;
                  })
                  .text(function(d, c){
                      return d
                  }) 
              }
              

          }, this);
      },
      filter:function(data){
          var info = [];
          var groups = {};
          // var newData = [];
          var drsblx = ['070001','070002','070003','070004','070009','070011','070017','070022','070023']; //单日上榜类型
          var _self = this;
          data.forEach(function(row, index) {
              var id = _self.getTextId();
              var sblxMark = drsblx.indexOf(row.sblx)>-1 ? "dr" : "3r";
              row.sblxMark = sblxMark;
              if (!groups[row.yzmc]){
                  groups[row.yzmc] = {};
                  groups[row.yzmc][row.yyb] = {};
                  groups[row.yzmc][row.yyb][row.gpdm] =  {}  //[sblxMark,id];
                  groups[row.yzmc][row.yyb][row.gpdm][sblxMark] = id 
                  info.push(row)
              }else if(groups[row.yzmc]){
                  if(groups[row.yzmc][row.yyb]){
                      if(groups[row.yzmc][row.yyb][row.gpdm]){ //同一游资 同一营业部 同一股票(当日和3日的数据都只取一条)
                          // if(sblxMark == "3r" && groups[row.yzmc][row.yyb][row.gpdm][sblxMark]== undefined){ //3日 且 没有记录这条数据则记录（只收录一条相同的3日）
                          if(groups[row.yzmc][row.yyb][row.gpdm][sblxMark]== undefined){
                              groups[row.yzmc][row.yyb][row.gpdm] = {} //[sblxMark,id];
                              groups[row.yzmc][row.yyb][row.gpdm][sblxMark] = id 
                              info.push(row)
                          }
                      }else{
                          groups[row.yzmc][row.yyb][row.gpdm] =  {}  
                          groups[row.yzmc][row.yyb][row.gpdm][sblxMark] = id 
                          info.push(row)
                      }
                  }else{
                      groups[row.yzmc][row.yyb] = {};
                      groups[row.yzmc][row.yyb][row.gpdm] =  {}  
                      groups[row.yzmc][row.yyb][row.gpdm][sblxMark] = id 
                      info.push(row)
                  }
              }
          })

          // $.each(info,function(key,row){
          //     if(row.sblx)
          //     newData.push(row)
          // })
         return info;

      },
      group:function(data){
          var totalNum = data.length;
          var leftGroup = [];
          var rightGroup = [];
          var groups = {};
          var info = {};
          var leftLenth = 0;
          
          
          data.forEach(function(row, index) {
              var id = this.getTextId();
              var yybShow = row["yyb"];
              yybShow = yybShow.replace(/(有限责任|股份有限|有限)公司|(证券营业部)/g,"");
              row.yybShow = yybShow
              info[id] = row;
              if (!groups[row.yzmc]){
                  groups[row.yzmc] = {mc:row.yzmc, list:[]}; 
              }
              groups[row.yzmc].list.push(id); 
              
          }.bind(this));
          var keys = Object.keys(groups);
          keys.forEach(function(key){
              var row = groups[key];
              if (leftLenth + row.list.length < totalNum/2){
                  leftLenth += row.list.length;
                  leftGroup.push(row);
              }
              else{
                  rightGroup.push(row);
              }
          })
          this.info = info;
          var maxRows = Math.max( leftLenth, totalNum-leftLenth);
          return [leftGroup, rightGroup, maxRows];

      },

      format:function(data){
          var rects = [];
          var links = [];
          var texts = {};
          var groups = this.group(data);
          var maxRows = groups[2];
          var lineHeight = 25;            
          var padingY = 6;
          var height = maxRows * (lineHeight + padingY) + 20;
          var center = {x:this.width /2, y: height/2};

          var textid = this.getTextId();
          var padingX = 30;
          
          rects.push({left:center.x - 40, top:center.y-lineHeight/2, width:80, height:lineHeight, index:textid, bCenter:1});
          texts[textid] = "龙虎榜";
          groups.forEach(function(group, index){
              var top = 0;
              var flag  = index == 0 ?-1:1;
              var wFlag = index == 0? 1:0; // rect 的left 是否要去除width
              var left = center.x + 40 * flag;
              if (!$.isArray(group)) return;
              group.forEach(function(d){
              
                  var w = 80;
                  var y = top + (d.list.length * (lineHeight + padingY) -padingY)/2 - lineHeight/2;
                  
                  //游资
                  textid = this.getTextId();
                  texts[textid] = d.mc;
                  rects.push({left:left + padingX*flag - w*wFlag , top:y, width:w, height:lineHeight, text:d.mc, index:textid, bCenter:2, code:d.mc});
                  links.push({source:{x:left, y:center.y + lineHeight*0.6 }, target:{x:left + flag*padingX, y: y + lineHeight*1}});
                  var leftPos = left + (w +padingX)  * flag;
                  var point = {x:leftPos, y:y + lineHeight*1}
                  var topPos = top;
                  // var codes = [];
                  var codes = {};
                  d.list.forEach(function(row, index){
                      var info = this.info[row];
                      if (codes[info.gpdm] && codes[info.gpdm][info.sblxMark] == 1) return

                      if(codes[info.gpdm]){
                          codes[info.gpdm][info.sblxMark] = 1;    
                      }else{
                          codes[info.gpdm] = {}
                          codes[info.gpdm][info.sblxMark] = 1;
                      }

                      // 计算相同股票对应的不同的营业部
                      var codeNum = 0;
                      var codeVal = 0;
                      d.list.forEach(function(row1){
                          var info1 = this.info[row1];
                          if (info1.gpdm == info.gpdm && info1.sblxMark == info.sblxMark){
                              codeNum ++ ;
                              var mrje = info1.mrje == null || isNaN(info1.mrje) ? 0:parseFloat(info1.mrje);
                              var mcje = info1.mcje == null || isNaN(info1.mcje) ? 0:parseFloat(info1.mcje);
                           
                              // console.log(mrje);
                              codeVal = codeVal + mrje - mcje;
                          }
                      }.bind(this))
                      
                      // var w1 = 120;
                     
                      
                      var y1 = topPos + (codeNum * (lineHeight + padingY) -padingY)/2 - lineHeight/2
                      // 股票代码
                      var codeRet = this.fmtNum(codeVal);
                      var sblxMark = info.sblxMark == "3r" ? "3日" : ""
                      textid = this.getTextId();
                      texts[textid] = info.gpmc + " " + codeRet["text"];

                      var w1 = this.getRectWidth(texts[textid]);
                      w1 = sblxMark == "3日" ? (w1+20) : w1 ;
                      rects.push({left:leftPos + flag*padingX -w1*wFlag , top:y1, width:w1
                          , height:lineHeight, index:textid, bCenter:3, code:info.gpdm,sc:info.sc, flag:codeRet.flag,mark:sblxMark});
                      links.push({source:{x:point.x, y:point.y}, target:{x:leftPos + flag*padingX, y: y1 + lineHeight*1}});
                      var leftPos1 = leftPos + (w1 + padingX) * flag ;

                      //营业部 
                      
                      d.list.forEach(function(row1){
                          var info1 = this.info[row1];
                          
                          if (info1.gpdm == info.gpdm && info1.sblxMark == info.sblxMark){
                              var mrje = info1.mrje == null || isNaN(info1.mrje) ? 0:parseFloat(info1.mrje);
                              var mcje = info1.mcje == null || isNaN(info1.mcje) ? 0:parseFloat(info1.mcje);
                              var ce = mrje - mcje;
                              var yybRet = this.fmtNum(ce);                               
                              textid = this.getTextId();
                              var yybShow = info1.yybShow + " " + yybRet.text
                              // var yybShow = info1.yybShow;
                              texts[textid] = info1.yybShow;
                              var w2 = this.getRectWidth(yybShow);

                              rects.push({left:leftPos1 + flag*padingX -w2*wFlag, top:topPos, width:w2, height:lineHeight, index:textid, bCenter:4, code:info1.gpdm,gpmc:info1.gpmc,yybRet: yybRet.text});
                              links.push({source:{x:leftPos1  , y:y1 + lineHeight*1}, target:{x:leftPos1 + flag*padingX, y: topPos + lineHeight*1}});                        
                              topPos = topPos + (lineHeight + padingY) ;                                
                          }
                      }.bind(this))                        


                  }.bind(this))
                  top = top + d.list.length * (lineHeight + padingY)
              }.bind(this));
          


          }.bind(this));
          var ret = {rects:rects, links:links, texts:texts, height:height}
          return ret;
          

      },
      fmtNum:function(val){
          var flag = 0;
          var v = "";
          if (!isNaN(val)){
              val = parseFloat(val);
              flag = (val > 0 && 1) || (val < 0 && 2) || 0;
              if (Math.abs(val) > 100000000){
                  v = (val/100000000).toFixed(2) + "亿";
              } 
              else if(Math.abs(val)>10000){
                  v = (val/10000).toFixed(0) + "万";
              }else{
                  v = (val/10000).toFixed(2) + "万";
              }      
          }
          if(flag==1) v="+"+v
          return {flag:flag, text:v}

      },
      diagonal:function(root){
          return function(d){
              var path = d3.path();
              path.moveTo(d.source.x, d.source.y);    
              // path.lineTo(d.target.x, d.target.y);
              // 小于3条的 在一条直线上
              if (root.rects.length < 3){
                  path.lineTo(d.target.x, d.target.y);
              }
              else{
                  //画一条三次贝塞尔曲线段
                  var offset = d.target.x < d.source.x? -10:10;
                  var c1 = {x:(d.target.x + d.source.x) /2 +offset, y:d.source.y}
                  var c2 = {x:(d.target.x + d.source.x) /2 -offset, y:d.target.y}
                  path.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, d.target.x, d.target.y) 
              }
              return path.toString();   
          }
  
      }    
      
  }

  function KeyBox($div,opts){
      this.$div = $div;
      this.opts = {
          onQuery:undefined
      }
      $.extend(true,this.opts,opts);
      this.$input = undefined;
      this.$pop = undefined;
      this.$send = undefined;
      this.$keyboard = undefined;
      this.init();

  }
  KeyBox.prototype = {
      init:function(){
          var self = this;
          var html =  "<div class='search-input-warp'><input id='search' class=''/><span class='search-icon'></span></div>"+
                      "<div class='search-suggess-warp'>"+
                          "<table class='tdx_keyboard_table' style='width:100%'>"+
                              "<thead>"+
                                  "<tr><th width='50%' filed='code'></th><th width='50%' filed='name'></th></tr>"+  
                              "</thead>"+
                              "<tbody></tbody>"+
                          "</table>"+
                      "</div>"
          this.$div.html(html);
          this.$input = this.$div.find("#search");
          this.$send = this.$div.find(".search-icon");
          this.$keyboard = this.$div.find(".tdx_keyboard_table");

          this.$send.unbind("click").bind("click", function(){
              var txt = $.trim(self.$input.val()) || "";
              if (txt){
                  if (self.opts.onQuery){
                      self.opts.onQuery(txt);
                  }
  
              }
          });
          this.$input.unbind("keydown").bind("keydown", function(e){

              switch (e.keyCode) {
                  case 38:
                      self.keyHandleUp();
                      break;
                  case 40:
                      self.keyHandleDown();
                      break;
                  case 13: //enter
                      var text = self.$keyboard.find("tbody tr.keyboard-sel-row td:first-child").text();
                      self.$input.val(text)
                      self.$send.click();
                      break;
                  default:
                      break;


              }
          });

          this.$input.unbind("input propertychange").bind("input propertychange", function(){
              var txt = self.$input.val() || "";
              self.query(txt)                
          });

          this.$keyboard.on("click","tr",function(e){
              if (e && e.stopPropagation) {
                  e.stopPropagation();
              }else {
                  window.event.cancelBubble = true;
              }
              var text = $(this).find("td:first-child").text();
              self.$input.val(text);
              self.$send.click();
          })

          
      },
      query:function(inputVal){ 
          var self = this;   
          CallTQL(function (data) {

              try {
                  data = $.parseJSON(data);
              } catch (e) {
                  return
              }
              if (data.ErrorCode != 0 && data.ErrorInfo == "timeout") {

                  return
              }
              // console.log("gp_KeyboardAngel",data)
              if (!data.ResultSets || data.ResultSets.length == 0) return
              var sCode = data.ResultSets[1].Content[0]
              var arrKeyCode = []
              $.each(data.ResultSets[0].Content, function (k, v) {
                  // if (k < 8)
                      arrKeyCode.push(v[1]+","+v[2]);
              })

              if (sCode == inputVal) {
                  self.createPop(arrKeyCode);

              }
          }, "gp_KeyboardAngel", [1, self.getType(inputVal), inputVal],{reqtype:"cwserv"})
      },
      keyHandleUp:function(){
         
          this.$keyboard.find("tbody")
          if (this.$keyboard.find("tbody").children(":first-child").hasClass("keyboard-sel-row")) {
              this.$keyboard.find("tbody").children(":first-child").removeClass("keyboard-sel-row")
              this.$keyboard.find("tbody").children(":last-child").addClass("keyboard-sel-row")
              
          } else {
              var curI = this.$keyboard.find(".keyboard-sel-row").index();
              this.$keyboard.find("tbody tr").eq(curI).removeClass("keyboard-sel-row")
              this.$keyboard.find("tbody tr").eq(curI - 1).addClass("keyboard-sel-row")
          }
          var text = this.$keyboard.find("tbody tr.keyboard-sel-row td:first-child").text();
          this.$input.val(text)
      },
      keyHandleDown:function(){
          var text = "";
          if (this.$keyboard.find("tbody").children(":last-child").hasClass("keyboard-sel-row")) {
              this.$keyboard.find("tbody").children(":last-child").removeClass("keyboard-sel-row")
              this.$keyboard.find("tbody").children(":first-child").addClass("keyboard-sel-row")
          } else {
              var curI = this.$keyboard.find(".keyboard-sel-row").index();
              this.$keyboard.find("tbody tr").eq(curI).removeClass("keyboard-sel-row")
              this.$keyboard.find("tbody tr").eq(curI + 1).addClass("keyboard-sel-row")
          }
          var text = this.$keyboard.find("tbody tr.keyboard-sel-row td:first-child").text();
          this.$input.val(text)
      },
      createPop:function(arrKey){
          this.$keyboard.show();
          var trHtml = "";
          arrKey.forEach(function(row,i){
              var tds = row.split(",");
              var tdHtml = "";
              var isSel = i == 0 ? "keyboard-sel-row" :"";
              tds.forEach(function(td){
                  tdHtml += "<td>"+td+"</td>"
              })
              trHtml += "<tr class='"+isSel+"'>"+tdHtml+"</tr>"
          })
          this.$keyboard.find("tbody").html(trHtml);
      },
      getType:function(p) {
          if (this.isNum(p)) return 1;//全是数字
          else if (this.isLetter(p)) return 3//全是字母;
          else return 2; 
      },
      //判断字符串是否全为数字
      isNum:function(a) {
          var pattern = /^\d*$/;
          return pattern.test(a);
      },
      //判断字符串是否全为英文字母
      isLetter:function(a) {
          var pattern = /^[A-Za-z]+$/;
          return pattern.test(a);
      }
  }

  function ViewLhb($div,opts){
      this.$div = $div;
      this.opts = {
          rq:date_time,
          initKey:"pt"  //pt jm jg
      }
      $.extend(this.opts,opts);
      this.lhbMx = undefined
      this.init();  
  }
  ViewLhb.prototype = {
      init:function(){
          var self = this;
          var rq = this.opts.rq;
          var layout = "<div class='lhb-head'>"+
                          "<div class='lhb-head-search'></div>"+
                          "<ul class='lhb-head-tab clear'>"+
                              "<li class='lhb-head-tab-item' tdx-lhb-type='pt'>普通</li>"+
                              "<li class='lhb-head-tab-item' tdx-lhb-type='jm'>净买</li>"+
                              "<li class='lhb-head-tab-item' tdx-lhb-type='jg'>机构</li>"+
                          "</ul>"+    
                      "</div>"+
                      "<div class='lhb-body clear'><div class='lhb-body-left'></div><div class='lhb-body-right'></div></div>"
                             
          this.$div.append($(layout));

          this.$div.find("[tdx-lhb-type='"+this.opts.initKey+"']").addClass("active");

          this.getData(this.opts.initKey,rq)


          new KeyBox($(".lhb-head-search"),{
              onQuery:function(code){
                  self.lhbMx.updata(code)
                  jumpStock(code)
              }
          })

          this.$div.find(".lhb-head-tab").on("click","li.lhb-head-tab-item",function(){
              $(this).siblings().removeClass("active");
              $(this).addClass("active");
              var type = $(this).attr("tdx-lhb-type");

              self.getData(type,rq)

          })

      },
      getData:function(type,rq){
          var self = this;
          showLoad()
          CallTQL(function(data){
              data = FormatResult(data);
              // console.log("龙虎榜",data);
              

              if(data.ErrorCode ==0 ){
                  var rows = data.tables[0]["rows"];

                  //当天行情走行情协议
                  /*var now = fmtdate(new Date(),"YYYY-MM-dd");
                  if(rq ==  now){
                      var hqlist = [];
                      rows.forEach(function(val){
                          var code = type == "pt" ? val.scode : val.gpdm
                          hqlist.push({"Code":code,"Setcode":val.sc})
                      })

                      getHq(hqlist,function(hqData){
                          rows.forEach(function(val){
                              var code = val.scode || val.gpdm;
                              val.zdf = hqData[code]["zdf"];
                          })
                          self.draw(type,rows)
                      })

                  }else{*/
                      self.draw(type,rows)
                 // }

              }
             
          },"cfg_fx_yzlhb_lhb",[type,rq,"jmr",1],{reqtype:"cwserv"})  
      },
      draw:function(type,rows){
          hideLoad()
          switch (type){
              case "pt":
                  var d = fmtPtLhbData(rows)
                  this.createPt(d)
              break;
              case "jm":
                  this.createJm(rows)
              break;
              case "jg":
                  this.createJg(rows)
              break;
          }
      },
      createPt:function(data){
          var self = this;
      
          var $left = this.$div.find(".lhb-body-left").empty();
          var $right = this.$div.find(".lhb-body-right").empty();

          var scList = "";
          $.each(data,function(key,row){
              var stockList = ""
              row.list.forEach(function(val,i){
                  var zdf = val.zdf>0 ? "[<span class='stock-zdf color-up'>"+val.zdf+"%</span>]" : "[<span class='stock-zdf color-down'>"+val.zdf+"%</span>]"
                  stockList +="<li class='stock-item' tdx-sc='"+val.sc+"' tdx-gpdm='"+val.scode+"'>"+
                      "<span class='stock-name'>"+val.sname+"</span>"+zdf+"</li>"
                  
              })
              stockList = stockList == "" ? "该市场暂无龙虎榜个股" : stockList;
              scList +=  "<li class='sc-item clear'>"+
                      "<div class='sc-name'><div class=''>"+row.name+":</div></div>"+
                      "<ul class='stock-list clear'>"+stockList+"</ul>"+
                  "</li>"
              
             
          })
          var html =  "<ul class='stock-wrap'>"+scList+"</ul>";
          $left.html(html);
          
          var scListData = data["hs"]["list"].length>0 ? data["hs"]["list"] :
                          (data["sszb"]["list"].length>0 ? data["sszb"]["list"] : 
                          (data["zxb"]["list"].length>0 ? data["zxb"]["list"] : data["cyb"]["list"]))

          if(scListData.length == 0 )  return;

          var code = scListData[0] .scode;

          this.lhbMx = new LhbGgMx($right,{
              code:code,
              bCreateCall:1,
              bLayout:1
          })
          var timer = null;
          $left.find(".stock-list").on("click","li.stock-item",function(){
              var code = $(this).attr("tdx-gpdm");
              var sc = $(this).attr("tdx-sc");
              clearTimeout(timer)
              timer = setTimeout(function(){
                  self.lhbMx.updata(code);
                  jumpStock(code,sc,1)
              },300)
             
          })
          .on("dblclick","li.stock-item",function(){
              
              clearTimeout(timer)
              var code = $(this).attr("tdx-gpdm");
              var sc = $(this).attr("tdx-sc");
              self.lhbMx.updata(code);
              jumpStock(code,sc,2)
          })

      },
      createJm:function(data){
          var self = this;
          var $left = this.$div.find(".lhb-body-left").empty();
          var $right = this.$div.find(".lhb-body-right").empty();

          var cols = [
              {filed:"gpmc",title:"股票名称",sWidth:"84px",align:"left",tdclass:"ft12",fmt:fmtStock},
              {filed:"yzmc",title:"游资",sWidth:"60px",align:"left",tdclass:"ft12",fmt:fmtYz},
              {filed:"zdf",title:"涨幅%",sWidth:"50px",align:"center",tdclass:"ft12",sortFlag:1,sortType:"F",fmt:fmtJmr},
              {filed:"jmr",title:"净买",sWidth:"74px",align:"center",tdclass:"ft12",sortFlag:3,sortType:"F",fmt:fmtJmr},
          ]

          new Table($left,{
              aoColumns:cols,
              data:data,
              bRowStype:2,
              remoteSort:false,
              bfixedHead:1,
              fixedHeadPos:{top:30},
              isDblclick:true,
              onClickCell:function(filed,row){
                  var code = row["gpdm"];
                  var sc = row["sc"];
                  self.lhbMx.updata(code);
                  jumpStock(code,sc,1);

              },
              onDblClickCell:function(filed,row){
                  var code = row["gpdm"];
                  var sc = row["sc"];
                  self.lhbMx.updata(code);
                  jumpStock(code,sc,2);
              }
          })

          var code = data[0]["gpdm"];
          this.lhbMx = new LhbGgMx($right,{
              code:code,
              bCreateCall:1,
              bLayout:1
          })

      },
      createJg:function(data){
          var self = this;
          var $left = this.$div.find(".lhb-body-left").empty();
          var $right = this.$div.find(".lhb-body-right").empty();

          var cols = [
              {filed:"gpmc",title:"股票名称",sWidth:"110px",align:"left",tdclass:"ft12",fmt:fmtStock},
              {filed:"cnt",title:"机构数量",sWidth:"55px",align:"center",tdclass:"ft12",sortFlag:1,sortType:"F"},
              {filed:"zdf",title:"涨幅%",sWidth:"70px",align:"center",tdclass:"ft12",sortFlag:1,sortType:"F",fmt:fmtJmr},
              {filed:"jmr",title:"净买",sWidth:"95px",align:"center",tdclass:"ft12",sortFlag:3,sortType:"F",fmt:fmtJmr},
          ]

          new Table($left,{
              aoColumns:cols,
              data:data,
              bRowStype:2,
              remoteSort:false,
              bfixedHead:1,
              fixedHeadPos:{top:30},
              onClickCell:function(filed,row){
                  var code = row["gpdm"];
                  var sc = row["sc"];
                  self.lhbMx.updata(code);
                  jumpStock(code,sc,1);

              },
              onDblClickCell:function(filed,row){
                  var code = row["gpdm"];
                  var sc = row["sc"];
                  self.lhbMx.updata(code);
                  jumpStock(code,sc,2);

              }
          })

          var code = data[0]["gpdm"];
          this.lhbMx = new LhbGgMx($right,{
              code:code,
              bCreateCall:1,
              bLayout:1
          })
      },
      search:function(){
          var code = $input.val().trim();
          self.lhbMx.updata(code);
      }
     
  }

  /*将字符串转换成date格式*/
  function str2date(str){
      if (!str || str.length < 8) return null;
      if (str.length == 8){
          str = str.substring(0, 4) + "-" + str.substring(4, 6)+  "-" + str.substring(6, 8);
      }
      var e = 'new Date(' + str.replace(/\d+(?=-[^-]+$)/,function (a) { return parseInt(a, 10) - 1; }).replace(/\d+/g,  function(a){return parseInt(a, 10)}).match(/\d+/g) + ')'
  
      var date = eval(e);
      return date;
  }

  function fmtJmr(val,rowData){
      var ret = "--"
      var f = fmtFlt(val); 
      if(f>=0){
          ret = "<span class='color-up'>"+fmtBigData(val)+"</span>"
      }else if(f<0){
          ret =  "<span class='color-down'>"+fmtBigData(val)+"</span>"
      }
      return ret
  }

  /*超过指定长度的字符串则截取部分，否则全部显示*/
  function fmtLongStr(str,maxLen,px){
      var curLen = 0;
      px = parseInt(px.toFixed(0));
      for(var i=0; i<str.length; i++){
          var code = str.charCodeAt(i);
          var pxLen = code > 255 ? px : px/2;
          curLen += pxLen;
          if(curLen > maxLen){
              return str.slice(0,i)+"..."
          }
      }
      return str
  }

  function fmtYz(val,rowData) {  
      var ret = "--"
      if(val)
          ret = fmtLongStr(val,100,12)

      return ret
  }

  function getData(date_time){
      CallTQL(function(data){
          data = FormatResult(data);
          console.log("yzlhb",data)
          hideLoad()
          if (data.ErrorCode != 0)
          {
              showError(1);
              return;
          }
          if (data.tables.length < 1 || !data.tables[0].rows || data.tables[0].rows.length < 1)
          {
              showError(2);
              return;
          } 
          var rows = data.tables[0].rows;
          new View ($("#drawView"), {data:rows, 
              onClick:function(evt){
                  var flag = evt.bCenter;
                  var code = evt.code;
                  var sc = "";
                  var gpmc = "";
                  if(flag==1) return 
                  if(flag==4) gpmc = evt.gpmc;
                  if(flag==3) sc = evt.sc;
                  popDetail(flag,code,gpmc,sc)
              },
              onDbClick:function(evt){
                  if(evt.bCenter == 3){
                      clearTimeout(gtimers);
                      var url = "http://www.baidu.com/direct_"+evt.sc+"#"+evt.code;
                     // window.open(url,"_self");
                  }
              }
          })

      }, "cfg_fx_yzlhb", ['yzlhb', date_time, '', '', "", 0, 20],{reqtype:"cwserv"})
  }

  function popDetail(flag,code,gpmc,sc){
      var url = ""
      var tdxmyietitle = "";
      if(flag==2){ //游资
          tdxmyietitle = "游资组合-"+code
          url = "yzmx.html?flag=yzxq&code="+code+"&color="+color
      }else if(flag==3){ //个股 
          // url = "http://www.baidu.com/breed_"+sc+"#"+code;
          url = "http://www.baidu.com/code_"+code;
        
      }else if(flag==4){  //营业部
          tdxmyietitle = "龙虎榜-"+gpmc
          url = "yzmx.html?flag=yybxq&code="+code+"&color="+color
      }

      if(window.TDXQuery){
          if(flag==3){
              clearTimeout(gtimers);
              gtimers = setTimeout(function(){
                  window.open(url,"_self");
              },300)
             
          }else{
              var locakUrl = window.location.href.split("?")[0]; //避免后面的参数带有/导致URL取错
              var index = locakUrl.lastIndexOf("/");
              locakUrl = locakUrl.substring(0, index)
              var otherUrl = "&myietitle="+myietitle+"&myiewidth=770&myieheight=650"
              var serverUrl = locakUrl+"/"+url+otherUrl;
              var _url =  "http://www.baidu.com/dlg"+serverUrl
              //window.open(_url, "_parent");
          } 
      }else{
          if(flag!=3) window.open(url,"_blank");
         
      }
  }

  function showError(flag){
      var text = flag == 1?"没有龙虎榜数据":"没有龙虎榜数据"
      var s = "<div class='p-hdy-error'>" + text + "</div>";
      $("#drawView").html(s);
  }

  function fmtPtLhbData(rows){
      var d = {
          "hs":{name:"沪主板",list:[]},
          "kcb":{name:"科创板",list:[]},
          "sszb":{name:"深主板",list:[]},
          "zxb":{name:"中小板",list:[]},
          "cyb":{name:"创业板",list:[]}
         
      };
      rows.forEach(function(row,i){
         
          if(/^002/.test(row.scode)){
              d["zxb"]["list"].push(row);  
          }else if(/^0/.test(row.scode)){
              d["sszb"]["list"].push(row);  
          }else if(/^68/.test(row.scode)){
              d["kcb"]["list"].push(row);  
          }else if(/^6/.test(row.scode)){
              d["hs"]["list"].push(row);  
          }else if(/^3/.test(row.scode)){
              d["cyb"]["list"].push(row);  
          }
      })

      return d
  }


  function main(){
      var obj = getUrlParam();
      color = obj["color"]     // == "1"?"c-white":"c-black";
      
      showLoad()
      initView();

      keyboardSearch();

      $(".type_info").on("click","span.type_item",function(){
          var type = $(this).attr("id");
          $(this).siblings().removeClass("active")
          $(this).addClass("active")
          switch (type) {
              case "typeYZ":
                  $("#drawView").show()
                  $("#drawView2").hide()
                  var date_time = $("#date_time").text();
                  getData(date_time);
                  break;
              case "typeLHB":
                  $("#drawView2").show()
                  $("#drawView").hide()
                  initLhb();
                  break;
          }
      })

      $(".drawWrap").scroll(function(){
          var scrollTop = $(".drawWrap")[0].scrollTop
          var $cloneTableHead =  $(".lhb-body-left .grid-head-clone")
           console.log(scrollTop)
           if(scrollTop>54 && $cloneTableHead.length>0){
              $cloneTableHead.show()
           }else{
              $cloneTableHead.hide()
           }
      })
  }

  function initView(){
      
      CallTQL(function(data){
          data = FormatResult(data);
          var date = str2date(data.tables[0].rows[0].rq);
          var date_time = "";
          var date_week = ""
          if(data.ErrorCode==0 && data.tables.length>0){
              date_time = fmtdate(date,"YYYY-MM-dd");
              date_week = fmtdate(date,"W");
          }else{
              date_time =fmtdate(new Date(),"YYYY-MM-dd");
              date_week =fmtdate(new Date(),"W")  
          } 

          if(date_time == fmtdate(new Date(),"YYYY-MM-dd")) $("#markInfo").text("今日已更新,相关数据仅供参考")
          else $("#markInfo").text("相关数据仅供参考")
              
          laydate.render({
              elem: '#date_time',
              format: 'yyyy-MM-dd',
              min: -365,
              max: 0,
              value: date_time,
              showBottom: false,
              done:function(value, date){
                  var date_week = fmtdate(str2date(value),"W");
                  var  flag = $("#drawView2").find(".lhb-head-tab-item.active").attr("tdx-lhb-type");
                  $("#date_week").text("("+date_week+")");
                  getData(value);
                  initLhb(flag);
              }
          });

          $("#date_week").text("("+date_week+")");
          getData(date_time);
          
      }, "cfg_fx_yzlhb", ['rq', '', '', '', "", 0, 20],{reqtype:"cwserv"})

       /***点击除目标div区域 目标div影藏**/
      $(document).bind("click", function (e) {
          $('.tdx_keyboard_table').hide()
      })
  }

  function initLhb(flag){
      var date_time = $("#date_time").text();
      flag = flag == undefined ? "pt" : flag;
      $("#drawView2").empty();

      new ViewLhb($("#drawView2"),{
          rq:date_time,
          initKey:flag
      })
  }

  function keyboardSearch(){
      $("#searchIcon").bind("click",function(){
          var txt = $("#search").val() || "";
          if(txt == "") return

          var scode = $("#searchSuggUl").find(".sel_item").attr("tdx-key");
          var type = $("#searchSuggUl").find(".sel_item").attr("tdx-type");
          var txt = $("#searchSuggUl").find(".sel_item").text();
          $("#search").val(txt);
          $("#searchSuggUl").hide()
          var flag = type == "1" ? 2 : 4;
          popDetail(flag,scode,txt)
      })
      $("#search").bind('keydown', function(e){
          if (e.keyCode == 13) {	// 回车
              e.preventDefault();
              $("#searchIcon").trigger("click")

          }
      });

      $("#searchSuggUl").on("click","li.search-sugg-item",function(){
          $("#searchSuggUl li.search-sugg-item").removeClass("sel_item");
          $(this).addClass("sel_item");
          $("#searchIcon").trigger("click")

      })
      
      $("#search").bind("input propertychange",function(){
          var input = $(this).val().trim();
          if(input == "") return;

          CallTQL(function(data){
              data = FormatResult(data);
              if(data.ErrorCode != 0 || data.tables.length < 1 || !data.tables[0].rows || data.tables[0].rows.length < 1) return

              var rows = data.tables[0].rows;
              var lis = "";
              rows.forEach(function(row,i){
                  var curcls = i == 0 ? "sel_item": "";
                  lis += "<li class='search-sugg-item "+curcls+"' tdx-type='"+row.type+"' tdx-key='"+row.scode+"'>"+row.sname+"</li>";
              })
              $(".search-sugg-ul").html(lis).show();

          },"cfg_fx_yzlhb_search",[input],{reqtype:"cwserv"})

          
      })
      $("#search").bind('keydown', function(e){
          if (e.keyCode == 13) {	// 回车
              e.preventDefault();
              $("#searchIcon").trigger("click")

          } else if (e.keyCode == 38) {	// 上
              if ($("#searchSuggUl").children(":first-child").hasClass("sel_item")) {
                  $("#searchSuggUl").children(":first-child").removeClass("sel_item")
                  $("#searchSuggUl").children(":last-child").addClass("sel_item")
              } else {
                  var curI = $("#searchSuggUl").find(".sel_item").index();
                  $("#searchSuggUl").find(".search-sugg-item").eq(curI).removeClass("sel_item")
                  $("#searchSuggUl").find(".search-sugg-item").eq(curI - 1).addClass("sel_item")
              }
          } else if (e.keyCode == 40) { //下
              if ($("#searchSuggUl").children(":last-child").hasClass("sel_item")) {
                  $("#searchSuggUl").children(":last-child").removeClass("sel_item")
                  $("#searchSuggUl").children(":first-child").addClass("sel_item")
              } else {
                  var curI = $("#searchSuggUl").find(".sel_item").index();
                  $("#searchSuggUl").find(".search-sugg-item").eq(curI).removeClass("sel_item")
                  $("#searchSuggUl").find(".search-sugg-item").eq(curI + 1).addClass("sel_item")
              }
          }
      });
  }

  

  $(function(){
      main();
  })



})()


