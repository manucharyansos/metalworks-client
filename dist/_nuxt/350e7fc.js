(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{452:function(t,e,r){"use strict";r.r(e);r(246),r(23),r(11),r(39),r(77),r(78),r(50);var n=r(34),o=(r(33),r(54),r(80),r(247),r(97),r(26),r(44),r(79));function c(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function l(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?c(Object(r),!0).forEach((function(e){Object(n.a)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var f={layout:"EngineerLayout",middleware:["admin","roleRedirect"],data:function(){return{selectedFactory:null,factoryFiles:[]}},computed:l(l({},Object(o.c)("factoryFiles",["getFactoryFiles"])),Object(o.c)("factory",["getFactory"])),mounted:function(){this.fetchFactory()},methods:l(l(l({},Object(o.b)("factoryFiles",["createFactoryFiles"])),Object(o.b)("factory",["fetchFactory"])),{},{handleFileUpload:function(t){var e=this,r=Array.from(t.target.files);if(this.selectedFactory){var n=this.factoryFiles.find((function(t){return t.id===e.selectedFactory.id}));n?r.forEach((function(t){n.files.some((function(e){return e.name===t.name}))?e.$notify({text:'File "'.concat(t.name,'" is already added to the factory.'),type:"error"}):n.files.push(t)})):this.factoryFiles.push({id:this.selectedFactory.id,name:this.selectedFactory.name,files:r})}else this.$notify({text:"Please select a factory first",type:"error"})},addFactory:function(t){var e=t.id;this.stepperData.some((function(t){return t.id===e}))?this.stepperData=this.stepperData.filter((function(t){return t.id!==e})):this.stepperData.push(t)},addFileForFactory:function(t){var e=this;if(this.selectedFactory){var r=this.factoryFiles.find((function(t){return t.id===e.selectedFactory.id}));r?r.files.includes(t)?this.$notify({text:"This file is already added to the factory",type:"error"}):r.files.push(t):this.factoryFiles.push({id:this.selectedFactory.id,name:this.selectedFactory.name,files:[t]})}else this.$notify({text:"Please select a factory first",type:"error"})},addFiles:function(){var t=this,e=new FormData,r=this.factoryFiles.find((function(e){return e.id===t.selectedFactory.id}));r||(r={id:this.selectedFactory.id,name:this.selectedFactory.name,files:[]},this.factoryFiles.push(r)),r.files.forEach((function(t){t.path&&t.original_name?(e.append("files[]",t.path),e.append("original_name[]",t.original_name)):e.append("files[]",t)})),e.has("files[]")?(e.append("factory_id",this.selectedFactory.id),e.append("order_id",this.getOrder.id),this.createFactoryFiles(e)):this.$notify({text:"Please add at least one file.",type:"error"})},removeFileFromFactory:function(t,e){var r=this.factoryFiles.find((function(e){return e.id===t}));if(r){var n=r.files.indexOf(e);-1!==n&&r.files.splice(n,1)}},selectFactoryForFiles:function(t){this.selectedFactory&&this.selectedFactory.id===t.id?this.selectedFactory=null:this.selectedFactory=t}})},d=r(15),component=Object(d.a)(f,(function(){var t=this,e=t._self._c;return e("div",[e("h1",{staticClass:"text-2xl text-center font-sans italic w-full my-6"},[t._v("\n    Ստեղծել նոր պատվեր\n  ")]),t._v(" "),e("div",[e("label",{staticClass:"block text-sm font-medium text-gray-900 dark:text-white",attrs:{for:"file"}},[t._v("File")]),t._v(" "),e("input",{staticClass:"block w-full mt-1",attrs:{type:"file",multiple:""},on:{change:t.handleFileUpload}}),t._v(" "),e("div",{staticClass:"flex flex-col"},[e("div",{staticClass:"flex flex-row items-start justify-between px-4"},t._l(t.getFactory,(function(r){var n;return e("div",{key:r.id},[e("h2",{staticClass:"cursor-pointer",on:{click:function(e){return t.selectFactoryForFiles(r)}}},[t._v("\n            "+t._s(r.name)+"\n          ")]),t._v(" "),t.factoryFiles.find((function(t){return t.id===r.id}))?e("div",[e("ul",t._l(null===(n=t.factoryFiles.find((function(t){return t.id===r.id})))||void 0===n?void 0:n.files,(function(n){return e("li",{key:n,staticClass:"flex flex-row items-center justify-between my-1 hover:bg-indigo-300 px-3 py-2"},[e("p",{staticClass:"w-32"},[t._v("\n                  "+t._s(n.name||n.original_name||"Unnamed File")+"\n                ")]),t._v(" "),e("button",{on:{click:function(e){return t.removeFileFromFactory(r.id,n)}}},[e("svg",{attrs:{xmlns:"http://www.w3.org/2000/svg",x:"0px",y:"0px",width:"20",height:"20",fill:"red",viewBox:"0 0 30 30"}},[e("path",{attrs:{d:"M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"}})])])])})),0)]):t._e()])})),0),t._v(" "),e("div",[e("button",{staticClass:"px-3 py-1 bg-green-400 rounded-xl",on:{click:t.addFiles}},[t._v("\n          Add files\n        ")])])])]),t._v(" "),e("notifications")],1)}),[],!1,null,null,null);e.default=component.exports}}]);