(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{467:function(t,e,n){"use strict";n.r(e);n(55),n(26);var l={props:["currentStep"],data:function(){return{files:[],steps:["Լազերային ֆայլ","Բենդինգի ֆայլ","Այլ տվյալներ"]}},computed:{stepTitle:function(){return this.steps[this.currentStep]},canProceed:function(){return this.files.length>0}},methods:{handleFileUpload:function(t){this.files=Array.from(t.target.files)},uploadFiles:function(){this.$emit("filesUploaded",{step:this.currentStep,files:this.files})}}},r=n(15),component=Object(r.a)(l,(function(){var t=this,e=t._self._c;return e("div",[e("h3",[t._v(t._s(t.stepTitle))]),t._v(" "),e("input",{attrs:{type:"file",multiple:""},on:{change:t.handleFileUpload}}),t._v(" "),e("button",{attrs:{disabled:!t.canProceed},on:{click:t.uploadFiles}},[t._v("\n    Հաստատել\n  ")])])}),[],!1,null,null,null);e.default=component.exports}}]);