(window.webpackJsonp=window.webpackJsonp||[]).push([[26,9,10],{376:function(t,e,r){"use strict";r.r(e);r(238);var l={props:{label:{type:String,default:""},value:{type:String,default:""},for_LAbel:{type:String,default:""},textarea_id:{type:String,default:""},rows:{type:Number,default:4},placeholder:{type:String,default:""},disabled:{type:Boolean,default:!1}}},n=r(9),component=Object(n.a)(l,(function(){var t=this,e=t._self._c;return e("div",[e("label",{staticClass:"text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1",attrs:{for:t.for_LAbel}},[t._v(t._s(t.label))]),t._v(" "),e("textarea",{staticClass:"block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",attrs:{id:t.textarea_id,rows:t.rows,placeholder:t.placeholder,disabled:t.disabled},domProps:{value:t.value},on:{input:function(e){return t.$emit("input",e.target.value)}}})])}),[],!1,null,"2bf44f05",null);e.default=component.exports},377:function(t,e,r){"use strict";r.r(e);r(47),r(50),r(23),r(16),r(238);var l={props:{label:{type:String,default:""},value:{type:[Number,Object],default:null},name:{type:String,default:""},dates:{type:Array,default:null}},data:function(){return{selectValue:this.value}},watch:{selectValue:function(t){this.$emit("input",t)}}},n=r(9),component=Object(n.a)(l,(function(){var t=this,e=t._self._c;return e("div",[e("label",{staticClass:"block mb-2 text-sm font-medium text-gray-900 dark:text-white",attrs:{for:"countries"}},[t._v(t._s(t.label))]),t._v(" "),e("select",t._b({directives:[{name:"model",rawName:"v-model",value:t.selectValue,expression:"selectValue"}],staticClass:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",attrs:{"aria-label":"Select client"},on:{change:function(e){var r=Array.prototype.filter.call(e.target.options,(function(t){return t.selected})).map((function(t){return"_value"in t?t._value:t.value}));t.selectValue=e.target.multiple?r:r[0]}}},"select",t.$attrs,!1),t._l(t.dates,(function(data,r){return e("option",{key:r,domProps:{value:data}},[t._v("\n      "+t._s(data.name)+"\n    ")])})),0)])}),[],!1,null,"4d0a289e",null);e.default=component.exports},414:function(t,e,r){"use strict";r.r(e);r(36),r(48),r(47),r(75),r(76),r(49),r(16),r(43);var l=r(29),n=(r(23),r(77)),o=r(376);function d(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(t);e&&(l=l.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,l)}return r}function c(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?d(Object(r),!0).forEach((function(e){Object(l.a)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):d(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var f={components:{SelectWithLabel:r(377).default,TextareaWithLabel:o.default},layout:"FactoryLayout",middleware:"roleRedirect",data:function(){return{isModal:!1,selectedOrder:{},selectedOption:null,status:[{id:1,name:"in process",value:"In process"},{id:2,name:"waiting",value:"Waiting"},{id:2,name:"finished",value:"Finished"}]}},computed:c(c({},Object(n.c)("factory",["getOrderByFactories"])),{},{orders:function(){return this.getOrderByFactories}}),mounted:function(){this.fetchOrdersByFactory(3)},methods:c(c({},Object(n.b)("factory",["fetchOrdersByFactory","doneFinishedOrder"])),{},{updateOrder:function(t){this.isModal=!0,this.selectedOrder.id=t.id,this.selectedOrder.status=t.status.status,this.selectedOrder.created_at=t.created_at,this.selectedOrder.finish_date=t.dates.finish_date,this.selectedOrder.name=t.details[0].name,this.selectedOrder.quantity=t.details[0].quantity,this.selectedOrder.description=t.details[0].description},closeModal:function(){this.isModal=!1},doneOrder:function(){var t={id:this.selectedOrder.id,status:this.selectedOption.name};this.doneFinishedOrder(t),this.closeModal(),this.fetchOrdersByFactory(3)}})},v=r(9),component=Object(v.a)(f,(function(){var t=this,e=t._self._c;return e("main",{staticClass:"flex flex-row flex-wrap items-start justify-start p-4 md:ml-64 h-auto pt-20"},[t._l(t.orders,(function(r){return e("div",{key:r.id,staticClass:"m-3"},[e("div",{staticClass:"border-2 border-dashed bg-neutral-700 border-neutral-700 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"},[r.created_at?e("p",[e("span",{staticClass:"font-bold"},[t._v("Start:")]),t._v(" "+t._s(r.created_at)+"\n        "),e("span",{staticClass:"font-bold"},[t._v("Finish:")]),t._v(" "+t._s(r.dates.finish_date)+"\n      ")]):t._e(),t._v(" "),e("div",{on:{click:function(e){return t.updateOrder(r)}}},[e("div",[e("div",["in process"===r.status.status?e("div",{staticClass:"flex flex-row items-start"},[e("span",{staticClass:"font-bold"},[t._v("Status:")]),t._v(" "),e("div",{staticClass:"bg-blue-700 font-sans italic mx-2"},[t._v("\n                "+t._s(r.status.status)+"\n              ")])]):t._e(),t._v(" "),"waiting"===r.status.status?e("div",{staticClass:"flex flex-row items-start"},[e("span",{staticClass:"font-bold"},[t._v("Status:")]),t._v(" "),e("div",{staticClass:"bg-yellow-700 font-sans italic mx-2"},[t._v("\n                "+t._s(r.status.status)+"\n              ")])]):t._e(),t._v(" "),"finished"===r.status.status?e("div",{staticClass:"flex flex-row items-start"},[e("span",{staticClass:"font-bold"},[t._v("Status:")]),t._v(" "),e("div",{staticClass:"bg-green-700 font-sans italic mx-2"},[t._v("\n                "+t._s(r.status.status)+"\n              ")])]):t._e()]),t._v(" "),t._l(r.details,(function(r){return e("div",{key:r.id,staticClass:"flex flex-col items-start justify-start"},[e("span",{staticClass:"font-bold"},[t._v("Description")]),t._v(" "),e("p",[t._v("Title: "+t._s(r.type))]),t._v(" "),e("p",[t._v("Type: "+t._s(r.quantity))]),t._v(" "),e("p",[t._v("Details: "+t._s(r.description))])])}))],2)]),t._v(" "),e("p",[e("span",{staticClass:"font-bold"},[t._v("Order number:")]),t._v("\n        "+t._s(r.order_number.number)+"\n      ")]),t._v(" "),r.store_link?e("a",{staticClass:"font-medium text-blue-600 dark:text-blue-500 hover:underline",attrs:{target:"_blank",href:r.store_link.url}},[t._v("Read more")]):t._e()])])})),t._v(" "),t.isModal?e("div",{staticClass:"overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"},[e("div",{staticClass:"flex items-center justify-center mx-auto p-4 w-full max-w-2xl h-full md:h-auto"},[e("div",{staticClass:"relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"},[e("div",{staticClass:"flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"},[e("h3",{staticClass:"text-lg font-semibold text-gray-900 dark:text-white"},[t._v("\n            Add Product\n          ")]),t._v(" "),e("button",{staticClass:"text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white",attrs:{type:"button"},on:{click:t.closeModal}},[e("svg",{staticClass:"w-5 h-5",attrs:{"aria-hidden":"true",fill:"currentColor",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg"}},[e("path",{attrs:{"fill-rule":"evenodd",d:"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z","clip-rule":"evenodd"}})]),t._v(" "),e("span",{staticClass:"sr-only"},[t._v("Close modal")])])]),t._v(" "),e("div",{staticClass:"grid gap-4 mb-4 sm:grid-cols-2"},[e("div",[e("select-with-label",{attrs:{dates:t.status},model:{value:t.selectedOption,callback:function(e){t.selectedOption=e},expression:"selectedOption"}})],1),t._v(" "),e("div",{staticClass:"sm:col-span-2"},[e("textarea-with-label",{model:{value:t.selectedOrder.description,callback:function(e){t.$set(t.selectedOrder,"description",e)},expression:"selectedOrder.description"}})],1)]),t._v(" "),e("button",{staticClass:"text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800",on:{click:function(e){return t.doneOrder(t.selectedOrder.id)}}},[e("svg",{staticClass:"mr-1 -ml-1 w-6 h-6",attrs:{fill:"currentColor",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg"}},[e("path",{attrs:{"fill-rule":"evenodd",d:"M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z","clip-rule":"evenodd"}})]),t._v("\n          Done\n        ")])])])]):t._e()],2)}),[],!1,null,"c3ac5576",null);e.default=component.exports}}]);