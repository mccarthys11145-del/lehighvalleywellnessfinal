export const weightLossPrograms = [
  {
    id: "weight_loss_core",
    title: "Weight Loss – Core",
    price: "$149",
    period: "per month",
    bestFor: "Patients who want a simple, structured plan with monthly oversight.",
    features: [
      "Monthly clinician follow-up (telehealth or in-person)",
      "Basic nutrition + habit framework",
      "Medication discussion and monitoring if prescribed"
    ],
    cta: "Request Consultation",
    highlight: false
  },
  {
    id: "weight_loss_plus",
    title: "Weight Loss – Plus",
    price: "$249",
    period: "per month",
    bestFor: "Patients who want more guidance and closer tracking.",
    includesFrom: "Core",
    features: [
      "Everything in Core, plus:",
      "Enhanced coaching structure (more frequent plan adjustments)",
      "Prioritized messaging support (non-urgent)"
    ],
    cta: "Request Consultation",
    highlight: true
  },
  {
    id: "weight_loss_intensive",
    title: "Significant Weight Loss – Intensive",
    price: "$349",
    period: "per month",
    bestFor: "Patients pursuing major weight reduction and/or a more complex plan.",
    includesFrom: "Plus",
    features: [
      "Everything in Plus, plus:",
      "More frequent touchpoints (structured check-ins)",
      "Comprehensive plateau strategy and escalation pathways"
    ],
    cta: "Request Consultation",
    highlight: false
  }
];

export const weightLossBaseFeatures = [
  "Comprehensive intake + medical history review",
  "Personalized treatment plan (nutrition, activity, behavior, and medication options when appropriate)",
  "Ongoing progress tracking and plan adjustments",
  "Secure messaging for quick non-urgent questions",
  "Coordination of labs and follow-up scheduling"
];

export const womensHormoneProgram = {
  id: "womens_hormone",
  title: "Women's Hormone Balance",
  price: "$229",
  period: "per month",
  headline: "Thoughtful, personalized hormone care for perimenopause, menopause, and beyond.",
  subhead: "Symptom-focused treatment plans with lab review, monitoring, and ongoing adjustments.",
  concerns: [
    "Hot flashes / night sweats",
    "Sleep disruption",
    "Mood changes and irritability",
    "Brain fog / low energy",
    "Weight changes and metabolic shifts",
    "Low libido / vaginal dryness"
  ],
  features: [
    "Comprehensive intake and symptom assessment",
    "Review of relevant medical history and risk factors",
    "Lab ordering/review when indicated",
    "Personalized treatment plan and monitoring schedule",
    "Ongoing follow-ups and dose adjustments as clinically appropriate",
    "Secure messaging for non-urgent questions"
  ],
  cta: "Request Women's Hormone Consultation"
};

export const mensHealthPrograms = [
  {
    id: "mens_hair_loss",
    title: "Hair Loss Membership",
    price: "$59",
    period: "per month",
    designedFor: "Men noticing thinning hair, recession, or early pattern loss who want a medically guided plan.",
    features: [
      "Medical intake + risk screening",
      "Treatment plan with prescription options when appropriate",
      "Follow-up monitoring and adjustments",
      "Secure messaging for non-urgent questions"
    ],
    note: "Medication cost not included.",
    cta: "Request Consultation"
  },
  {
    id: "mens_ed",
    title: "ED Membership",
    price: "$59",
    period: "per month",
    designedFor: "Men who want safe, clinically appropriate ED treatment and follow-up.",
    features: [
      "Medical intake + cardiovascular risk screening questions",
      "Treatment plan with prescription options when appropriate",
      "Follow-up monitoring and adjustments",
      "Secure messaging for non-urgent questions"
    ],
    note: "Medication cost not included.",
    cta: "Request Consultation"
  },
  {
    id: "mens_bundle",
    title: "Men's Health Bundle",
    price: "$99",
    period: "per month",
    designedFor: "Men who want to address multiple goals together.",
    features: [
      "Everything in Hair Loss + ED programs",
      "One coordinated plan with follow-up monitoring"
    ],
    note: "Medication cost not included.",
    cta: "Request Consultation",
    highlight: true,
    badge: "Best Value"
  }
];

export const peptideProgram = {
  id: "peptide_therapy",
  title: "Peptide Therapy Membership",
  price: "$249",
  period: "per month",
  headline: "Performance and recovery support with a medically guided, compliance-forward approach.",
  subhead: "Peptide-based therapies can be complex—our program emphasizes appropriate screening, education, and monitoring.",
  whoFor: [
    "Patients focused on recovery, wellness optimization, or performance goals",
    "Individuals who want a clinician-guided plan (not internet protocols)"
  ],
  features: [
    "Intake + medical screening",
    "Evidence-informed protocol design (when appropriate)",
    "Education on administration, expectations, and monitoring",
    "Follow-ups and protocol adjustments",
    "Secure messaging for non-urgent questions"
  ],
  note: "Peptide costs are not included and vary by product/source/pharmacy and availability.",
  cta: "Request Peptide Therapy Consultation"
};

export const bookingPolicy = {
  id: "booking_deposit",
  deposit: "$50",
  title: "Booking Deposit & No-Show Policy",
  intro: "To provide timely appointments and respect the time reserved for each patient, Lehigh Valley Wellness requires a booking deposit for new patient appointments.",
  sections: [
    {
      title: "Booking deposit",
      items: [
        "A $50 booking deposit is required to reserve your appointment time.",
        "The deposit is applied to your visit total (or credited toward your first month if you enroll in a membership program the day of your visit)."
      ]
    },
    {
      title: "Cancellation / reschedule",
      items: [
        "You may cancel or reschedule with at least 24 hours' notice and your deposit will be transferred to a new appointment (or refunded upon request).",
        "Cancellations or reschedules made within 24 hours of the appointment time will result in forfeiture of the deposit."
      ]
    },
    {
      title: "No-shows and late arrivals",
      items: [
        "If you do not attend your appointment (\"no-show\"), the deposit is forfeited.",
        "If you arrive more than 10 minutes late, we may need to reschedule your appointment to protect other patients' scheduled times; in this situation, the deposit may be treated as a late cancellation."
      ]
    },
    {
      title: "Established patients",
      items: [
        "Established patients may be asked to keep a card on file and may be subject to a similar late cancellation/no-show fee."
      ]
    }
  ],
  why: "This policy helps keep appointments available and reduces last-minute schedule gaps so we can care for more patients efficiently."
};

export const insuranceNote = "We are a direct-pay practice. Labs and medications are billed separately. We do not bill insurance directly for visits, but can provide a superbill for out-of-network reimbursement.";

export const globalDisclosures = [
  "Medication costs are not included and vary by prescription, pharmacy, and insurance coverage.",
  "Lab work is not included and is billed separately by the lab (unless otherwise specified).",
  "Individual results vary; no outcomes are guaranteed.",
  "Not for emergencies—call 911."
];
