export type Action = '$includes' | '$excludes' | '$if_includes';
export type Control = { [key in Action]?: ControlMap[] };
export type ControlMap = { attributes: { [key: string]: unknown } };
export type ControlProcedure = Control[];
