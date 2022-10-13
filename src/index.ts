import { Control, ControlAttribute } from './types/Control';

import Ajv from 'ajv';
import { CommonInventoryItem } from '@elemental-clouds/hydrogen/Common';
import assert from 'assert';
import { isMatch } from 'lodash';
import { schema } from './schema';

interface EngineConstructor {
  control: Control;
  item: CommonInventoryItem;
}

interface ControlValidation {
  attribute: string;
  control: ControlAttribute;
  result: boolean;
}

interface FinalControlValidationResult {
  nonCompliant: ControlValidation[];
  item: CommonInventoryItem;
  result: boolean;
}

class Engine {
  control: Control;
  item: CommonInventoryItem;
  validations: ControlValidation[] = [];
  status?: FinalControlValidationResult;

  constructor(args: EngineConstructor) {
    this.control = args.control;
    this.item = args.item;
  }

  start() {
    this.validateSyntax();
    this.validateControl('$includes');
    this.validateControl('$excludes');
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

  validateControl(attribute: '$includes' | '$excludes') {
    if (this.control[attribute]) {
      /**
       * validateSyntax validates the structure of object before
       * we make it here, it is safe to assume that the keys exist
       */
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      for (const control of this.control[attribute]!) {
        let result = false;

        if (attribute === '$includes') {
          result = isMatch(this.item, control);
        }

        if (attribute === '$excludes') {
          result = !isMatch(this.item, control);
        }

        this.validations.push({
          attribute,
          control,
          result,
        });
      }
    }
  }

  validateSyntax() {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    assert(validate(this.control), new Error(ajv.errorsText(validate.errors)));
  }
}

export default function (item: CommonInventoryItem, control: any) {
  const engine = new Engine({ item, control }).start();

  assert(engine.status, 'unable to determine compliance result');
  return engine.status;
}
