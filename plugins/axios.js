export default function ({ $axios }) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  $axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}
