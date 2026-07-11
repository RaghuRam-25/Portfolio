import React, { useState, useEffect } from 'react';
import { FiLayers, FiDollarSign, FiShoppingBag, FiInfo, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { productAPI, categoryAPI, SOCKET_URL } from '../utils/api';

export default function Services({ profile }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const sectionCopy = profile?.servicesSection || {
    title: 'Offered Services & Digital Products',
    subtitle: 'Explore ready-made application templates, development packages, and customized services.',
    emptyState: 'No services or products have been listed yet.'
  };

  const inquiryEmail = profile?.contactInfo?.email || profile?.email || 'admin@example.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll()
        ]);
        if (prodRes.success) setProducts(prodRes.data || []);
        else throw new Error(prodRes.message || 'Failed to fetch services.');
        if (catRes.success) setCategories(catRes.data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching services:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category?._id === selectedCategory || p.category === selectedCategory);

  if (isLoading) {
    return (
      <section id="services" className="py-24 text-center">
        <FiLoader className="animate-spin text-accent-purple text-4xl mx-auto" />
        <p className="text-sm text-neutral-400 mt-2">Loading Services...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="py-24 text-center text-red-400">
        <FiInfo className="text-5xl mx-auto mb-4" />
        <p>Error loading services: {error}</p>
      </section>
    );
  }

  return (
    <section id="services" className="py-24 border-t border-neutral-900 bg-black/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white inline-flex items-center gap-2">
            <FiShoppingBag className="text-accent-purple" /> {sectionCopy.title}
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl mx-auto">{sectionCopy.subtitle}</p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in-up animation-delay-200">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedCategory === 'all' ? 'bg-accent-purple text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
            >All Categories</button>
            {categories.map((cat) => (
              <button key={cat._id} onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedCategory === cat._id ? 'bg-accent-purple text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center p-8 text-neutral-500 animate-fade-in-up">
            <FiInfo className="text-5xl mx-auto mb-4" />
            <p>{sectionCopy.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="group bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-accent-purple/10 hover:-translate-y-1.5 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden mb-6">
                    <img
                      src={product.images && product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${SOCKET_URL}/${product.images[0].replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.isFeatured && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-accent-purple transition-colors">{product.name}</h3>
                  <p className="text-xs text-neutral-400 mb-4 h-16 overflow-hidden text-ellipsis line-clamp-3">{product.shortDescription || product.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Investment</div>
                    <div className="flex items-baseline gap-1 text-white">
                      <FiDollarSign className="text-accent-purple" />
                      <span className="text-2xl font-black">{product.salePrice ? product.salePrice : product.price}</span>
                      {product.salePrice && <span className="text-xs line-through text-neutral-500 ml-1">${product.price}</span>}
                    </div>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {product.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => window.open(`mailto:${inquiryEmail}?subject=Inquiry for ${product.name}`, '_blank')}
                    className="w-full py-2.5 bg-accent-purple hover:bg-accent-purple/90 text-white text-xs font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-accent-purple/30"
                  >
                    <FiCheckCircle size={14} /> Order Now / Inquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
