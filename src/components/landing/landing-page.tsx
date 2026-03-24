'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
}

function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-500 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function MobileMenu({ 
  isOpen, 
  onClose, 
  scrollToSection,
  whatsappUrl 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  scrollToSection: (id: string) => void;
  whatsappUrl: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mt-12 space-y-1">
            <button
              onClick={() => { scrollToSection('hero'); onClose(); }}
              className="block w-full text-left px-4 py-3 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={() => { scrollToSection('contact'); onClose(); }}
              className="block w-full text-left px-4 py-3 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
            >
              Contacto
            </button>
            <button
              onClick={() => { scrollToSection('work-with-us'); onClose(); }}
              className="block w-full text-left px-4 py-3 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
            >
              Trabaja con Nosotros
            </button>
          </div>
          <div className="mt-8 space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg">
                Iniciar Sesion
              </Button>
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold py-3 rounded-xl">
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LandingConfig {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string | null;
  heroButtonText: string;
  whatsappUrl: string;
  contactTitle: string;
  contactDescription: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  workWithUsTitle: string;
  workWithUsDescription: string | null;
  workWithUsEmail: string | null;
}

interface LandingPageProps {
  config: LandingConfig;
}

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1920&q=90';

function WhatsAppButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
      aria-label="Contactar por WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

export function LandingPage({ config }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const heroImage = config.heroImageUrl && config.heroImageUrl.trim() !== '' 
    ? config.heroImageUrl 
    : FALLBACK_HERO_IMAGE;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/frutylab-logo.png"
                alt="FrutyLab"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
                priority
              />
              <span className={`text-xl sm:text-2xl font-bold transition-colors ${
                scrolled ? 'text-green-600' : 'text-white'
              }`}>FrutyLab</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-10">
              <button
                onClick={() => scrollToSection('hero')}
                className={`text-base lg:text-lg font-medium transition-colors ${
                  scrolled 
                    ? 'text-gray-700 hover:text-green-600' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className={`text-base lg:text-lg font-medium transition-colors ${
                  scrolled 
                    ? 'text-gray-700 hover:text-green-600' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Contacto
              </button>
              <button
                onClick={() => scrollToSection('work-with-us')}
                className={`text-base lg:text-lg font-medium transition-colors ${
                  scrolled 
                    ? 'text-gray-700 hover:text-green-600' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Trabaja con Nosotros
              </button>
              <Link href="/login">
                <Button className={`font-semibold px-6 py-2 rounded-xl transition-all duration-300 ${
                  scrolled
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30'
                }`}>
                  Iniciar Sesion
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'
              }`}
            >
              <svg className={`w-6 h-6 ${scrolled ? 'text-gray-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        scrollToSection={scrollToSection}
        whatsappUrl={config.whatsappUrl}
      />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-green-900/40" />
        </div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 py-20 sm:py-0">
          <div className="max-w-4xl mx-auto md:mx-0">
            <div className="text-white space-y-4 sm:space-y-6 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  {config.heroTitle}
                </span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 font-light max-w-2xl mx-auto md:mx-0">
                {config.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                  onClick={() => scrollToSection('contact')}
                >
                  {config.heroButtonText}
                </Button>
                <a href={config.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Por que elegir <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">FrutyLab</span>?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos pulpa de fruta 100% natural, sin conservantes ni aditivos
            </p>
          </AnimatedSection>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <AnimatedSection delay={0}>
              <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg rounded-2xl h-full group hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">100% Natural</h3>
                  <p className="text-gray-600">Sin conservantes, sin colorantes, solo fruta fresca</p>
                </CardContent>
              </Card>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg rounded-2xl h-full group hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Frescura Garantizada</h3>
                  <p className="text-gray-600">Procesamos la fruta en su punto optimo de maduracion</p>
                </CardContent>
              </Card>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg rounded-2xl h-full group hover:-translate-y-1 sm:col-span-2 md:col-span-1">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Vida Saludable</h3>
                  <p className="text-gray-600">Ideal para deportistas y amantes de lo natural</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{config.contactTitle}</h2>
            {config.contactDescription && (
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">{config.contactDescription}</p>
            )}
          </AnimatedSection>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {config.contactEmail && (
              <AnimatedSection delay={0}>
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl h-full group hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Email</h3>
                    <a href={`mailto:${config.contactEmail}`} className="text-green-600 hover:text-green-700 font-medium transition-colors">
                      {config.contactEmail}
                    </a>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
            
            {config.contactPhone && (
              <AnimatedSection delay={100}>
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl h-full group hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Telefono</h3>
                    <a href={`tel:${config.contactPhone}`} className="text-green-600 hover:text-green-700 font-medium transition-colors">
                      {config.contactPhone}
                    </a>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
            
            {config.contactAddress && (
              <AnimatedSection delay={200}>
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl h-full group hover:-translate-y-1 sm:col-span-2 md:col-span-1">
                  <CardContent className="pt-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Direccion</h3>
                    <p className="text-gray-600">{config.contactAddress}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Work With Us Section */}
      <section id="work-with-us" className="py-16 sm:py-20 bg-gradient-to-br from-green-600 via-green-600 to-green-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">{config.workWithUsTitle}</h2>
            {config.workWithUsDescription && (
              <p className="text-lg sm:text-xl text-green-100 mb-6 sm:mb-8">{config.workWithUsDescription}</p>
            )}
            {config.workWithUsEmail && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href={`mailto:${config.workWithUsEmail}`}>
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold">
                    Enviar CV a {config.workWithUsEmail}
                  </Button>
                </a>
              </div>
            )}
            {!config.workWithUsEmail && (
              <a href={config.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold">
                  Contactanos por WhatsApp
                </Button>
              </a>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="/frutylab-logo.png"
                alt="FrutyLab"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold">FrutyLab</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contacto
              </button>
              <button
                onClick={() => scrollToSection('work-with-us')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Trabaja con Nosotros
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} FrutyLab. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton url={config.whatsappUrl} />

      {/* Login Floating Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <Link href="/login">
          <div className="relative group">
            <div className="absolute -top-10 right-0 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Iniciar Sesión
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110 cursor-pointer">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
