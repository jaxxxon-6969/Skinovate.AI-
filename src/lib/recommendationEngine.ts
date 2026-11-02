import {
  SkinProfileData,
  SkinAnalysisRecord,
  SkincareProduct,
  IngredientIntelligence,
  RoutineStep,
  RoutineConditionAlert,
  ProductCategory,
  PriceTier,
  SkinType,
} from '../types';

// ==========================================
// 1. Curated Clinical Skincare Catalog
// ==========================================
export const SKINCARE_PRODUCTS_CATALOG: SkincareProduct[] = [
  // --- CLEANSERS ---
  {
    id: 'prod_cl_01',
    name: 'Hydrating Amino Acid Gentle Cleanser',
    brand: 'Skinovate DermaLab',
    category: 'Cleanse',
    priceTier: 'mid',
    priceUsd: 28,
    volume: '150 ml / 5.1 fl oz',
    rating: 4.9,
    reviewsCount: 312,
    skinTypes: ['Dry', 'Combination', 'Normal', 'Sensitive'],
    targetConcerns: ['Dehydration & Dullness', 'Sensitivity & Redness'],
    keyActives: ['Oat Amino Acids', 'Panthenol (Pro-Vitamin B5)', 'Glycerin (99% pure)'],
    fullIngredientsSummary: 'Water, Sodium Cocoyl Oat Amino Acids, Glycerin, Panthenol, Allantoin, Chamomile Extract, Phenoxyethanol, Ethylhexylglycerin.',
    benefits: ['Maintains natural skin lipid mantle', 'Zero post-wash tightness', 'Balances skin pH to 5.5'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Silk-cushion gel emulsion',
    applicationTip: 'Massage over damp skin for 45 seconds using circular motions. Rinse with lukewarm water.',
    clinicalRationale: 'Protects stratum corneum hydration during cleansing without surfactant-induced barrier disruption.',
  },
  {
    id: 'prod_cl_02',
    name: 'Salicylic Clarifying Purifying Gel Cleanser',
    brand: 'DermaClarity',
    category: 'Cleanse',
    priceTier: 'budget',
    priceUsd: 22,
    volume: '200 ml / 6.7 fl oz',
    rating: 4.8,
    reviewsCount: 428,
    skinTypes: ['Oily', 'Combination'],
    targetConcerns: ['Acne & Blemishes', 'Pore Texture & Congestion'],
    keyActives: ['1.5% Encapsulated Salicylic Acid (BHA)', 'Zinc PCA', 'Green Tea Hydrosol'],
    fullIngredientsSummary: 'Water, Cocamidopropyl Hydroxysultaine, Salicylic Acid, Zinc PCA, Camellia Sinensis (Green Tea) Leaf Water, Niacinamide, Sodium Hydroxide.',
    benefits: ['Degrades sebum build-up in pores', 'Reduces active micro-comedones', 'Calms follicular inflammation'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Refreshing, non-stripping micro-foaming gel',
    applicationTip: 'Target T-zone and congested areas for 60 seconds before rinsing thoroughly.',
    clinicalRationale: 'Lipophilic BHA penetrates deep into follicular infundibulum to liquefy oxidized lipids.',
  },
  {
    id: 'prod_cl_03',
    name: 'Lipid Replenishing Omega Melt Balm',
    brand: 'Skinovate Luxe',
    category: 'Cleanse',
    priceTier: 'luxury',
    priceUsd: 46,
    volume: '100 ml / 3.4 fl oz',
    rating: 4.9,
    reviewsCount: 189,
    skinTypes: ['Dry', 'Normal', 'Sensitive'],
    targetConcerns: ['Dehydration & Dullness', 'Sensitivity & Redness', 'Fine Lines & Wrinkles'],
    keyActives: ['Pure Plant Squalane', 'Oat Kernel Oil', 'Bisabolol'],
    fullIngredientsSummary: 'Caprylic/Capric Triglyceride, Squalane, Avena Sativa (Oat) Kernel Oil, Polyglyceryl-4 Oleate, Bisabolol, Tocopherol.',
    benefits: ['Effortlessly breaks down waterproof SPF and particulate pollution', 'Provides immediate barrier lipidation', 'Prevents TEWL during PM double cleanse'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'PM',
    texture: 'Silky solid balm melting into translucent oil, then milky emulsion',
    applicationTip: 'Warm a dime-sized amount between dry palms, massage into dry skin, then emulsify with warm water.',
    clinicalRationale: 'First-step PM double cleanser that dissolves sebum and silicones without stripping epidermal ceramides.',
  },

  // --- TONERS & ESSENCES ---
  {
    id: 'prod_tn_01',
    name: 'Micro-Essence 3% Polyglutamic & Beta-Glucan',
    brand: 'Skinovate DermaLab',
    category: 'Tone / Essence',
    priceTier: 'mid',
    priceUsd: 34,
    volume: '150 ml / 5.1 fl oz',
    rating: 4.9,
    reviewsCount: 260,
    skinTypes: ['Dry', 'Combination', 'Normal', 'Sensitive'],
    targetConcerns: ['Dehydration & Dullness', 'Sensitivity & Redness', 'Loss of Elasticity'],
    keyActives: ['Polyglutamic Acid (PGA)', 'Oat Beta-Glucan (98%)', 'Trehalose'],
    fullIngredientsSummary: 'Water, Butylene Glycol, Polyglutamic Acid, Beta-Glucan, Trehalose, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, 1,2-Hexanediol.',
    benefits: ['Holds 4x more moisture than standard hyaluronic acid', 'Forms a breathable humectant veil', 'Soothes micro-erythema immediately'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Cushioned essence with rapid trans-epidermal absorption',
    applicationTip: 'Pour 4-5 drops into cupped hands and press gently across face and neck while skin is still slightly damp.',
    clinicalRationale: 'Polyglutamic acid inhibits natural hyaluronidase enzymes while providing deep intercellular moisture retention.',
  },
  {
    id: 'prod_tn_02',
    name: '2% BHA + Willow Bark Clarifying Liquid',
    brand: 'Clinical Clarity',
    category: 'Tone / Essence',
    priceTier: 'budget',
    priceUsd: 26,
    volume: '120 ml / 4.0 fl oz',
    rating: 4.8,
    reviewsCount: 380,
    skinTypes: ['Oily', 'Combination'],
    targetConcerns: ['Pore Texture & Congestion', 'Acne & Blemishes'],
    keyActives: ['2.0% Salicylic Acid', 'Willow Bark Extract', 'Licorice Root Extract'],
    fullIngredientsSummary: 'Water, Propanediol, Salicylic Acid, Salix Alba (Willow) Bark Extract, Dipotassium Glycyrrhizate, Camellia Sinensis Leaf Extract, Sodium Hydroxide.',
    benefits: ['Clears micro-comedones and blackheads', 'Evens textured skin roughness', 'Soothes redness around pores'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'PM',
    texture: 'Weightless liquid fluid',
    applicationTip: 'Saturate a cotton round or pat 3-4 drops over T-zone. Start 3 evenings per week before increasing frequency.',
    clinicalRationale: 'Chemical exfoliant optimized at pH 3.6 for maximum free acid bioavailability without epithelial damage.',
  },
  {
    id: 'prod_tn_03',
    name: 'Centella Asiatica 95% Soothing Recovery Elixir',
    brand: 'PhytoShield',
    category: 'Tone / Essence',
    priceTier: 'mid',
    priceUsd: 32,
    volume: '180 ml / 6.1 fl oz',
    rating: 4.9,
    reviewsCount: 295,
    skinTypes: ['Sensitive', 'Dry', 'Combination', 'Normal'],
    targetConcerns: ['Sensitivity & Redness', 'Acne & Blemishes', 'Dehydration & Dullness'],
    keyActives: ['95% Fermented Centella Asiatica', 'Madecassoside', 'Asiaticoside'],
    fullIngredientsSummary: 'Centella Asiatica Leaf Water, Glycerin, 1,2-Hexanediol, Madecassoside, Asiatic Acid, Asiaticoside, Panthenol, Allantoin.',
    benefits: ['Down-regulates pro-inflammatory cytokines', 'Accelerates barrier repair after irritation', 'Instant cooling sensation'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Cooling watery splash',
    applicationTip: 'Layer 2 to 3 thin coats when experiencing redness or post-sun exposure.',
    clinicalRationale: 'Triterpenoid saponins stimulate type I collagen synthesis while accelerating epidermal tissue regeneration.',
  },

  // --- TARGETED SERUMS & TREATMENTS ---
  {
    id: 'prod_sr_01',
    name: '15% L-Ascorbic + 0.5% Ferulic Antioxidant Serum',
    brand: 'Skinovate Radiance',
    category: 'Treat / Serum',
    priceTier: 'luxury',
    priceUsd: 64,
    volume: '30 ml / 1.0 fl oz',
    rating: 4.9,
    reviewsCount: 512,
    skinTypes: ['Normal', 'Combination', 'Dry', 'Oily'],
    targetConcerns: ['Hyperpigmentation & Sun Spots', 'Dehydration & Dullness', 'Fine Lines & Wrinkles'],
    keyActives: ['15% Pure L-Ascorbic Acid (Vitamin C)', '0.5% Ferulic Acid', '1% Pure Tocopherol (Vitamin E)'],
    fullIngredientsSummary: 'Water, Ethoxydiglycol, Ascorbic Acid, Ferulic Acid, Tocopherol, Propylene Glycol, Panthenol, Phenoxyethanol.',
    benefits: ['Neutralizes oxidative free radicals generated by UVA/HEV light', 'Inhibits tyrosinase to lighten melanin deposits', 'Boosts dermal collagen synthesis'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'AM',
    texture: 'Light, fast-absorbing water serum with clinical golden hue',
    applicationTip: 'Apply 4-5 drops to completely dry skin every morning before moisturizer and SPF.',
    clinicalRationale: 'Gold-standard antioxidant triad: Ferulic acid doubles photoprotection and doubles stability of Vitamin C.',
  },
  {
    id: 'prod_sr_02',
    name: '10% Niacinamide + 1% Zinc PCA Sebum Balancer',
    brand: 'Skinovate DermaLab',
    category: 'Treat / Serum',
    priceTier: 'budget',
    priceUsd: 24,
    volume: '30 ml / 1.0 fl oz',
    rating: 4.8,
    reviewsCount: 890,
    skinTypes: ['Oily', 'Combination'],
    targetConcerns: ['Pore Texture & Congestion', 'Acne & Blemishes', 'Hyperpigmentation & Sun Spots'],
    keyActives: ['10% Niacinamide (Vitamin B3)', '1% Zinc PCA', 'Tamarind Seed Extract'],
    fullIngredientsSummary: 'Water, Niacinamide, Zinc PCA, Tamarindus Indica Seed Polysaccharide, Pentylene Glycol, Xanthan Gum, Phenoxyethanol.',
    benefits: ['Normalizes excess sebum secretion', 'Strengthens intercellular lipid matrix', 'Prevents post-inflammatory hyperpigmentation (PIH)'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Clear, silky fluid with zero tackiness',
    applicationTip: 'Dispense 3 drops across forehead, nose, and chin. Layer under moisturizer.',
    clinicalRationale: 'Niacinamide upregulates ceramide synthesis in keratinocytes while Zinc PCA regulates 5α-reductase activity.',
  },
  {
    id: 'prod_sr_03',
    name: '10% Micro-Encapsulated Azelaic Acid + Centella',
    brand: 'DermaCalm',
    category: 'Treat / Serum',
    priceTier: 'mid',
    priceUsd: 38,
    volume: '30 ml / 1.0 fl oz',
    rating: 4.9,
    reviewsCount: 340,
    skinTypes: ['Sensitive', 'Combination', 'Oily', 'Normal'],
    targetConcerns: ['Sensitivity & Redness', 'Acne & Blemishes', 'Hyperpigmentation & Sun Spots'],
    keyActives: ['10% Micronized Azelaic Acid', 'Centella Asiatica Extract', 'Allantoin'],
    fullIngredientsSummary: 'Water, Azelaic Acid, Propanediol, Dimethicone, Squalane, Centella Asiatica Extract, Allantoin, Polyacrylamide, C13-14 Isoparaffin, Laureth-7.',
    benefits: ['Calms facial flushing and persistent erythema', 'Gently exfoliates within pores', 'Fades stubborn post-breakout dark marks'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Ultra-light, soothing cream-gel',
    applicationTip: 'Smooth 1 pump over affected areas after lighter watery toners or essences.',
    clinicalRationale: 'Selectively targets hyperactive melanocytes and reduces kallikrein-5 mediated inflammation in sensitive skin.',
  },
  {
    id: 'prod_sr_04',
    name: '5% Tranexamic Acid + 2% Alpha Arbutin Complex',
    brand: 'MelanoFix Clinical',
    category: 'Treat / Serum',
    priceTier: 'mid',
    priceUsd: 44,
    volume: '30 ml / 1.0 fl oz',
    rating: 4.9,
    reviewsCount: 275,
    skinTypes: ['Normal', 'Dry', 'Combination', 'Oily'],
    targetConcerns: ['Hyperpigmentation & Sun Spots', 'Dehydration & Dullness'],
    keyActives: ['5% Tranexamic Acid', '2% Alpha Arbutin', 'N-Acetyl Glucosamine', 'Licorice Root'],
    fullIngredientsSummary: 'Water, Tranexamic Acid, Propanediol, Alpha-Arbutin, Acetyl Glucosamine, Glycyrrhiza Glabra (Licorice) Root Extract, Sodium Hyaluronate.',
    benefits: ['Interrupts multiple pathways of melanin transfer', 'Fades melasma and stubborn UV damage patches', 'Restores uniform luminous complexion'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Weightless amber fluid',
    applicationTip: 'Apply 3 drops morning and evening to face, focusing on hyperpigmented zones.',
    clinicalRationale: 'Plasmin inhibitor tranexamic acid blocks keratinocyte-melanocyte paracrine signaling cascades.',
  },
  {
    id: 'prod_sr_05',
    name: 'Copper Tripeptide-1 + Matrixyl 3000 Firming Serum',
    brand: 'BioPeptide Derma',
    category: 'Treat / Serum',
    priceTier: 'luxury',
    priceUsd: 68,
    volume: '30 ml / 1.0 fl oz',
    rating: 4.9,
    reviewsCount: 198,
    skinTypes: ['Normal', 'Dry', 'Combination'],
    targetConcerns: ['Loss of Elasticity', 'Fine Lines & Wrinkles', 'Dehydration & Dullness'],
    keyActives: ['1.0% Pure Copper Tripeptide-1 (GHK-Cu)', 'Matrixyl 3000 (Palmitoyl Tripeptide-1 & 7)', 'Tremella Mushroom'],
    fullIngredientsSummary: 'Water, Glycerin, Copper Tripeptide-1, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Tremella Fuciformis Sporocarp Extract, Sodium Hyaluronate.',
    benefits: ['Triggers pro-collagen and elastin synthesis', 'Accelerates micro-wound healing and skin bounce', 'Promotes cellular DNA repair'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Natural vibrant cobalt-blue water-gel with zero synthetic dyes',
    applicationTip: 'Smooth 4 drops across clean face and neck. Note: Do not layer with direct acids in the same routine step.',
    clinicalRationale: 'Signal and carrier peptides restore extracellular matrix architecture and dermal density.',
  },

  // --- MOISTURIZERS ---
  {
    id: 'prod_mz_01',
    name: 'Ceramide NP/AP/EOP Barrier Emulsion',
    brand: 'Skinovate LipidLab',
    category: 'Moisturize',
    priceTier: 'mid',
    priceUsd: 36,
    volume: '60 ml / 2.0 fl oz',
    rating: 4.9,
    reviewsCount: 640,
    skinTypes: ['Combination', 'Dry', 'Normal', 'Sensitive'],
    targetConcerns: ['Dehydration & Dullness', 'Sensitivity & Redness', 'Fine Lines & Wrinkles'],
    keyActives: ['Ceramides NP, AP, EOP (3:1:1 physiological ratio)', 'Cholesterol', 'Free Fatty Acids', 'Phytosphingosine'],
    fullIngredientsSummary: 'Water, Caprylic/Capric Triglyceride, Squalane, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Carbomer, Xanthan Gum.',
    benefits: ['Mimics human intercellular lipid bilayer', 'Prevents overnight moisture loss', 'Restores comfort within 15 minutes of application'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Cloud-soft lightweight cream with matte velvety dry-down',
    applicationTip: 'Warm 1-2 pumps between fingertips and press evenly into face, neck, and décolletage.',
    clinicalRationale: 'The 3:1:1 lipid ratio accelerates lamellar body secretion, reinforcing the compromised stratum corneum barrier.',
  },
  {
    id: 'prod_mz_02',
    name: 'Water-Burst Squalane + Ectoin Gel Moisturizer',
    brand: 'HydroGlow Clinical',
    category: 'Moisturize',
    priceTier: 'budget',
    priceUsd: 29,
    volume: '50 ml / 1.7 fl oz',
    rating: 4.8,
    reviewsCount: 310,
    skinTypes: ['Oily', 'Combination'],
    targetConcerns: ['Dehydration & Dullness', 'Pore Texture & Congestion', 'Acne & Blemishes'],
    keyActives: ['Pure Sugarcane Squalane (2%)', '1% Ectoin Extremolyte', 'Marine Algae Hydrosol'],
    fullIngredientsSummary: 'Water, Butylene Glycol, Squalane, Ectoin, Sodium Hyaluronate, Laminaria Saccharina Extract, Carbomer, Arginine, Phenoxyethanol.',
    benefits: ['100% oil-free feel with 24h continuous hydration', 'Protects against environmental particulate pollution', 'Zero pore clogging or mid-day shine'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Cooling sheer water-burst jelly',
    applicationTip: 'Smooth a nickel-sized amount over skin after active serums.',
    clinicalRationale: 'Ectoin creates protective hydration shields around cellular structures, suppressing stress-induced matrix degradation.',
  },
  {
    id: 'prod_mz_03',
    name: 'Deep Peptide Recovery Velvet Crème',
    brand: 'Skinovate Luxe',
    category: 'Moisturize',
    priceTier: 'luxury',
    priceUsd: 56,
    volume: '50 ml / 1.7 fl oz',
    rating: 4.9,
    reviewsCount: 220,
    skinTypes: ['Dry', 'Normal', 'Sensitive'],
    targetConcerns: ['Loss of Elasticity', 'Fine Lines & Wrinkles', 'Dehydration & Dullness'],
    keyActives: ['Hexapeptide-8 (Argireline)', 'Bakuchiol (1%)', 'Shea Butter Esters'],
    fullIngredientsSummary: 'Water, Butyrospermum Parkii Butter, Squalane, Acetyl Hexapeptide-8, Bakuchiol, Niacinamide, Sodium Hyaluronate, Cetearyl Alcohol, Tocopherol.',
    benefits: ['Smooths expression lines and enhances skin elasticity', 'Nourishes lipid-depleted mature skin', 'Velvety protective finish for nighttime repair'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Rich, whipped velvet cream',
    applicationTip: 'Gently massage onto face using upward lifting strokes.',
    clinicalRationale: 'Acetyl Hexapeptide-8 modulates neuro-exocytosis, visibly softening dynamic expression lines.',
  },

  // --- SUN PROTECTION (SPF) ---
  {
    id: 'prod_spf_01',
    name: 'Invisible Feather-Light Fluid SPF 50+ PA++++',
    brand: 'Skinovate Shield',
    category: 'Protect (SPF)',
    priceTier: 'mid',
    priceUsd: 34,
    volume: '50 ml / 1.7 fl oz',
    rating: 4.9,
    reviewsCount: 780,
    skinTypes: ['Oily', 'Combination', 'Normal', 'Dry', 'Sensitive'],
    targetConcerns: ['Hyperpigmentation & Sun Spots', 'Fine Lines & Wrinkles'],
    keyActives: ['Next-Gen Modern UV Filters (Tinosorb S, Uvinul A Plus)', 'Ectoin (1%)', 'Vitamin E'],
    fullIngredientsSummary: 'Water, Dibutyl Adipate, Propanediol, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Ectoin, Tocopherol.',
    benefits: ['Zero white cast on all Fitzpatrick skin tones (I-VI)', 'Non-greasy satin finish that primes makeup', 'Shields against UVA, UVB, and HEV blue light'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'AM',
    texture: 'Ultra-fluid milky serum',
    applicationTip: 'Apply 2 generous finger-lengths to face, ears, and neck 15 minutes before UV exposure. Reapply every 2 hours outdoors.',
    clinicalRationale: 'Photostable broad-spectrum UV protection is the single most critical preventive factor against photoaging and hyperpigmentation.',
  },
  {
    id: 'prod_spf_02',
    name: '100% Mineral Calming Tinted Shield SPF 50',
    brand: 'PureMineral Clinical',
    category: 'Protect (SPF)',
    priceTier: 'mid',
    priceUsd: 38,
    volume: '50 ml / 1.7 fl oz',
    rating: 4.8,
    reviewsCount: 290,
    skinTypes: ['Sensitive', 'Normal', 'Combination'],
    targetConcerns: ['Sensitivity & Redness', 'Acne & Blemishes', 'Hyperpigmentation & Sun Spots'],
    keyActives: ['18% Non-Nano Zinc Oxide', 'Bisabolol', 'Iron Oxides (Blue Light Shield)'],
    fullIngredientsSummary: 'Zinc Oxide, Water, Caprylic/Capric Triglyceride, C13-15 Alkane, Bisabolol, Iron Oxides (CI 77491, CI 77492, CI 77499), Polyglyceryl-3 Polyricinoleate.',
    benefits: ['Physically deflecting UV rays with zero chemical filter stinging', 'Universal translucent tint neutralizes facial redness', 'Iron oxides block high-energy visible (HEV) blue light'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'AM',
    texture: 'Silky tinted lotion with natural demi-matte radiance',
    applicationTip: 'Shake well. Apply 2 finger lengths evenly over face and blend into hairline.',
    clinicalRationale: 'Non-nano zinc oxide provides anti-inflammatory calming benefits ideal for rosacea-prone and reactive skin barriers.',
  },

  // --- NIGHT RECOVERY & RETINOIDS ---
  {
    id: 'prod_nt_01',
    name: 'Micro-Encapsulated Retinaldehyde (0.05%) Active Treatment',
    brand: 'Skinovate RetinoidLab',
    category: 'Night Recovery',
    priceTier: 'luxury',
    priceUsd: 62,
    volume: '30 ml / 1.0 fl oz',
    rating: 4.9,
    reviewsCount: 410,
    skinTypes: ['Normal', 'Combination', 'Dry', 'Oily'],
    targetConcerns: ['Fine Lines & Wrinkles', 'Acne & Blemishes', 'Pore Texture & Congestion', 'Hyperpigmentation & Sun Spots'],
    keyActives: ['0.05% Liposome-Encapsulated Retinaldehyde', 'Madecassoside', 'Ceramide NP'],
    fullIngredientsSummary: 'Water, Caprylic/Capric Triglyceride, Glycerin, Retinal (0.05%), Madecassoside, Ceramide NP, Phospholipids, Tocopherol, Carbomer.',
    benefits: ['Converts to retinoic acid 11x faster than retinol with lower irritation', 'Direct antibacterial action against C. acnes', 'Accelerates cellular turnover and collagen synthesis'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'PM',
    texture: 'Naturally saffron-yellow lightweight serum-lotion',
    applicationTip: 'Apply a pea-sized amount onto completely dry skin at night. Start 2 nights per week and build tolerance gradually.',
    clinicalRationale: 'Retinal requires only 1 metabolic conversion to retinoic acid, minimizing cellular metabolic strain while optimizing efficacy.',
  },
  {
    id: 'prod_nt_02',
    name: '0.2% Granactive Retinoid Gentle Night Oil',
    brand: 'DermaGentle',
    category: 'Night Recovery',
    priceTier: 'budget',
    priceUsd: 26,
    volume: '30 ml / 1.0 fl oz',
    rating: 4.8,
    reviewsCount: 315,
    skinTypes: ['Sensitive', 'Dry', 'Normal'],
    targetConcerns: ['Fine Lines & Wrinkles', 'Sensitivity & Redness', 'Loss of Elasticity'],
    keyActives: ['Hydroxypinacolone Retinoate (Granactive Retinoid)', 'Jojoba Oil', 'Squalane'],
    fullIngredientsSummary: 'Squalane, Simmondsia Chinensis (Jojoba) Seed Oil, Hydroxypinacolone Retinoate, Dimethyl Isosorbide, Tocopherol.',
    benefits: ['Direct retinoid receptor binding with minimal erythema or flaking', 'Nourishes dry skin while smoothing texture', 'Ideal for first-time retinoid beginners'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'PM',
    texture: 'Silky, dry fast-absorbing facial oil',
    applicationTip: 'Press 2-3 drops into face as the final step of your evening regimen.',
    clinicalRationale: 'Hydroxypinacolone Retinoate directly activates retinoic acid receptors without requiring enzymatic degradation.',
  },
  {
    id: 'prod_nt_03',
    name: 'Cica Sleeping Lipid Barrier Recovery Cocoon',
    brand: 'BarrierLab Clinical',
    category: 'Night Recovery',
    priceTier: 'mid',
    priceUsd: 38,
    volume: '60 ml / 2.0 fl oz',
    rating: 4.9,
    reviewsCount: 380,
    skinTypes: ['Sensitive', 'Dry', 'Combination', 'Normal'],
    targetConcerns: ['Sensitivity & Redness', 'Dehydration & Dullness'],
    keyActives: ['Centella Asiatica Extract', 'Madecassic Acid', 'Cholesterol', 'Allantoin'],
    fullIngredientsSummary: 'Water, Glycerin, Caprylic/Capric Triglyceride, Butylene Glycol, Centella Asiatica Extract, Madecassic Acid, Cholesterol, Carbomer, Arginine.',
    benefits: ['Creates an overnight trans-epidermal moisture lock', 'Calms visible reactivity and tightness overnight', 'Wake up to supple, cushioned skin'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'PM',
    texture: 'Pudding-like cushion balm that melts upon contact',
    applicationTip: 'Apply generously as the final step of PM routine, especially on evenings when your skin feels irritated.',
    clinicalRationale: 'Inhibits overnight trans-epidermal water loss (TEWL) during peak nocturnal cellular repair phases.',
  },

  // --- EYE CARE ---
  {
    id: 'prod_eye_01',
    name: '5% Caffeine + EGCG Dark Circle De-Puffing Solution',
    brand: 'OptiLuxe Derma',
    category: 'Eye Care',
    priceTier: 'mid',
    priceUsd: 32,
    volume: '15 ml / 0.5 fl oz',
    rating: 4.8,
    reviewsCount: 340,
    skinTypes: ['Normal', 'Combination', 'Dry', 'Oily', 'Sensitive'],
    targetConcerns: ['Dark Circles & Eye Puffiness', 'Fine Lines & Wrinkles'],
    keyActives: ['5% Pure Caffeine', 'Epigallocatechin Gallatyl Glucoside (EGCG)', 'Hyaluronic Acid'],
    fullIngredientsSummary: 'Water, Caffeine, Maltodextrin, Glycerin, Propanediol, Epigallocatechin Gallatyl Glucoside, Sodium Hyaluronate, Hydroxyethylcellulose.',
    benefits: ['Vasoconstricts micro-capillaries to visibly reduce puffiness', 'Fades vascular periorbital dark shadows', 'Re-energizes tired morning eyes'],
    attributes: {
      fragranceFree: true,
      alcoholFree: true,
      vegan: true,
      crueltyFree: true,
      nonComedogenic: true,
    },
    usageTime: 'Both',
    texture: 'Cooling, refreshing liquid fluid',
    applicationTip: 'Gently pat 1 drop around orbital bone using ring finger.',
    clinicalRationale: 'High solubility caffeine stimulates microcirculation and promotes lymphatic drainage of periorbital edema.',
  },
];

// ==========================================
// 2. Comprehensive Active Ingredients Database
// ==========================================
export const ACTIVE_INGREDIENTS_LIBRARY: IngredientIntelligence[] = [
  {
    id: 'ing_ha',
    name: 'Multi-Weight Hyaluronic Acid',
    inciName: 'Sodium Hyaluronate / Hydrolyzed Hyaluronic Acid',
    category: 'Hydrator / Humectant',
    role: 'Binds up to 1,000 times its molecular weight in water, hydrating both superficial and deeper epidermal layers.',
    optimalConcentration: '1.0% - 2.5%',
    timeOfDay: 'Both',
    synergies: ['Panthenol (B5)', 'Ceramides', 'Glycerin', 'Niacinamide'],
    avoidWith: [],
    whyRecommended: 'Essential for combating dehydrated skin matrices and restoring supple skin turgor.',
    targetConcerns: ['Dehydration & Dullness', 'Fine Lines & Wrinkles'],
  },
  {
    id: 'ing_niacinamide',
    name: 'Niacinamide (Vitamin B3)',
    inciName: 'Niacinamide',
    category: 'Sebum Regulator',
    role: 'Stimulates ceramide and free fatty acid synthesis, suppresses melanosome transfer, and refines pore diameter.',
    optimalConcentration: '2% - 10%',
    timeOfDay: 'Both',
    synergies: ['Zinc PCA', 'Hyaluronic Acid', 'Ceramides', 'Retinol / Retinal', 'Centella'],
    avoidWith: [],
    whyRecommended: 'Multi-tasking powerhouse for pore congestion, uneven pigmentation, and strengthening the barrier.',
    targetConcerns: ['Pore Texture & Congestion', 'Acne & Blemishes', 'Hyperpigmentation & Sun Spots'],
  },
  {
    id: 'ing_retinal',
    name: 'Micro-Encapsulated Retinaldehyde',
    inciName: 'Retinal',
    category: 'Cell Turnover / Retinoid',
    role: 'Potent vitamin A precursor that requires only a single direct enzymatic step to become active retinoic acid.',
    optimalConcentration: '0.05% - 0.1%',
    timeOfDay: 'PM',
    synergies: ['Ceramides', 'Peptides', 'Hyaluronic Acid', 'Centella Asiatica'],
    avoidWith: ['High-Strength AHAs (Glycolic > 7%) in same PM step', 'Pure L-Ascorbic Acid in same PM step'],
    whyRecommended: 'Accelerates cell renewal, unclogs microcomedones, and stimulates dermal collagen with clinical efficiency.',
    targetConcerns: ['Fine Lines & Wrinkles', 'Acne & Blemishes', 'Pore Texture & Congestion', 'Loss of Elasticity'],
  },
  {
    id: 'ing_vit_c',
    name: 'L-Ascorbic Acid (Pure Vitamin C)',
    inciName: 'Ascorbic Acid',
    category: 'Antioxidant',
    role: 'Neutralizes free radicals from UV and environmental pollution, downregulates tyrosinase, and synthesizes collagen.',
    optimalConcentration: '10% - 15%',
    timeOfDay: 'AM',
    synergies: ['Ferulic Acid', 'Tocopherol (Vitamin E)', 'Hyaluronic Acid'],
    avoidWith: ['Direct Retinoids in same morning step', 'Direct Benzoyl Peroxide'],
    whyRecommended: 'Critical morning antioxidant shield against premature photoaging and persistent pigmentation spots.',
    targetConcerns: ['Hyperpigmentation & Sun Spots', 'Dehydration & Dullness', 'Fine Lines & Wrinkles'],
  },
  {
    id: 'ing_ceramides',
    name: 'Ceramides (NP, AP, EOP) Complex',
    inciName: 'Ceramide NP, Ceramide AP, Ceramide EOP',
    category: 'Barrier Lipid',
    role: 'Fundamental physiological lipids comprising 50% of the stratum corneum intercellular glue, sealing hydration in.',
    optimalConcentration: '1% - 3% physiological ratio',
    timeOfDay: 'Both',
    synergies: ['Cholesterol', 'Fatty Acids', 'Phytosphingosine', 'Niacinamide'],
    avoidWith: [],
    whyRecommended: 'Repairs compromised lipid barriers and eliminates trans-epidermal moisture leakage.',
    targetConcerns: ['Dehydration & Dullness', 'Sensitivity & Redness', 'Loss of Elasticity'],
  },
  {
    id: 'ing_azelaic',
    name: 'Azelaic Acid',
    inciName: 'Azelaic Acid',
    category: 'Soothing / Anti-inflammatory',
    role: 'Selectively normalizes abnormal melanocytes, inhibits tyrosinase, and inhibits pro-inflammatory pathways.',
    optimalConcentration: '10% - 15%',
    timeOfDay: 'Both',
    synergies: ['Niacinamide', 'Centella Asiatica', 'Hyaluronic Acid'],
    avoidWith: ['Harsh physical scrubs', 'High concentration alcohol astringents'],
    whyRecommended: 'Ideal for sensitive skin with redness, rosacea tendencies, or lingering post-acne pigmentation.',
    targetConcerns: ['Sensitivity & Redness', 'Acne & Blemishes', 'Hyperpigmentation & Sun Spots'],
  },
  {
    id: 'ing_centella',
    name: 'Centella Asiatica & Madecassoside',
    inciName: 'Centella Asiatica Leaf Extract / Madecassoside',
    category: 'Soothing / Anti-inflammatory',
    role: 'Suppresses NF-κB inflammatory signaling and stimulates microvascular collagen regeneration.',
    optimalConcentration: '0.1% - 2.0% pure madecassoside or 80%+ fermented extract',
    timeOfDay: 'Both',
    synergies: ['Panthenol', 'Ceramides', 'Allantoin', 'Azelaic Acid'],
    avoidWith: [],
    whyRecommended: 'Immediate relief for reactive skin, micro-flushing, and compromised epidermal integrity.',
    targetConcerns: ['Sensitivity & Redness', 'Acne & Blemishes', 'Dehydration & Dullness'],
  },
  {
    id: 'ing_bha',
    name: 'Salicylic Acid (BHA)',
    inciName: 'Salicylic Acid',
    category: 'Exfoliant / Acid',
    role: 'Oil-soluble beta hydroxy acid that dissolves keratin plugs inside follicles, clearing blackheads and enlarged pores.',
    optimalConcentration: '1.0% - 2.0%',
    timeOfDay: 'PM',
    synergies: ['Green Tea Extract', 'Niacinamide', 'Zinc PCA'],
    avoidWith: ['Retinal / Retinol in the same application step (alternate nights)'],
    whyRecommended: 'Targets sebaceous congestion and surface texture irregularities without mechanical abrasion.',
    targetConcerns: ['Pore Texture & Congestion', 'Acne & Blemishes'],
  },
];

// ==========================================
// 3. Clinical Compatibility & Matching Algorithm
// ==========================================
export function calculateProductCompatibility(
  product: SkincareProduct,
  profile: SkinProfileData | null,
  analysis: SkinAnalysisRecord | null
): { score: number; matchReasons: string[] } {
  let score = 70; // baseline
  const matchReasons: string[] = [];

  // 1. Skin Type Match (+15%)
  if (profile?.skinType && product.skinTypes.includes(profile.skinType)) {
    score += 10;
    matchReasons.push(`Formulated specifically for ${profile.skinType} skin characteristics.`);
  }

  // 2. Target Concerns Match (+15%)
  if (profile?.primaryConcerns && profile.primaryConcerns.length > 0) {
    const matchedConcerns = profile.primaryConcerns.filter((c) => product.targetConcerns.includes(c));
    if (matchedConcerns.length > 0) {
      score += Math.min(15, matchedConcerns.length * 7);
      matchReasons.push(`Directly targets ${matchedConcerns.join(', ')}.`);
    }
  }

  // 3. Biometric Analysis Deficiencies Match (+20%)
  if (analysis?.metrics) {
    const { hydration, barrierHealth, poreCongestion, rednessSensitivity, textureSmoothness, pigmentEvenness } = analysis.metrics;

    // Hydration deficit (<70)
    if (hydration?.score && hydration.score < 70) {
      if (product.keyActives.some((a) => a.toLowerCase().includes('hyaluronic') || a.toLowerCase().includes('polyglutamic') || a.toLowerCase().includes('beta-glucan') || a.toLowerCase().includes('squalane'))) {
        score += 8;
        matchReasons.push(`Hydration active replenishes your detected ${hydration.score}/100 moisture deficit.`);
      }
    }

    // Barrier deficiency (<70)
    if (barrierHealth?.score && barrierHealth.score < 70) {
      if (product.keyActives.some((a) => a.toLowerCase().includes('ceramide') || a.toLowerCase().includes('lipid') || a.toLowerCase().includes('panthenol') || a.toLowerCase().includes('cholesterol'))) {
        score += 8;
        matchReasons.push(`Physiological lipids reinforce your measured ${barrierHealth.score}/100 barrier health score.`);
      }
    }

    // Pore congestion / high oil (<70 or elevated)
    if (poreCongestion?.score && poreCongestion.score < 70) {
      if (product.keyActives.some((a) => a.toLowerCase().includes('salicylic') || a.toLowerCase().includes('zinc') || a.toLowerCase().includes('niacinamide'))) {
        score += 8;
        matchReasons.push(`Follicular decongestant clarifies your T-zone texture metric.`);
      }
    }

    // Redness / sensitivity (<70)
    if (rednessSensitivity?.score && rednessSensitivity.score < 70) {
      if (product.keyActives.some((a) => a.toLowerCase().includes('centella') || a.toLowerCase().includes('azelaic') || a.toLowerCase().includes('madecassoside') || a.toLowerCase().includes('bisabolol'))) {
        score += 8;
        matchReasons.push(`Anti-inflammatory actives soothe detected facial erythema.`);
      }
    }

    // Pigmentation irregularity (<70)
    if (pigmentEvenness?.score && pigmentEvenness.score < 70) {
      if (product.keyActives.some((a) => a.toLowerCase().includes('vitamin c') || a.toLowerCase().includes('tranexamic') || a.toLowerCase().includes('arbutin') || a.toLowerCase().includes('ferulic'))) {
        score += 7;
        matchReasons.push(`Tyrosinase-inhibiting actives optimize tone uniformity.`);
      }
    }
  }

  // 4. Sensitivity Protection
  if (profile?.sensitivityLevel === 'High (Reactive)') {
    if (product.attributes.fragranceFree && product.attributes.alcoholFree) {
      score += 5;
    } else {
      score -= 15;
    }
  }

  // 5. Budget Tier Match
  if (profile?.budgetPreference && profile.budgetPreference !== 'flexible') {
    if (product.priceTier === profile.budgetPreference) {
      score += 4;
    }
  }

  // Bound score between 60 and 99
  const finalScore = Math.min(99, Math.max(60, score));

  if (matchReasons.length === 0) {
    matchReasons.push('Broad-spectrum dermatological compatibility with your profile goals.');
  }

  return {
    score: finalScore,
    matchReasons,
  };
}

// ==========================================
// 4. Personalized Routine Plan Generator
// ==========================================
export function generatePersonalizedRoutine(
  userId: string,
  profile: SkinProfileData | null,
  analysis: SkinAnalysisRecord | null
): { amSteps: RoutineStep[]; pmSteps: RoutineStep[]; conditionAlerts: RoutineConditionAlert[] } {
  const amSteps: RoutineStep[] = [];
  const pmSteps: RoutineStep[] = [];
  const conditionAlerts: RoutineConditionAlert[] = [];

  const skinType: SkinType = profile?.skinType || 'Combination';
  const isSensitive = profile?.sensitivityLevel === 'High (Reactive)';
  const hydrationScore = analysis?.metrics?.hydration?.score ?? 72;
  const barrierScore = analysis?.metrics?.barrierHealth?.score ?? 75;
  const rednessScore = analysis?.metrics?.rednessSensitivity?.score ?? 80;
  const poreScore = analysis?.metrics?.poreCongestion?.score ?? 68;
  const pigmentScore = analysis?.metrics?.pigmentEvenness?.score ?? 74;

  // ------------------------------------------
  // Condition Alerts based on real-time biometric scan
  // ------------------------------------------
  if (barrierScore < 68) {
    conditionAlerts.push({
      id: 'alert_barrier_repair',
      type: 'warning',
      metricTrigger: 'Barrier Health (Below 68)',
      message: 'Compromised stratum corneum detected. High-concentration direct acids paused.',
      suggestedAction: 'Focus on 3:1:1 Ceramide emulsion and overnight lipid shielding.',
    });
  }

  if (rednessScore < 65) {
    conditionAlerts.push({
      id: 'alert_redness_relief',
      type: 'caution',
      metricTrigger: 'Facial Erythema / Redness',
      message: 'Active capillary dilation detected on cheeks. Soothing Centella & Azelaic activated.',
      suggestedAction: 'Avoid warm water washes and mechanical scrubbing.',
    });
  }

  if (hydrationScore < 65) {
    conditionAlerts.push({
      id: 'alert_hydration_boost',
      type: 'info',
      metricTrigger: 'Epidermal Hydration Deficit',
      message: 'Intracellular water levels low. Multi-weight Polyglutamic & HA infusion prioritized.',
      suggestedAction: 'Apply humectant layers onto damp skin immediately after cleansing.',
    });
  }

  // ------------------------------------------
  // Morning (AM) Regimen Assembly
  // ------------------------------------------
  // Step 1: Gentle Cleanser
  const amCleanser = skinType === 'Oily' && poreScore < 70 && !isSensitive
    ? SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_cl_02')!
    : SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_cl_01')!;

  amSteps.push({
    id: `step_am_1_${amCleanser.id}`,
    order: 1,
    period: 'AM',
    category: 'Cleanse',
    productId: amCleanser.id,
    productName: amCleanser.name,
    brand: amCleanser.brand,
    activeIngredients: amCleanser.keyActives.join(', '),
    directions: 'Massage over damp skin for 45 seconds using lukewarm water to clear nocturnal sebum without stripping lipids.',
    applicationTip: 'Rinse with lukewarm water. Never use hot water which disrupts stratum corneum enzymes.',
    waitTimeMinutes: 0,
    compatibilityScore: calculateProductCompatibility(amCleanser, profile, analysis).score,
    completed: false,
  });

  // Step 2: Tone / Essence (if dehydrated or sensitive)
  if (hydrationScore < 75 || isSensitive || rednessScore < 75) {
    const amToner = rednessScore < 70
      ? SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_tn_03')!
      : SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_tn_01')!;

    amSteps.push({
      id: `step_am_2_${amToner.id}`,
      order: amSteps.length + 1,
      period: 'AM',
      category: 'Tone / Essence',
      productId: amToner.id,
      productName: amToner.name,
      brand: amToner.brand,
      activeIngredients: amToner.keyActives.join(', '),
      directions: 'Press 4-5 drops into face while skin is still slightly damp from cleansing.',
      applicationTip: 'Pat gently rather than wiping to maximize trans-epidermal permeation.',
      waitTimeMinutes: 1,
      compatibilityScore: calculateProductCompatibility(amToner, profile, analysis).score,
      completed: false,
    });
  }

  // Step 3: Targeted AM Antioxidant or Sebum/Redness Treatment
  let amSerum: SkincareProduct;
  if (rednessScore < 65 || isSensitive) {
    amSerum = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_sr_03')!; // 10% Azelaic
  } else if (poreScore < 70 || skinType === 'Oily') {
    amSerum = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_sr_02')!; // 10% Niacinamide + Zinc
  } else if (pigmentScore < 70) {
    amSerum = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_sr_01')!; // 15% Vitamin C + Ferulic
  } else {
    amSerum = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_sr_01')!;
  }

  amSteps.push({
    id: `step_am_3_${amSerum.id}`,
    order: amSteps.length + 1,
    period: 'AM',
    category: 'Treat / Serum',
    productId: amSerum.id,
    productName: amSerum.name,
    brand: amSerum.brand,
    activeIngredients: amSerum.keyActives.join(', '),
    directions: amSerum.applicationTip,
    applicationTip: 'Allow 60 seconds to absorb into the stratum corneum before sealing with moisturizer.',
    waitTimeMinutes: 1,
    compatibilityScore: calculateProductCompatibility(amSerum, profile, analysis).score,
    completed: false,
  });

  // Step 4: Moisturizer
  const amMoisturizer = skinType === 'Oily'
    ? SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_mz_02')! // Water-burst Squalane Gel
    : SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_mz_01')!; // Ceramide Barrier Emulsion

  amSteps.push({
    id: `step_am_4_${amMoisturizer.id}`,
    order: amSteps.length + 1,
    period: 'AM',
    category: 'Moisturize',
    productId: amMoisturizer.id,
    productName: amMoisturizer.name,
    brand: amMoisturizer.brand,
    activeIngredients: amMoisturizer.keyActives.join(', '),
    directions: 'Warm between fingertips and gently press across face and neck.',
    applicationTip: 'Provides physiological lipids to keep moisture sealed throughout the day.',
    waitTimeMinutes: 1,
    compatibilityScore: calculateProductCompatibility(amMoisturizer, profile, analysis).score,
    completed: false,
  });

  // Step 5: Broad Spectrum Sun Protection (SPF 50+)
  const amSpf = isSensitive || rednessScore < 68
    ? SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_spf_02')! // Mineral Tinted Shield
    : SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_spf_01')!; // Invisible Feather-Light Fluid

  amSteps.push({
    id: `step_am_5_${amSpf.id}`,
    order: amSteps.length + 1,
    period: 'AM',
    category: 'Protect (SPF)',
    productId: amSpf.id,
    productName: amSpf.name,
    brand: amSpf.brand,
    activeIngredients: amSpf.keyActives.join(', '),
    directions: 'Apply two full finger-lengths evenly across face, ears, and neck 15 minutes before UV exposure.',
    applicationTip: 'Critical non-negotiable step: UV rays cause 80% of preventable premature facial aging.',
    waitTimeMinutes: 2,
    compatibilityScore: calculateProductCompatibility(amSpf, profile, analysis).score,
    completed: false,
  });

  // ------------------------------------------
  // Evening (PM) Regimen Assembly
  // ------------------------------------------
  // PM Step 1: Double Cleanse / First Cleanser
  const pmMelt = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_cl_03')!;
  pmSteps.push({
    id: `step_pm_1_${pmMelt.id}`,
    order: 1,
    period: 'PM',
    category: 'Cleanse',
    productId: pmMelt.id,
    productName: pmMelt.name,
    brand: pmMelt.brand,
    activeIngredients: pmMelt.keyActives.join(', '),
    directions: 'Massage dry face for 60 seconds to break down sunscreen and airborne particulates. Emulsify with warm water.',
    applicationTip: 'First step in double cleansing ensures no lingering waterproof SPF clogs pores.',
    waitTimeMinutes: 0,
    compatibilityScore: calculateProductCompatibility(pmMelt, profile, analysis).score,
    completed: false,
  });

  // PM Step 2: Second Water Cleanser
  const pmSecondCleanser = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_cl_01')!;
  pmSteps.push({
    id: `step_pm_2_${pmSecondCleanser.id}`,
    order: 2,
    period: 'PM',
    category: 'Cleanse',
    productId: pmSecondCleanser.id,
    productName: pmSecondCleanser.name,
    brand: pmSecondCleanser.brand,
    activeIngredients: pmSecondCleanser.keyActives.join(', '),
    directions: 'Gentle second wash to leave skin pristine and primed for cellular active absorption.',
    applicationTip: 'Pat dry with a fresh, clean microfiber towel.',
    waitTimeMinutes: 0,
    compatibilityScore: calculateProductCompatibility(pmSecondCleanser, profile, analysis).score,
    completed: false,
  });

  // PM Step 3: Evening Cellular Active / Night Recovery
  let pmActive: SkincareProduct;
  if (barrierScore < 68 || rednessScore < 65) {
    // If barrier is compromised or red, avoid strong retinoids, use Cica Sleeping Barrier
    pmActive = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_nt_03')!;
  } else if (isSensitive) {
    pmActive = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_nt_02')!; // Granactive Retinoid Gentle Night Oil
  } else {
    pmActive = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_nt_01')!; // Micro-Encapsulated Retinaldehyde 0.05%
  }

  pmSteps.push({
    id: `step_pm_3_${pmActive.id}`,
    order: 3,
    period: 'PM',
    category: 'Night Recovery',
    productId: pmActive.id,
    productName: pmActive.name,
    brand: pmActive.brand,
    activeIngredients: pmActive.keyActives.join(', '),
    directions: pmActive.applicationTip,
    applicationTip: 'Ensure skin is bone dry before application. Retinoids penetrate too rapidly on damp skin.',
    waitTimeMinutes: 2,
    conflictWarning: 'Do not layer with direct AHA/BHA chemical exfoliants on the same night.',
    compatibilityScore: calculateProductCompatibility(pmActive, profile, analysis).score,
    completed: false,
  });

  // PM Step 4: Eye Contour Care (if eye puffiness or dark circles are a concern)
  if (profile?.primaryConcerns?.some((c) => c.includes('Eye') || c.includes('Dark Circles')) || analysis?.detectedZones?.periorbital) {
    const eyeProd = SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_eye_01')!;
    pmSteps.push({
      id: `step_pm_4_${eyeProd.id}`,
      order: pmSteps.length + 1,
      period: 'PM',
      category: 'Eye Care',
      productId: eyeProd.id,
      productName: eyeProd.name,
      brand: eyeProd.brand,
      activeIngredients: eyeProd.keyActives.join(', '),
      directions: eyeProd.applicationTip,
      applicationTip: 'Tap lightly along orbital bone. Avoid putting too close to the lower lash line.',
      waitTimeMinutes: 1,
      compatibilityScore: calculateProductCompatibility(eyeProd, profile, analysis).score,
      completed: false,
    });
  }

  // PM Step 5: Barrier Sealing Night Cream / Cocoon
  const pmMoisturizer = barrierScore < 70 || skinType === 'Dry'
    ? SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_mz_01')!
    : SKINCARE_PRODUCTS_CATALOG.find((p) => p.id === 'prod_mz_03')!;

  pmSteps.push({
    id: `step_pm_5_${pmMoisturizer.id}`,
    order: pmSteps.length + 1,
    period: 'PM',
    category: 'Moisturize',
    productId: pmMoisturizer.id,
    productName: pmMoisturizer.name,
    brand: pmMoisturizer.brand,
    activeIngredients: pmMoisturizer.keyActives.join(', '),
    directions: 'Gently press a generous amount across face to seal nocturnal active treatments.',
    applicationTip: 'Acts as an occlusive shield against dry indoor heating or air conditioning during sleep.',
    waitTimeMinutes: 0,
    compatibilityScore: calculateProductCompatibility(pmMoisturizer, profile, analysis).score,
    completed: false,
  });

  return { amSteps, pmSteps, conditionAlerts };
}

// ==========================================
// 5. Conflict & Synergy Checker
// ==========================================
export function checkRoutineConflicts(steps: RoutineStep[]): { hasConflict: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const activeStrings = steps.map((s) => s.activeIngredients.toLowerCase());

  const hasRetinoid = activeStrings.some((s) => s.includes('retinal') || s.includes('retinol') || s.includes('retinoid'));
  const hasStrongBHA_AHA = activeStrings.some((s) => s.includes('salicylic') || s.includes('glycolic') || s.includes('lactic'));
  const hasPureVitC = activeStrings.some((s) => s.includes('l-ascorbic') || s.includes('ascorbic acid'));
  const hasCopperPeptides = activeStrings.some((s) => s.includes('copper tripeptide') || s.includes('ghk-cu'));

  if (hasRetinoid && hasStrongBHA_AHA) {
    warnings.push('Retinoids and Direct Hydroxy Acids (AHA/BHA) detected in the same routine sequence. Applying both concurrently increases transepidermal barrier stress. Recommend alternating evenings.');
  }

  if (hasPureVitC && hasCopperPeptides) {
    warnings.push('Copper Peptides and L-Ascorbic Acid can oxidize each other, reducing antioxidant efficacy. Separate them: Vitamin C in AM, Peptides in PM.');
  }

  return {
    hasConflict: warnings.length > 0,
    warnings,
  };
}
