import { Action, ControlMap, ControlProcedure } from './types/Control';

import Ajv from 'ajv';
import { CommonInventoryItem } from '@elemental-clouds/hydrogen/Common';
import assert from 'assert';
import { isMatch } from 'lodash';
import { schema } from './schema';

interface EngineConstructor {
  procedure: ControlProcedure;
  item: CommonInventoryItem;
}

interface ControlValidation {
  action: Action;
  map: ControlMap;
  result: boolean;
}

interface FinalControlValidationResult {
  nonCompliant: ControlValidation[];
  item: CommonInventoryItem;
  result: boolean;
}

class Engine {
  procedure: ControlProcedure;
  item: CommonInventoryItem;
  validations: ControlValidation[] = [];
  status?: FinalControlValidationResult;

  constructor(args: EngineConstructor) {
    this.procedure = args.procedure;
    this.item = args.item;
  }

  start() {
    this.validateSyntax();
    this.validationProcedure();
    this.compileResult();

    return this;
  }

  compileResult() {
    let result = false;
    const nonCompliant = this.validations.filter(
      validation => validation.result === false
    );
    if (nonCompliant.length === 0) {
      result = true;
    }

    this.status = {
      nonCompliant,
      item: this.item,
      result,
    };
  }

  validationProcedure() {
    for (const control of this.procedure) {
      /**
       * for each $keyword in the control procedure
       */
      let action: keyof typeof control;
      for (action in control) {
        const maps = control[action];

        /**
         * is it possible for this condition to ever be false? Typescript says
         * yes, but it needs verification
         */
        assert(maps, 'unable to find control mapping');

        for (const map of maps) {
          let result = false;

          if (action === '$includes') {
            result = isMatch(this.item, map);
          }

          if (action === '$excludes') {
            result = !isMatch(this.item, map);
          }

          this.validations.push({
            action,
            map,
            result,
          });

          if (result === false && action === '$if_includes') {
            continue;
          }
        }
      }
    }
  }

  // validateAction(attribute: '$includes' | '$excludes') {
  //   if (this.control[attribute]) {
  //     /**
  //      * validateSyntax validates the structure of object before
  //      * we make it here, it is safe to assume that the keys exist
  //      */
  //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //     for (const control of this.control[attribute]!) {
  //       let result = false;

  //       if (attribute === '$includes') {
  //         result = isMatch(this.item, control);
  //       }

  //       if (attribute === '$excludes') {
  //         result = !isMatch(this.item, control);
  //       }

  //       this.validations.push({
  //         attribute,
  //         control,
  //         result,
  //       });
  //     }
  //   }
  // }

  validateSyntax() {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    assert(
      validate(this.procedure),
      new Error(ajv.errorsText(validate.errors))
    );
  }
}

export default function (
  item: CommonInventoryItem,
  procedure: ControlProcedure
) {
  const engine = new Engine({ item, procedure }).start();

  assert(engine.status, 'unable to determine compliance result');
  return engine.status;
}
