import"./hoist-non-react-statics-DUIF_pJT.js";import{R as T,r as m}from"./react-CiCIRML4.js";import{s as S,c as U,m as Y,a as Z,r as Q,d as ee,b as re,R as te,e as ne,K as ae,f as w,g as o,W as c,D as se,n as F,t as D,h as ie,p as O,i as ce,j as oe,k as b,M as l,l as k,o as N,q as E,u as fe,v as ue,w as G}from"./stylis-YPZU7XtI.js";var de=!1;function le(e){if(e.sheet)return e.sheet;for(var r=0;r<document.styleSheets.length;r++)if(document.styleSheets[r].ownerNode===e)return document.styleSheets[r]}function he(e){var r=document.createElement("style");return r.setAttribute("data-emotion",e.key),e.nonce!==void 0&&r.setAttribute("nonce",e.nonce),r.appendChild(document.createTextNode("")),r.setAttribute("data-s",""),r}var me=function(){function e(t){var n=this;this._insertTag=function(a){var s;n.tags.length===0?n.insertionPoint?s=n.insertionPoint.nextSibling:n.prepend?s=n.container.firstChild:s=n.before:s=n.tags[n.tags.length-1].nextSibling,n.container.insertBefore(a,s),n.tags.push(a)},this.isSpeedy=t.speedy===void 0?!de:t.speedy,this.tags=[],this.ctr=0,this.nonce=t.nonce,this.key=t.key,this.container=t.container,this.prepend=t.prepend,this.insertionPoint=t.insertionPoint,this.before=null}var r=e.prototype;return r.hydrate=function(n){n.forEach(this._insertTag)},r.insert=function(n){this.ctr%(this.isSpeedy?65e3:1)===0&&this._insertTag(he(this));var a=this.tags[this.tags.length-1];if(this.isSpeedy){var s=le(a);try{s.insertRule(n,s.cssRules.length)}catch{}}else a.appendChild(document.createTextNode(n));this.ctr++},r.flush=function(){this.tags.forEach(function(n){var a;return(a=n.parentNode)==null?void 0:a.removeChild(n)}),this.tags=[],this.ctr=0},e}();function pe(e){var r=Object.create(null);return function(t){return r[t]===void 0&&(r[t]=e(t)),r[t]}}var ye=function(r,t,n){for(var a=0,s=0;a=s,s=O(),a===38&&s===12&&(t[n]=1),!D(s);)F();return ue(r,G)},ge=function(r,t){var n=-1,a=44;do switch(D(a)){case 0:a===38&&O()===12&&(t[n]=1),r[n]+=ye(G-1,t,n);break;case 2:r[n]+=ce(a);break;case 4:if(a===44){r[++n]=O()===58?"&\f":"",t[n]=r[n].length;break}default:r[n]+=ie(a)}while(a=F());return r},xe=function(r,t){return ee(ge(re(r),t))},I=new WeakMap,be=function(r){if(!(r.type!=="rule"||!r.parent||r.length<1)){for(var t=r.value,n=r.parent,a=r.column===n.column&&r.line===n.line;n.type!=="rule";)if(n=n.parent,!n)return;if(!(r.props.length===1&&t.charCodeAt(0)!==58&&!I.get(n))&&!a){I.set(r,!0);for(var s=[],i=xe(t,s),u=n.props,f=0,d=0;f<i.length;f++)for(var h=0;h<u.length;h++,d++)r.props[d]=s[f]?i[f].replace(/&\f/g,u[h]):u[h]+" "+i[f]}}},we=function(r){if(r.type==="decl"){var t=r.value;t.charCodeAt(0)===108&&t.charCodeAt(2)===98&&(r.return="",r.value="")}};function J(e,r){switch(oe(e,r)){case 5103:return c+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return c+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return c+e+E+e+l+e+e;case 6828:case 4268:return c+e+l+e+e;case 6165:return c+e+l+"flex-"+e+e;case 5187:return c+e+o(e,/(\w+).+(:[^]+)/,c+"box-$1$2"+l+"flex-$1$2")+e;case 5443:return c+e+l+"flex-item-"+o(e,/flex-|-self/,"")+e;case 4675:return c+e+l+"flex-line-pack"+o(e,/align-content|flex-|-self/,"")+e;case 5548:return c+e+l+o(e,"shrink","negative")+e;case 5292:return c+e+l+o(e,"basis","preferred-size")+e;case 6060:return c+"box-"+o(e,"-grow","")+c+e+l+o(e,"grow","positive")+e;case 4554:return c+o(e,/([^-])(transform)/g,"$1"+c+"$2")+e;case 6187:return o(o(o(e,/(zoom-|grab)/,c+"$1"),/(image-set)/,c+"$1"),e,"")+e;case 5495:case 3959:return o(e,/(image-set\([^]*)/,c+"$1$`$1");case 4968:return o(o(e,/(.+:)(flex-)?(.*)/,c+"box-pack:$3"+l+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+c+e+e;case 4095:case 3583:case 4068:case 2532:return o(e,/(.+)-inline(.+)/,c+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(k(e)-1-r>6)switch(b(e,r+1)){case 109:if(b(e,r+4)!==45)break;case 102:return o(e,/(.+:)(.+)-([^]+)/,"$1"+c+"$2-$3$1"+E+(b(e,r+3)==108?"$3":"$2-$3"))+e;case 115:return~N(e,"stretch")?J(o(e,"stretch","fill-available"),r)+e:e}break;case 4949:if(b(e,r+1)!==115)break;case 6444:switch(b(e,k(e)-3-(~N(e,"!important")&&10))){case 107:return o(e,":",":"+c)+e;case 101:return o(e,/(.+:)([^;!]+)(;|!.+)?/,"$1"+c+(b(e,14)===45?"inline-":"")+"box$3$1"+c+"$2$3$1"+l+"$2box$3")+e}break;case 5936:switch(b(e,r+11)){case 114:return c+e+l+o(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return c+e+l+o(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return c+e+l+o(e,/[svh]\w+-[tblr]{2}/,"lr")+e}return c+e+l+e+e}return e}var ve=function(r,t,n,a){if(r.length>-1&&!r.return)switch(r.type){case se:r.return=J(r.value,r.length);break;case ae:return S([w(r,{value:o(r.value,"@","@"+c)})],a);case te:if(r.length)return ne(r.props,function(s){switch(fe(s,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return S([w(r,{props:[o(s,/:(read-\w+)/,":"+E+"$1")]})],a);case"::placeholder":return S([w(r,{props:[o(s,/:(plac\w+)/,":"+c+"input-$1")]}),w(r,{props:[o(s,/:(plac\w+)/,":"+E+"$1")]}),w(r,{props:[o(s,/:(plac\w+)/,l+"input-$1")]})],a)}return""})}},Se=[ve],Ee=function(r){var t=r.key;if(t==="css"){var n=document.querySelectorAll("style[data-emotion]:not([data-s])");Array.prototype.forEach.call(n,function(p){var g=p.getAttribute("data-emotion");g.indexOf(" ")!==-1&&(document.head.appendChild(p),p.setAttribute("data-s",""))})}var a=r.stylisPlugins||Se,s={},i,u=[];i=r.container||document.head,Array.prototype.forEach.call(document.querySelectorAll('style[data-emotion^="'+t+' "]'),function(p){for(var g=p.getAttribute("data-emotion").split(" "),x=1;x<g.length;x++)s[g[x]]=!0;u.push(p)});var f,d=[be,we];{var h,C=[Z,Q(function(p){h.insert(p)})],q=Y(d.concat(a,C)),z=function(g){return S(U(g),q)};f=function(g,x,B,H){h=B,z(g?g+"{"+x.styles+"}":x.styles),H&&($.inserted[x.name]=!0)}}var $={key:t,sheet:new me({key:t,container:i,nonce:r.nonce,speedy:r.speedy,prepend:r.prepend,insertionPoint:r.insertionPoint}),nonce:r.nonce,inserted:s,registered:{},insert:f};return $.sheet.hydrate(u),$},Ce=!0;function $e(e,r,t){var n="";return t.split(" ").forEach(function(a){e[a]!==void 0?r.push(e[a]+";"):a&&(n+=a+" ")}),n}var K=function(r,t,n){var a=r.key+"-"+t.name;(n===!1||Ce===!1)&&r.registered[a]===void 0&&(r.registered[a]=t.styles)},Ae=function(r,t,n){K(r,t,n);var a=r.key+"-"+t.name;if(r.inserted[t.name]===void 0){var s=t;do r.insert(t===s?"."+a:"",s,r.sheet,!0),s=s.next;while(s!==void 0)}};function Oe(e){for(var r=0,t,n=0,a=e.length;a>=4;++n,a-=4)t=e.charCodeAt(n)&255|(e.charCodeAt(++n)&255)<<8|(e.charCodeAt(++n)&255)<<16|(e.charCodeAt(++n)&255)<<24,t=(t&65535)*1540483477+((t>>>16)*59797<<16),t^=t>>>24,r=(t&65535)*1540483477+((t>>>16)*59797<<16)^(r&65535)*1540483477+((r>>>16)*59797<<16);switch(a){case 3:r^=(e.charCodeAt(n+2)&255)<<16;case 2:r^=(e.charCodeAt(n+1)&255)<<8;case 1:r^=e.charCodeAt(n)&255,r=(r&65535)*1540483477+((r>>>16)*59797<<16)}return r^=r>>>13,r=(r&65535)*1540483477+((r>>>16)*59797<<16),((r^r>>>15)>>>0).toString(36)}var Re={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,scale:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},Pe=!1,Te=/[A-Z]|^ms/g,ke=/_EMO_([^_]+?)_([^]*?)_EMO_/g,V=function(r){return r.charCodeAt(1)===45},_=function(r){return r!=null&&typeof r!="boolean"},A=pe(function(e){return V(e)?e:e.replace(Te,"-$&").toLowerCase()}),M=function(r,t){switch(r){case"animation":case"animationName":if(typeof t=="string")return t.replace(ke,function(n,a,s){return y={name:a,styles:s,next:y},a})}return Re[r]!==1&&!V(r)&&typeof t=="number"&&t!==0?t+"px":t},Ne="Component selectors can only be used in conjunction with @emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware compiler transform.";function v(e,r,t){if(t==null)return"";var n=t;if(n.__emotion_styles!==void 0)return n;switch(typeof t){case"boolean":return"";case"object":{var a=t;if(a.anim===1)return y={name:a.name,styles:a.styles,next:y},a.name;var s=t;if(s.styles!==void 0){var i=s.next;if(i!==void 0)for(;i!==void 0;)y={name:i.name,styles:i.styles,next:y},i=i.next;var u=s.styles+";";return u}return Ie(e,r,t)}case"function":{if(e!==void 0){var f=y,d=t(e);return y=f,v(e,r,d)}break}}var h=t;return h}function Ie(e,r,t){var n="";if(Array.isArray(t))for(var a=0;a<t.length;a++)n+=v(e,r,t[a])+";";else for(var s in t){var i=t[s];if(typeof i!="object"){var u=i;_(u)&&(n+=A(s)+":"+M(s,u)+";")}else{if(s==="NO_COMPONENT_SELECTOR"&&Pe)throw new Error(Ne);if(Array.isArray(i)&&typeof i[0]=="string"&&r==null)for(var f=0;f<i.length;f++)_(i[f])&&(n+=A(s)+":"+M(s,i[f])+";");else{var d=v(e,r,i);switch(s){case"animation":case"animationName":{n+=A(s)+":"+d+";";break}default:n+=s+"{"+d+"}"}}}}return n}var W=/label:\s*([^\s;{]+)\s*(;|$)/g,y;function X(e,r,t){if(e.length===1&&typeof e[0]=="object"&&e[0]!==null&&e[0].styles!==void 0)return e[0];var n=!0,a="";y=void 0;var s=e[0];if(s==null||s.raw===void 0)n=!1,a+=v(t,r,s);else{var i=s;a+=i[0]}for(var u=1;u<e.length;u++)if(a+=v(t,r,e[u]),n){var f=s;a+=f[u]}W.lastIndex=0;for(var d="",h;(h=W.exec(a))!==null;)d+="-"+h[1];var C=Oe(a)+d;return{name:C,styles:a,next:y}}var _e=function(r){return r()},Me=T.useInsertionEffect?T.useInsertionEffect:!1,We=Me||_e,Le=!1,j=m.createContext(typeof HTMLElement<"u"?Ee({key:"css"}):null);j.Provider;var Fe=function(r){return m.forwardRef(function(t,n){var a=m.useContext(j);return r(t,a,n)})},De=m.createContext({}),P={}.hasOwnProperty,R="__EMOTION_TYPE_PLEASE_DO_NOT_USE__",Ge=function(r,t){var n={};for(var a in t)P.call(t,a)&&(n[a]=t[a]);return n[R]=r,n},Je=function(r){var t=r.cache,n=r.serialized,a=r.isStringTag;return K(t,n,a),We(function(){return Ae(t,n,a)}),null},Ke=Fe(function(e,r,t){var n=e.css;typeof n=="string"&&r.registered[n]!==void 0&&(n=r.registered[n]);var a=e[R],s=[n],i="";typeof e.className=="string"?i=$e(r.registered,s,e.className):e.className!=null&&(i=e.className+" ");var u=X(s,void 0,m.useContext(De));i+=r.key+"-"+u.name;var f={};for(var d in e)P.call(e,d)&&d!=="css"&&d!==R&&!Le&&(f[d]=e[d]);return f.className=i,t&&(f.ref=t),m.createElement(m.Fragment,null,m.createElement(Je,{cache:r,serialized:u,isStringTag:typeof a=="string"}),m.createElement(a,f))}),Ve=Ke,L=function(r,t){var n=arguments;if(t==null||!P.call(t,"css"))return m.createElement.apply(void 0,n);var a=n.length,s=new Array(a);s[0]=Ve,s[1]=Ge(r,t);for(var i=2;i<a;i++)s[i]=n[i];return m.createElement.apply(null,s)};(function(e){var r;r||(r=e.JSX||(e.JSX={}))})(L||(L={}));function Xe(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];return X(r)}function Be(){var e=Xe.apply(void 0,arguments),r="animation-"+e.name;return{name:r,styles:"@keyframes "+r+"{"+e.styles+"}",anim:1,toString:function(){return"_EMO_"+this.name+"_"+this.styles+"_EMO_"}}}export{Xe as c,L as j,Be as k};