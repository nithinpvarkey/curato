export const CATEGORY_FROM_MASTER_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string' },
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          confidence: {
            type: 'string',
            enum: ['high', 'medium', 'low']
          },
          signal_evidence: { type: 'string' },
          behavioral_description: { type: 'string' },
          why_your_style: { type: 'string' },
          palette: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                hex: { type: 'string' },
                name: { type: 'string' }
              },
              required: ['hex', 'name'],
              additionalProperties: false
            }
          },
          do_not_list: {
            type: 'array',
            items: { type: 'string' }
          },
          vendor_keywords: {
            type: 'array',
            items: { type: 'string' }
          },
          avoid_keywords: {
            type: 'array',
            items: { type: 'string' }
          },
          budget_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                range: { type: 'string' },
                note: { type: 'string' }
              },
              required: ['item', 'range', 'note'],
              additionalProperties: false
            }
          },
          vendor_brief: {
            type: 'object',
            properties: {
              inquiry: { type: 'string' },
              vision: { type: 'string' }
            },
            required: ['inquiry', 'vision'],
            additionalProperties: false
          },
          planner: {
            type: 'object',
            properties: {
              booking_window: { type: 'string' },
              questions_to_ask: {
                type: 'array',
                items: { type: 'string' }
              },
              coordination_checklist: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: [
              'booking_window',
              'questions_to_ask',
              'coordination_checklist'
            ],
            additionalProperties: false
          },
          budget_reality_range: { type: 'string' },
          cost_drivers: {
            type: 'array',
            items: { type: 'string' }
          },
          budget_surprises: {
            type: 'array',
            items: { type: 'string' }
          },
          savings_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                expensive_element: {
                  type: 'string'
                },
                lower_cost_alternative: {
                  type: 'string'
                },
                estimated_saving: {
                  type: 'string'
                },
                atmosphere_impact: {
                  type: 'string',
                  enum: ['low', 'medium', 'high']
                }
              },
              required: [
                'expensive_element',
                'lower_cost_alternative',
                'estimated_saving',
                'atmosphere_impact'
              ],
              additionalProperties: false
            }
          },
          atmosphere_protection: {
            type: 'object',
            properties: {
              protect_first: {
                type: 'array',
                items: { type: 'string' }
              },
              reduce_first: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['protect_first', 'reduce_first'],
            additionalProperties: false
          },
          pattern_insights: {
            type: 'object',
            properties: {
              sample_size: {
                type: 'integer',
              },
              insights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    percentage: {
                      type: 'integer',
                    },
                    observation: {
                      type: 'string'
                    }
                  },
                  required: [
                    'percentage',
                    'observation'
                  ],
                  additionalProperties: false
                }
              }
            },
            required: ['sample_size', 'insights'],
            additionalProperties: false
          },
          design_language: {
            type: 'object',
            properties: {
              flowers: { type: 'string' },
              greenery: { type: 'string' },
              texture_shape: { type: 'string' },
              vibe: { type: 'string' }
            },
            required: [
              'flowers',
              'greenery',
              'texture_shape',
              'vibe'
            ],
            additionalProperties: false
          }
        },
        required: [
          'id',
          'name',
          'confidence',
          'signal_evidence',
          'behavioral_description',
          'why_your_style',
          'palette',
          'do_not_list',
          'vendor_keywords',
          'avoid_keywords',
          'budget_items',
          'vendor_brief',
          'planner',
          'budget_reality_range',
          'cost_drivers',
          'budget_surprises',
          'savings_opportunities',
          'atmosphere_protection'
        ],
        additionalProperties: false
      }
    }
  },
  required: ['category', 'options'],
  additionalProperties: false
} as const
