(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{415:function(e,t,r){"use strict";r.r(t);r(77),r(96);var n=r(148);var l=r(209),o=r(112);function d(e){return function(e){if(Array.isArray(e))return Object(n.a)(e)}(e)||Object(l.a)(e)||Object(o.a)(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}r(241),r(238);var c={props:{value:{type:[String,Number,Boolean],required:!0},label:{type:String,required:!0},modelValue:{type:Array,default:function(){return[]}},id:{type:String,required:!0}},methods:{handleChange:function(e){var t=e.target.checked,r=d(this.modelValue);if(t)r.includes(this.value)||r.push(this.value);else{var n=r.indexOf(this.value);n>-1&&r.splice(n,1)}this.$emit("update:modelValue",r)}}},h=r(11),component=Object(h.a)(c,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"flex items-center"},[t("input",{staticClass:"rounded-md w-6 h-6 border-2",attrs:{id:e.id,type:"checkbox"},domProps:{value:e.value,checked:e.modelValue.includes(e.value)},on:{change:e.handleChange}}),e._v(" "),t("label",{staticClass:"ml-2",attrs:{for:e.id}},[e._v(e._s(e.label))])])}),[],!1,null,null,null);t.default=component.exports}}]);