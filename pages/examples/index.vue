<!--<template>-->
<!--  <div>-->
<!--    <section class="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 antialiased">-->
<!--      <div class="mx-auto max-w-screen-2xl">-->
<!--        <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">-->
<!--          <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">-->
<!--            <div class="flex-1 flex items-center space-x-2">-->
<!--              <h5>-->
<!--                <span class="text-gray-500">All Products:</span>-->
<!--                <span class="dark:text-white">{{ getTotal }}</span>-->
<!--              </h5>-->
<!--              <h5 class="text-gray-500 dark:text-gray-400 ml-1">1-10 ({{ getTotal }})</h5>-->
<!--              <button type="button" class="group" data-tooltip-target="results-tooltip">-->
<!--                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 object-center object-cover text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" viewbox="0 0 20 20" fill="currentColor">-->
<!--                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />-->
<!--                </svg>-->
<!--                <span class="sr-only">More info</span>-->
<!--              </button>-->
<!--              <div id="results-tooltip" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">-->
<!--                Showing {{ getCurrentPage }} - {{ getPerPage }} of {{ getTotal }} results-->
<!--                <div class="tooltip-arrow" data-popper-arrow=""></div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="flex flex-col md:flex-row items-stretch md:items-center md:space-x-3 space-y-3 md:space-y-0 justify-between mx-4 py-4 border-t dark:border-gray-700">-->
<!--            <div class="w-full md:w-1/2">-->
<!--              <form class="flex items-center">-->
<!--                <label for="simple-search" class="sr-only">Search</label>-->
<!--                <div class="relative w-full">-->
<!--                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">-->
<!--                    <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                      <path fill-rule="evenodd" clip-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />-->
<!--                    </svg>-->
<!--                  </div>-->
<!--                  <input type="text" id="simple-search" placeholder="Search for products" required="" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">-->
<!--                </div>-->
<!--              </form>-->
<!--            </div>-->
<!--            <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">-->
<!--              <button-->
<!--                type="button"-->
<!--                class="flex items-center justify-center text-white bg-blue-500 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"-->
<!--                @click="addProduct"-->
<!--              >-->
<!--                <svg class="h-5 w-5 mr-1.5 -ml-1 object-center object-cover" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">-->
<!--                  <path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />-->
<!--                </svg>-->
<!--                Add product-->
<!--              </button>-->
<!--              <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown" class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">-->
<!--                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-1.5 -ml-1 text-gray-400" viewbox="0 0 20 20" fill="currentColor">-->
<!--                  <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />-->
<!--                </svg>-->
<!--                Filter options-->
<!--                <svg class="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">-->
<!--                  <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />-->
<!--                </svg>-->
<!--              </button>-->
<!--              <div id="filterDropdown" class="z-10 hidden px-3 pt-1 bg-white rounded-lg shadow w-80 dark:bg-gray-700 right-0">-->
<!--                <div class="flex items-center justify-between pt-2">-->
<!--                  <h6 class="text-sm font-medium text-black dark:text-white">Filters</h6>-->
<!--                  <div class="flex items-center space-x-3">-->
<!--                    <a href="#" class="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline">Save view</a>-->
<!--                    <a href="#" class="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline">Clear all</a>-->
<!--                  </div>-->
<!--                </div>-->
<!--                <div class="pt-3 pb-2">-->
<!--                  <label for="input-group-search" class="sr-only">Search</label>-->
<!--                  <div class="relative">-->
<!--                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">-->
<!--                      <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />-->
<!--                      </svg>-->
<!--                    </div>-->
<!--                    <input type="text" id="input-group-search" class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search keywords...">-->
<!--                  </div>-->
<!--                </div>-->
<!--                <div id="accordion-flush" data-accordion="collapse" data-active-classes="text-black dark:text-white" data-inactive-classes="text-gray-500 dark:text-gray-400">-->
<!--                  &lt;!&ndash; Category &ndash;&gt;-->
<!--                  <h2 id="category-heading">-->
<!--                    <button type="button" class="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" data-accordion-target="#category-body" aria-expanded="true" aria-controls="category-body">-->
<!--                      <span>Category</span>-->
<!--                      <svg aria-hidden="true" data-accordion-icon="" class="w-5 h-5 rotate-180 shrink-0" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />-->
<!--                      </svg>-->
<!--                    </button>-->
<!--                  </h2>-->
<!--                  <div id="category-body" class="hidden" aria-labelledby="category-heading">-->
<!--                    <div class="py-2 font-light border-b border-gray-200 dark:border-gray-600">-->
<!--                      <ul class="space-y-2">-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="apple" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="apple" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Apple (56)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="microsoft" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="microsoft" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Microsoft (45)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="logitech" type="checkbox" value="" checked="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="logitech" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Logitech (97)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="sony" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="sony" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Sony (234)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="asus" type="checkbox" value="" checked="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="asus" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Asus (97)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="dell" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="dell" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Dell (56)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="msi" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="msi" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">MSI (97)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="canon" type="checkbox" value="" checked="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="canon" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Canon (49)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="benq" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="benq" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">BenQ (23)</label>-->
<!--                        </li>-->
<!--                        <li class="flex items-center">-->
<!--                          <input id="razor" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">-->
<!--                          <label for="razor" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Razor (49)</label>-->
<!--                        </li>-->
<!--                        <a href="#" class="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline">View all</a>-->
<!--                      </ul>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                  &lt;!&ndash; Price &ndash;&gt;-->
<!--                  <h2 id="price-heading">-->
<!--                    <button type="button" class="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" data-accordion-target="#price-body" aria-expanded="true" aria-controls="price-body">-->
<!--                      <span>Price</span>-->
<!--                      <svg aria-hidden="true" data-accordion-icon="" class="w-5 h-5 rotate-180 shrink-0" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />-->
<!--                      </svg>-->
<!--                    </button>-->
<!--                  </h2>-->
<!--                  <div id="price-body" class="hidden" aria-labelledby="price-heading">-->
<!--                    <div class="flex items-center py-2 space-x-3 font-light border-b border-gray-200 dark:border-gray-600"><select id="price-from" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"><option disabled="" selected="">From</option><option>$500</option><option>$2500</option><option>$5000</option></select><select id="price-to" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"><option disabled="" selected="">To</option><option>$500</option><option>$2500</option><option>$5000</option></select></div>-->
<!--                  </div>-->
<!--                  &lt;!&ndash; Worldwide Shipping &ndash;&gt;-->
<!--                  <h2 id="worldwide-shipping-heading">-->
<!--                    <button type="button" class="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" data-accordion-target="#worldwide-shipping-body" aria-expanded="true" aria-controls="worldwide-shipping-body">-->
<!--                      <span>Worldwide Shipping</span>-->
<!--                      <svg aria-hidden="true" data-accordion-icon="" class="w-5 h-5 rotate-180 shrink-0" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />-->
<!--                      </svg>-->
<!--                    </button>-->
<!--                  </h2>-->
<!--                  <div id="worldwide-shipping-body" class="hidden" aria-labelledby="worldwide-shipping-heading">-->
<!--                    <div class="py-2 space-y-2 font-light border-b border-gray-200 dark:border-gray-600">-->
<!--                      <label class="relative flex items-center cursor-pointer">-->
<!--                        <input type="checkbox" value="" class="sr-only peer" name="shipping" checked="">-->
<!--                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>-->
<!--                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">North America</span>-->
<!--                      </label>-->
<!--                      <label class="relative flex items-center cursor-pointer">-->
<!--                        <input type="checkbox" value="" class="sr-only peer" name="shipping">-->
<!--                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>-->
<!--                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">South America</span>-->
<!--                      </label>-->
<!--                      <label class="relative flex items-center cursor-pointer">-->
<!--                        <input type="checkbox" value="" class="sr-only peer" name="shipping">-->
<!--                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>-->
<!--                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Asia</span>-->
<!--                      </label>-->
<!--                      <label class="relative flex items-center cursor-pointer">-->
<!--                        <input type="checkbox" value="" class="sr-only peer" name="shipping" checked="">-->
<!--                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>-->
<!--                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Australia</span>-->
<!--                      </label>-->
<!--                      <label class="relative flex items-center cursor-pointer">-->
<!--                        <input type="checkbox" value="" class="sr-only peer" name="shipping">-->
<!--                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>-->
<!--                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Europe</span>-->
<!--                      </label>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                  &lt;!&ndash; Rating &ndash;&gt;-->
<!--                  <h2 id="rating-heading">-->
<!--                    <button type="button" class="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" data-accordion-target="#rating-body" aria-expanded="true" aria-controls="rating-body">-->
<!--                      <span>Rating</span>-->
<!--                      <svg aria-hidden="true" data-accordion-icon="" class="w-5 h-5 rotate-180 shrink-0" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />-->
<!--                      </svg>-->
<!--                    </button>-->
<!--                  </h2>-->
<!--                  <div id="rating-body" class="hidden" aria-labelledby="rating-heading">-->
<!--                    <div class="py-2 space-y-2 font-light border-b border-gray-200 dark:border-gray-600">-->
<!--                      <div class="flex items-center">-->
<!--                        <input id="five-stars" type="radio" value="" name="rating" class="w-4 h-4 bg-gray-100 border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">-->
<!--                        <label for="five-stars" class="flex items-center ml-2">-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>First star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Second star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Third star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fourth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fifth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                        </label>-->
<!--                      </div>-->
<!--                      <div class="flex items-center">-->
<!--                        <input id="four-stars" type="radio" value="" name="rating" class="w-4 h-4 bg-gray-100 border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">-->
<!--                        <label for="four-stars" class="flex items-center ml-2">-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>First star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Second star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Third star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fourth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fifth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                        </label>-->
<!--                      </div>-->
<!--                      <div class="flex items-center">-->
<!--                        <input id="three-stars" type="radio" value="" name="rating" checked="" class="w-4 h-4 bg-gray-100 border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">-->
<!--                        <label for="three-stars" class="flex items-center ml-2">-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>First star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Second star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Third star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fourth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fifth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                        </label>-->
<!--                      </div>-->
<!--                      <div class="flex items-center">-->
<!--                        <input id="two-stars" type="radio" value="" name="rating" class="w-4 h-4 bg-gray-100 border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">-->
<!--                        <label for="two-stars" class="flex items-center ml-2">-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>First star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Second star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Third star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fourth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fifth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                        </label>-->
<!--                      </div>-->
<!--                      <div class="flex items-center">-->
<!--                        <input id="one-star" type="radio" value="" name="rating" class="w-4 h-4 bg-gray-100 border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">-->
<!--                        <label for="one-star" class="flex items-center ml-2">-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-yellow-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>First star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Second star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Third star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fourth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                          <svg aria-hidden="true" class="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <title>Fifth star</title>-->
<!--                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />-->
<!--                          </svg>-->
<!--                        </label>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="flex items-center space-x-3 w-full md:w-auto">-->
<!--                <button id="actionsDropdownButton" data-dropdown-toggle="actionsDropdown" class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">-->
<!--                  Actions-->
<!--                  <svg class="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">-->
<!--                    <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />-->
<!--                  </svg>-->
<!--                </button>-->
<!--                <div id="actionsDropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">-->
<!--                  <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="actionsDropdownButton">-->
<!--                    <li>-->
<!--                      <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mass Edit</a>-->
<!--                    </li>-->
<!--                  </ul>-->
<!--                  <div class="py-1">-->
<!--                    <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete all</a>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="overflow-x-auto">-->
<!--            <Table-->
<!--              :data="getProducts"-->
<!--              @removeProduct="removeProduct"-->
<!--              @previewSelectedProduct="previewSelectedProduct"-->
<!--              @editProduct="editProduct"-->
<!--              target="delete-modal"-->
<!--              toggle="delete-modal"-->
<!--            />-->
<!--          </div>-->

<!--          <Pagination-->
<!--            :total="getTotal"-->
<!--            :per-page="getPerPage"-->
<!--            :links="getLinks"-->
<!--            :current-page="getCurrentPage"-->
<!--            @handleLinkClick="handleLinkClick"-->
<!--          />-->
<!--        </div>-->
<!--      </div>-->
<!--    </section>-->

<!--    &lt;!&ndash; drawer component &ndash;&gt;-->
<!--    <UpdateProductDrawer-->
<!--      @removeSelectedProduct="removeSelectedProduct"-->
<!--      @updateSelectedProduct="updateSelectedProduct"-->
<!--      :categories="getSubcategories"-->
<!--      @handleFileUpload="handleFileUpload"-->
<!--      id="drawer-update-product"-->
<!--    >-->
<!--      <template v-slot:name>-->
<!--        <input-->
<!--          type="text"-->
<!--          name="name"-->
<!--          id="name"-->
<!--          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value="Apple iMac 27&ldquo;"-->
<!--          placeholder="Type product name"-->
<!--          required=""-->
<!--          v-model="product.title"-->
<!--        >-->
<!--      </template>-->
<!--      <template v-slot:description>-->
<!--        <textarea-->
<!--          id="description"-->
<!--          rows="8"-->
<!--          class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"-->
<!--          placeholder="Write product description here"-->
<!--          required=""-->
<!--          v-model="product.description"-->
<!--        ></textarea>-->
<!--      </template>-->
<!--      <template v-slot:image>-->
<!--        <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">-->
<!--          <div class="flex flex-col items-center justify-center pt-5 pb-6">-->
<!--            <svg aria-hidden="true" class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">-->
<!--              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />-->
<!--            </svg>-->
<!--            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">-->
<!--              <span class="font-semibold">Click to upload</span>-->
<!--              or drag and drop-->
<!--            </p>-->
<!--            <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>-->
<!--          </div>-->
<!--          <input @change="handleFileUpload" id="dropzone-file" type="file" class="hidden">-->
<!--        </label>-->
<!--        <div class="grid grid-cols-3 gap-8 mb-4">-->
<!--          <div-->
<!--            v-for="image of product.imageFiles"-->
<!--            class="relative p-2 bg-gray-100 rounded-lg sm:w-36 sm:h-36 dark:bg-gray-700">-->
<!--            <img-->
<!--              v-if="image"-->
<!--              :src="`http://127.0.0.1:8000/storage/products-images/${image.image_path}`"-->
<!--              alt="imac image"-->
<!--              class="w-36 h-28 object-cover object-center">-->
<!--            <button type="button" class="absolute text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 bottom-1 left-1">-->
<!--              <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">-->
<!--                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />-->
<!--              </svg>-->
<!--              <span class="sr-only">Remove image</span>-->
<!--            </button>-->
<!--          </div>-->
<!--        </div>-->
<!--      </template>-->
<!--      <template v-slot:categories>-->
<!--        <select-->
<!--          id="category"-->
<!--          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"-->
<!--          v-model="product.subcategory_id"-->
<!--        >-->
<!--          <option selected="">Select category</option>-->
<!--          <option-->
<!--            v-for="subcategory of getSubcategories"-->
<!--            :key="subcategory.id"-->
<!--            :value="subcategory.id">-->
<!--            {{subcategory.name}}-->
<!--          </option>-->
<!--        </select>-->
<!--      </template>-->
<!--    </UpdateProductDrawer>-->
<!--    &lt;!&ndash; Preview Drawer &ndash;&gt;-->
<!--    <PreviewDrawer-->
<!--      :data="previewProduct"-->
<!--    />-->
<!--    &lt;!&ndash; Delete Modal &ndash;&gt;-->
<!--    <DeleteModal-->
<!--      @deleteClick="deleteProduct"-->
<!--      id="delete-modal"-->
<!--    />-->

<!--    <notifications />-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import {mapActions, mapGetters} from "vuex";-->
<!--import Table from "~/components/products/product-table"-->
<!--import PreviewDrawer from "@/components/products/product-table/preview-drawer";-->
<!--import UpdateProductDrawer from "@/components/products/product-table/update-product-drawer";-->
<!--import DeleteModal from "@/components/products/product-table/delete-modal";-->
<!--import { initFlowbite } from 'flowbite'-->
<!--import Pagination from "@/components/pagination";-->
<!--export default {-->
<!--  name: "index",-->
<!--  layout: 'AdminLayout',-->
<!--  middleware: 'admin',-->
<!--  components: {-->
<!--    Table,-->
<!--    PreviewDrawer,-->
<!--    DeleteModal,-->
<!--    UpdateProductDrawer,-->
<!--    Pagination-->
<!--  },-->
<!--  async fetch(){-->
<!--    await this.fetchProducts(1)-->
<!--    await this.fetchSubCategories()-->
<!--  },-->
<!--  data (){-->
<!--    return {-->
<!--      selectedProduct: [],-->
<!--      previewProduct: [],-->
<!--      id: '',-->
<!--      product: {-->
<!--        title: '',-->
<!--        description: '',-->
<!--        price: '',-->
<!--        stock: '',-->
<!--        imageUrl: '',-->
<!--        imageFiles: [],-->
<!--        subcategory_id: '',-->
<!--        selectedImage: ''-->
<!--      },-->
<!--      errors: {},-->
<!--    }-->
<!--  },-->
<!--  mounted() {-->
<!--    initFlowbite()-->
<!--  },-->
<!--  computed: {-->
<!--    ...mapGetters('admin/categories/subcategories', ['getSubcategories']),-->
<!--    ...mapGetters('admin/products',-->
<!--      [-->
<!--        'getErrorMessages',-->
<!--        'getProducts',-->
<!--        'getLastPage',-->
<!--        'getPerPage',-->
<!--        'getTotal',-->
<!--        'getCurrentPage',-->
<!--        'getLinks'-->
<!--      ])-->
<!--  },-->
<!--  methods :{-->
<!--    ...mapActions('admin/products', ['fetchProducts', 'deleteSelectedProduct', 'createProduct', 'updateProduct']),-->
<!--    ...mapActions('admin/categories/subcategories', ['fetchSubCategories']),-->
<!--    addProduct(){-->
<!--      this.$router.push('/admin/products/create')-->
<!--    },-->
<!--    editProduct(product){-->
<!--      this.product.id = product.id-->
<!--      this.product.title = product.title-->
<!--      this.product.description = product.description-->
<!--      this.product.price = product.price-->
<!--      this.product.imageUrl = product.imageUrl-->
<!--      this.product.stock = product.stock-->
<!--      this.product.imageFiles = product.images-->
<!--      this.product.subcategory_id = product.subcategory_id-->
<!--    },-->
<!--    previewSelectedProduct(product){-->
<!--      this.previewProduct = product-->
<!--    },-->
<!--    removeSelectedProduct(){-->
<!--      this.selectedProduct = []-->
<!--    },-->
<!--    removeProduct(id){-->
<!--      this.id = id-->
<!--    },-->
<!--    async deleteProduct(){-->
<!--      await this.deleteSelectedProduct(this.id)-->
<!--      await this.$router.push('/admin')-->
<!--    },-->
<!--    handleFileUpload(event) {-->
<!--      const files = event.target.files;-->
<!--      for (let i = 0; i < files.length; i++) {-->
<!--        const reader = new FileReader();-->
<!--        const imageFile = files[i];-->
<!--        reader.onload = () => {-->
<!--          this.product.imageUrl = reader.result;-->
<!--        };-->
<!--        reader.readAsDataURL(imageFile);-->
<!--        this.product.imageFiles.push(imageFile);-->
<!--      }-->
<!--    },-->
<!--    async updateSelectedProduct(){-->
<!--      const formData = new FormData();-->

<!--      this.product.imageFiles.forEach((file) => {-->
<!--        formData.append('images[]', file);-->
<!--      });-->
<!--      const res = await this.updateProduct({-->
<!--        id: this.product.id,-->
<!--        data: {-->
<!--          subcategory_id: this.product.subcategory_id,-->
<!--          title: this.product.title,-->
<!--          description: this.product.description,-->
<!--          price: this.product.price,-->
<!--          stock: this.product.stock,-->
<!--          images: formData-->
<!--        }-->
<!--      })-->
<!--      if (res){-->
<!--        this.$notify({-->
<!--          text: `Product updated successfully`,-->
<!--          duration: 3000,-->
<!--          speed: 1000,-->
<!--          position: 'center',-->
<!--          type: 'success',-->
<!--        });-->
<!--      }else{-->
<!--        const error = this.getErrorMessages-->
<!--        this.$notify({-->
<!--          text: error,-->
<!--          duration: 3000,-->
<!--          speed: 1000,-->
<!--          position: 'center',-->
<!--          type: 'error',-->
<!--        });-->
<!--      }-->
<!--    },-->
<!--    async handleLinkClick(link) {-->
<!--      try {-->
<!--        const url = new URL(link.url);-->
<!--        const page = url.searchParams.get('page');-->
<!--        await this.fetchProducts(page);-->
<!--      } catch (error) {-->
<!--        console.error(error);-->
<!--        const defaultPage = 1;-->
<!--        await this.fetchProducts(defaultPage);-->
<!--      }-->
<!--    },-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.active{-->
<!--  background: darkgray;-->
<!--}-->
<!--</style>-->

<template>
  <main
    class="flex flex-row flex-wrap items-start justify-start p-4 md:ml-64 h-auto pt-20"
  >
    <div v-for="order in orders" :key="order.id" class="m-3">
      <div
        class="border-2 border-dashed bg-neutral-700 border-neutral-700 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
      >
        <p v-if="order.created_at">
          <span class="font-bold">Start:</span> {{ order.created_at }}
          <span class="font-bold">Finish:</span> {{ order.dates.finish_date }}
        </p>
        <div @click="updateOrder(order)">
          <div>
            <div>
              <div
                v-if="order.status.status === 'in process'"
                class="flex flex-row items-start"
              >
                <span class="font-bold">Status:</span>
                <div class="bg-blue-700 font-sans italic mx-2">
                  {{ order.status.status }}
                </div>
              </div>
              <div
                v-if="order.status.status === 'waiting'"
                class="flex flex-row items-start"
              >
                <span class="font-bold">Status:</span>
                <div class="bg-yellow-700 font-sans italic mx-2">
                  {{ order.status.status }}
                </div>
              </div>
              <div
                v-if="order.status.status === 'finished'"
                class="flex flex-row items-start"
              >
                <span class="font-bold">Status:</span>
                <div class="bg-green-700 font-sans italic mx-2">
                  {{ order.status.status }}
                </div>
              </div>
            </div>
            <div
              v-for="detail in order.details"
              :key="detail.id"
              class="flex flex-col items-start justify-start"
            >
              <span class="font-bold">Description</span>
              <p>Title: {{ detail.type }}</p>
              <p>Type: {{ detail.quantity }}</p>
              <p>Details: {{ detail.description }}</p>
            </div>
          </div>
        </div>
        <p>
          <span class="font-bold">Order number:</span>
          {{ order.order_number.number }}
        </p>
        <a
          v-if="order.store_link"
          target="_blank"
          :href="order.store_link.url"
          class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >Read more</a
        >
      </div>
    </div>
    <!-- Main modal -->
    <div
      v-if="isModal"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
    >
      <div
        class="flex items-center justify-center mx-auto p-4 w-full max-w-2xl h-full md:h-auto"
      >
        <!-- Modal content -->
        <div
          class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
        >
          <!-- Modal header -->
          <div
            class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Add Product
            </h3>
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeModal"
            >
              <svg
                aria-hidden="true"
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <select-with-label v-model="selectedOption" :dates="status" />
            </div>
            <!--            <div>-->
            <!--              <input-with-label-icon-->
            <!--                v-model="selectedOrder.created_at"-->
            <!--                disabled-->
            <!--              />-->
            <!--            </div>-->
            <!--            <div>-->
            <!--              <input-with-label-icon-->
            <!--                v-model="selectedOrder.finish_date"-->
            <!--                type="date"-->
            <!--              />-->
            <!--            </div>-->
            <!--            <div>-->
            <!--              <input-with-label-icon v-model="selectedOrder.name" type="text" />-->
            <!--            </div>-->
            <!--            <div>-->
            <!--              <input-with-label-icon-->
            <!--                v-model="selectedOrder.quantity"-->
            <!--                type="number"-->
            <!--              />-->
            <!--            </div>-->
            <div class="sm:col-span-2">
              <textarea-with-label v-model="selectedOrder.description" />
            </div>
          </div>
          <button
            class="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            @click="doneOrder(selectedOrder.id)"
          >
            <svg
              class="mr-1 -ml-1 w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Done
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'

export default {
  components: { SelectWithLabel, TextareaWithLabel },
  layout: 'FactoryLayout',
  middleware: 'auth',
  data() {
    return {
      isModal: false,
      selectedOrder: {},
      selectedOption: null,
      status: [
        { id: 1, name: 'in process', value: 'In process' },
        { id: 2, name: 'waiting', value: 'Waiting' },
        { id: 2, name: 'finished', value: 'Finished' },
      ],
    }
  },
  computed: {
    ...mapGetters('factory', ['getOrderByFactories']),
    orders() {
      return this.getOrderByFactories
    },
  },
  mounted() {
    this.fetchOrdersByFactory(3)
  },
  methods: {
    ...mapActions('factory', ['fetchOrdersByFactory', 'doneFinishedOrder']),
    updateOrder(order) {
      this.isModal = true
      this.selectedOrder.id = order.id
      this.selectedOrder.status = order.status.status
      this.selectedOrder.created_at = order.created_at
      this.selectedOrder.finish_date = order.dates.finish_date
      this.selectedOrder.name = order.details[0].name
      this.selectedOrder.quantity = order.details[0].quantity
      this.selectedOrder.description = order.details[0].description
    },
    closeModal() {
      this.isModal = false
    },
    doneOrder() {
      const updatedOrder = {
        id: this.selectedOrder.id,
        status: this.selectedOption.name,
      }
      this.doneFinishedOrder(updatedOrder)
      this.closeModal()
      this.fetchOrdersByFactory(3)
    },
  },
}
</script>

<style scoped></style>
