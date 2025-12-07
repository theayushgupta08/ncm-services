import './About.css'

function About() {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1 className="about-title">About Us</h1>
        <div className="about-divider"></div>
      </div>

      <div className="about-content">
        <section className="about-section">
          <div className="about-card">
            <div className="about-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12ZM12 16C9.33 16 5 17.33 5 20V22H19V20C19 17.33 14.67 16 12 16Z" fill="currentColor"/>
              </svg>
            </div>
            <h2>Our Story</h2>
            <p>
              New Calcutta Motors has been serving the automotive needs of our community for years. 
              We started with a vision to provide exceptional service and quality products to every customer 
              who walks through our doors.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="currentColor"/>
              </svg>
            </div>
            <h2>Our Mission</h2>
            <p>
              Our mission is to deliver outstanding automotive services with integrity, professionalism, 
              and a commitment to customer satisfaction. We strive to build lasting relationships with 
              our clients through trust and excellence.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
              </svg>
            </div>
            <h2>Our Values</h2>
            <p>
              We are committed to quality, honesty, and customer-first service. Our team of experienced 
              professionals ensures that every interaction meets the highest standards of excellence and 
              customer care.
            </p>
          </div>
        </section>

        <section className="stats-section">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10+</div>
            <div className="stat-label">Years of Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About

