import { CommonInventoryItem } from '@elemental-clouds/hydrogen/Common';

export type Action =
  | '$includes'
  | '$excludes'
  | '$if_includes'
  | '$if_excludes';
export type Control = { [key in Action]?: ControlMap[] };
export type ControlMap = { attributes: { [key: string]: unknown } };
export type ControlProcedure = Control[];
export type ComplianceState =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'SKIPPED'
  | 'UNKNOWN';

export interface EngineConstructor {
  procedure: ControlProcedure;
  item: CommonInventoryItem;
}

export interface ControlValidation {
  action: Action;
  map: ControlMap;
  result: ComplianceState;
}

export interface FinalControlValidationResult {
  compliant: ControlValidation[];
  controlProcedure: ControlProcedure;
  item: CommonInventoryItem;
  nonCompliant: ControlValidation[];
  result: ComplianceState;
  skipped: ControlValidation[];
}
