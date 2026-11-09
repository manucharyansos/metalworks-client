<template>
  <svg class="h-7 w-8 shrink-0" viewBox="0 0 48 40" aria-hidden="true">
    <path
      d="M2 6a4 4 0 0 1 4-4h12l5 5h19a4 4 0 0 1 4 4v3H2V6Z"
      :fill="info ? '#60A5FA' : '#E9B949'"
    />
    <path
      d="M2 12h44v22a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V12Z"
      :fill="info ? '#93C5FD' : '#F8D775'"
    />
  </svg>
</template>

<script>
export default {
  props: { info: Boolean },
}
</script>
