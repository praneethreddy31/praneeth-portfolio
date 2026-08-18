import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

const INFERENCE_ENGINEERING_PDF =
  "https://drive.google.com/file/d/1pqhCJ3Q2XgjypL-cFiI4MPkI8Z5JvWXA/view?usp=sharing";

export function loader(_: LoaderFunctionArgs) {
  return redirect(INFERENCE_ENGINEERING_PDF);
}
