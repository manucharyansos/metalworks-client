(window.webpackJsonp=window.webpackJsonp||[]).push([[31],{442:function(e,t,r){"use strict";r.r(t);r(23),r(38),r(47),r(74),r(75),r(49),r(16),r(43);var n=r(2),o=r(29),l=(r(17),r(76));function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach((function(t){Object(o.a)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var y={components:{InputWithLabels:r(157).default},layout:"creatorLayout",middleware:["creator","roleRedirect"],data:function(){return{personType:"",openPersonsType:!1,openUsers:!1,isAccordionType:!1,isUserAccordion:!1,isPasswordVisible:!1,isConfirmPasswordVisible:!1,pysPersonData:{},pysPersonClientData:{}}},computed:d(d({isPhysPerson:function(){return"physPerson"===this.personType},isLegalEntity:function(){return"legalEntity"===this.personType}},Object(l.c)("users",["getUsers"])),{},{users:function(){return this.getUsers}}),mounted:function(){this.fetchUsers()},methods:d(d(d({},Object(l.b)("clients",["addClient"])),Object(l.b)("users",["fetchUsers","createUser","updateUser"])),{},{selectUser:function(e){this.pysPersonData.email=e.email,this.pysPersonData.name=e.name,this.pysPersonData.user_id=e.id,this.id=e.id,this.pysPersonClientData=d({},e.client),this.isUserAccordion=!1},createOrUpdateUser:function(){var e=this;return Object(n.a)(regeneratorRuntime.mark((function t(){var r,n;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(r=d({},e.pysPersonClientData),n=d(d(d({},e.pysPersonData),r),{},{type:e.personType}),t.prev=2,!e.id){t.next=9;break}return t.next=6,e.updateUser({id:e.id,data:n});case 6:e.$notify({type:"success",text:"Հաճախորդը հաջողությամբ թարմացվեց"}),t.next=12;break;case 9:return t.next=11,e.createUser(n);case 11:e.$notify({type:"success",text:"Հաճախորդը հաջողությամբ ստեղծվեց"});case 12:t.next=17;break;case 14:t.prev=14,t.t0=t.catch(2),e.$notify({type:"error",text:"Սխալ է տեղի ունեցել հաճախորդի ստեղծման/թարմացման ժամանակ"});case 17:case"end":return t.stop()}}),t,null,[[2,14]])})))()}})},h=r(11),component=Object(h.a)(y,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"w-full h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto"},[t("p",{staticClass:"text-gray-800 dark:text-white font-bold font-sans italic my-8 text-2xl text-center"},[e._v("\n    Հաճախորդ տվյալնեիր թարմացում\n  ")]),e._v(" "),t("div",{staticClass:"grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12 p-4"},[t("div",{attrs:{id:"accordion-collapse","data-accordion":"collapse"}},[t("h2",{attrs:{id:"accordion-collapse-heading-2"}},[t("button",{staticClass:"flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 rounded-t-xl border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3",attrs:{type:"button","data-accordion-target":"#accordion-collapse-body-2","aria-expanded":"false","aria-controls":"accordion-collapse-body-2"},on:{click:function(t){e.isUserAccordion=!e.isUserAccordion}}},[t("span",[e._v("Օգտատեր")]),e._v(" "),t("svg",{staticClass:"w-3 h-3 rotate-180 shrink-0",attrs:{"data-accordion-icon":"","aria-hidden":"true",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 10 6"}},[t("path",{attrs:{stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 5 5 1 1 5"}})])])]),e._v(" "),e.isUserAccordion?t("div",{attrs:{id:"accordion-collapse-body-2","aria-labelledby":"accordion-collapse-heading-2"}},[e.getUsers?e._l(e.users,(function(r,n){return t("div",{key:n,staticClass:"p-3 border border-b-0 border-gray-200 dark:border-gray-700 hover:bg-neutral-300 cursor-pointer",on:{click:function(t){return e.selectUser(r)}}},[t("p",{staticClass:"text-base italic font-sans leading-3 my-2"},[t("span",{staticClass:"font-bold"},[e._v("Անուն։")]),e._v(" "+e._s(r.name)+",\n            ")]),e._v(" "),t("p",{staticClass:"text-base italic font-sans leading-3 my-2"},[t("span",{staticClass:"font-bold"},[e._v("էլ․ փոստ։ ")]),e._v(" "+e._s(r.email)+"\n            ")])])})):e._e()],2):e._e(),e._v(" "),t("h2",{attrs:{id:"accordion-collapse-heading-1"}},[t("button",{staticClass:"flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3",attrs:{type:"button","data-accordion-target":"#accordion-collapse-body-1","aria-expanded":"true","aria-controls":"accordion-collapse-body-1"},on:{click:function(t){e.isAccordionType=!e.isAccordionType}}},[t("span",[e._v("Կարգավիճակ")]),e._v(" "),t("svg",{staticClass:"w-3 h-3 rotate-180 shrink-0",attrs:{"data-accordion-icon":"","aria-hidden":"true",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 10 6"}},[t("path",{attrs:{stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 5 5 1 1 5"}})])])]),e._v(" "),e.isAccordionType?t("div",{class:{"transition delay-2000":e.isAccordionType},attrs:{id:"accordion-collapse-body-1","aria-labelledby":"accordion-collapse-heading-1"}},[t("ul",{staticClass:"p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"},[t("li",[t("div",{staticClass:"flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600"},[t("div",{staticClass:"flex items-center h-5"},[t("input",{directives:[{name:"model",rawName:"v-model",value:e.personType,expression:"personType"}],staticClass:"w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500",attrs:{id:"fiz",value:"physPerson",name:"helper-radio",type:"radio"},domProps:{checked:e._q(e.personType,"physPerson")},on:{change:function(t){e.personType="physPerson"}}})]),e._v(" "),e._m(0)])]),e._v(" "),t("li",[t("div",{staticClass:"flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600"},[t("div",{staticClass:"flex items-center h-5"},[t("input",{directives:[{name:"model",rawName:"v-model",value:e.personType,expression:"personType"}],staticClass:"w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500",attrs:{id:"legalEntity",value:"legalEntity",name:"helper-radio",type:"radio"},domProps:{checked:e._q(e.personType,"legalEntity")},on:{change:function(t){e.personType="legalEntity"}}})]),e._v(" "),e._m(1)])])])]):e._e()]),e._v(" "),e.isPhysPerson?t("div",{staticClass:"flex flex-col items-center justify-center"},[t("div",{staticClass:"grid grid-cols-2 gap-4 float-left w-full"},[t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"name",label:"Անուն",type:"text"},model:{value:e.pysPersonData.name,callback:function(t){e.$set(e.pysPersonData,"name",t)},expression:"pysPersonData.name"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"lastName",label:"Ազգանուն",type:"text"},model:{value:e.pysPersonClientData.last_name,callback:function(t){e.$set(e.pysPersonClientData,"last_name",t)},expression:"pysPersonClientData.last_name"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"phone",type:"phone",label:"Հեռախոս"},model:{value:e.pysPersonClientData.phone,callback:function(t){e.$set(e.pysPersonClientData,"phone",t)},expression:"pysPersonClientData.phone"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"secondPhone",type:"phone",label:"Երկրորդ Հեռախոս"},model:{value:e.pysPersonClientData.second_phone,callback:function(t){e.$set(e.pysPersonClientData,"second_phone",t)},expression:"pysPersonClientData.second_phone"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"address",type:"text",label:"Հասցե"},model:{value:e.pysPersonClientData.address,callback:function(t){e.$set(e.pysPersonClientData,"address",t)},expression:"pysPersonClientData.address"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"address",type:"email",label:"Էլ․ փոստ"},model:{value:e.pysPersonData.email,callback:function(t){e.$set(e.pysPersonData,"email",t)},expression:"pysPersonData.email"}})],1),e._v(" "),t("button",{staticClass:"mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",on:{click:e.createOrUpdateUser}},[e._v("\n        Ստեղծել նոր հաճախորդ\n      ")])]):e._e(),e._v(" "),e.isLegalEntity?t("div",{staticClass:"grid grid-cols-2 gap-4 float-left w-full"},[t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"name",label:"Անուն",type:"text"},model:{value:e.pysPersonData.name,callback:function(t){e.$set(e.pysPersonData,"name",t)},expression:"pysPersonData.name"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"lastName",label:"Ազգանուն",type:"text"},model:{value:e.pysPersonClientData.last_name,callback:function(t){e.$set(e.pysPersonClientData,"last_name",t)},expression:"pysPersonClientData.last_name"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"phone",label:"Հեռախոս",type:"phone"},model:{value:e.pysPersonClientData.phone,callback:function(t){e.$set(e.pysPersonClientData,"phone",t)},expression:"pysPersonClientData.phone"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"nextPhone",label:"Այլ հեռախոս",type:"text"},model:{value:e.pysPersonClientData.second_phone,callback:function(t){e.$set(e.pysPersonClientData,"second_phone",t)},expression:"pysPersonClientData.second_phone"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"address",label:"Հասցե",type:"text"},model:{value:e.pysPersonClientData.legal_address,callback:function(t){e.$set(e.pysPersonClientData,"legal_address",t)},expression:"pysPersonClientData.legal_address"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"userEmail",label:"Էլ․ փոստ",type:"text"},model:{value:e.pysPersonData.email,callback:function(t){e.$set(e.pysPersonData,"email",t)},expression:"pysPersonData.email"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"passportNumber",label:"Անձնագրի համար",type:"text"},model:{value:e.pysPersonClientData.passportNumber,callback:function(t){e.$set(e.pysPersonClientData,"passportNumber",t)},expression:"pysPersonClientData.passportNumber"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"companyName",label:"Կազմակերպության հասցե",type:"text"},model:{value:e.pysPersonClientData.company_name,callback:function(t){e.$set(e.pysPersonClientData,"company_name",t)},expression:"pysPersonClientData.company_name"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"avc",label:"ՀՎՀՀ",type:"text"},model:{value:e.pysPersonClientData.AVC,callback:function(t){e.$set(e.pysPersonClientData,"AVC",t)},expression:"pysPersonClientData.AVC"}}),e._v(" "),t("input-with-labels",{staticClass:"shadow-md rounded-lg p-3",attrs:{id:"accountant",label:"Հաշվապահ",type:"text"},model:{value:e.pysPersonClientData.accountant,callback:function(t){e.$set(e.pysPersonClientData,"accountant",t)},expression:"pysPersonClientData.accountant"}}),e._v(" "),t("button",{staticClass:"mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",on:{click:e.createOrUpdateUser}},[e._v("\n        Փոխել\n      ")])],1):e._e()]),e._v(" "),t("notifications")],1)}),[function(){var e=this._self._c;return e("div",{staticClass:"ms-2 text-sm"},[e("label",{staticClass:"font-medium text-gray-900 dark:text-gray-300",attrs:{for:"fiz"}},[this._v("\n                  Ֆիզ․ անձ\n                ")])])},function(){var e=this._self._c;return e("div",{staticClass:"ms-2 text-sm"},[e("label",{staticClass:"font-medium text-gray-900 dark:text-gray-300",attrs:{for:"legalEntity"}},[this._v("\n                  Իրավաբանական անձ\n                ")])])}],!1,null,null,null);t.default=component.exports}}]);