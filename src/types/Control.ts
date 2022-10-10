export interface Control {
  $includes?: { [key: string]: unknown };
  $excludes?: { [key: string]: unknown }[];
}
