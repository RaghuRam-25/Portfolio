import React, { useState, useMemo, useEffect } from 'react';
import { FiSliders, FiClock, FiDollarSign, FiCheck, FiArrowRight, FiInfo } from 'react-icons/fi';

export default function ProjectEstimator({ user, setEstimation, profile, setActiveTab }) {
  const projectTypesRaw = useMemo(() => profile?.projectEstimator?.projectTypes || [], [profile]);
  const featuresList = useMemo(() => profile?.projectEstimator?.features || [], [profile]);
  const sectionCopy = profile?.estimatorSection || {};
  const isEstimatorConfigured = projectTypesRaw.length > 0 && featuresList.length > 0;

  const projectTypes = useMemo(() => {
    return projectTypesRaw.reduce((acc, type) => {
      acc[type.id] = type;
      return acc;
    }, {});
  }, [projectTypesRaw]);

  const [projectType, setProjectType] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [urgency, setUrgency] = useState('standard');

  useEffect(() => {
    // Set the default project type only once when the data loads and if it's not already set.
    if (isEstimatorConfigured && !projectType) {
      setProjectType(projectTypesRaw[0].id);
    }
  }, [isEstimatorConfigured, projectTypesRaw, projectType]);

  const handleFeatureChange = (id) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter(item => item !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  const estimation = useMemo(() => {
    if (!isEstimatorConfigured) return { price: 0, days: 0, urgencyLabel: 'Not Available' };

    const selectedType = projectTypes[projectType] || { basePrice: 0, baseDays: 0, name: 'N/A' };
    if (!selectedType) return { price: 0, days: 0, urgencyLabel: 'Standard Delivery' };

    let price = selectedType.basePrice;
    let days = selectedType.baseDays;

    selectedFeatures.forEach(featureId => {
      const feature = featuresList.find(f => f.id === featureId);
      if (feature) {
        price += feature.price;
        days += feature.days;
      }
    });

    // Apply urgency modifications
    let urgencyLabel = 'Standard Delivery';
    if (urgency === 'rush') {
      // Express Rush: +25% price, 30% faster (but min 3 days)
      price = Math.round(price * 1.25);
      days = Math.max(3, Math.round(days * 0.7));
      urgencyLabel = 'Express Rush (+25%)';
    } else if (urgency === 'relaxed') {
      // Flexible/Relaxed: -10% price, 30% slower
      price = Math.round(price * 0.9);
      days = Math.round(days * 1.3);
      urgencyLabel = 'Flexible (-10%)';
    }

    return { price, days, urgencyLabel, projectType };
  }, [projectType, selectedFeatures, urgency, isEstimatorConfigured, projectTypes, featuresList]);

  const handleBuildProjectClick = () => {
    if (!isEstimatorConfigured) return;

    if (user?.isLoggedIn) {
      setEstimation(estimation);
      setActiveTab('payment');
    } else {
      // For a better UX, store the estimation so it can be retrieved after login.
      // The auth/payment flow should be designed to look for this data.
      try {
        sessionStorage.setItem('projectEstimation', JSON.stringify(estimation));
      } catch (error) {
        console.error("Could not save estimation to session storage:", error);
      }
      setActiveTab('auth-portal');
    }
  };

  if (!isEstimatorConfigured) {
    return (
      <section id="estimator" className="pt-2 pb-20 border-t border-light-border/30 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 inline-flex flex-col items-center gap-4">
            <FiInfo className="text-4xl text-accent" />
            <h3 className="font-bold text-lg">Project Estimator Not Available</h3>
            <p className="text-sm text-neutral-400">The project estimator has not been configured in the admin panel yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    // 💡 ম্যাজিক এখানে: pt-20 বা py-24 এর জায়গায় pt-2 করে দেওয়া হয়েছে যাতে নেভবারের সাথে একদম লেগে যায়
    <section id="estimator" className="pt-2 pb-20 border-t border-light-border/30 dark:border-neutral-900 bg-gradient-to-b from-transparent to-neutral-50/50 dark:to-neutral-950/40">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="mb-14 text-center lg:text-left">
          <span className="text-xs font-bold tracking-widest uppercase text-secondary dark:text-accent bg-secondary/10 dark:bg-accent/10 px-3 py-1.5 rounded-full border border-secondary/20 dark:border-accent/20 inline-flex items-center gap-1.5">
            <FiSliders /> {sectionCopy.eyebrow || 'Dynamic Budget Planner'}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-3 text-light-textPrimary dark:text-dark-textPrimary">
            {sectionCopy.title || 'Scope Your Project Instantly'}
          </h2>
          <p className="text-light-textSecondary dark:text-dark-textSecondary max-w-xl text-sm md:text-base font-normal leading-relaxed">
            {sectionCopy.subtitle || 'Select your architecture model and extra modules below to get a ballpark engineering timeframe and financial estimation.'}
          </p>
        </div>

        {/* Matrix Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Controls Form Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="p-6 md:p-8 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-light-textPrimary dark:text-dark-textPrimary">
                Step 1: Core Project Architecture Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {projectTypesRaw.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => { setProjectType(type.id); setSelectedFeatures([]); }}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${projectType === type.id
                      ? 'border-secondary dark:border-accent bg-secondary/5 dark:bg-accent/5 ring-1 ring-secondary dark:ring-accent'
                      : 'border-light-border dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                      }`}
                  >
                    <p className="text-sm font-bold text-light-textPrimary dark:text-dark-textPrimary">{type.name}</p>
                    <p className="text-xs text-light-textSecondary dark:text-neutral-400 mt-1">Starts at ${type.basePrice}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-light-textPrimary dark:text-dark-textPrimary">
                Step 2: Plug & Play Modules
              </label>
              <div className="space-y-3">
                {featuresList.map((feature) => {
                  const isSelected = selectedFeatures.includes(feature.id);
                  return (
                    <label
                      key={feature.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${isSelected
                        ? 'border-secondary/50 dark:border-accent/50 bg-neutral-50 dark:bg-neutral-900'
                        : 'border-light-border dark:border-neutral-800/80 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-neutral-900 border-neutral-900 dark:bg-white dark:border-white text-white dark:text-neutral-950' : 'border-neutral-300 dark:border-neutral-700'
                        }`}>
                        {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFeatureChange(feature.id)}
                        className="hidden"
                      />
                      <div className="flex-grow flex items-center justify-between gap-2">
                        <div>
                          <p className={`text-sm font-semibold ${isSelected ? 'text-light-textPrimary dark:text-dark-textPrimary' : 'text-light-textSecondary dark:text-neutral-400'}`}>{feature.name}</p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">+{feature.days} business days</p>
                        </div>
                        <span className="text-sm font-bold text-light-textPrimary dark:text-dark-textPrimary">
                          +${feature.price}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary">
                Step 3: Engineering Pace
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'relaxed', title: 'Flexible', desc: '-10% Budget' },
                  { id: 'standard', title: 'Standard', desc: 'Regular Time' },
                  { id: 'rush', title: 'Express', desc: '+25% Cost' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUrgency(item.id)}
                    className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${urgency === item.id
                      ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold shadow-md shadow-black/5'
                      : 'border-light-border dark:border-neutral-800 bg-transparent text-light-textSecondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                      }`}
                  >
                    <p className="text-xs font-bold">{item.title}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Display Counter */}
          <div className="lg:col-span-5 rounded-2xl border border-light-border dark:border-neutral-800 bg-neutral-950 text-white dark:bg-neutral-900/40 p-6 md:p-8 shadow-xl flex flex-col justify-between sticky top-24">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Live Bill Breakdowns
                </h3>
                <span className="text-[11px] font-bold text-accent dark:text-accent bg-accent/10 px-2 py-0.5 rounded">
                  {projectTypes[projectType]?.name || 'Select a type'}
                </span>
              </div>

              <div className="space-y-3.5 mb-8 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>Base Package</span>
                  <span>${projectTypes[projectType]?.basePrice || 0}</span>
                </div>

                {selectedFeatures.map(fId => {
                  const item = featuresList.find(f => f.id === fId);
                  return item ? (
                    <div key={fId} className="flex justify-between text-neutral-300">
                      <span className="text-xs truncate max-w-[200px]">+ {item.name}</span>
                      <span>${item.price}</span>
                    </div>
                  ) : null;
                })}

                <div className="flex justify-between text-xs text-neutral-500 border-t border-neutral-800/80 pt-3">
                  <span>Pace Adjustment</span>
                  <span>{estimation.urgencyLabel}</span>
                </div>
              </div>

              <div className="space-y-6 pt-2 border-t border-dashed border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wider">
                    <FiDollarSign /> Estimated Price
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    ${estimation.price} <span className="text-xs font-semibold text-neutral-500">USD</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wider">
                    <FiClock /> Delivery Time
                  </div>
                  <div className="text-xl font-bold text-neutral-200">
                    ~ {estimation.days} <span className="text-xs text-neutral-400 font-normal">Business Days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800">
              <button
                onClick={handleBuildProjectClick} disabled={!isEstimatorConfigured}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white text-neutral-900 dark:bg-neutral-100 hover:bg-neutral-200 text-center transition-all flex items-center justify-center gap-2 shadow-lg group"
              >
                Let's Build This Project <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[10px] text-center text-neutral-500 mt-3 leading-relaxed">
                *Includes full responsive architecture, production setup & SEO base config.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
