var s=Number.isNaN||function(r){return typeof r=="number"&&r!==r};function f(t,r){return!!(t===r||s(t)&&s(r))}function i(t,r){if(t.length!==r.length)return!1;for(var e=0;e<t.length;e++)if(!f(t[e],r[e]))return!1;return!0}function o(t,r){r===void 0&&(r=i);var e=null;function a(){for(var n=[],u=0;u<arguments.length;u++)n[u]=arguments[u];if(e&&e.lastThis===this&&r(n,e.lastArgs))return e.lastResult;var l=t.apply(this,n);return e={lastResult:l,lastArgs:n,lastThis:this},l}return a.clear=function(){e=null},a}export{o as m};
