# Engineer CAD model preview

The engineer file page renders IGES (`.igs`, `.iges`), STEP (`.step`, `.stp`), STL and OBJ geometry. STEP/IGES and STL signatures are detected from the file contents, so a recognized model saved with an `.iqs` extension also opens in 3D. Textual OBJ data is detected by vertex and face records, including negative indices.

IQS is a factory category and does not establish a geometry format. An unknown native IQS payload remains downloadable, and readable machine programs retain their text preview. Native SolidWorks files use their saved image; export STEP or IGES for an interactive 3D model.

The viewer supports rotation, pan, zoom, isometric/top/front/right views, fit, wireframe, bounding box, original file colors, part visibility/isolation, fullscreen and PNG snapshots. IGES/STEP dimensions are converted to millimeters. STL/OBJ dimensions use the source file units because these formats do not reliably declare units. Dimensions describe the tessellated model's axis-aligned bounds.

## Import and access

Files are fetched through the existing authenticated secure-file endpoint. Import runs in a dedicated worker and never sends the model to a third-party service. Changing files or leaving the page terminates the worker. Import has a 45-second timeout and retains the download action on failure. Geometry is limited to 500,000 triangles, 1,000,000 vertices and 512 parts; the existing 10 MB upload/preview limit applies.

OpenCascade is supplied by the pinned `occt-import-js` dependency. `build/prepare-cad-assets.cjs` copies its unmodified JavaScript, WebAssembly and licenses into `static/cad-vendor/0.0.23` before each build. These generated files are included in `dist`, not committed to git. Keep `cad-vendor/` and both CAD worker assets when installing the `/work` bundle. The host should serve `.wasm` as `application/wasm`.

## Deployment and checks

Build with `npm ci` and `npm run generate:server`, then install the contents of `dist/` in `/work`. Update the API repository and run `php artisan migrate --force` to enable common model uploads for the legacy IQS default policy. The API migration retains custom and empty factory policies.

`npm run test:regression` tests real IGES and STEP fixtures from the import library, assembly parts, source-unit conversion, content detection, malformed geometry and complexity limits. Browser verification covers the actual bundled worker/WebAssembly, geometry rendering and controls, mobile/dark layouts, existing PDF/SolidWorks/DXF previews and order creation.
