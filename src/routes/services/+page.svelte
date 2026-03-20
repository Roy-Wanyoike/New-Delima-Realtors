<script>
  const coreServices = [
    { icon: '🏠', title: 'Residential Sales', desc: 'Houses, apartments & gated communities', color: '#d4af37' },
    { icon: '🏢', title: 'Commercial Leasing', desc: 'Professional spaces for your business', color: '#1a1a1a' },
    { icon: '🌿', title: 'Land Acquisition', desc: 'Find the right plot for your needs', color: '#d4af37' },
    { icon: '📈', title: 'Investment Advisory', desc: 'Strategic advice for wealth creation', color: '#1a1a1a' },
    { icon: '🏗️', title: 'Off-Plan Sales', desc: 'Invest in upcoming developments', color: '#d4af37' },
    { icon: '💰', title: 'Rental Sourcing', desc: 'Generate passive income opportunities', color: '#1a1a1a' },
    { icon: '💎', title: 'Luxury Properties', desc: 'Premium properties in exclusive locations', color: '#d4af37' },
    { icon: '🏘️', title: 'Affordable Housing', desc: 'Quality properties within budget', color: '#1a1a1a' }
  ];
  
  const buyerServices = [
    { icon: '🤝', title: 'Buyer Representation', desc: 'Your interests always come first' },
    { icon: '🔍', title: 'Property Search', desc: 'Curated options matching your criteria' },
    { icon: '📊', title: 'Market Analysis', desc: 'Fair market value assessments' },
    { icon: '✅', title: 'Due Diligence', desc: 'Thorough property evaluations' },
    { icon: '💬', title: 'Negotiation Support', desc: 'Expert negotiators securing the best deal' },
    { icon: '📄', title: 'Legal Coordination', desc: 'Seamless documentation handling' }
  ];
  
  const whyChooseUs = [
    { icon: '🏆', title: 'Accredited Excellence', desc: 'Licensed professionals in Kenya' },
    { icon: '📍', title: 'Market Mastery', desc: 'Deep expertise in Nairobi property' },
    { icon: '❤️', title: 'Client Obsession', desc: 'Your goals drive every decision' },
    { icon: '🔧', title: 'Complete Solutions', desc: 'End-to-end services' },
    { icon: '🛡️', title: 'Trust & Integrity', desc: 'Built on transparency' },
    { icon: '✨', title: 'Proven Results', desc: 'Hundreds of satisfied clients' }
  ];
  
  const neighborhoods = [
    { name: 'Westlands', type: 'Business Hub', desc: 'Modern apartments & commercial spaces', icon: '🏙️' },
    { name: 'Karen', type: 'Exclusive', desc: 'Spacious plots & luxury estates', icon: '💎' },
    { name: 'Kilimani', type: 'Vibrant', desc: 'Diverse housing with strong appreciation', icon: '🎨' },
    { name: 'Muthaiga', type: 'Ultra-Premium', desc: 'Gated community with lavish homes', icon: '👑' },
    { name: 'Runda', type: 'Prestigious', desc: 'Leafy streets & family homes', icon: '🌳' },
    { name: 'Upper Hill', type: 'Upscale', desc: 'Excellent investment returns', icon: '⭐' }
  ];
  
  const stats = [
    { value: '500+', label: 'Properties Sold' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '15+', label: 'Years Experience' },
    { value: '24/7', label: 'Support Available' }
  ];
</script>

<div class="services-page">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-badge">Our Services</div>
      <h1>Comprehensive Real Estate <span class="highlight">Solutions</span></h1>
      <p class="hero-subtitle">Your trusted partner in Nairobi's dynamic property market. We provide end-to-end services tailored to your unique needs.</p>
      <div class="hero-stats">
        {#each stats as stat}
          <div class="stat-item">
            <div class="stat-value">{stat.value}</div>
            <div class="stat-label">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
    <div class="hero-pattern"></div>
  </section>

  <!-- About Section -->
  <section class="section section-alt">
    <div class="container">
      <div class="about-grid">
        <div class="about-content">
          <span class="section-badge">About Us</span>
          <h2>Delima Realtors</h2>
          <p>Delima Realtors is an accredited real estate company dedicated to helping clients find their dream homes and investment properties in Nairobi, Kenya. With years of experience in the industry, our team of expert agents is committed to providing personalized service and expert guidance throughout the buying and selling process.</p>
          <p class="mission-text"><strong>Our Mission:</strong> To make real estate transactions smooth and successful for our clients. We understand the unique challenges and opportunities of the Nairobi real estate market.</p>
        </div>
        <div class="about-image">
          <img src="/lib/assets/project-1.jpg" alt="Delima Realtors Properties" />
          <div class="experience-badge">
            <span class="years">15+</span>
            <span class="text">Years of<br/>Excellence</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Core Services Grid -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">🏢 Core Services</span>
        <h2>What We Offer</h2>
        <p>Comprehensive real estate services covering all aspects of property transactions</p>
      </div>
      <div class="services-grid">
        {#each coreServices as service}
          <div class="service-card" style="--card-color: {service.color}">
            <div class="card-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
            <div class="card-arrow">→</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Buyer Agent Services -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">🧭 For Buyers</span>
        <h2>Home Buyer Agent Services</h2>
        <p>Comprehensive support throughout your property search journey</p>
      </div>
      <div class="buyer-services-grid">
        {#each buyerServices as feature, i}
          <div class="buyer-card">
            <div class="buyer-number">{String(i + 1).padStart(2, '0')}</div>
            <div class="buyer-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Why Choose Us -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">✨ Why Us</span>
        <h2>The Delima Difference</h2>
        <p>Why clients choose us for their real estate needs</p>
      </div>
      <div class="why-grid">
        {#each whyChooseUs as item}
          <div class="why-card">
            <div class="why-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Client Experience & Trust -->
  <section class="section section-dark">
    <div class="container">
      <div class="two-column">
        <div class="column">
          <span class="section-badge light">⭐ Client-Focused</span>
          <h2>Personalized Service</h2>
          <ul class="feature-list">
            <li><span class="check">✓</span> <strong>Bespoke property matching</strong> based on your requirements</li>
            <li><span class="check">✓</span> <strong>Personalized investment strategies</strong> for wealth building</li>
            <li><span class="check">✓</span> <strong>One-on-one client consultation</strong> with expert agents</li>
            <li><span class="check">✓</span> <strong>Tailored recommendations</strong> aligned with your goals</li>
            <li><span class="check">✓</span> <strong>First-time buyer guidance</strong> for newcomers</li>
            <li><span class="check">✓</span> <strong>Investor portfolio planning</strong> for portfolio growth</li>
          </ul>
        </div>
        <div class="column">
          <span class="section-badge light">🔐 Trust & Compliance</span>
          <h2>Professional Standards</h2>
          <ul class="feature-list">
            <li><span class="check">✓</span> <strong>Accredited estate agents</strong> certified in Kenya</li>
            <li><span class="check">✓</span> <strong>Transparent transactions</strong> with clear communication</li>
            <li><span class="check">✓</span> <strong>Ethical sales practices</strong> prioritizing clients</li>
            <li><span class="check">✓</span> <strong>Legal compliance assurance</strong> on all deals</li>
            <li><span class="check">✓</span> <strong>Secure documentation</strong> handling</li>
            <li><span class="check">✓</span> <strong>Verified listings</strong> only</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Investor Services -->
  <section class="section section-gold">
    <div class="container">
      <div class="investor-content">
        <span class="section-badge light">💼 Investor Services</span>
        <h2>For Property Investors</h2>
        <p>Comprehensive services designed for investors of all levels</p>
        <div class="investor-grid">
          <div class="investor-item">
            <div class="investor-icon">📊</div>
            <h4>ROI Forecasting</h4>
            <p>Projected returns analysis</p>
          </div>
          <div class="investor-item">
            <div class="investor-icon">💹</div>
            <h4>Rental Yield Analysis</h4>
            <p>Income potential assessment</p>
          </div>
          <div class="investor-item">
            <div class="investor-icon">📈</div>
            <h4>Capital Appreciation</h4>
            <p>Long-term growth strategies</p>
          </div>
          <div class="investor-item">
            <div class="investor-icon">🎯</div>
            <h4>Portfolio Diversification</h4>
            <p>Balanced property investments</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Value Added Services -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">🧠 Value-Added</span>
        <h2>Beyond Property Sales</h2>
        <p>Comprehensive support services for our clients</p>
      </div>
      <div class="value-grid">
        <div class="value-card">
          <span class="value-icon">🏦</span>
          <h4>Mortgage & Financing</h4>
          <p>Help navigating loan options</p>
        </div>
        <div class="value-card">
          <span class="value-icon">⚖️</span>
          <h4>Legal Partner Referrals</h4>
          <p>Trusted legal professionals</p>
        </div>
        <div class="value-card">
          <span class="value-icon">🏘️</span>
          <h4>Property Management</h4>
          <p>Connection with professionals</p>
        </div>
        <div class="value-card">
          <span class="value-icon">📋</span>
          <h4>Valuation Services</h4>
          <p>Professional appraisals</p>
        </div>
        <div class="value-card">
          <span class="value-icon">🏗️</span>
          <h4>Development Consultancy</h4>
          <p>Project development advice</p>
        </div>
        <div class="value-card">
          <span class="value-icon">📢</span>
          <h4>Property Marketing</h4>
          <p>Effective showcasing</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Neighborhoods -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">📍 Areas</span>
        <h2>Nairobi Neighborhoods</h2>
        <p>We specialize in premium and emerging neighborhoods across Nairobi</p>
      </div>
      <div class="neighborhoods-grid">
        {#each neighborhoods as hood}
          <div class="neighborhood-card">
            <div class="neighborhood-icon">{hood.icon}</div>
            <span class="neighborhood-type">{hood.type}</span>
            <h3>{hood.name}</h3>
            <p>{hood.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Market Expertise -->
  <section class="section section-alt">
    <div class="container">
      <div class="expertise-content">
        <span class="section-badge">📍 Market Expertise</span>
        <h2>Nairobi Market Intelligence</h2>
        <p>With deep understanding of Nairobi's dynamic property market, we help you make informed decisions</p>
        <div class="expertise-grid">
          <div class="expertise-item">
            <span class="expertise-icon">📊</span>
            <span>Deep understanding of Nairobi property trends</span>
          </div>
          <div class="expertise-item">
            <span class="expertise-icon">🎯</span>
            <span>ROI-driven property selection</span>
          </div>
          <div class="expertise-item">
            <span class="expertise-icon">🚀</span>
            <span>Growth corridor identification</span>
          </div>
          <div class="expertise-item">
            <span class="expertise-icon">🏘️</span>
            <span>Neighborhood profiling & demographics</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-card">
        <div class="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Whether you're buying, selling, or investing, we have the expertise to make it happen.</p>
        </div>
        <div class="cta-buttons">
          <a href="/contact" class="btn-primary">Schedule Consultation</a>
          <a href="/projects" class="btn-secondary">Browse Listings</a>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .services-page {
    --gold: #d4af37;
    --dark: #1a1a1a;
    --light: #fafafa;
    --gray: #666;
    --light-gray: #f5f5f5;
    --white: #ffffff;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, var(--dark) 0%, #2d2d2d 100%);
    color: white;
    padding: 100px 20px 80px;
    position: relative;
    overflow: hidden;
    text-align: center;
  }
  
  .hero-pattern {
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%);
  }
  
  .hero-content {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
  
  .hero-badge {
    display: inline-block;
    background: rgba(212, 175, 55, 0.2);
    color: var(--gold);
    padding: 8px 24px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 24px;
    border: 1px solid rgba(212, 175, 55, 0.3);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .hero h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
  }
  
  .highlight {
    color: var(--gold);
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    max-width: 600px;
    margin: 0 auto 50px;
    line-height: 1.6;
  }
  
  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 60px;
    flex-wrap: wrap;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--gold);
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 5px;
  }
  
  /* Section Styles */
  .section {
    padding: 80px 20px;
  }
  
  .section-alt {
    background: var(--light);
  }
  
  .section-dark {
    background: var(--dark);
    color: white;
  }
  
  .section-gold {
    background: linear-gradient(135deg, var(--gold) 0%, #e8cc6f 100%);
    color: white;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 50px;
  }
  
  .section-header h2 {
    font-size: 2.5rem;
    color: var(--dark);
    margin-bottom: 15px;
  }
  
  .section-header p {
    color: var(--gray);
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .section-badge {
    display: inline-block;
    background: rgba(212, 175, 55, 0.1);
    color: var(--gold);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .section-badge.light {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
  
  /* About Section */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  
  .about-content h2 {
    font-size: 2.5rem;
    color: var(--dark);
    margin-bottom: 20px;
  }
  
  .about-content p {
    color: var(--gray);
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 20px;
  }
  
  .mission-text {
    background: white;
    padding: 25px;
    border-radius: 12px;
    border-left: 4px solid var(--gold);
  }
  
  .about-image {
    position: relative;
  }
  
  .about-image img {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  }
  
  .experience-badge {
    position: absolute;
    bottom: -20px;
    right: -20px;
    background: var(--gold);
    color: white;
    padding: 25px 35px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
  }
  
  .experience-badge .years {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
  }
  
  .experience-badge .text {
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  /* Services Grid */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
    gap: 25px;
  }
  
  .service-card {
    background: white;
    border-radius: 16px;
    padding: 35px 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    border: 1px solid #f0f0f0;
  }
  
  .service-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--card-color);
    transition: width 0.3s ease;
  }
  
  .service-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  }
  
  .service-card:hover::before {
    width: 100%;
    opacity: 0.03;
  }
  
  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
  
  .service-card h3 {
    font-size: 1.2rem;
    color: var(--dark);
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .service-card p {
    color: var(--gray);
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .card-arrow {
    position: absolute;
    bottom: 25px;
    right: 25px;
    width: 40px;
    height: 40px;
    background: var(--light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gold);
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .service-card:hover .card-arrow {
    background: var(--gold);
    color: white;
    transform: translateX(5px);
  }
  
  /* Buyer Services */
  .buyer-services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
  }
  
  .buyer-card {
    background: white;
    padding: 35px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .buyer-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  }
  
  .buyer-number {
    position: absolute;
    top: 20px;
    right: 25px;
    font-size: 3rem;
    font-weight: 700;
    color: var(--gold);
    opacity: 0.15;
  }
  
  .buyer-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .buyer-card h3 {
    font-size: 1.2rem;
    color: var(--dark);
    margin-bottom: 10px;
  }
  
  .buyer-card p {
    color: var(--gray);
    font-size: 0.95rem;
  }
  
  /* Why Choose Us */
  .why-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
  }
  
  .why-card {
    background: white;
    padding: 40px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border-bottom: 3px solid transparent;
  }
  
  .why-card:hover {
    transform: translateY(-8px);
    border-bottom-color: var(--gold);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  }
  
  .why-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }
  
  .why-card h3 {
    font-size: 1.2rem;
    color: var(--dark);
    margin-bottom: 10px;
  }
  
  .why-card p {
    color: var(--gray);
    font-size: 0.95rem;
  }
  
  /* Two Column Section */
  .two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
  }
  
  .column h2 {
    font-size: 2rem;
    margin-bottom: 30px;
  }
  
  .feature-list {
    list-style: none;
  }
  
  .feature-list li {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 20px;
    font-size: 1.05rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
  }
  
  .check {
    color: var(--gold);
    font-weight: bold;
    flex-shrink: 0;
  }
  
  /* Investor Section */
  .investor-content {
    text-align: center;
  }
  
  .investor-content h2 {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .investor-content p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 40px;
  }
  
  .investor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
  }
  
  .investor-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }
  
  .investor-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .investor-item h4 {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }
  
  .investor-item p {
    font-size: 0.95rem;
    opacity: 0.9;
    margin: 0;
  }
  
  /* Value Added */
  .value-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .value-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  
  .value-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  
  .value-icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 15px;
  }
  
  .value-card h4 {
    font-size: 1.1rem;
    color: var(--dark);
    margin-bottom: 8px;
  }
  
  .value-card p {
    color: var(--gray);
    font-size: 0.9rem;
  }
  
  /* Neighborhoods */
  .neighborhoods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
  }
  
  .neighborhood-card {
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .neighborhood-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--gold);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  .neighborhood-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  }
  
  .neighborhood-card:hover::after {
    transform: scaleX(1);
  }
  
  .neighborhood-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .neighborhood-type {
    display: inline-block;
    background: var(--gold);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }
  
  .neighborhood-card h3 {
    font-size: 1.4rem;
    margin-bottom: 8px;
    color: var(--dark);
  }
  
  .neighborhood-card p {
    color: var(--gray);
    font-size: 0.95rem;
  }
  
  /* Expertise Section */
  .expertise-content {
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
  }
  
  .expertise-content h2 {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .expertise-content p {
    color: var(--gray);
    font-size: 1.1rem;
    margin-bottom: 40px;
  }
  
  .expertise-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .expertise-item {
    display: flex;
    align-items: center;
    gap: 15px;
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    text-align: left;
  }
  
  .expertise-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }
  
  /* CTA Section */
  .cta-section {
    padding: 60px 20px;
    background: var(--light);
  }
  
  .cta-card {
    background: var(--dark);
    border-radius: 20px;
    padding: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    flex-wrap: wrap;
    max-width: 1100px;
    margin: 0 auto;
  }
  
  .cta-content h2 {
    color: white;
    font-size: 2.2rem;
    margin-bottom: 10px;
  }
  
  .cta-content p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1rem;
  }
  
  .cta-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }
  
  .btn-primary {
    background: var(--gold);
    color: white;
    padding: 16px 35px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-block;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
  }
  
  .btn-secondary {
    background: transparent;
    color: white;
    padding: 16px 35px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    display: inline-block;
  }
  
  .btn-secondary:hover {
    background: white;
    color: var(--dark);
  }
  
  /* Responsive */
  @media (max-width: 992px) {
    .about-grid,
    .two-column {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    
    .about-image {
      order: -1;
    }
    
    .experience-badge {
      right: 20px;
      bottom: -15px;
    }
  }
  
  @media (max-width: 768px) {
    .hero {
      padding: 80px 20px 60px;
    }
    
    .hero-stats {
      gap: 30px;
    }
    
    .stat-value {
      font-size: 2rem;
    }
    
    .section {
      padding: 60px 20px;
    }
    
    .section-header h2 {
      font-size: 2rem;
    }
    
    .cta-card {
      flex-direction: column;
      text-align: center;
      padding: 40px 30px;
    }
    
    .cta-buttons {
      justify-content: center;
    }
    
    .services-grid,
    .why-grid,
    .neighborhoods-grid {
      grid-template-columns: 1fr;
    }
  }
</style>