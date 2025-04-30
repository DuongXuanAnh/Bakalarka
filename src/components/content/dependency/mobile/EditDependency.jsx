import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAttributeContext } from '../../../../contexts/AttributeContext';
import { useDependencyContext } from '../../../../contexts/DependencyContext';
import { useTranslation } from 'react-i18next';
import './editDependency.scss';

export default function EditDependency() {
    const { t } = useTranslation();
    const { attributes } = useAttributeContext();
    const { id: stringId } = useParams();
    const id = parseInt(stringId, 10);
    const { dependencies, setDependencies } = useDependencyContext();
    const navigate = useNavigate();

    const [leftAttributes, setLeftAttributes] = useState([]);
    const [rightAttributes, setRightAttributes] = useState([]);

    useEffect(() => {
        if (dependencies[id]) {
            setLeftAttributes(dependencies[id].left);
            setRightAttributes(dependencies[id].right);
        }
    }, [id, dependencies]);

    const handleSave = useCallback(() => {
        setDependencies(prev => {
            const updatedDependencies = [...prev];
            updatedDependencies[id] = {
                left: leftAttributes,
                right: rightAttributes
            };
            return updatedDependencies;
        });
        navigate('/dependencies');
    }, [id, leftAttributes, rightAttributes, navigate, setDependencies]);

    const handleAddAttribute = useCallback((side, value) => {
        if (value === "default") return;
        const setter = side === 'left' ? setLeftAttributes : setRightAttributes;
        setter(prev => [...prev, value]);
    }, []);

    const handleRemoveAttribute = useCallback((side, indexToRemove) => {
        const setter = side === 'left' ? setLeftAttributes : setRightAttributes;
        setter(prevAttributes => prevAttributes.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleDelete = useCallback(() => {
        setDependencies(prev => prev.filter((_, index) => index !== id));
        navigate('/dependencies');
    }, [id, navigate, setDependencies]);

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
        <div className='editDependencyContainer'>
            <h1>{t('content-dependencies.updateDependency')}</h1>
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
            <button onClick={handleSave} className='saveChangeBtn'>{t('content-dependencies.saveChanges')}</button>
            <button onClick={handleDelete} className='deleteBtn'>{t('content-dependencies.delete')}</button>
        </div>
    );
}
