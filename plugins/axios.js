export default function ({ $axios }) {
  $axios.onRequest(async () => {
    await $axios.get('/sanctum/csrf-cookie');
  });
}
