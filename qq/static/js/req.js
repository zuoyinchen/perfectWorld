var WEBSITE = {
  protocol: "",
  host: "",
  baseurl: "",
  path: "/zdweb/test/xueqiu/",
  url: "",
  filepath: "",
  fileurl: "",
  filename: "",
  filedir: "",
  init: function() {
      this.protocol = window.location.protocol.toLowerCase();
      this.host = window.location.host.toLowerCase();
      this.baseurl = this.protocol + "//" + this.host + "/";
      this.url = this.baseurl + this.path.substr(1);
      this.filepath = window.location.pathname.replace(/\\/g, "/").toLowerCase();
      this.filename = this.filepath.replace(/(.+)[\\/] / ,
      "");
      this.fileurl = this.baseurl + this.filepath.substr(1);
      this.filedir = this.fileurl.substring(0, this.fileurl.lastIndexOf("/") + 1)
  }
};
WEBSITE.init();
var _callFuncDict = {};
var platform = "pc";
function IsWebPlatform() {
  return platform == "bs"
}
function IsPcPlatform() {
  return platform == "pc"
}
function IsLocalPcPlatform() {
  return platform == "localpc"
}
function IsAndPlatform() {
  return platform == "and"
}
function IsIosPlatform() {
  return platform == "ios"
}
var CALLTQL_CONFIG = {
  url: WEBSITE.baseurl,
  dataType: "text",
  type: "POST",
  callType: "external",
  timeout: 20000,
  CilentSpecifiedKey: ""
};
function URLParam(a) {
  var b = new RegExp("(^|&)" + a + "=([^&]*)(&|$)", "i");
  var d = unescape(window.location.search);
  var c = d.substr(1).match(b);
  if (c != null) {
      return unescape(c[2])
  }
  return null
}
function ParseParmStr(a) {
  var c = new Object();
  strs = a.split("&");
  for (var b = 0; b < strs.length; b++) {
      c[strs[b].split("=")[0]] = strs[b].split("=")[1]
  }
  return c
}
function Auto_Get_Platform() {
  platform = "pc";
  if (window.location.href.indexOf("http") == 0) {
      platform = "bs"
  }
  var a = decodeURI(window.location.search.substr(1));
  var b = ParseParmStr(a);
  var d = b.ispc;
  if (d == "1") {
      platform = "pc"
  }
  var c = navigator.userAgent.toLowerCase();
  if (c.indexOf("ipod") != -1 || c.indexOf("iphone") != -1 || c.indexOf("ipad") != -1) {
      platform = "ios"
  } else {
      if (c.indexOf("android") != -1) {
          platform = "and"
      }
  }
}
function Auto_Set_Req() {
  if (IsWebPlatform() || window.location.href.indexOf("http") == 0) {
//        CALLTQL_CONFIG.callType = "ajax";
//        if (window.location.href.indexOf("/site/") > 0) {
          CALLTQL_CONFIG.callType = "tp_ajax"
//        }
      CALLTQL_CONFIG.url = window.location.protocol + "//" + "zero/yzlhb" + "/"
  } else {
      if (IsPcPlatform()) {
          CALLTQL_CONFIG.callType = "external"
      } else {
          if (IsIosPlatform()) {
              CALLTQL_CONFIG.callType = "ios_external"
          } else {
              if (IsAndPlatform()) {
                  CALLTQL_CONFIG.callType = "and_external"
              }
          }
      }
  }
}
Auto_Get_Platform();
Auto_Set_Req();

var userSignCookie = $.cookie('zero_user_sign_cookie');
function CallTQL(m, j, d, c) {
Fingerprint2.get(function(components) {
    var murmur = Fingerprint2.x64hash128(components.map(function (pair) { return pair.value }).join(), 31)
    c = c == undefined ? {}: c;
    var g = $.extend(true, {},
    CALLTQL_CONFIG);
    if (c != undefined && c != "" && c != null) {
        $.each(c,
        function(e, n) {
            g[e] = n
        })
    }
    var a = Fun_Name(m);
    var f = "CWServ.SecuInfo";
    if (typeof(d) == "string") {
        f = j
    } else {
        if (j) {
            if (j.substring(0, 6).toUpperCase() == "TDXSJ_" || j.substring(0, 7).toUpperCase() == "TDXF10_" || j.substring(0, 8).toUpperCase() == "TDXBF10_" || j.substring(0, 10).toUpperCase() == "PCWEBCALL_") {
                g.reqtype = "cwserv"
            }
        }
        if (g.hasOwnProperty("reqtype") && g.reqtype == "cwserv") {
            f = "CWServ." + j;
            d = FormatParams(d);
            d = "{" + d;
            if (g.CilentSpecifiedKey) {
                d += ',"CilentSpecifiedKey":"' + g.CilentSpecifiedKey + '"'
            }
            if (g.secuparse == "true") {
                d += ',"secuparse":"true"'
            }
            d += "}"
        } else {
            d = FormatParams(d);
            d = '{"CallName":"' + j + '",' + d;
            if (g.CilentSpecifiedKey) {
                d += ',"CilentSpecifiedKey":"' + g.CilentSpecifiedKey + '"'
            }
            if (g.secuparse == "true") {
                d += ',"secuparse":"true"'
            }
            d += "}"
        }
    }
    if (g.callType == "ajax") {
        $.ajax({
            url: g.url + "/zero/yzlhb/Exec?" + getRnd(),
            type: g.type,
            dataType: g.dataType,
            data: {
                funcid: f,
                bodystr: d,
                timeout: g.timeout
            },
            jsonp: "callback",
            timeout: g.timeout,
            success: function(n, o, e) {
                if (o == "success") {
                    if (n.indexOf("success|") === 0) {
                        n = n.substr(8);
                        m(n)
                    } else {
                        alert("请求发生错误！" + n)
                    }
                }
            },
            error: function(o, e, n) {
                if (e == "timeout") {
                    m('{"ErrorCode":1, "ErrorInfo":"timeout"}')
                }
            }
        })
    } else {
        if (g.callType == "tp_ajax") {
            var b = (c || {})["callFunc"];
            if (b) {
                f = b
            }
            $.ajax({
                url: "/zero/yzlhb/params?entry=" + f,
                type: g.type,
                contentType: 'application/json',
                dataType: "json",
                data: d + "&sign=" + murmur.toUpperCase() + "&order=" + userSignCookie,
                jsonp: "callback",
                timeout: g.timeout,
                success: function(e) {
                  if(e.code == 1) {
                    m(e.data.lhb);
                    if(-1 == e.data.vipDay) {
                      if(null != e.data.vipMsg) {
                        alert(e.data.vipMsg);
                      }
                    } else {
                      $('#vipDay').text(e.data.vipDay);
                    }
                  } else {
                    $('#pay').css("display","");
                    $('#trend').css("display","none");
                    alert(e.msg);
                  }
                },
                error: function(o, e, n) {
                    if (e == "timeout") {
                        m('{"ErrorCode":1, "ErrorInfo":"timeout"}')
                    } else {
                        m('{"ErrorCode":1, "ErrorInfo":"error"}')
                    }
                }
            })
        } else {
            if (g.callType == "external") {
                try {
                    window.external.CallTQL(a, f, d)
                } catch(i) {
                    alert("此JS平台不支持window.external.CallTQL方法。\r\n\r\n错误提示：" + i.message)
                }
            } else {
                if (g.callType == "and_external") {
                    var l = getRnd() + "_" + a;
                    _callFuncDict[l] = m;
                    var k = "HQSession";
                    if (c && c.SendSession && c.SendSession.length > 0) {
                        k = c.SendSession
                    }
                    var h = '{"SendSession":"' + k + '"}';
                    window.tdx_java.TdxSendData(f, d, h, "Get_Android", l)
                } else {
                    if (g.callType == "ios_external") {
                        var l = getRnd() + "_" + a;
                        _callFuncDict[l] = m;
                        var k = "HQSession";
                        if (c.SendSession && c.SendSession.length > 0) {
                            k = c.SendSession
                        }
                        d = '{"SessionType":"' + k + '","TQLParam":' + d + "}";
                        IOS_Bridge.call("CallTQL", d, f, l, "Get_Ios")
                    } else {
                        if (g.callType == "zxdialog") {
                            try {
                                window.external.CallTQL_IE(Fun_Name(m), f, d)
                            } catch(i) {
                                alert("此JS平台不支持window.external.CallTQL_IE方法。\r\n\r\n错误提示：" + i.message)
                            }
                        } else {
                            alert("不支持的JS调用类型：" + g.callType)
                        }
                    }
                }
            }
        }
    }
})
}
function getRnd() {
  return parseInt(Math.random() * 10000) + "=" + parseInt(Math.random() * 10000)
}
function getRuntime() {
  var c = new Date();
  var b = "";
  var f = c.getFullYear();
  var h = c.getMonth() + 1;
  var g = c.getDate();
  var a = c.getHours();
  var d = c.getMinutes();
  var e = c.getSeconds();
  b = f + "-" + h + "-" + g + " " + a + ":" + d + ":" + e;
  return b
}
function Fun_Name(a) {
  var b = a.toString();
  var c = /function\s*(\w*)/i;
  var d = c.exec(b);
  return d[1]
}
function FormatParams(d) {
  var c = "";
  c += '"Params":[';
  var b = "";
  for (var a = 0; a < d.length; a++) {
      if (typeof(d[a]) == "string") {
          b += ',"' + d[a] + '"'
      } else {
          if (typeof(d[a]) == "number") {
              b += "," + d[a]
          } else {
              alert("非法的参数！");
              break
          }
      }
  }
  if (b != "") {
      b = b.substr(1)
  }
  c += b;
  c += "]";
  return c
}
function FormatResult(f) {
  try {
      if (IsAndPlatform() || IsIosPlatform()) {
          f = f.replace(/\r\n/ig, "<br>")
      }
      var l = $.parseJSON(f)
  } catch(h) {}
  var m = {};
  m.ErrorCode = l.ErrorCode;
  if (m.ErrorCode != 0) {
      m.ErrorInfo = l.ErrorInfo;
      return m
  }
  m.CilentSpecifiedKey = l.CilentSpecifiedKey;
  m.tables = [];
  for (var g = 0; g < l.ResultSets.length; g++) {
      var a = [];
      if (typeof l.ResultSets[g].ColName !== "undefined") {
          for (var c = 0; c < l.ResultSets[g].ColName.length; c++) {
              a.push({
                  Name: l.ResultSets[g].ColName[c]
              })
          }
      } else {
          a = l.ResultSets[g].ColDes
      }
      if (a[0].Name == "total") {
          if (g - 1 >= 0) {
              m.tables[g - 1].total = l.ResultSets[g].Content[0][0]
          }
      }
      m.tables[g] = {};
      m.tables[g].total = "";
      m.tables[g].rows = [];
      var n = l.ResultSets[g].Content;
      for (var c = 0; c < n.length; c++) {
          m.tables[g].rows[c] = {};
          for (var b = 0; b < a.length; b++) {
              m.tables[g].rows[c][a[b].Name] = n[c][b]
          }
      }
  }
  return m
}
var IOS_Bridge = {
  callbacksCount: 1,
  callbacks: {},
  resultForCallback: function resultForCallback(b, a) {
      try {
          var d = IOS_Bridge.callbacks[b];
          if (!d) {
              return
          }
          d.apply(null, a)
      } catch(c) {
          alert(c)
      }
  },
  call: function call(f, a, g, c, h) {
      var e = h && typeof h == "function";
      var d = e ? IOS_Bridge.callbacksCount++:0;
      if (e) {
          IOS_Bridge.callbacks[d] = h
      }
      var b = document.createElement("IFRAME");
      if (f == "Get_Ret") {
          b.setAttribute("src", "js-frame:" + f + ";;" + d + ";;" + c + ";;" + g + ";;" + a + ";;" + h + ";;")
      } else {
          b.setAttribute("src", "tdx-frame:" + f + ";;" + c + ";;" + g + ";;" + a + ";;" + h)
      }
      document.documentElement.appendChild(b);
      b.parentNode.removeChild(b);
      b = null
  }
};
function Get_Ios(e, d, b, c, a) {
  if (_callFuncDict.hasOwnProperty(e)) {
      var f = _callFuncDict[e];
      _callFuncDict[e] = undefined;
      delete _callFuncDict[e];
      f(c)
  }
}
function Get_Android(d, c, a, b) {
  if (_callFuncDict.hasOwnProperty(d)) {
      var e = _callFuncDict[d];
      _callFuncDict[d] = undefined;
      delete _callFuncDict[d];
      e(b)
  }
};