<template>
  <header class="container-fluid justify-center">
    <nav class="bg-white border-gray-200 px-4 py-2.5 dark:bg-gray-800">
      <div class="flex flex-wrap justify-between">
        <div class="flex items-center lg:order-2">

          <div class="flex justify-content-around items-center">

            <form class="max-w-md mx-auto">
              <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input
                  type="search"
                  id="default-search"
                  class="search_input focus:outline-none focus:border-neutral-50 block w-full ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search."
                  required />
               </div>
            </form>

            <a href="#" class="get_started_button text-white border bg-red-700 border-red-500 mx-2 rounded-xl shadow-2xl  hover:translate-y-0.5 hover:shadow-2xl duration-300 py-0.5 px-3">GET STARTED</a>
            <a href="#" class="login_button text-red-600 border bg-white border-red-500 rounded-xl mx-2 shadow-2xl  hover:translate-y-0.5 hover:shadow-2xl duration-300 py-0.5 px-3">LOGIN</a>

          </div>

          <a href="#" class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Get started</a>
          <button data-collapse-toggle="mobile-menu-2" type="button" class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
            <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        </div>
        <div class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
          <a href="/" class="flex items-center">
            <img src="https://flowbite.com/docs/images/logo.svg" class="mr-3 h-6 sm:h-9" alt="Metalwork's" />
            <span class="self-center text-xl font-semibold italic font-sans whitespace-nowrap dark:text-white">Metalwork's</span>
          </a>
          <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li>
              <a href="#" class="block text-base font-bold py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white" aria-current="page">Materials</a>
            </li>
            <li>
              <a href="#" class="block text-base font-bold py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Services</a>
            </li>
            <li>
              <a href="#" class="block text-base font-bold py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Resources</a>
            </li>
            <li>
              <a href="#" class="block text-base font-bold py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Examples</a>
            </li>
            <li>
              <a href="#" class="block text-base font-bold py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Contact</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>
<script>
export default {
  // name: "header-layout"
}
</script>
<style >
.login_button {
  box-shadow: rgba(143, 23, 23, 0.04) 0 0 1px 0, rgba(185, 19, 19, 0.87) 0 5px 8px 0;
}
.get_started_button {
  box-shadow: rgba(143, 23, 23, 0.04) 0 0 1px 0, rgba(185, 19, 19, 0.87) 0 5px 8px 0;
}
.search_input:focus {
  outline: none;

}
input:focus {
  outline: none; /* Remove default outline */
  border: 2px solid #3498db; /* Custom border */
  -webkit-box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2); /* Optional shadow */
  -moz-box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2); /* Optional shadow */
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2); /* Optional shadow */
}

</style>
