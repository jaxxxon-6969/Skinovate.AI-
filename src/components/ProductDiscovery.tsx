import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Check,
  Plus,
  ArrowRightLeft,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  Droplets,
  Star,
  Tag,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import {
  SkincareProduct,
  ProductCategory,
  PriceTier,
  UserProfile,
  SkinProfileData,
  SkinAnalysisRecord,
} from '../types';
import {
  SKINCARE_PRODUCTS_CATALOG,
  calculateProductCompatibility,
} from '../lib/recommendationEngine';

interface ProductDiscoveryProps {
  currentUser: UserProfile;
  profile: SkinProfileData | null;
  latestAnalysis: SkinAnalysisRecord | null;
  onAddToRoutine: (period: 'AM' | 'PM', product: SkincareProduct) => void;
  onSwapProduct?: (product: SkincareProduct) => void;
  swapMode?: { stepId: string; period: 'AM' | 'PM'; currentProductName: string } | null;
  onCancelSwap?: () => void;
}

export const ProductDiscovery: React.FC<ProductDiscoveryProps> = ({
  currentUser,
  profile,
  latestAnalysis,
  onAddToRoutine,
  onSwapProduct,
  swapMode,
  onCancelSwap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('All');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'priceAsc' | 'priceDesc'>('match');
  const [selectedProductForModal, setSelectedProductForModal] = useState<SkincareProduct | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const categories: string[] = [
    'All',
    'Cleanse',
    'Tone / Essence',
    'Treat / Serum',
    'Moisturize',
    'Protect (SPF)',
    'Night Recovery',
    'Eye Care',
  ];

  const popularActives: string[] = [
    'All',
    'Ceramides',
    'Niacinamide',
    'Hyaluronic Acid',
    'Retinal',
    'Centella',
    'Vitamin C',
    'Salicylic Acid (BHA)',
    'Azelaic Acid',
  ];

  // Calculate scores and filter
  const scoredProducts = useMemo(() => {
    return SKINCARE_PRODUCTS_CATALOG.map((prod) => {
      const { score, matchReasons } = calculateProductCompatibility(prod, profile, latestAnalysis);
      return {
        ...prod,
        compatibilityScore: score,
        matchReasons,
      };
    });
  }, [profile, latestAnalysis]);

  const filteredProducts = useMemo(() => {
    return scoredProducts
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Price Tier filter
        if (selectedPriceTier !== 'All' && p.priceTier !== selectedPriceTier) {
          return false;
        }

        // Active tag filter
        if (activeFilterTag !== 'All') {
          const hasActive = p.keyActives.some((act) =>
            act.toLowerCase().includes(activeFilterTag.toLowerCase())
          );
          if (!hasActive) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchActives = p.keyActives.some((a) => a.toLowerCase().includes(q));
          const matchBenefits = p.benefits.some((b) => b.toLowerCase().includes(q));
          if (!matchName && !matchBrand && !matchActives && !matchBenefits) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'priceAsc') {
          return a.priceUsd - b.priceUsd;
        }
        if (sortBy === 'priceDesc') {
          return b.priceUsd - a.priceUsd;
        }
        return 0;
      });
  }, [scoredProducts, selectedCategory, selectedPriceTier, activeFilterTag, searchQuery, sortBy]);

  const triggerToast = (msg: string) => {
    setAddedToast(msg);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleAdd = (period: 'AM' | 'PM', prod: SkincareProduct) => {
    onAddToRoutine(period, prod);
    triggerToast(`Added ${prod.name} to your ${period} routine!`);
    if (selectedProductForModal) {
      setSelectedProductForModal(null);
    }
  };

  const handleSwap = (prod: SkincareProduct) => {
    if (onSwapProduct) {
      onSwapProduct(prod);
      triggerToast(`Swapped in ${prod.name}!`);
      if (selectedProductForModal) {
        setSelectedProductForModal(null);
      }
    }
  };

  return (
    <div className="product-discovery-section">
      {/* Swap Mode Alert Banner if active */}
      {swapMode && (
        <div className="swap-mode-banner">
          <div className="swap-banner-content">
            <ArrowRightLeft size={18} className="text-royal-violet" />
            <div>
              <strong>Swapping Step in {swapMode.period} Routine:</strong>{' '}
              <span>Replacing &ldquo;{swapMode.currentProductName}&rdquo;</span>
            </div>
          </div>
          {onCancelSwap && (
            <button
              type="button"
              className="btn-cancel-swap"
              onClick={onCancelSwap}
            >
              Cancel Swap
            </button>
          )}
        </div>
      )}

      {/* Discovery Header */}
      <div className="discovery-header">
        <div className="discovery-header-main">
          <div className="page-badge">
            <Sparkles size={13} />
            <span>Formulation Intelligence</span>
          </div>
          <h2 className="discovery-title">Clinical Product Discovery</h2>
          <p className="discovery-subtitle">
            Dermatologist-grade formulations calibrated with individual compatibility scores based on your skin type and optical biometric scan.
          </p>
        </div>

        {/* Search Bar */}
        <div className="discovery-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="discovery-search-input"
            placeholder="Search by product name, active ingredient (e.g. Retinal, Niacinamide), or concern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="category-scroll-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${selectedCategory === cat ? 'category-pill--active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter & Sort Controls Row */}
      <div className="discovery-filters-row">
        {/* Popular Active Tags */}
        <div className="active-tags-scroll">
          <span className="filter-label">Key Actives:</span>
          {popularActives.map((act) => (
            <button
              key={act}
              type="button"
              className={`filter-active-tag ${activeFilterTag === act ? 'filter-active-tag--active' : ''}`}
              onClick={() => setActiveFilterTag(act)}
            >
              {act}
            </button>
          ))}
        </div>

        {/* Right Controls: Price Tier & Sort */}
        <div className="filter-right-controls">
          <div className="select-control-wrap">
            <label htmlFor="tier-select" className="sr-only">Price Tier</label>
            <select
              id="tier-select"
              className="styled-select"
              value={selectedPriceTier}
              onChange={(e) => setSelectedPriceTier(e.target.value)}
            >
              <option value="All">All Price Tiers</option>
              <option value="budget">$ Clean Budget (&lt;$30)</option>
              <option value="mid">$$ Mid Dermaceutical ($30-$45)</option>
              <option value="luxury">$$$ Luxury Clinical ($45+)</option>
            </select>
          </div>

          <div className="select-control-wrap">
            <label htmlFor="sort-select" className="sr-only">Sort by</label>
            <select
              id="sort-select"
              className="styled-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="match">Highest Compatibility (% Match)</option>
              <option value="rating">Top Rated (Stars)</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Results Counter */}
      <div className="discovery-results-meta">
        <span>Showing <strong>{filteredProducts.length}</strong> formulated products</span>
        {latestAnalysis && (
          <span className="results-calibrated-tag">
            <ShieldCheck size={13} className="text-emerald-500" />
            Calibrated to Scan #{latestAnalysis.id.slice(-6)}
          </span>
        )}
      </div>

      {/* Products Grid */}
      <div className="products-card-grid">
        {filteredProducts.map((product) => {
          const matchPercent = product.compatibilityScore || 85;
          const isHighMatch = matchPercent >= 90;

          return (
            <motion.div
              key={product.id}
              className="product-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Card Top: Brand, Category, Match Score */}
              <div className="product-card-top">
                <div className="product-brand-group">
                  <span className="product-brand">{product.brand}</span>
                  <span className="product-category-chip">{product.category}</span>
                </div>

                <div
                  className={`compatibility-badge ${
                    isHighMatch ? 'compatibility-badge--high' : 'compatibility-badge--good'
                  }`}
                  title={`${matchPercent}% compatibility with your skin profile`}
                >
                  <Sparkles size={12} />
                  <span>{matchPercent}% Match</span>
                </div>
              </div>

              {/* Product Title & Volume */}
              <h3 className="product-name">{product.name}</h3>
              <div className="product-meta-row">
                <span className="product-price">${product.priceUsd}</span>
                <span className="product-volume">{product.volume}</span>
                <div className="product-rating">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="rating-count">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Key Actives Pills */}
              <div className="product-actives-row">
                {product.keyActives.map((act) => (
                  <span key={act} className="mini-active-pill">
                    {act}
                  </span>
                ))}
              </div>

              {/* Texture & Attributes */}
              <p className="product-texture-desc">
                <em>Texture:</em> {product.texture}
              </p>

              {/* Attributes Chips */}
              <div className="product-attrs-row">
                {product.attributes.fragranceFree && (
                  <span className="attr-pill">Fragrance-Free</span>
                )}
                {product.attributes.vegan && <span className="attr-pill">Vegan</span>}
                {product.attributes.nonComedogenic && (
                  <span className="attr-pill">Non-Comedogenic</span>
                )}
              </div>

              {/* Actions Footer */}
              <div className="product-card-actions">
                {swapMode ? (
                  <button
                    type="button"
                    className="btn-action-swap-confirm"
                    onClick={() => handleSwap(product)}
                  >
                    <ArrowRightLeft size={14} />
                    <span>Select for Swap</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-action-details"
                      onClick={() => setSelectedProductForModal(product)}
                    >
                      <Info size={14} />
                      <span>Clinical Profile</span>
                    </button>

                    <div className="btn-add-split">
                      <button
                        type="button"
                        className="btn-add-am"
                        onClick={() => handleAdd('AM', product)}
                        title="Add to Morning Routine"
                      >
                        <Sun size={13} />
                        <span>AM</span>
                      </button>
                      <button
                        type="button"
                        className="btn-add-pm"
                        onClick={() => handleAdd('PM', product)}
                        title="Add to Evening Routine"
                      >
                        <Moon size={13} />
                        <span>PM</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products-state">
          <p className="text-gray-500">No products found matching your current filter criteria.</p>
          <button
            type="button"
            className="btn-reset-filters"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedPriceTier('All');
              setActiveFilterTag('All');
              setSearchQuery('');
            }}
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Product Clinical Profile Modal */}
      <AnimatePresence>
        {selectedProductForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="modal-backdrop-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForModal(null)}
            />

            <motion.div
              className="product-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              {/* Modal Header */}
              <div className="modal-header">
                <div>
                  <span className="modal-brand-tag">{selectedProductForModal.brand}</span>
                  <h3 className="modal-product-title">{selectedProductForModal.name}</h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedProductForModal(null)}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="modal-body-scroll">
                {/* Match Banner */}
                <div className="modal-compatibility-banner">
                  <div className="score-circle">
                    <strong>{selectedProductForModal.compatibilityScore || 90}%</strong>
                    <span>Match</span>
                  </div>
                  <div className="reasons-list">
                    <h4>Clinical Synergy Rationale:</h4>
                    <ul>
                      {selectedProductForModal.matchReasons?.map((reason, idx) => (
                        <li key={idx}>
                          <Check size={13} className="text-emerald-500 inline mr-1 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Key Actives Section */}
                <div className="modal-detail-block">
                  <h4 className="detail-block-title">Formulated Key Actives</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProductForModal.keyActives.map((act) => (
                      <span key={act} className="modal-active-badge">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clinical Benefits */}
                <div className="modal-detail-block">
                  <h4 className="detail-block-title">Targeted Clinical Benefits</h4>
                  <ul className="benefit-bullets">
                    {selectedProductForModal.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                {/* Application Technique */}
                <div className="modal-detail-block">
                  <h4 className="detail-block-title">Dermatological Application Protocol</h4>
                  <p className="detail-paragraph">{selectedProductForModal.applicationTip}</p>
                </div>

                {/* INCI Breakdown */}
                <div className="modal-detail-block">
                  <h4 className="detail-block-title">Full Ingredient Highlight (INCI)</h4>
                  <p className="inci-code-block">{selectedProductForModal.fullIngredientsSummary}</p>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="modal-footer">
                <span className="modal-price-tag">
                  ${selectedProductForModal.priceUsd} &bull; {selectedProductForModal.volume}
                </span>

                <div className="modal-action-buttons">
                  {swapMode ? (
                    <button
                      type="button"
                      className="btn-primary-action"
                      onClick={() => handleSwap(selectedProductForModal)}
                    >
                      <ArrowRightLeft size={16} />
                      <span>Confirm Swap into Step</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-modal-add-am"
                        onClick={() => handleAdd('AM', selectedProductForModal)}
                      >
                        <Sun size={15} />
                        <span>Add to AM Routine</span>
                      </button>
                      <button
                        type="button"
                        className="btn-modal-add-pm"
                        onClick={() => handleAdd('PM', selectedProductForModal)}
                      >
                        <Moon size={15} />
                        <span>Add to PM Routine</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            className="discovery-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Check size={16} className="text-emerald-400" />
            <span>{addedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
