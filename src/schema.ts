import { Control } from './types/Control';
import { JSONSchemaType } from 'ajv';

export const schema: JSONSchemaType<Control> = {
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
