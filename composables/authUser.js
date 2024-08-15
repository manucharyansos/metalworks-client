// // composables/useAuth.ts
// import { useAxios } from "#axios";
//
// export const useAuth = () => {
//   const { $axios } = useAxios();
//   const token = useCookie("token");
//
//   const login = async (email: string, password: string) => {
//     try {
//       const response = await $axios.post("/login", { email, password });
//       token.value = response.data.token;
//       return response.data.token;
//     } catch (error) {
//       console.error("Login failed:", error);
//     }
//   };
//
//   const register = async (
//     name: string,
//     email: string,
//     password: string,
//     password_confirmation: string,
//   ) => {
//     try {
//       await $axios.post("/register", {
//         name,
//         email,
//         password,
//         password_confirmation,
//       });
//     } catch (error) {
//       console.error("Registration failed:", error);
//     }
//   };
//
//   return { login, register };
// };
