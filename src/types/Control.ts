export interface ControlAttribute {
  attributes: { [key: string]: unknown };
}

export interface Control {
  $includes?: ControlAttribute[];
  $excludes?: ControlAttribute[];
}
