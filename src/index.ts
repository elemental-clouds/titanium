import {
  ComplianceState,
  ControlProcedure,
  ControlValidation,
  EngineConstructor,
  FinalControlValidationResult,
} from './types/Control';
import {
  conditionalActions,
  exclusiveActions,
  inclusiveActions,
  schema,
} from './schema';

import Ajv from 'ajv';
import { CommonInventoryItem } from '@elemental-clouds/hydrogen/Common';
import assert from 'assert';
import { isMatch } from 'lodash';

class Engine {
  item: CommonInventoryItem;
  procedure: ControlProcedure;
  status?: FinalControlValidationResult;
  validations: ControlValidation[] = [];

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
    let result: ComplianceState = 'COMPLIANT';

    const compliant = this.validations.filter(
      validation => validation.result === 'COMPLIANT'
    );

    const nonCompliant = this.validations.filter(
      validation => validation.result === 'NON_COMPLIANT'
    );

    const skipped = this.validations.filter(
      validation => validation.result === 'SKIPPED'
    );

    if (nonCompliant.length > 0) {
      result = 'NON_COMPLIANT';
    }

    if (skipped.length > 0) {
      result = 'SKIPPED';
    }

    this.status = {
      compliant,
      controlProcedure: this.procedure,
      item: this.item,
      nonCompliant,
      result,
      skipped,
    };
  }

  validationProcedure() {
    procedureLoop: for (const control of this.procedure.procedure) {
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
          const validation: ControlValidation = {
            action,
            map,
            result: 'NON_COMPLIANT',
          };

          if (inclusiveActions.includes(action)) {
            if (isMatch(this.item, map)) {
              validation.result = 'COMPLIANT';
            }
          }

          if (exclusiveActions.includes(action)) {
            if (!isMatch(this.item, map)) {
              validation.result = 'COMPLIANT';
            }
          }

          /**
           * conditional actions that fail should result in a full stop
           * of the system.
           */
          if (validation.result === 'NON_COMPLIANT') {
            if (conditionalActions.includes(action)) {
              validation.result = 'SKIPPED';
              this.validations.push(validation);
              break procedureLoop;
            }
          }

          this.validations.push(validation);
        }
      }
    }
  }

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
