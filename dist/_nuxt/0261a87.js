(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{412:function(t,e,r){var content=r(436);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(36).default)("3aa96b76",content,!0,{sourceMap:!1})},435:function(t,e,r){"use strict";r(412)},436:function(t,e,r){var n=r(35)((function(i){return i[1]}));n.push([t.i,"",""]),n.locals={},t.exports=n},466:function(t,e,r){"use strict";r.r(e);r(39),r(50),r(23);var n={props:{order:Object,updateOrder:Function},computed:{statuses:function(){return[{value:"in process",class:"bg-blue-700"},{value:"waiting",class:"bg-yellow-700"},{value:"finished",class:"bg-green-700"}]}}},o=(r(435),r(15)),component=Object(o.a)(n,(function(){var t=this,e=t._self._c;return e("div",{staticClass:"border-2 border-dashed bg-neutral-700 border-neutral-700 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"},[t.order.created_at?e("p",[e("span",{staticClass:"font-bold"},[t._v("Start:")]),t._v(" "+t._s(t.order.created_at)+"\n    "),e("span",{staticClass:"font-bold"},[t._v("Finish:")]),t._v(" "+t._s(t.order.dates.finish_date)+"\n  ")]):t._e(),t._v(" "),e("div",{on:{click:function(e){return t.updateOrder(t.order)}}},[e("div",[t._l(t.statuses,(function(r){return e("div",{key:r.label},[t.order.factory_order_statuses.status===r.value?e("div",{staticClass:"flex flex-row items-start"},[e("span",{staticClass:"font-bold"},[t._v("Status:")]),t._v(" "),e("div",{staticClass:"font-sans italic mx-2",class:r.class},[t._v("\n            "+t._s(t.order.factory_order_statuses.status)+"\n          ")])]):t._e()])})),t._v(" "),e("div",{staticClass:"flex flex-col items-start justify-start"},[e("span",{staticClass:"font-bold"},[t._v("Description")]),t._v(" "),e("p",[t._v("Name: "+t._s(t.order.name))]),t._v(" "),e("p",[t._v("Quantity: "+t._s(t.order.quantity))]),t._v(" "),e("p",[t._v("Description: "+t._s(t.order.description))])])],2)]),t._v(" "),e("p",[e("span",{staticClass:"font-bold"},[t._v("Order number:")]),t._v("\n    "+t._s(t.order.order_number.number)+"\n  ")]),t._v(" "),t.order.store_link?e("a",{staticClass:"font-medium text-blue-600 dark:text-blue-500 hover:underline",attrs:{target:"_blank",href:t.order.store_link.url}},[t._v("\n    Read more\n  ")]):t._e()])}),[],!1,null,"46d0348e",null);e.default=component.exports}}]);