import {
  SkinProfileData,
  SkinAnalysisRecord,
  SkincareRoutine,
  AssistantMessage,
} from '../types';
import { ACTIVE_INGREDIENTS_LIBRARY } from './recommendationEngine';

export interface SkincareAssistantContext {
  profile: SkinProfileData | null;
  latestAnalysis: SkinAnalysisRecord | null;
  routine: SkincareRoutine | null;
}

export const SUGGESTED_QUESTIONS = [
  'What does my current skincare routine do?',
  'How should I use niacinamide with my other steps?',
  'What ingredients support hydration in my skin?',
  'What is the purpose of my morning routine?',
  'Can you explain my latest skin analysis observations?',
  'How can I improve my routine consistency?',
  'What should I know before trying a new active ingredient?',
  'Which ingredients should I avoid for my skin barrier?',
];

/**
 * Builds a prompt grounding context summarizing actual user data.
 */
export function buildUserGroundingSummary(context: SkincareAssistantContext): string {
  const parts: string[] = [];

  if (context.profile) {
    parts.push(
      `User Profile: Skin Type: ${context.profile.skinType}, Age Range: ${context.profile.ageRange}, Sensitivity: ${context.profile.sensitivityLevel}, Primary Goal: ${context.profile.primaryGoal}, Primary Concerns: ${context.profile.primaryConcerns.join(', ')}.`
    );
    if (context.profile.knownSensitivities && context.profile.knownSensitivities.length > 0) {
      parts.push(`Known Sensitivities / Exclusions: ${context.profile.knownSensitivities.join(', ')}.`);
    }
  }

  if (context.latestAnalysis) {
    const m = context.latestAnalysis.metrics;
    parts.push(
      `Latest Optical Analysis (#${context.latestAnalysis.id.slice(-6)}): Overall Score: ${context.latestAnalysis.overallScore}/100. Hydration: ${m.hydration?.score}/100 (${m.hydration?.status}), Barrier Health: ${m.barrierHealth?.score}/100 (${m.barrierHealth?.status}), Redness/Sensitivity: ${m.rednessSensitivity?.score}/100, Pore Clarity: ${m.poreCongestion?.score}/100, Tone Uniformity: ${m.pigmentEvenness?.score}/100.`
    );
    if (context.latestAnalysis.keyFindings?.length) {
      parts.push(`Key Observations: ${context.latestAnalysis.keyFindings.join('; ')}.`);
    }
    if (context.latestAnalysis.ingredientsToAvoid?.length) {
      parts.push(`Ingredients to avoid: ${context.latestAnalysis.ingredientsToAvoid.join(', ')}.`);
    }
  }

  if (context.routine) {
    const amList = context.routine.amSteps.map((s) => `${s.order}. ${s.productName} (${s.category} - Actives: ${s.activeIngredients})`).join('; ');
    const pmList = context.routine.pmSteps.map((s) => `${s.order}. ${s.productName} (${s.category} - Actives: ${s.activeIngredients})`).join('; ');
    parts.push(`Morning Regimen (AM): ${amList || 'None recorded'}.`);
    parts.push(`Evening Regimen (PM): ${pmList || 'None recorded'}.`);
    parts.push(`Routine Adherence: ${context.routine.streakDays || 0} consecutive days streak.`);
  }

  return parts.join('\n');
}

/**
 * Core clinical logic responder that produces grounded, accurate, personalized answers.
 */
export async function generateAssistantResponse(
  userQuery: string,
  history: AssistantMessage[],
  context: SkincareAssistantContext
): Promise<{ content: string; referencedActives: string[]; referencedMetrics: string[] }> {
  // Simulate natural typing delay for thoughtful UX
  await new Promise((resolve) => setTimeout(resolve, 600));

  const queryLower = userQuery.toLowerCase();
  const referencedActives: string[] = [];
  const referencedMetrics: string[] = [];

  const profile = context.profile;
  const analysis = context.latestAnalysis;
  const routine = context.routine;

  // Medical boundary detection
  const medicalTerms = ['eczema', 'psoriasis', 'dermatitis', 'infection', 'bleeding', 'cyst', 'melanoma', 'cancer', 'prescription', 'tretinoin', 'accutane', 'antibiotic'];
  const hasMedicalQuery = medicalTerms.some((t) => queryLower.includes(t));

  let medicalDisclaimer = '';
  if (hasMedicalQuery) {
    medicalDisclaimer = '\n\n*Important Clinical Disclaimer: Skinovate is an educational skincare companion and does not diagnose dermatological medical diseases, prescribe pharmaceuticals, or replace clinical care. For persistent inflammation, cystic lesions, or suspected dermatitis, please consult a board-certified dermatologist.*';
  }

  // Question 1: Current Routine explanation
  if (queryLower.includes('current skincare routine do') || queryLower.includes('my routine') || queryLower.includes('how does my routine work')) {
    if (!routine || (routine.amSteps.length === 0 && routine.pmSteps.length === 0)) {
      return {
        content: `You haven't compounded a personalized skincare routine yet. Head over to **Skin Analysis** or the **My Routine** section to generate a personalized AM/PM regimen based on your skin type.`,
        referencedActives: [],
        referencedMetrics: [],
      };
    }

    const amSummary = routine.amSteps.map((s) => `• **Step ${s.order}: ${s.productName}** (${s.category}) — *Key Actives: ${s.activeIngredients}*`).join('\n');
    const pmSummary = routine.pmSteps.map((s) => `• **Step ${s.order}: ${s.productName}** (${s.category}) — *Key Actives: ${s.activeIngredients}*`).join('\n');

    let response = `Here is how your personalized regimen works to support your skin barrier based on your **${profile?.skinType || 'Combination'}** profile:\n\n`;
    response += `### ☀️ Morning Regimen (Antioxidant Defense & Photoprotection)\n${amSummary}\n\n`;
    response += `### 🌙 Evening Regimen (Cellular Repair & Lipid Replenishing)\n${pmSummary}\n\n`;
    response += `**Why this fits your skin:** Your routine synchronizes with circadian biology—defending against environmental oxidative stress and UV radiation during daylight, then accelerating epidermal desquamation and barrier lipid synthesis while you sleep.${medicalDisclaimer}`;

    return {
      content: response,
      referencedActives: ['Ceramides', 'Niacinamide', 'UV Filters'],
      referencedMetrics: ['Barrier Health', 'Hydration'],
    };
  }

  // Question 2: Morning routine purpose
  if (queryLower.includes('morning routine') || queryLower.includes('am routine')) {
    let response = `### The Biological Purpose of Your Morning Regimen\n\n`;
    response += `During daytime hours, your stratum corneum faces constant environmental stress: UV radiation, particulate air pollution, and temperature fluctuations.\n\n`;
    response += `Your morning steps are sequenced to:\n`;
    response += `1. **Preserve Barrier Lipids:** Cleanse gently without stripping your acid mantle.\n`;
    response += `2. **Neutralize Free Radicals:** Deliver antioxidant shields (such as Vitamin C, Ectoin, or Niacinamide) to absorb oxidative stress before it damages cellular DNA.\n`;
    response += `3. **Maintain Hydration & Occlusion:** Seal trans-epidermal water loss (TEWL).\n`;
    response += `4. **Broad-Spectrum UV Defense (SPF 50+):** The single most crucial anti-aging and anti-pigmentation step. Without UV protection, active repair serums cannot work effectively.${medicalDisclaimer}`;

    return {
      content: response,
      referencedActives: ['Antioxidants', 'SPF 50+'],
      referencedMetrics: ['Hydration', 'Pigment Evenness'],
    };
  }

  // Question 3: Niacinamide
  if (queryLower.includes('niacinamide')) {
    referencedActives.push('Niacinamide (Vitamin B3)');
    let response = `### Niacinamide (Vitamin B3) Guide\n\n`;
    response += `Niacinamide is a versatile, physiologically gentle active ingredient suited for almost all skin types.\n\n`;
    response += `**Dermatological Mechanisms:**\n`;
    response += `• Stimulates synthesis of ceramides and free fatty acids in keratinocytes, directly reinforcing your lipid barrier.\n`;
    response += `• Regulates sebaceous gland hyperactivity without drying out the epidermis.\n`;
    response += `• Inhibits transfer of melanosomes to surrounding keratinocytes, fading post-inflammatory dark marks.\n\n`;
    response += `**How to layer in your routine:**\n`;
    response += `• Apply 3–4 drops after cleansing/toning and before heavier moisturizers.\n`;
    response += `• Pairs safely with Hyaluronic Acid, Ceramides, Zinc PCA, and Retinoids.\n`;
    if (profile?.skinType === 'Oily' || profile?.skinType === 'Combination') {
      response += `• *Personalized Note:* For your **${profile.skinType}** profile, pairing Niacinamide with Zinc PCA will help balance shine across your T-zone.`;
    }
    response += medicalDisclaimer;

    return {
      content: response,
      referencedActives,
      referencedMetrics: ['Barrier Health', 'Pore Congestion'],
    };
  }

  // Question 4: Hydration ingredients
  if (queryLower.includes('hydration') || queryLower.includes('hydrate') || queryLower.includes('dry skin')) {
    referencedMetrics.push('Hydration');
    let response = `### Key Ingredients for Deep Epidermal Hydration\n\n`;
    response += `True skin hydration requires a synergy of **humectants** (water magnets), **emollients** (lipid softeners), and **occlusives** (moisture sealers):\n\n`;
    response += `1. **Polyglutamic Acid (PGA):** Holds up to 4× more water than standard hyaluronic acid and forms a breathable plumping film.\n`;
    response += `2. **Multi-Molecular Hyaluronic Acid:** Low molecular weights penetrate deeper to hydrate lower stratum corneum layers, while high molecular weights cushion the surface.\n`;
    response += `3. **Oat Beta-Glucan & Panthenol (B5):** Accelerates tissue hydration and calms irritation.\n`;
    response += `4. **Physiological Ceramides (NP, AP, EOP):** Critical for preventing the water you added from evaporating back into the atmosphere (TEWL).\n\n`;
    if (analysis?.metrics.hydration) {
      response += `*Your Biometric Context:* Your latest hydration score was **${analysis.metrics.hydration.score}/100**. Layer humectants onto damp skin for optimal absorption.`;
    }
    response += medicalDisclaimer;

    return {
      content: response,
      referencedActives: ['Hyaluronic Acid', 'Polyglutamic Acid', 'Panthenol'],
      referencedMetrics: ['Hydration', 'Barrier Health'],
    };
  }

  // Question 5: Latest analysis explanation
  if (queryLower.includes('latest skin analysis') || queryLower.includes('my analysis') || queryLower.includes('analysis observations')) {
    if (!analysis) {
      return {
        content: `You haven't completed a skin analysis scan yet. Tap **Start New Analysis** on your Dashboard to capture an optical biometric baseline.`,
        referencedActives: [],
        referencedMetrics: [],
      };
    }

    const m = analysis.metrics;
    let response = `### Breakdown of Your Latest Biometric Analysis (#${analysis.id.slice(-6)})\n\n`;
    response += `Overall Health Index: **${analysis.overallScore} / 100** (${analysis.skinConditionSummary || 'Calibrated Range'})\n\n`;
    response += `**Core Biometric Dimensions:**\n`;
    response += `• **Epidermal Hydration:** ${m.hydration?.score}/100 — *${m.hydration?.status}*\n`;
    response += `• **Lipid Barrier Health:** ${m.barrierHealth?.score}/100 — *${m.barrierHealth?.status}*\n`;
    response += `• **Pore & Sebum Congestion:** ${m.poreCongestion?.score}/100 — *${m.poreCongestion?.status}*\n`;
    response += `• **Redness / Erythema:** ${m.rednessSensitivity?.score}/100 — *${m.rednessSensitivity?.status}*\n`;
    response += `• **Texture Smoothness:** ${m.textureSmoothness?.score}/100 — *${m.textureSmoothness?.status}*\n`;
    response += `• **Pigment Uniformity:** ${m.pigmentEvenness?.score}/100 — *${m.pigmentEvenness?.status}*\n\n`;

    if (analysis.keyFindings?.length) {
      response += `**Key Optical Findings:**\n${analysis.keyFindings.map((f) => `• ${f}`).join('\n')}\n\n`;
    }
    response += `*Recommendation:* Focus on stabilizing your barrier lipids with physiological ceramides before introducing strong direct exfoliants.${medicalDisclaimer}`;

    return {
      content: response,
      referencedActives: ['Ceramides', 'Centella'],
      referencedMetrics: ['Overall Score', 'Hydration', 'Barrier Health'],
    };
  }

  // Question 6: Routine consistency
  if (queryLower.includes('consistency') || queryLower.includes('streak') || queryLower.includes('habit')) {
    const streak = routine?.streakDays || 0;
    let response = `### Building Skincare Habit Consistency\n\n`;
    response += `You currently have an adherence streak of **${streak} days** recorded in Skinovate.\n\n`;
    response += `**Why consistency matters more than potency:**\n`;
    response += `Skin cells in the basal layer take approximately **28 to 40 days** to migrate through the stratum spinosum and shed naturally. Active ingredients require consistent cellular signaling over multiple turnover cycles to produce visible change.\n\n`;
    response += `**Actionable Tips to Stay Consistent:**\n`;
    response += `1. **Keep it streamlined:** If 5 steps feel exhausting at night, reduce down to the core 2: Cleanse + Moisturize.\n`;
    response += `2. **Place products where you see them:** Keep PM products on your bedside table or bathroom vanity.\n`;
    response += `3. **Set In-App Reminders:** Enable evening reminders so you complete your steps before you become too fatigued.${medicalDisclaimer}`;

    return {
      content: response,
      referencedActives: [],
      referencedMetrics: ['Consistency'],
    };
  }

  // Question 7: Introducing new active ingredient
  if (queryLower.includes('new ingredient') || queryLower.includes('patch test') || queryLower.includes('introduce')) {
    let response = `### Dermatological Protocol for Introducing New Ingredients\n\n`;
    response += `Whenever you introduce a new active formulation into your routine, follow the **48-Hour Patch & Buffer Rule**:\n\n`;
    response += `1. **Patch Test First:** Apply a pea-sized amount behind your ear or inner forearm for 48 hours to check for delayed-type hypersensitivity.\n`;
    response += `2. **Introduce One Active at a Time:** Wait at least 2 weeks before adding another new active so you can accurately identify tolerance.\n`;
    response += `3. **Start Low & Slow:** Begin 2 evenings per week. Only increase frequency if your barrier remains calm.\n`;
    response += `4. **Buffer if Sensitive:** Apply your barrier moisturizer first, allow it to dry, then layer your active on top to buffer penetration rate.\n\n`;
    if (profile?.sensitivityLevel === 'High (Reactive)') {
      response += `*Caution for your skin:* Because your profile is marked as **High (Reactive)**, avoid products containing synthetic fragrances, drying alcohols, or high-percentage direct glycolic acid.`;
    }
    response += medicalDisclaimer;

    return {
      content: response,
      referencedActives: ['Soothing Actives'],
      referencedMetrics: ['Barrier Health', 'Sensitivity'],
    };
  }

  // Question 8: Ingredients to avoid
  if (queryLower.includes('avoid') || queryLower.includes('contraindication') || queryLower.includes('conflict')) {
    let response = `### Ingredients & Active Pairings to Avoid\n\n`;
    response += `Based on clinical cosmetic chemistry, here are the most important conflict rules:\n\n`;
    response += `• **Retinoids + Direct AHA/BHA (Salicylic / Glycolic Acid):** Combining in the same application exponentially increases barrier stress and flaking. Alternate nights.\n`;
    response += `• **Pure L-Ascorbic Acid + Copper Peptides:** Copper can oxidize pure Vitamin C, causing both to lose their antioxidant potency.\n`;
    response += `• **Benzoyl Peroxide + Pure Vitamin C:** Direct oxidation deactivates both active compounds.\n\n`;

    if (profile?.sensitivityLevel === 'High (Reactive)' || analysis?.metrics.rednessSensitivity?.score! < 70) {
      response += `**Personalized Exclusions for Your Reactive Skin:**\n`;
      response += `• Denatured alcohol (Alcohol Denat)\n• Essential oils (lavender oil, citrus peel oils, eucalyptus)\n• Harsh walnut or physical scrubs\n• High-strength AHA chemical peels (>10%)\n\n`;
    }
    response += `Always prioritize calming humectants (Centella, Madecassoside, Ceramides) to keep your baseline resilient.${medicalDisclaimer}`;

    return {
      content: response,
      referencedActives: ['Centella', 'Ceramides'],
      referencedMetrics: ['Barrier Health', 'Redness'],
    };
  }

  // General Grounded Educational Response
  let response = `Thank you for asking. Based on your **${profile?.skinType || 'Balanced'}** profile`;
  if (profile?.primaryGoal) {
    response += ` and primary goal of **${profile.primaryGoal}**`;
  }
  response += `:\n\n`;
  response += `Regarding "${userQuery}": In dermatological skincare, supporting the intercellular lipid matrix (ceramides, cholesterol, and fatty acids) is foundational. When your stratum corneum is intact, active ingredients penetrate predictably without triggering inflammatory micro-erythema.\n\n`;
  response += `• If you're targeting texture or congestion, gentle lipid-soluble BHAs (Salicylic Acid) or Niacinamide help normalize pore diameter.\n`;
  response += `• If you're targeting brightness or fine lines, morning Vitamin C paired with evening micro-encapsulated Retinal provides optimal collagen and antioxidant signaling.\n\n`;
  response += `Would you like specific advice on tailoring this to your morning or evening routine?${medicalDisclaimer}`;

  return {
    content: response,
    referencedActives: ['Ceramides', 'Niacinamide'],
    referencedMetrics: ['Barrier Health'],
  };
}
