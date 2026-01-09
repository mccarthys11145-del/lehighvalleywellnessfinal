// Stripe Products and Pricing Configuration
// All prices are in cents (USD)

export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  interval?: 'month' | 'year' | 'one_time';
  category: 'booking' | 'weight_loss' | 'womens_hormone' | 'mens_health' | 'peptide';
  features?: string[];
}

export const products: Product[] = [
  // Booking Deposit
  {
    id: 'booking_deposit',
    name: 'Booking Deposit',
    description: 'New patient appointment booking deposit. Applied to your visit total or credited toward your first month if you enroll in a membership.',
    priceInCents: 5000, // $50
    interval: 'one_time',
    category: 'booking',
    features: [
      'Reserves your appointment time',
      'Applied to visit total or first month membership',
      'Refundable with 24+ hours notice'
    ]
  },

  // Weight Loss Memberships
  {
    id: 'weight_loss_core',
    name: 'Weight Loss – Core',
    description: 'Simple, structured weight loss plan with monthly oversight.',
    priceInCents: 14900, // $149
    interval: 'month',
    category: 'weight_loss',
    features: [
      'Monthly clinician follow-up (telehealth or in-person)',
      'Basic nutrition + habit framework',
      'Medication discussion and monitoring if prescribed',
      'Secure messaging for non-urgent questions'
    ]
  },
  {
    id: 'weight_loss_plus',
    name: 'Weight Loss – Plus',
    description: 'Enhanced guidance and closer tracking for weight loss.',
    priceInCents: 24900, // $249
    interval: 'month',
    category: 'weight_loss',
    features: [
      'Everything in Core, plus:',
      'Enhanced coaching structure (more frequent plan adjustments)',
      'Prioritized messaging support (non-urgent)'
    ]
  },
  {
    id: 'weight_loss_intensive',
    name: 'Significant Weight Loss – Intensive',
    description: 'Comprehensive program for major weight reduction.',
    priceInCents: 34900, // $349
    interval: 'month',
    category: 'weight_loss',
    features: [
      'Everything in Plus, plus:',
      'More frequent touchpoints (structured check-ins)',
      'Comprehensive plateau strategy and escalation pathways'
    ]
  },

  // Women's Hormone Balance
  {
    id: 'womens_hormone',
    name: "Women's Hormone Balance",
    description: 'Personalized hormone care for perimenopause, menopause, and beyond.',
    priceInCents: 22900, // $229
    interval: 'month',
    category: 'womens_hormone',
    features: [
      'Comprehensive intake and symptom assessment',
      'Lab ordering/review when indicated',
      'Personalized treatment plan and monitoring',
      'Ongoing follow-ups and dose adjustments',
      'Secure messaging for non-urgent questions'
    ]
  },

  // Men's Health
  {
    id: 'mens_hair_loss',
    name: 'Hair Loss Membership',
    description: 'Medically guided hair restoration program.',
    priceInCents: 5900, // $59
    interval: 'month',
    category: 'mens_health',
    features: [
      'Medical intake + risk screening',
      'Treatment plan with prescription options',
      'Follow-up monitoring and adjustments',
      'Secure messaging for non-urgent questions'
    ]
  },
  {
    id: 'mens_ed',
    name: 'ED Membership',
    description: 'Safe, clinically appropriate ED treatment and follow-up.',
    priceInCents: 5900, // $59
    interval: 'month',
    category: 'mens_health',
    features: [
      'Medical intake + cardiovascular risk screening',
      'Treatment plan with prescription options',
      'Follow-up monitoring and adjustments',
      'Secure messaging for non-urgent questions'
    ]
  },
  {
    id: 'mens_bundle',
    name: "Men's Health Bundle",
    description: 'Complete men\'s health program combining Hair Loss and ED care.',
    priceInCents: 9900, // $99
    interval: 'month',
    category: 'mens_health',
    features: [
      'Everything in Hair Loss + ED programs',
      'One coordinated plan with follow-up monitoring'
    ]
  },

  // Peptide Therapy
  {
    id: 'peptide_therapy',
    name: 'Peptide Therapy Membership',
    description: 'Performance and recovery support with medically guided peptide therapy.',
    priceInCents: 24900, // $249
    interval: 'month',
    category: 'peptide',
    features: [
      'Intake + medical screening',
      'Evidence-informed protocol design',
      'Education on administration and monitoring',
      'Follow-ups and protocol adjustments',
      'Secure messaging for non-urgent questions'
    ]
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: Product['category']): Product[] => {
  return products.filter(p => p.category === category);
};

export const formatPrice = (priceInCents: number): string => {
  return `$${(priceInCents / 100).toFixed(0)}`;
};
