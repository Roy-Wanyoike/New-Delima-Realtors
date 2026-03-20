
<script lang="ts">
	// Featured properties data
	const featuredProperties = [
		{
			id: 'koch-1',
			title: '2, 3 & 4 Bedroom Apartments',
			location: 'Westlands, Nairobi',
			price: '17700000',
			bedrooms: '3',
			bathrooms: '2',
			imageUrl: '/lib/assets/project-1.jpg'
		},
		{
			id: 'koch-3',
			title: 'Luxury Apartments with DSQs',
			location: 'Kilimani, Nairobi',
			price: '29400000',
			bedrooms: '4',
			bathrooms: '3',
			imageUrl: '/lib/assets/apartments-3.jpg'
		},
		{
			id: 'koch-6',
			title: '5 Bedroom Villa with Pool',
			location: 'Loresho, Nairobi',
			price: '150000000',
			bedrooms: '5',
			bathrooms: '6',
			imageUrl: '/lib/assets/project-2.jpg'
		}
	];

	// Search filter values
	let searchLocation = '';
	let searchType = '';
	let searchBeds = '';
	let searchMaxPrice = '';

	function filterProperties() {
		// Filters are handled on the projects page
		// This function can be expanded to filter on homepage
	}

	function formatPrice(price: string | number | undefined): string {
		if (!price) return '0';
		const num = typeof price === 'string' ? parseInt(price) : price;
		return isNaN(num) ? '0' : num.toLocaleString();
	}
</script>

    <!-- Preloader Start -->
	<div class="preloader">
		<div class="loading-container">
			<div class="loading"></div>
			<div id="loading-icon"><img src="/lib/assets/logo/LogoMakerCa-1771232657338-removebg-preview.png" alt="Delima Realtors Logo"></div>
		</div>
	</div>
	<!-- Preloader End -->


    <!-- Hero Section Start -->
    <div class="hero" style="background: linear-gradient(rgba(31, 24, 16, 0.7), rgba(31, 24, 16, 0.8)), url('/lib/assets/project-1.jpg') center/cover no-repeat; min-height: 90vh; display: flex; align-items: center;">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-11">
                    <!-- Hero Content Start -->
                    <div class="hero-content">
                        <!-- Section Title Start -->
                        <div class="section-title dark-section">
                            <h3 class="wow fadeInUp" style="color: #d4af37; text-transform: uppercase; letter-spacing: 3px; font-size: 14px; margin-bottom: 20px;">🏠 Nairobi's Premier Real Estate</h3>
                            <h1 class="text-anime-style-2" data-cursor="-opaque" style="font-size: 56px; line-height: 1.2; margin-bottom: 25px;">Find Your Perfect Home in <span style="color: #d4af37;">Nairobi's Best Neighborhoods</span></h1>
                            <p class="wow fadeInUp" data-wow-delay="0.2s" style="color: rgba(255,255,255,0.9); font-size: 18px; max-width: 600px; margin-bottom: 30px;">Discover premium apartments, villas, and townhouses in Westlands, Kilimani, Karen, and more. Your dream property awaits.</p>
                        </div>
                        <!-- Section Title End -->

                        <!-- Hero Buttons Start -->
                        <div class="hero-btn wow fadeInUp" data-wow-delay="0.25s" style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <a href="/projects" class="btn-default" style="background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #1f1810; padding: 15px 35px; font-weight: 600;">Browse Properties</a>
                            <a href="/contact" class="btn-default" style="background: transparent; border: 2px solid white; color: white; padding: 15px 35px; font-weight: 600;">Get Consultation</a>
                        </div>
                        <!-- Hero Buttons End -->                   
                    </div>
                    <!-- Hero Content End -->                    
                </div>

                <div class="col-lg-12" style="position: absolute; bottom: 30px; right: 30px;">
                    <!-- Hero Social Media Start -->
                    <div class="hero-social-media" style="text-align: right;">
                        <h3 style="color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">Follow Us</h3>
                        <ul style="justify-content: flex-end;">
                            <li><a href="#" title="facebook" on:click|preventDefault style="color: white; border-color: rgba(255,255,255,0.3);"><i class="fab fa-facebook-f"></i></a></li>
                            <li><a href="#" title="instagram" on:click|preventDefault style="color: white; border-color: rgba(255,255,255,0.3);"><i class="fa-brands fa-instagram"></i></a></li>
                            <li><a href="#" title="twitter" on:click|preventDefault style="color: white; border-color: rgba(255,255,255,0.3);"><i class="fa-brands fa-twitter"></i></a></li>
                        </ul>
                    </div>
                    <!-- Hero Social Media End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Hero Section End -->

    <!-- Property Search Section Start -->
    <div class="property-search-section">
        <div class="container">
            <div class="search-box">
                <h3>Find Your Dream Property</h3>
                <div class="search-filters">
                    <div class="filter-group">
                        <label>Location</label>
                        <select bind:value={searchLocation} on:change={filterProperties}>
                            <option value="">All Locations</option>
                            <option value="Westlands">Westlands</option>
                            <option value="Kilimani">Kilimani</option>
                            <option value="Kileleshwa">Kileleshwa</option>
                            <option value="Langata">Langata</option>
                            <option value="Loresho">Loresho</option>
                            <option value="Kitisuru">Kitisuru</option>
                            <option value="Karen">Karen</option>
                            <option value="Runda">Runda</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Property Type</label>
                        <select bind:value={searchType} on:change={filterProperties}>
                            <option value="">All Types</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Villa">Villa</option>
                            <option value="Townhouse">Townhouse</option>
                            <option value="Penthouse">Penthouse</option>
                            <option value="Studio">Studio</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Bedrooms</label>
                        <select bind:value={searchBeds} on:change={filterProperties}>
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                            <option value="5">5+</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Max Price (KES)</label>
                        <select bind:value={searchMaxPrice} on:change={filterProperties}>
                            <option value="">No Limit</option>
                            <option value="10000000">10M</option>
                            <option value="20000000">20M</option>
                            <option value="30000000">30M</option>
                            <option value="50000000">50M</option>
                            <option value="100000000">100M+</option>
                        </select>
                    </div>
                    <a href="/projects" class="btn-search">Search Properties</a>
                </div>
            </div>
        </div>
    </div>
    <!-- Property Search Section End -->

    <!-- Featured Properties Section Start -->
    <div class="featured-properties">
        <div class="container">
            <div class="section-title text-center">
                <h3 class="wow fadeInUp">featured listings</h3>
                <h2 class="text-anime-style-2" data-cursor="-opaque">Premium Properties <span>in Nairobi</span></h2>
            </div>
            
            <div class="row">
                {#each featuredProperties as property}
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="property-card wow fadeInUp">
                            <div class="card-image">
                                <img src={property.imageUrl} alt={property.title} />
                                <div class="featured-tag">⭐ Featured</div>
                                <div class="price-tag">KES {formatPrice(property.price)}</div>
                            </div>
                            <div class="card-content">
                                <h4>{property.title}</h4>
                                <p class="location">📍 {property.location}</p>
                                <div class="specs">
                                    <span>🛏️ {property.bedrooms} Beds</span>
                                    <span>🚿 {property.bathrooms} Baths</span>
                                </div>
                                <a href="/projects/{property.id}" class="btn-view">View Details</a>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
            
            <div class="text-center mt-4">
                <a href="/projects" class="btn-default">View All Properties</a>
            </div>
        </div>
    </div>
    <!-- Featured Properties Section End -->

    <!-- About Us Section Start -->
    <div class="about-us">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <!-- About Us Images Start -->
                    <div style="position: relative;">
                        <img src="/lib/assets/project-1.jpg" alt="Premium Property" style="width: 100%; height: 500px; object-fit: cover; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
                        <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(212, 175, 55, 0.95); color: #1f1810; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                            🏆 Premium Properties
                        </div>
                    </div>
                </div>
                <!-- About Us Images End -->

                <div class="col-lg-6">
                    <!-- About Us Content Start -->
                    <div class="about-us-content">
                        <!-- Section Title Start -->
                        <div class="section-title">
                            <h3 class="wow fadeInUp">about us</h3>
                            <h2 class="text-anime-style-2" data-cursor="-opaque">Accredited Estate Agents <span>in Nairobi's Premier Locations</span></h2>
                            <p class="wow fadeInUp" data-wow-delay="0.2s">As accredited estate agents serving Nairobi, we specialise in premium neighborhoods including Westlands, Karen, Kilimani, Muthaiga, Runda, and Upper Hill. We navigate the dynamic Nairobi property market to help you find investment opportunities and dream homes with seamless, rewarding transactions.</p>
                        </div>
                        <!-- Section Title End -->

                        <!-- About Content Body Start -->
                        <div class="about-content-body">
                            <!-- About Detail Item Start -->
                            <div class="about-detail-item wow fadeInUp" data-wow-delay="0.4s">
                                <div class="icon-box">
                                    <img src="/lib/assets/icon-about-detail-1.svg" alt="Tailored Solutions">
                                </div>

                                <div class="about-detail-content">
                                    <h3>Tailored Solutions</h3>
                                    <p>We provide trusted real estate services tailored to your specific property investment needs, whether you're buying, selling, or investing.</p>
                                </div>
                            </div>
                            <!-- About Detail Item End -->

                            <!-- About Detail Item Start -->
                            <div class="about-detail-item wow fadeInUp" data-wow-delay="0.6s">
                                <div class="icon-box">
                                    <img src="/lib/assets/icon-about-detail-2.svg" alt="Expert Knowledge">
                                </div>

                                <div class="about-detail-content">
                                    <h3>Expert Market Knowledge</h3>
                                    <p>Our accredited agents have deep expertise in the Nairobi property market, helping first-time homebuyers and seasoned investors alike.</p>
                                </div>
                            </div>
                            <!-- About Detail Item End -->
                        </div>
                        <!-- About Content Body End -->

                        <!-- About Content Footer Start -->
                         <div class="about-content-footer wow fadeInUp" data-wow-delay="0.8s">
                            <!-- About Content Button Start -->
                            <div class="about-content-btn">
                                <a href="/about" class="btn-default">learn more</a>
                            </div>
                            <!-- About Content Button End -->

                            <!-- About Contact Box Start -->
                            <div class="about-contact-box">
                                <div class="icon-box">
                                    <img src="/lib/assets/icon-accent-phone.svg" alt="Phone">
                                </div>

                                <div class="about-contact-content">
                                    <p>call us 24/7</p>
                                    <h3><a href="tel:+254727523752">+254 727 523 752</a></h3>
                                </div>
                            </div>
                            <!-- About Contact Box End -->
                         </div>
                        <!-- About Content Footer End -->
                    </div>
                    <!-- About Us Content End -->
                </div>
            </div>
        </div>
    </div>
    <!-- About Us Section End -->

    <!-- Our Apartment Section Start -->
    <div class="our-apartments">
        <div class="container">
            <div class="row section-row">
                <div class="col-lg-12">
                    <!-- Section Title Start -->
                    <div class="section-title">
                        <h3 class="wow fadeInUp">our properties</h3>
                        <h2 class="text-anime-style-2" data-cursor="-opaque">Premium Properties in <span>Nairobi</span></h2>
                    </div>
                    <!-- Section Title End -->
                </div>
            </div>

            <div class="row">
                <div class="col-lg-3 col-md-6">
                    <!-- Apartment Item Start -->
                    <div class="apartment-item wow fadeInUp">
                        <!-- Apartment Image Start -->
                        <div class="apartment-image">
                            <a href="/projects" data-cursor-text="View">
                                <figure class="image-anime">
                                    <img src="/lib/assets/apartments-1.jpg" alt="Studio Apartment">
                                </figure>
                            </a>
                        </div>
                        <!-- Apartment Image End -->

                        <!-- Apartment Button Start -->
                        <div class="apartment-btn">
                            <a href="/projects"><img src="/lib/assets/arrow-accent.svg" alt="View Details"></a>
                        </div>
                        <!-- Apartment Button End -->
                         
                        <!-- Apartment Content Start -->
                        <div class="apartments-content">
                            <h3><a href="/projects">Studio Apartments</a></h3>
                        </div>
                        <!-- Apartment Content End -->
                    </div>
                </div>

                <div class="col-lg-3 col-md-6">
                    <!-- Apartment Item Start -->
                    <div class="apartment-item wow fadeInUp" data-wow-delay="0.2s">
                        <!-- Apartment Image Start -->
                        <div class="apartment-image">
                            <a href="/projects" data-cursor-text="View">
                                <figure class="image-anime">
                                    <img src="/lib/assets/apartments-2.jpg" alt="Luxury Apartment">
                                </figure>
                            </a>
                        </div>
                        <!-- Apartment Image End -->

                        <!-- Apartment Button Start -->
                        <div class="apartment-btn">
                            <a href="/projects"><img src="/lib/assets/arrow-accent.svg" alt="View Details"></a>
                        </div>
                        <!-- Apartment Button End -->

                        <!-- Apartment Content Start -->
                        <div class="apartments-content">
                            <h3><a href="/projects">Luxury Apartments</a></h3>
                        </div>
                        <!-- Apartment Content End -->
                    </div>
                </div>

                <div class="col-lg-3 col-md-6">
                    <!-- Apartment Item Start -->
                    <div class="apartment-item wow fadeInUp" data-wow-delay="0.4s">
                        <!-- Apartment Image Start -->
                        <div class="apartment-image">
                            <a href="/projects" data-cursor-text="View">
                                <figure class="image-anime">
                                    <img src="/lib/assets/apartments-3.jpg" alt="Deluxe Home">
                                </figure>
                            </a>
                        </div>
                        <!-- Apartment Image End -->

                        <!-- Apartment Button Start -->
                        <div class="apartment-btn">
                            <a href="/projects"><img src="/lib/assets/arrow-accent.svg" alt="View Details"></a>
                        </div>
                        <!-- Apartment Button End -->

                        <!-- Apartment Content Start -->
                        <div class="apartments-content">
                            <h3><a href="/projects">Deluxe Homes</a></h3>
                        </div>
                        <!-- Apartment Content End -->
                    </div>
                </div>

                <div class="col-lg-3 col-md-6">
                    <!-- Apartment Item Start -->
                    <div class="apartment-item wow fadeInUp" data-wow-delay="0.6s">
                        <!-- Apartment Image Start -->
                        <div class="apartment-image">
                            <a href="/projects" data-cursor-text="View">
                                <figure class="image-anime">
                                    <img src="/lib/assets/apartments-4.jpg" alt="One Room Apartment">
                                </figure>
                            </a>
                        </div>
                        <!-- Apartment Image End -->

                        <!-- Apartment Button Start -->
                        <div class="apartment-btn">
                            <a href="/projects"><img src="/lib/assets/arrow-accent.svg" alt="View Details"></a>
                        </div>
                        <!-- Apartment Button End -->

                        <!-- Apartment Content Start -->
                        <div class="apartments-content">
                            <h3><a href="/projects">one room apartment</a></h3>
                        </div>
                        <!-- Apartment Content End -->
                    </div>
                </div>

                <div class="col-md-12">
                    <!-- Our Apartments Footer Start -->
                    <div class="our-apartment-footer wow fadeInUp" data-wow-delay="0.8s">
                        <a href="/projects" class="btn-default">view all apartments</a>
                    </div>
                    <!-- Our Apartments Footer End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our Apartment Section End -->

    <!-- Our Property Section Start -->
    <div class="our-property">
        <div class="container">
            <div class="row section-row">
                <div class="col-lg-12">
                    <!-- Section Title Start -->
                    <div class="section-title">
                        <h3 class="wow fadeInUp">property overview</h3>
                        <h2 class="text-anime-style-2" data-cursor="-opaque">All you need to know about <span>this property</span></h2>
                    </div>
                    <!-- Section Title End -->
                </div>
            </div>

            <div class="row">
                <div class="col-lg-12">
                    <!-- Property Tab Content Start -->
                    <div class="property-tab-content tab-content" id="property">
                        <!-- Property Tab Nav start -->
                        <div class="property-tab-nav wow fadeInUp" data-wow-delay="0.25s">
                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="basement-tab" data-bs-toggle="tab" data-bs-target="#basement" type="button" role="tab" aria-selected="true">basement</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="ground-floor-tab" data-bs-toggle="tab" data-bs-target="#ground-floor" type="button" role="tab" aria-selected="false">ground floor</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="1st-floor-tab" data-bs-toggle="tab" data-bs-target="#1st-floor" type="button" role="tab" aria-selected="false">1st floor</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="2nd-floor-tab" data-bs-toggle="tab" data-bs-target="#2nd-floor" type="button" role="tab" aria-selected="false">2nd floor</button>
                                </li>
                            </ul>
                        </div>
                        <!-- Property Tab Nav End -->

                        <!-- Property Tab Item Start -->
                        <div class="property-tab-item tab-pane fade show active" id="basement" role="tabpanel">
                            <div class="row align-items-center">
                                <div class="col-lg-6">
                                    <!-- Property Tab Image Start -->
                                    <div class="property-tab-image">
                                        <figure>
                                            <img src="/lib/assets/project-1.jpg" alt="Property View" style="width: 100%; border-radius: 12px;">
                                        </figure>
                                    </div>
                                    <!-- Property Tab Image End -->
                                </div>

                                <div class="col-lg-6">
                                    <!-- Property Tab Content Start -->
                                    <div class="property-tab-content">
                                        <!-- Property Content Info Start -->
                                        <div class="property-content-info">
                                            <h2>basement apartment</h2>
                                            <p>Enjoy the luxury of being close to common amenities, with quick access to outdoor spaces, parking, and the building's entrance.</p>
                                            <p>Square Footage: Generously sized with specific square footage to accommodate your lifestyle.</p>
                                        </div>
                                        <!-- Property Content Info End -->

                                        <!-- Property Content Types Start -->
                                        <div class="property-content-types">
                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-1.svg" alt="Total Area">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>total area</h3>
                                                    <p>1200 Sq.Ft</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->

                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-2.svg" alt="Floor Number">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>floor no</h3>
                                                    <p>1st</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->
                                            
                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-3.svg" alt="Bathrooms">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>bathrooms</h3>
                                                    <p>02</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->

                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-4.svg" alt="Parking">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>parking</h3>
                                                    <p>available</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->
                                        </div>
                                        <!-- Property Content Types End -->
                                    </div>
                                    <!-- Property Tab Content End -->
                                </div>
                            </div>
                        </div>
                        <!-- Property Tab Item End -->

                        <!-- Property Tab Item Start -->
                        <div class="property-tab-item tab-pane fade" id="ground-floor" role="tabpanel">
                            <div class="row align-items-center">
                                <div class="col-lg-6">
                                    <!-- Property Tab Image Start -->
                                    <div class="property-tab-image">
                                        <figure>
                                            <img src="/lib/assets/project-1.jpg" alt="Property View" style="width: 100%; border-radius: 12px;">
                                        </figure>
                                    </div>
                                    <!-- Property Tab Image End -->
                                </div>

                                <div class="col-lg-6">
                                    <!-- Property Tab Content Start -->
                                    <div class="property-tab-content">
                                        <!-- Property Content Info Start -->
                                        <div class="property-content-info">
                                            <h2>ground floor apartment</h2>
                                            <p>Enjoy the luxury of being close to common amenities, with quick access to outdoor spaces, parking, and the building's entrance.</p>
                                            <p>Square Footage: Generously sized with specific square footage to accommodate your lifestyle.</p>
                                        </div>
                                        <!-- Property Content Info End -->

                                        <!-- Property Content Types Start -->
                                        <div class="property-content-types">
                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-1.svg" alt="Total Area">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>total area</h3>
                                                    <p>1200 Sq.Ft</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->

                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-2.svg" alt="Floor Number">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>floor no</h3>
                                                    <p>1st</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->
                                            
                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-3.svg" alt="Bathrooms">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>bathrooms</h3>
                                                    <p>02</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->

                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-4.svg" alt="Parking">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>parking</h3>
                                                    <p>available</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->
                                        </div>
                                        <!-- Property Content Types End -->
                                    </div>
                                    <!-- Property Tab Content End -->
                                </div>
                            </div>
                        </div>
                        <!-- Property Tab Item End -->

                        <!-- Property Tab Item Start -->
                        <div class="property-tab-item tab-pane fade" id="1st-floor" role="tabpanel">
                            <div class="row align-items-center">
                                <div class="col-lg-6">
                                    <!-- Property Tab Image Start -->
                                    <div class="property-tab-image">
                                        <figure>
                                            <img src="/lib/assets/project-1.jpg" alt="Property View" style="width: 100%; border-radius: 12px;">
                                        </figure>
                                    </div>
                                    <!-- Property Tab Image End -->
                                </div>

                                <div class="col-lg-6">
                                    <!-- Property Tab Content Start -->
                                    <div class="property-tab-content">
                                        <!-- Property Content Info Start -->
                                        <div class="property-content-info">
                                            <h2>first floor apartment</h2>
                                            <p>Enjoy the luxury of being close to common amenities, with quick access to outdoor spaces, parking, and the building's entrance.</p>
                                            <p>Square Footage: Generously sized with specific square footage to accommodate your lifestyle.</p>
                                        </div>
                                        <!-- Property Content Info End -->

                                        <!-- Property Content Types Start -->
                                        <div class="property-content-types">
                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-1.svg" alt="Total Area">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>total area</h3>
                                                    <p>1200 Sq.Ft</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->

                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-2.svg" alt="Floor Number">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>floor no</h3>
                                                    <p>1st</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->
                                            
                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-3.svg" alt="Bathrooms">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>bathrooms</h3>
                                                    <p>02</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->

                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-4.svg" alt="Parking">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>parking</h3>
                                                    <p>available</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->
                                        </div>
                                        <!-- Property Content Types End -->
                                    </div>
                                    <!-- Property Tab Content End -->
                                </div>
                            </div>
                        </div>
                        <!-- Property Tab Item End -->

                        <!-- Property Tab Item Start -->
                        <div class="property-tab-item tab-pane fade" id="2nd-floor" role="tabpanel">
                            <div class="row align-items-center">
                                <div class="col-lg-6">
                                    <!-- Property Tab Image Start -->
                                    <div class="property-tab-image">
                                        <figure>
                                            <img src="/lib/assets/project-1.jpg" alt="Property View" style="width: 100%; border-radius: 12px;">
                                        </figure>
                                    </div>
                                    <!-- Property Tab Image End -->
                                </div>

                                <div class="col-lg-6">
                                    <!-- Property Tab Content Start -->
                                    <div class="property-tab-content">
                                        <!-- Property Content Info Start -->
                                        <div class="property-content-info">
                                            <h2>second floor apartment</h2>
                                            <p>Enjoy the luxury of being close to common amenities, with quick access to outdoor spaces, parking, and the building's entrance.</p>
                                            <p>Square Footage: Generously sized with specific square footage to accommodate your lifestyle.</p>
                                        </div>
                                        <!-- Property Content Info End -->

                                        <!-- Property Content Types Start -->
                                        <div class="property-content-types">
                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-1.svg" alt="Total Area">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>total area</h3>
                                                    <p>1200 Sq.Ft</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->

                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-2.svg" alt="Floor Number">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>floor no</h3>
                                                    <p>1st</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->
                                            
                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-3.svg" alt="Bathrooms">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>bathrooms</h3>
                                                    <p>02</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->

                                            <!-- Property Type Item Start -->
                                            <div class="property-type-item">
                                                <div class="icon-box">
                                                    <img src="/lib/assets/icon-property-type-4.svg" alt="Parking">
                                                </div>
                                                <div class="property-type-content">
                                                    <h3>parking</h3>
                                                    <p>available</p>
                                                </div>
                                            </div>
                                            <!-- Property Type Item End -->
                                        </div>
                                        <!-- Property Content Types End -->
                                    </div>
                                    <!-- Property Tab Content End -->
                                </div>
                            </div>
                        </div>
                        <!-- Property Tab Item End -->
                    </div>
                    <!-- Property Tab Content End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our Property Section End -->

    <!-- Our Features Section Start -->
    <div class="our-features">
        <div class="container">
            <div class="row">
                <div class="col-lg-6">
                    <!-- Our Features Content Start -->
                    <div class="our-features-content">
                        <!-- Section Title Start -->
                        <div class="section-title dark-section">
                            <h3 class="wow fadeInUp">delima realtors</h3>
                            <h2 class="text-anime-style-2" data-cursor="-opaque">Comprehensive Real Estate <span>Services for Everyone</span></h2>
                        </div>
                        <!-- Section Title End -->

                        <!-- Our Features Button Start -->
                        <div class="our-features-btn wow fadeInUp" data-wow-delay="0.25s">
                            <a href="/services" class="btn-default btn-highlighted">explore our services</a>
                        </div>
                        <!-- Our Features Button End -->
                    </div>
                    <!-- Our Features Content End -->
                </div>

                <div class="col-lg-6">
                    <!-- Our Feartures List Start -->
                    <div class="our-features-list">
                        <!-- Features Item Start -->
                        <div class="features-item wow fadeInUp">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-features-1.svg" alt="">
                            </div>
                            <div class="features-item-content">
                                <h3>residential sales</h3>
                                <p>Houses, apartments, and gated communities tailored to your lifestyle needs.</p>
                            </div>
                        </div>
                        <!-- Features Item End -->

                        <!-- Features Item Start -->
                        <div class="features-item wow fadeInUp" data-wow-delay="0.2s">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-features-2.svg" alt="">
                            </div>
                            <div class="features-item-content">
                                <h3>home buyer services</h3>
                                <p>Dedicated representation and expert negotiation for your property purchase.</p>
                            </div>
                        </div>
                        <!-- Features Item End -->

                        <!-- Features Item Start -->
                        <div class="features-item wow fadeInUp" data-wow-delay="0.4s">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-features-3.svg" alt="">
                            </div>
                            <div class="features-item-content">
                                <h3>investment advisory</h3>
                                <p>Strategic guidance for property investments with maximum ROI potential.</p>
                            </div>
                        </div>
                        <!-- Features Item End -->

                        <!-- Features Item Start -->
                        <div class="features-item wow fadeInUp" data-wow-delay="0.6s">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-features-4.svg" alt="">
                            </div>
                            <div class="features-item-content">
                                <h3>commercial properties</h3>
                                <p>Professional spaces and commercial leasing opportunities for your business.</p>
                            </div>
                        </div>
                        <!-- Features Item End -->

                        <!-- Features Item Start -->
                        <div class="features-item wow fadeInUp" data-wow-delay="0.8s">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-features-5.svg" alt="">
                            </div>
                            <div class="features-item-content">
                                <h3>luxury properties</h3>
                                <p>Premium properties in exclusive Nairobi locations for discerning buyers.</p>
                            </div>
                        </div>
                        <!-- Features Item End -->

                        <!-- Features Item Start -->
                        <div class="features-item wow fadeInUp" data-wow-delay="1s">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-features-6.svg" alt="">
                            </div>
                            <div class="features-item-content">
                                <h3>market expertise</h3>
                                <p>Deep insights into Nairobi's real estate market trends and opportunities.</p>
                            </div>
                        </div>
                        <!-- Features Item End -->
                    </div>
                    <!-- Our Feartures List End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our Features Section End -->

    <!-- Our amenities Section Start -->
    <div class="our-amenities">
        <div class="container">
            <div class="row section-row">
                <div class="col-lg-12">
                    <!-- Section Title Start -->
                    <div class="section-title">
                        <h3 class="wow fadeInUp">our amenities</h3>
                        <h2 class="text-anime-style-2" data-cursor="-opaque">Unmatched comfort, every step <span>of the way</span></h2>
                    </div>
                    <!-- Section Title End -->
                </div>
            </div>

            <div class="row">
                <div class="col-lg-12">
                    <!-- Our Amenities List Start -->
                    <div class="our-amenities-list wow fadeInUp" data-wow-delay="0.25s">
                        <!-- Amenities Item Start -->
                        <div class="amenities-item">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-amenities-1.svg" alt="">
                            </div>
                            <div class="amenities-item-content">
                                <h3>Property Sourcing</h3>
                                <p>Access to thousands of verified listings across all property types and segments.</p>
                            </div>
                            <div class="features-btn">
                                <a href="/services" class="readmore-btn">learn more</a>
                            </div>
                        </div>
                        <!-- Amenities Item End -->

                        <!-- Amenities Item Start -->
                        <div class="amenities-item">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-amenities-2.svg" alt="">
                            </div>
                            <div class="amenities-item-content">
                                <h3>Market Intelligence</h3>
                                <p>Real-time market data and trends to guide your real estate decisions.</p>
                            </div>
                            <div class="features-btn">
                                <a href="/services" class="readmore-btn">learn more</a>
                            </div>
                        </div>
                        <!-- Amenities Item End -->

                        <!-- Amenities Item Start -->
                        <div class="amenities-item">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-amenities-3.svg" alt="">
                            </div>
                            <div class="amenities-item-content">
                                <h3>Legal Support</h3>
                                <p>Full legal coordination and documentation assistance throughout transactions.</p>
                            </div>
                            <div class="features-btn">
                                <a href="/services" class="readmore-btn">learn more</a>
                            </div>
                        </div>
                        <!-- Amenities Item End -->

                        <!-- Amenities Item Start -->
                        <div class="amenities-item">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-amenities-4.svg" alt="">
                            </div>
                            <div class="amenities-item-content">
                                <h3>Investment Planning</h3>
                                <p>Strategic advice for portfolio building and long-term wealth creation.</p>
                            </div>
                            <div class="features-btn">
                                <a href="/services" class="readmore-btn">learn more</a>
                            </div>
                        </div>
                        <!-- Amenities Item End -->

                        <!-- Amenities Item Start -->
                        <div class="amenities-item">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-amenities-5.svg" alt="">
                            </div>
                            <div class="amenities-item-content">
                                <h3>Financing Advisory</h3>
                                <p>Guidance on mortgage options and financing solutions for your purchase.</p>
                            </div>
                            <div class="features-btn">
                                <a href="/services" class="readmore-btn">learn more</a>
                            </div>
                        </div>
                        <!-- Amenities Item End -->

                        <!-- Amenities Item Start -->
                        <div class="amenities-item">
                            <div class="icon-box">
                                <img src="/lib/assets/icon-amenities-6.svg" alt="">
                            </div>
                            <div class="amenities-item-content">
                                <h3>Relocation Support</h3>
                                <p>Complete relocation assistance and property orientation services.</p>
                            </div>
                            <div class="features-btn">
                                <a href="/services" class="readmore-btn">learn more</a>
                            </div>
                        </div>
                        <!-- Amenities Item End -->
                    </div>
                    <!-- Our Amenities List End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our amenities Section End -->

    <!-- Browse Neighborhoods Section Start -->
    <div style="padding: 80px 20px; background: #f8f8f8;">
        <div class="container">
            <div class="row section-row" style="margin-bottom: 50px;">
                <div class="col-lg-12">
                    <div class="section-title" style="text-align: center;">
                        <h3 class="wow fadeInUp">nairobi neighborhoods</h3>
                        <h2 class="text-anime-style-2" data-cursor="-opaque">Explore Properties Across <span>Nairobi's Best Areas</span></h2>
                        <p style="color: #666; margin-top: 15px; font-size: 1.05rem; max-width: 700px; margin-left: auto; margin-right: auto;">From ultra-premium enclaves to emerging growth corridors, discover the perfect neighborhood for your lifestyle or investment needs.</p>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s" style="margin-bottom: 30px;">
                    <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #d4af37; box-shadow: 0 3px 10px rgba(0,0,0,0.05); height: 100%; cursor: pointer; transition: all 0.3s;">
                        <h3 style="color: #d4af37; margin-bottom: 10px; font-size: 1.2rem;">🏙️ Westlands</h3>
                        <p style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">Nairobi's premier business and residential hub. Modern apartments, luxury condominiums, and excellent infrastructure.</p>
                        <a href="/projects" style="color: #d4af37; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Browse listings →</a>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.2s" style="margin-bottom: 30px;">
                    <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #d4af37; box-shadow: 0 3px 10px rgba(0,0,0,0.05); height: 100%; cursor: pointer; transition: all 0.3s;">
                        <h3 style="color: #d4af37; margin-bottom: 10px; font-size: 1.2rem;">💎 Karen</h3>
                        <p style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">Exclusive residential area with spacious plots, standalone homes, and mature trees. Popular with high-net-worth individuals.</p>
                        <a href="/projects" style="color: #d4af37; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Browse listings →</a>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s" style="margin-bottom: 30px;">
                    <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #d4af37; box-shadow: 0 3px 10px rgba(0,0,0,0.05); height: 100%; cursor: pointer; transition: all 0.3s;">
                        <h3 style="color: #d4af37; margin-bottom: 10px; font-size: 1.2rem;">🎨 Kilimani</h3>
                        <p style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">Vibrant middle-class residential area with diverse housing, excellent services, and strong appreciation potential.</p>
                        <a href="/projects" style="color: #d4af37; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Browse listings →</a>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.4s" style="margin-bottom: 30px;">
                    <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #d4af37; box-shadow: 0 3px 10px rgba(0,0,0,0.05); height: 100%; cursor: pointer; transition: all 0.3s;">
                        <h3 style="color: #d4af37; margin-bottom: 10px; font-size: 1.2rem;">👑 Muthaiga</h3>
                        <p style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">Ultra-premium gated community with lavish homes, exclusive clubs, and prestigious lifestyle offerings.</p>
                        <a href="/projects" style="color: #d4af37; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Browse listings →</a>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.5s" style="margin-bottom: 30px;">
                    <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #d4af37; box-shadow: 0 3px 10px rgba(0,0,0,0.05); height: 100%; cursor: pointer; transition: all 0.3s;">
                        <h3 style="color: #d4af37; margin-bottom: 10px; font-size: 1.2rem;">⭐ Upper Hill</h3>
                        <p style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">Upscale residential and commercial area offering excellent investment returns with modern infrastructure.</p>
                        <a href="/projects" style="color: #d4af37; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Browse listings →</a>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.6s" style="margin-bottom: 30px;">
                    <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #d4af37; box-shadow: 0 3px 10px rgba(0,0,0,0.05); height: 100%; cursor: pointer; transition: all 0.3s;">
                        <h3 style="color: #d4af37; margin-bottom: 10px; font-size: 1.2rem;">🚀 Growth Corridors</h3>
                        <p style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">High-growth areas including Thika Road, Kikuyu, and emerging zones offering excellent investment potential.</p>
                        <a href="/projects" style="color: #d4af37; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Browse listings →</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Browse Neighborhoods Section End -->

    <!-- Our Experience Section Start -->
    <div class="our-experience">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <!-- Our Experience Image Start -->
                    <div class="our-experience-img">
                        <figure>
                            <img src="/lib/assets/experience-img.png" alt="">
                        </figure>
                    </div>
                    <!-- Our Experience Image End -->
                </div>

                <div class="col-lg-6">
                    <!-- Our Experience Content Start -->
                    <div class="our-experience-content">
                        <!-- Section Title Start -->
                        <div class="section-title">
                            <h3 class="wow fadeInUp">our experience</h3>
                            <h2 class="text-anime-style-2" data-cursor="-opaque">Trusted Real Estate Partner in <span>Nairobi, Kenya</span></h2>
                            <p class="wow fadeInUp" data-wow-delay="0.25s">With extensive experience in the Nairobi property market, Delima Realtors has built a reputation for excellence, integrity, and client satisfaction. We leverage deep market knowledge and industry expertise to deliver exceptional results for every client.</p>
                        </div>
                        <!-- Section Title End -->

                        <!-- Experience Counter List Start -->
                         <div class="experience-counter-list">
                            <!-- Experience Counter Item Start -->
                            <div class="experience-counter-item">
                                <div class="icon-box">
                                    <img src="/lib/assets/icon-experience-1.svg" alt="">
                                </div>
                                <div class="experience-counter-content">
                                    <h2><span class="counter">500</span>+</h2>
                                    <p>Successful Transactions</p>
                                </div>
                            </div>
                            <!-- Experience Counter Item End -->

                            <!-- Experience Counter Item Start -->
                            <div class="experience-counter-item">
                                <div class="icon-box">
                                    <img src="/lib/assets/icon-experience-2.svg" alt="">
                                </div>
                                <div class="experience-counter-content">
                                    <h2><span class="counter">1000</span>+</h2>
                                    <p>Satisfied Clients</p>
                                </div>
                            </div>
                            <!-- Experience Counter Item End -->

                            <!-- Experience Counter Item Start -->
                            <div class="experience-counter-item">
                                <div class="icon-box">
                                    <img src="/lib/assets/icon-experience-3.svg" alt="">
                                </div>
                                <div class="experience-counter-content">
                                    <h2><span class="counter">8000</span>+</h2>
                                    <p>Properties Listed</p>
                                </div>
                            </div>
                            <!-- Experience Counter Item End -->

                            <!-- Experience Counter Item Start -->
                            <div class="experience-counter-item">
                                <div class="icon-box">
                                    <img src="/lib/assets/icon-experience-4.svg" alt="">
                                </div>
                                <div class="experience-counter-content">
                                    <h2><span class="counter">99</span>%</h2>
                                    <p>Client Satisfaction</p>
                                </div>
                            </div>
                            <!-- Experience Counter Item End -->
                         </div>
                        <!-- Experience Counter List End -->
                    </div>
                    <!-- Our Experience Content End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our Experience Section End -->

    <!-- Intro Video Section Start -->
    <div class="intro-video parallaxie">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 col-md-8">
                    <!-- Section Title Start -->
                    <div class="section-title dark-section">
                        <h3 class="wow fadeInUp">delima realtors solutions</h3>
                        <h2 class="text-anime-style-2" data-cursor="-opaque">Your Journey to the Perfect <span>Property Starts Here</span></h2>
                    </div>
                    <!-- Section Title End -->
                </div>

                <div class="col-lg-6 col-md-4">
                    <!-- Intro Video Box Start -->
                    <div class="intro-video-box">
                        <!-- Video Play Button Start -->
                        <div class="video-play-button">
                            <a href="https://www.youtube.com/watch?v=Y-x0efG1seA" class="popup-video" data-cursor-text="Play">learn more</a>
                        </div>
                        <!-- Video Play Button End -->
                    </div>
                    <!-- Intro Video Box End -->
                </div>
            </div>

            <div class="row">
                <div class="col-lg-12">
                    <!-- Intro Video Counter List Start -->
                    <div class="intro-video-counter-list">
                        <!-- Intro Video Counter Item Start -->
                        <div class="intro-video-counter-item">
                            <h3>Expert Team</h3>
                            <h2><span class="counter">25</span>+</h2>
                            <p>Accredited real estate professionals dedicated to your success</p>
                        </div>
                        <!-- Intro Video Counter Item End -->

                        <!-- Intro Video Counter Item Start -->
                        <div class="intro-video-counter-item">
                            <h3>Active Listings</h3>
                            <h2><span class="counter">8000</span></h2>
                            <p>Diverse properties across all segments in Nairobi</p>
                        </div>
                        <!-- Intro Video Counter Item End -->

                        <!-- Intro Video Counter Item Start -->
                        <div class="intro-video-counter-item">
                            <h3>Market Coverage</h3>
                            <h2><span class="counter">50</span>+</h2>
                            <p>Neighborhoods and areas covered in the Nairobi market</p>
                        </div>
                        <!-- Intro Video Counter Item End -->

                        <!-- Intro Video Counter Item Start -->
                        <div class="intro-video-counter-item">
                            <h3>Client Rating</h3>
                            <h2><span class="counter">4.9</span>/5</h2>
                            <p>Exceptional service quality rated by our satisfied clients</p>
                        </div>
                        <!-- Intro Video Counter Item End -->
                    </div>
                    <!-- Intro Video Counter List End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Intro Video Section End -->

    <!-- Our Team Section Start -->
    <div class="our-team">
        <div class="container">
            <div class="row section-row align-items-center">
                <div class="col-lg-12">
                    <!-- Section Title Start -->
                    <div class="section-title">
                        <h3 class="wow fadeInUp">our team</h3>
                        <h2 class="text-anime-style-2" data-cursor="-opaque">The professionals behind <span>every success</span></h2>
                    </div>
                    <!-- Section Title End -->
                </div>
            </div>

            <div class="row">
                <div class="col-lg-3 col-md-6">
                    <!-- Team Member Item Start -->
                    <div class="team-member-item wow fadeInUp">
                        <!-- Team Image Start -->
                        <div class="team-image">
                            <a href="#" data-cursor-text="View" on:click|preventDefault>
                                <figure class="image-anime">
                                    <img src="/lib/assets/team-1.jpg" alt="">
                                </figure>
                            </a>

                            <!-- Team Readmore Button Start -->
                            <div class="team-readmore-btn">
                                <a href="#" on:click|preventDefault><img src="/lib/assets/arrow-white.svg" alt=""></a>
                            </div>
                            <!-- Team Readmore Button End -->
                        </div>	
                        <!-- Team Image End -->

                        <!-- Team Body Start -->
                        <div class="team-body">
                            <!-- Team Content Start -->
                            <div class="team-content">
                                <h3><a href="#" on:click|preventDefault>Cameron williamson</a></h3>
                                <p>Founder and CEO</p>
                            </div>
                            <!-- Team Content End -->
                            
                            <!-- Team Social Icon Start -->
                            <div class="team-social-icon">
                                <ul>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fa-brands fa-instagram"></i></a></li>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fab fa-facebook-f"></i></a></li>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fa-brands fa-dribbble"></i></a></li>
                                </ul>
                            </div>
                            <!-- Team Social Icon End -->
                        </div>
                        <!-- Team Body End -->
                    </div>
                    <!-- Team Member Item Start -->
                </div>

                <div class="col-lg-3 col-md-6">
                    <!-- Team Member Item Start -->
                    <div class="team-member-item wow fadeInUp">
                        <!-- Team Image Start -->
                        <div class="team-image">
                            <a href="#" data-cursor-text="View" on:click|preventDefault>
                                <figure class="image-anime">
                                    <img src="/lib/assets/team-2.jpg" alt="">
                                </figure>
                            </a>

                            <!-- Team Readmore Button Start -->
                            <div class="team-readmore-btn">
                                <a href="#" on:click|preventDefault><img src="/lib/assets/arrow-white.svg" alt=""></a>
                            </div>
                            <!-- Team Readmore Button End -->
                        </div>	
                        <!-- Team Image End -->

                        <!-- Team Body Start -->
                        <div class="team-body">
                            <!-- Team Content Start -->
                            <div class="team-content">
                                <h3><a href="#" on:click|preventDefault>Courtney henry</a></h3>
                                <p>Executive officer</p>
                            </div>
                            <!-- Team Content End -->
                            
                            <!-- Team Social Icon Start -->
                            <div class="team-social-icon">
                                <ul>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fa-brands fa-instagram"></i></a></li>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fab fa-facebook-f"></i></a></li>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fa-brands fa-dribbble"></i></a></li>
                                </ul>
                            </div>
                            <!-- Team Social Icon End -->
                        </div>
                        <!-- Team Body End -->
                    </div>
                    <!-- Team Member Item Start -->
                </div>

                <div class="col-lg-3 col-md-6">
                    <!-- Team Member Item Start -->
                    <div class="team-member-item wow fadeInUp">
                        <!-- Team Image Start -->
                        <div class="team-image">
                            <a href="#" data-cursor-text="View" on:click|preventDefault>
                                <figure class="image-anime">
                                    <img src="/lib/assets/team-3.jpg" alt="">
                                </figure>
                            </a>

                            <!-- Team Readmore Button Start -->
                            <div class="team-readmore-btn">
                                <a href="#" on:click|preventDefault><img src="/lib/assets/arrow-white.svg" alt=""></a>
                            </div>
                            <!-- Team Readmore Button End -->
                        </div>	
                        <!-- Team Image End -->

                        <!-- Team Body Start -->
                        <div class="team-body">
                            <!-- Team Content Start -->
                            <div class="team-content">
                                <h3><a href="#" on:click|preventDefault>Robert fox</a></h3>
                                <p>Financial director</p>
                            </div>
                            <!-- Team Content End -->
                            
                            <!-- Team Social Icon Start -->
                            <div class="team-social-icon">
                                <ul>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fa-brands fa-instagram"></i></a></li>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fab fa-facebook-f"></i></a></li>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fa-brands fa-dribbble"></i></a></li>
                                </ul>
                            </div>
                            <!-- Team Social Icon End -->
                        </div>
                        <!-- Team Body End -->
                    </div>
                    <!-- Team Member Item Start -->
                </div>

                <div class="col-lg-3 col-md-6">
                    <!-- Team Member Item Start -->
                    <div class="team-member-item wow fadeInUp">
                        <!-- Team Image Start -->
                        <div class="team-image">
                            <a href="#" data-cursor-text="View" on:click|preventDefault>
                                <figure class="image-anime">
                                    <img src="/lib/assets/team-4.jpg" alt="">
                                </figure>
                            </a>

                            <!-- Team Readmore Button Start -->
                            <div class="team-readmore-btn">
                                <a href="#" on:click|preventDefault><img src="/lib/assets/arrow-white.svg" alt=""></a>
                            </div>
                            <!-- Team Readmore Button End -->
                        </div>	
                        <!-- Team Image End -->

                        <!-- Team Body Start -->
                        <div class="team-body">
                            <!-- Team Content Start -->
                            <div class="team-content">
                                <h3><a href="#" on:click|preventDefault>Annette black</a></h3>
                                <p>Managing director</p>
                            </div>
                            <!-- Team Content End -->
                            
                            <!-- Team Social Icon Start -->
                            <div class="team-social-icon">
                                <ul>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fa-brands fa-instagram"></i></a></li>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fab fa-facebook-f"></i></a></li>
                                    <li><a href="#" aria-label="social-media" on:click|preventDefault><i class="fa-brands fa-dribbble"></i></a></li>
                                </ul>
                            </div>
                            <!-- Team Social Icon End -->
                        </div>
                        <!-- Team Body End -->
                    </div>
                    <!-- Team Member Item Start -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our Team Section End -->

    <!-- Our Testimonial Section Start -->
    <div class="our-testimonial">
        <div class="container">
            <div class="row section-row">
                <div class="col-lg-12">
                    <!-- Section Title Start -->
                    <div class="section-title">
                        <h3 class="wow fadeInUp">testimonials</h3>
                        <h2 class="text-anime-style-2" data-cursor="-opaque">Hear from those who <span>matter most</span></h2>
                    </div>
                    <!-- Section Title End -->
                </div>
            </div>

            <div class="row">               
                <div class="col-lg-12">
                    <div class="testimonial-slider">
                        <div class="swiper">
                            <div class="swiper-wrapper" data-cursor-text="Drag">
                                <!-- Testimonial Slide Start -->
                                <div class="swiper-slide">
                                    <div class="testimonial-item">
                                        <div class="testimonial-content">
                                            <p>“ From the moment I contacted them, I knew I was in good hands. The property exceeded all my expectations, and the team's expertise made the entire buying experience seamless. </p>
                                        </div>
                                        <div class="author-info">
                                            <div class="author-image">
                                                <figure class="image-anime">
                                                    <img src="/lib/assets/author-1.jpg" alt="">
                                                </figure>
                                            </div>            
                                            <div class="author-content">
                                                <h3>james d</h3>
                                                <p>ukco - united kingdom co.</p>
                                            </div>
                                        </div>                                    
                                    </div>
                                </div>
                                <!-- Testimonial Slide End -->

                                <!-- Testimonial Slide Start -->
                                <div class="swiper-slide">
                                    <div class="testimonial-item">
                                        <div class="testimonial-content">
                                            <p>“ From the moment I contacted them, I knew I was in good hands. The property exceeded all my expectations, and the team's expertise made the entire buying experience seamless. </p>
                                        </div>
                                        <div class="author-info">
                                            <div class="author-image">
                                                <figure class="image-anime">
                                                    <img src="/lib/assets/author-2.jpg" alt="">
                                                </figure>
                                            </div>            
                                            <div class="author-content">
                                                <h3>liya allen</h3>
                                                <p>Marketing manager</p>
                                            </div>
                                        </div>                                    
                                    </div>
                                </div>
                                <!-- Testimonial Slide End -->                              
                            </div>
                            <div class="testimonial-btn">
                                <div class="testimonial-btn-prev"></div>
                                <div class="testimonial-btn-next"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Our Testimonial Section End -->

    <!-- Our Faq Section Start -->
    <div class="our-faqs">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <!-- Our Faq Image Start -->
                    <div class="our-faqs-image">
                        <div class="our-faqs-img">
                            <figure class="image-anime reveal">
                                <img src="/lib/assets/our-faq-img.jpg" alt="">
                            </figure>
                        </div>

                        <!-- Quary Box Start -->
                        <div class="query-box wow fadeInUp">
                            <div class="query-box-content">
                                <h3>Still you have doubts?</h3>
                                <p>Standard dummy text ever</p>
                            </div>

                            <div class="query-box-btn">
                                <a href="/contact" class="btn-default btn-highlighted">submit query</a>
                            </div>
                        </div>
                        <!-- Quary Box End -->
                    </div>
                    <!-- Our Faq Image End -->
                </div>
                <div class="col-lg-6">
                    <!-- Our Faq Content Start -->
                    <div class="our-faqs-content">
                        <!-- Section Title Start -->
                        <div class="section-title">
                            <h3 class="wow fadeInUp">frequently asked questions</h3>
                            <h2 class="text-anime-style-2" data-cursor="-opaque">Clear answers to <span>your questions</span></h2>
                        </div>
                        <!-- Section Title End -->

                        <!-- FAQ Accordion Start -->
                        <div class="faq-accordion" id="accordion">
                            <!-- FAQ Item Start -->
                            <div class="accordion-item wow fadeInUp">
                                <h2 class="accordion-header" id="heading1">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                                        1. What is the process for purchasing a property?
                                    </button>
                                </h2>
                                <div id="collapse1" class="accordion-collapse collapse show" aria-labelledby="heading1" data-bs-parent="#accordion">
                                    <div class="accordion-body">
                                        <p>Our portfolio also includes high-end commercial spaces and vacation properties designed for comfort and style. We specialize in luxury residential properties, including single-family homes.</p>
                                    </div>
                                </div>
                            </div>
                            <!-- FAQ Item End -->

                            <!-- FAQ Item Start -->
                            <div class="accordion-item wow fadeInUp" data-wow-delay="0.2s">
                                <h2 class="accordion-header" id="heading2">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                                        2. How do I schedule a viewing?
                                    </button>
                                </h2>
                                <div id="collapse2" class="accordion-collapse collapse" aria-labelledby="heading2" data-bs-parent="#accordion">
                                    <div class="accordion-body">
                                        <p>Our portfolio also includes high-end commercial spaces and vacation properties designed for comfort and style. We specialize in luxury residential properties, including single-family homes.</p>
                                    </div>
                                </div>
                            </div>
                            <!-- FAQ Item End -->

                            <!-- FAQ Item Start -->
                            <div class="accordion-item wow fadeInUp" data-wow-delay="0.4s">
                                <h2 class="accordion-header" id="heading3">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                                        3. Do you offer financing options?
                                    </button>
                                </h2>
                                <div id="collapse3" class="accordion-collapse collapse" aria-labelledby="heading3" data-bs-parent="#accordion">
                                    <div class="accordion-body">
                                        <p>Our portfolio also includes high-end commercial spaces and vacation properties designed for comfort and style. We specialize in luxury residential properties, including single-family homes.</p>
                                    </div>
                                </div>
                            </div>
                            <!-- FAQ Item End -->

                            <!-- FAQ Item Start -->
                            <div class="accordion-item wow fadeInUp" data-wow-delay="0.6s">
                                <h2 class="accordion-header" id="heading4">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapse4">
                                        4. Can I customize the design of my new home?
                                    </button>
                                </h2>
                                <div id="collapse4" class="accordion-collapse collapse" aria-labelledby="heading4" data-bs-parent="#accordion">
                                    <div class="accordion-body">
                                        <p>Our portfolio also includes high-end commercial spaces and vacation properties designed for comfort and style. We specialize in luxury residential properties, including single-family homes.</p>
                                    </div>
                                </div>
                            </div>
                            <!-- FAQ Item End -->
                        </div>
                        <!-- FAQ Accordion End -->
                    </div>
                    <!-- Our Faq Content End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our Faq Section End -->

    <!-- Our Blog Section Start -->
    <div class="our-blog">
        <div class="container">
            <div class="row section-row">
                <div class="col-lg-12">
                    <!-- Section Title Start -->
                    <div class="section-title">
                        <h3 class="wow fadeInUp">latest posts</h3>
                        <h2 class="text-anime-style-2" data-cursor="-opaque">Stay informed with our <span>latest posts</span></h2>
                    </div>
                    <!-- Section Title End -->
                </div>
            </div>

            <div class="row">
                <div class="col-lg-4 col-md-6">
                    <!-- Post Item Start -->
                    <div class="post-item wow fadeInUp">
                        <!-- Post Featured Image Start-->
                        <div class="post-featured-image">
                            <a href="#" data-cursor-text="View" on:click|preventDefault>
                                <figure class="image-anime">
                                    <img src="/lib/assets/post-1.jpg" alt="">
                                </figure>    
                            </a>                            
                        </div>
                        <!-- Post Featured Image End -->

                        <!-- Post Item Body Start -->
                        <div class="post-item-body">
                            <!-- Post Item Content Start -->
                            <div class="post-item-content">
                                <h2><a href="#" on:click|preventDefault>Sustainable living: eco-friendly home features</a></h2>
                                <p>We explore sustainable design elements, from solar panels to energy-efficient appliances....</p>
                            </div>
                            <!-- Post Item Content End -->

                            <!-- Post Item Button Start-->
                            <div class="post-item-btn">
                                <a href="#" class="readmore-btn" on:click|preventDefault>read more <img src="/lib/assets/arrow-primary.svg" alt=""></a>
                            </div>
                            <!-- Post Item Button End-->
                        </div>
                        <!-- Post Item Body End -->
                    </div>
                    <!-- Post Item End -->
                </div>

                <div class="col-lg-4 col-md-6">
                    <!-- Post Item Start -->
                    <div class="post-item wow fadeInUp" data-wow-delay="0.2s">
                        <!-- Post Featured Image Start-->
                        <div class="post-featured-image">
                            <a href="#" data-cursor-text="View" on:click|preventDefault>
                                <figure class="image-anime">
                                    <img src="/lib/assets/post-2.jpg" alt="">
                                </figure>    
                            </a>                            
                        </div>
                        <!-- Post Featured Image End -->

                        <!-- Post Item Body Start -->
                        <div class="post-item-body">
                            <!-- Post Item Content Start -->
                            <div class="post-item-content">
                                <h2><a href="#" on:click|preventDefault>Small spaces: design tips for compact homes</a></h2>
                                <p>In this article, We share design strategies to maximize space, optimize storage, and make    </p>
                            </div>
                            <!-- Post Item Content End -->

                            <!-- Post Item Button Start-->
                            <div class="post-item-btn">
                                <a href="#" on:click|preventDefault>read more <img src="/lib/assets/arrow-primary.svg" alt=""></a>
                            </div>
                            <!-- Post Item Button End-->
                        </div>
                        <!-- Post Item Body End -->
                    </div>
                    <!-- Post Item End -->
                </div>

                <div class="col-lg-4 col-md-6">
                    <!-- Post Item Start -->
                    <div class="post-item wow fadeInUp" data-wow-delay="0.4s">
                        <!-- Post Featured Image Start-->
                        <div class="post-featured-image">
                            <a href="/blog-single"  data-cursor-text="View">
                                <figure class="image-anime">
                                    <img src="/lib/assets/post-3.jpg" alt="">
                                </figure>    
                            </a>                            
                        </div>
                        <!-- Post Featured Image End -->

                        <!-- Post Item Body Start -->
                        <div class="post-item-body">
                            <!-- Post Item Content Start -->
                            <div class="post-item-content">
                                <h2><a href="#" on:click|preventDefault>Home buying process: a step-by-step guide</a></h2>
                                <p>This post breaks down the home buying process into easy-to-follow steps...</p>
                            </div>
                            <!-- Post Item Content End -->

                            <!-- Post Item Button Start-->
                            <div class="post-item-btn">
                                <a href="#" class="readmore-btn" on:click|preventDefault>read more <img src="/lib/assets/arrow-primary.svg" alt=""></a>
                            </div>
                            <!-- Post Item Button End-->
                        </div>
                        <!-- Post Item Body End -->
                    </div>
                    <!-- Post Item End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our Blog Section End -->

<!-- Custom Styles for Homepage -->
<style>
    /* Property Search Section */
    .property-search-section {
        background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
        padding: 60px 0;
        margin-top: -60px;
        position: relative;
        z-index: 10;
    }

    .search-box {
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .search-box h3 {
        text-align: center;
        color: #1f1810;
        font-size: 28px;
        margin-bottom: 30px;
        font-weight: 600;
    }

    .search-filters {
        display: grid;
        grid-template-columns: repeat(4, 1fr) auto;
        gap: 20px;
        align-items: end;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
    }

    .filter-group label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
        font-weight: 500;
    }

    .filter-group select {
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
        transition: all 0.3s;
    }

    .filter-group select:focus {
        border-color: #d4af37;
        outline: none;
    }

    .btn-search {
        background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
        color: #1f1810;
        padding: 12px 30px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
        transition: all 0.3s;
        white-space: nowrap;
    }

    .btn-search:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
    }

    /* Featured Properties Section */
    .featured-properties {
        padding: 80px 0;
        background: #f9f9f9;
    }

    .featured-properties .section-title {
        text-align: center;
        margin-bottom: 50px;
    }

    .property-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        height: 100%;
    }

    .property-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }

    .card-image {
        position: relative;
        height: 240px;
        overflow: hidden;
    }

    .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }

    .property-card:hover .card-image img {
        transform: scale(1.08);
    }

    .featured-tag {
        position: absolute;
        top: 15px;
        left: 15px;
        background: #d4af37;
        color: #1f1810;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }

    .price-tag {
        position: absolute;
        bottom: 15px;
        right: 15px;
        background: rgba(31, 24, 16, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 14px;
    }

    .card-content {
        padding: 25px;
    }

    .card-content h4 {
        color: #1f1810;
        font-size: 18px;
        margin-bottom: 10px;
        font-weight: 600;
    }

    .card-content .location {
        color: #666;
        font-size: 14px;
        margin-bottom: 15px;
    }

    .card-content .specs {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        font-size: 14px;
        color: #666;
    }

    .btn-view {
        display: block;
        width: 100%;
        padding: 12px;
        background: #1f1810;
        color: white;
        text-align: center;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.3s;
    }

    .btn-view:hover {
        background: #d4af37;
        color: #1f1810;
    }

    /* Mobile Responsive */
    @media (max-width: 992px) {
        .search-filters {
            grid-template-columns: repeat(2, 1fr);
        }

        .btn-search {
            grid-column: 1 / -1;
        }
    }

    @media (max-width: 576px) {
        .search-filters {
            grid-template-columns: 1fr;
        }

        .search-box {
            padding: 25px;
        }

        .search-box h3 {
            font-size: 22px;
        }
    }
</style>
