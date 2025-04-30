import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.scss';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isResponsive, setIsResponsive] = useState(false);

  const toggleNavbar = () => {
    setIsResponsive(!isResponsive);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'cz' ? 'en' : 'cz');
  };

  return (
    <>
      <div className={`topnav ${isResponsive ? 'responsive' : ''}`} id="myTopnav">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''} 
          onClick={() => setIsResponsive(false)}>
          <p>{t('navBar.nav-title-addAttribute')}</p>
        </Link>
        <Link 
          to="/dependencies" 
          className={location.pathname === '/dependencies' ? 'active' : ''} 
          onClick={() => setIsResponsive(false)}>
            <p>{t('navBar.nav-title-addDependencies')}</p>
        </Link>
        <Link 
          to="/problems" 
          className={location.pathname === '/problems' ? 'active' : ''} 
          onClick={() => setIsResponsive(false)}>
          <p>{t('navBar.nav-title-problem')}</p>
        </Link>
        <a href="#" className="icon" onClick={toggleNavbar}>
          <i className="fa fa-bars"></i>
        </a>
        <a href="#" onClick={toggleLanguage} className='languages_btn'>
          🌍 {i18n.language.toUpperCase()}
        </a>
      </div>
    </>
  );
};

export default Navbar;
