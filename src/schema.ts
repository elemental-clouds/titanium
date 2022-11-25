import { Action, ControlProcedure } from './types/Control';

import { JSONSchemaType } from 'ajv';

export const inclusiveActions: Action[] = ['$includes', '$if_includes'];
export const exclusiveActions: Action[] = ['$excludes', '$if_excludes'];
export const conditionalActions: Action[] = ['$if_includes', '$if_excludes'];

export const schema: JSONSchemaType<ControlProcedure> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    description: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    procedure: {
      type: 'array',
      nullable: true,
      items: {
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {
          $includes: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              required: [],
            },
          },
          $excludes: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              required: [],
            },
          },
          $if_includes: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              required: [],
            },
          },
          $if_excludes: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              required: [],
            },
          },
        },
      },
    },
  },
  required: ['description', 'name', 'procedure'],
};

// export const schema: JSONSchemaType<ControlProcedure> = {
//   type: 'array',
//   nullable: true,
//   items: {
//     type: 'object',
//     required: [],
//     properties: {
//       $includes: {
//         type: 'array',
//         nullable: true,
//         items: {
//           type: 'object',
//           required: ['attributes'],
//           properties: {
//             attributes: { type: 'object' },
//           },
//         },
//       },
//       $excludes: {
//         type: 'array',
//         nullable: true,
//         items: {
//           type: 'object',
//           required: ['attributes'],
//           properties: {
//             attributes: { type: 'object' },
//           },
//         },
//       },
//       $if_includes: {
//         type: 'array',
//         nullable: true,
//         items: {
//           type: 'object',
//           required: ['attributes'],
//           properties: {
//             attributes: { type: 'object' },
//           },
//         },
//       },
//       $if_excludes: {
//         type: 'array',
//         nullable: true,
//         items: {
//           type: 'object',
//           required: ['attributes'],
//           properties: {
//             attributes: { type: 'object' },
//           },
//         },
//       },
//     },
//     additionalProperties: false,
//   },
// };
