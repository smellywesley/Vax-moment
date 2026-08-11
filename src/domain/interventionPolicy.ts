import type { BarrierCategory, Intervention } from './model'

export const interventionRegistry: Readonly<Record<BarrierCategory, Intervention>> = {
  ready: {
    id: 'intervention-ready-v1',
    category: 'ready',
    wording: 'Choose a convenient appointment.',
    action: 'show_slots',
    escalationTrigger: 'User asks a clinical question',
    evidenceStatus: 'Synthetic',
    approver: 'Product owner',
  },
  convenience: {
    id: 'intervention-convenience-v1',
    category: 'convenience',
    wording: "Let's find an option that fits your schedule.",
    action: 'show_slots',
    escalationTrigger: 'No suitable slot or accessibility need',
    evidenceStatus: 'To Validate',
    approver: 'Product owner',
  },
  cost_or_access: {
    id: 'intervention-cost-access-v1',
    category: 'cost_or_access',
    wording: 'See the programme options and what to confirm with the clinic.',
    action: 'show_campaign_access',
    escalationTrigger: 'Eligibility, subsidy, or suitability question',
    evidenceStatus: 'To Validate',
    approver: 'Product owner + qualified reviewer before pilot',
  },
  information: {
    id: 'intervention-information-v1',
    category: 'information',
    wording: 'Review trusted information or ask a healthcare professional.',
    action: 'show_trusted_information',
    escalationTrigger: 'Any personal medical or suitability question',
    evidenceStatus: 'To Validate',
    approver: 'Qualified reviewer before pilot',
  },
  clinical_question: {
    id: 'intervention-clinical-handoff-v1',
    category: 'clinical_question',
    wording: 'A healthcare professional should answer this.',
    action: 'create_handoff',
    escalationTrigger: 'Always',
    evidenceStatus: 'To Validate',
    approver: 'Qualified reviewer before pilot',
  },
  decline_or_opt_out: {
    id: 'intervention-opt-out-v1',
    category: 'decline_or_opt_out',
    wording: 'Your choice is recorded. You can return while the campaign is open.',
    action: 'record_opt_out',
    escalationTrigger: 'User requests human contact',
    evidenceStatus: 'Synthetic',
    approver: 'Product owner',
  },
}

export const selectIntervention = (category: BarrierCategory): Intervention => interventionRegistry[category]
