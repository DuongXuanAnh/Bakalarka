import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.scss';
import { useTranslation } from 'react-i18next';

import { HelperColorFunctions } from "../../algorithm/HelperColorFunctions";

const helperColorFunctionsInstance = new HelperColorFunctions();

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isResponsive, setIsResponsive] = useState(false);
  const [hover, setHover] = useState('')

  const toggleNavbar = () => {
    setIsResponsive(!isResponsive);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'cz' ? 'en' : 'cz');
  };

  return (
    <>
      <div 
        className={`topnav ${isResponsive ? 'responsive' : ''}`}
        style={{backgroundColor:helperColorFunctionsInstance.uiSkinProperty('NavbarBackground')}}
        id="myTopnav">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''} 
          style={{
            backgroundColor: helperColorFunctionsInstance.uiSkinProperty(location.pathname === '/' ? 'NavbarActiveBackground' : (hover === 'Attributes' ? 'NavbarHoverBackground' : 'NavbarBackground')),
            color: helperColorFunctionsInstance.uiSkinProperty(location.pathname === '/' ? 'NavbarActiveColor' : (hover === 'Attributes' ? 'NavbarHoverColor' : 'NavbarColor'))
            }}
          onMouseEnter={() => setHover('Attributes')} 
          onMouseLeave={() => setHover('')}
          onClick={() => setIsResponsive(false)}>
          <p>{t('navBar.nav-title-addAttribute')}</p>
        </Link>
        <Link 
          to="/dependencies" 
          className={location.pathname === '/dependencies' ? 'active' : ''} 
          style={{
            backgroundColor: helperColorFunctionsInstance.uiSkinProperty(location.pathname === '/dependencies' ? 'NavbarActiveBackground' : (hover === 'Dependencies' ? 'NavbarHoverBackground' : 'NavbarBackground')),
            color: helperColorFunctionsInstance.uiSkinProperty(location.pathname === '/dependencies' ? 'NavbarActiveColor' : (hover === 'Dependencies' ? 'NavbarHoverColor' : 'NavbarColor'))
            }}
          onMouseEnter={() => setHover('Dependencies')} 
          onMouseLeave={() => setHover('')}
          onClick={() => setIsResponsive(false)}>
            <p>{t('navBar.nav-title-addDependencies')}</p>
        </Link>
        <Link 
          to="/problems" 
          className={location.pathname === '/problems' ? 'active' : ''} 
          style={{
            backgroundColor: helperColorFunctionsInstance.uiSkinProperty(location.pathname === '/problems' ? 'NavbarActiveBackground' : (hover === 'Problems' ? 'NavbarHoverBackground' : 'NavbarBackground')),
            color: helperColorFunctionsInstance.uiSkinProperty(location.pathname === '/problems' ? 'NavbarActiveColor' : (hover === 'Problems' ? 'NavbarHoverColor' : 'NavbarColor'))
            }}
          onMouseEnter={() => setHover('Problems')} 
          onMouseLeave={() => setHover('')}
          onClick={() => setIsResponsive(false)}>
          <p>{t('navBar.nav-title-problem')}</p>
        </Link>
        <a href="#" className="icon" onClick={toggleNavbar}>
          <i className="fa fa-bars"></i>
        </a>
        <a 
          href="#"
          style={{
            backgroundColor: helperColorFunctionsInstance.uiSkinProperty(hover === 'Languages' ? 'NavbarHoverBackground' : 'NavbarBackground'),
            color: helperColorFunctionsInstance.uiSkinProperty(hover === 'Languages' ? 'NavbarHoverColor' : 'NavbarColor')
            }}
          onMouseEnter={() => setHover('Languages')} 
          onMouseLeave={() => setHover('')}
          onClick={toggleLanguage}
          className='languages_btn'>
          🌍 {i18n.language.toUpperCase()}
        </a>
      </div>
    </>
  );
};

export default Navbar;
