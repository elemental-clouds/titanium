import { ControlProcedure } from './types/Control';
import { JSONSchemaType } from 'ajv';

export const schema: JSONSchemaType<ControlProcedure> = {
  type: 'array',
  nullable: true,
  items: {
    type: 'object',
    required: [],
    properties: {
      $includes: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          required: ['attributes'],
          properties: {
            attributes: { type: 'object' },
          },
        },
      },
      $excludes: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          required: ['attributes'],
          properties: {
            attributes: { type: 'object' },
          },
        },
      },
      $if_includes: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          required: ['attributes'],
          properties: {
            attributes: { type: 'object' },
          },
        },
      },
    },
  },
};

// export const schema: JSONSchemaType<ControlProcedure> = {
//   type: 'array',
//   nullable: true,
//   items: {
//     type: 'object',
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
//     },
//   },
// };

// export const schema: JSONSchemaType<Control> = {
//   type: 'object',
//   properties: {
//     $includes: {
//       type: 'array',
//       items: {
//         type: 'object',
//         required: ['attributes'],
//         properties: {
//           attributes: { type: 'object' },
//         },
//         additionalProperties: false,
//       },
//       nullable: true,
//     },
//     $excludes: {
//       type: 'array',
//       items: {
//         type: 'object',
//         required: ['attributes'],
//         properties: {
//           attributes: { type: 'object' },
//         },
//         additionalProperties: false,
//       },
//       nullable: true,
//     },
//   },
//   additionalProperties: false,
// };
