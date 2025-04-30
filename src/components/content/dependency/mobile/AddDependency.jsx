import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttributeContext } from '../../../../contexts/AttributeContext';
import { useDependencyContext } from '../../../../contexts/DependencyContext';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import './addDependency.scss';

export default function AddDependency() {
    const { t } = useTranslation();
    const { attributes } = useAttributeContext();
    const { setDependencies } = useDependencyContext();
    const navigate = useNavigate();

    const [leftAttributes, setLeftAttributes] = useState([]);
    const [rightAttributes, setRightAttributes] = useState([]);

    const handleAddDependency = useCallback(() => {

        if (leftAttributes.length === 0 || rightAttributes.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: t('content-dependencies.needSelectBothSides'),
            });
            return;
        }

        setDependencies(prev => [...prev, { left: leftAttributes, right: rightAttributes }]);
        setLeftAttributes([]);
        setRightAttributes([]);

        navigate('/dependencies');

    }, [leftAttributes, rightAttributes, setDependencies]);

    const goBack = useCallback(() => {
        navigate('/dependencies');
    }, []);

    const handleAddAttribute = useCallback((side, value) => {
        if (value === "default") return;
        const setter = side === 'left' ? setLeftAttributes : setRightAttributes;
        setter(prev => [...prev, value]);
    }, []);

    const handleRemoveAttribute = useCallback((side, indexToRemove) => {
        const setter = side === 'left' ? setLeftAttributes : setRightAttributes;
        setter(prevAttributes => prevAttributes.filter((_, index) => index !== indexToRemove));
    }, []);

    const renderComboBoxes = useCallback((side) => {
        const attributesList = side === 'left' ? leftAttributes : rightAttributes;
        return (
            <>
                {attributesList.map((selectedAttribute, index) => (
                    <div key={index} className="comboBoxWrapper">
                        <span className="attributeTag">
                            {selectedAttribute}
                            <button onClick={() => handleRemoveAttribute(side, index)} className='removeBtn'>x</button>
                        </span>
                    </div>
                ))}
                <select 
                    value="default" 
                    onChange={(e) => handleAddAttribute(side, e.target.value)}
                    className='addAttrComboBox'
                >
                    <option value="default" disabled>+</option>
                    {attributes.filter(attr => !attributesList.includes(attr)).map(attr => (
                        <option key={attr} value={attr}>{attr}</option>
                    ))}
                </select>
            </>
        );
    }, [leftAttributes, rightAttributes, attributes, handleAddAttribute, handleRemoveAttribute]);

    const fillAllAttributes = useCallback((side) => {
        const setter = side === 'left' ? setLeftAttributes : setRightAttributes;
        setter([...attributes]);
    }, []);

    return (
        <div className='addDependencyContainer'>
            <h1>{t('content-dependencies.addRelation')}</h1>
            <h2>{t('content-dependencies.leftSide')}</h2>
            <div className='leftAttributes'>
            <button className='fillAllAttributesBtn' onClick={() => fillAllAttributes("left")}>{t('global.fillAllAttributes')}</button>
                {renderComboBoxes('left')}
            </div>
            <h2>{t('content-dependencies.rightSide')}</h2>
            <div className='rightAttributes'>
            <button className='fillAllAttributesBtn' onClick={() => fillAllAttributes("right")}>{t('global.fillAllAttributes')}</button>
                {renderComboBoxes('right')}
            </div>
            <button onClick={handleAddDependency} className='addBtn'>{t('content-dependencies.addRelation')}</button>
            <button onClick={goBack} className='backBtn'>{t('content-dependencies.back')}</button>
        </div>
    );
}
