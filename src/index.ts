import Ajv, { JSONSchemaType } from 'ajv';

import { CommonInventoryItem } from '@elemental-clouds/hydrogen/Common';
import { Control } from './types/Control';

interface EngineConstructor {
  item: CommonInventoryItem;
  control: Control;
}

class Engine {
  item: CommonInventoryItem;
  control: Control;
  decisions: boolean[] = [];
  ajv = new Ajv({ allErrors: true });
  schema: JSONSchemaType<Control> = {
    type: 'object',
    properties: {
      $includes: {
        type: 'array',
        items: {
          type: 'object',
          required: ['attributes'],
          properties: {
            attributes: { type: 'object' },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
      $excludes: {
        type: 'array',
        items: {
          type: 'object',
          required: ['attributes'],
          properties: {
            attributes: { type: 'object' },
          },
          additionalProperties: false,
        },
        nullable: true,
      },
    },
    additionalProperties: false,
  };

  constructor(args: EngineConstructor) {
    this.item = args.item;
    this.control = args.control;
  }

  start() {
    this.validateControl();
  }

  validateControl() {
    const validate = this.ajv.compile(this.schema);
    const thing = validate(this.control);
    console.log(thing);
    console.log(this.ajv.errorsText(validate.errors));
  }
}

export default function (item: CommonInventoryItem, control: any) {
  const engine = new Engine({ item, control });

  engine.start();
  // const decision: boolean[] = [];
  // if (control.$includes) {
  //   decision.push(isMatch(item, control.$includes));
  // }
  // if (control.$excludes) {
  //   decision.push(!isMatch(item, control.$excludes));
  // }
  // assert(decision.length > 0, new Error('invalid control syntax'));
  // return decision;
}
