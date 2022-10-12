export interface Control {
  $includes?: { attributes: { [key: string]: unknown } }[];
  $excludes?: { attributes: { [key: string]: unknown } }[];
  // $excludes?: { [key: string]: unknown }[];
}
