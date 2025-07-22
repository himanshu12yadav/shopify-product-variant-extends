import { useState } from "react";
import { Card, Button, Box, Text, Badge, Divider, TextField, Select, Checkbox } from "@shopify/polaris";
import { ViewIcon, HideIcon } from "@shopify/polaris-icons";

export default function Preview({ options = [] }) {
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [selectedValues, setSelectedValues] = useState({});
    const [customInputs, setCustomInputs] = useState({});

    const activeOptions = options.filter(opt => opt.values.some(v => v.checked));

    // Handle option selection
    const handleOptionSelect = (optionId, value) => {
        setSelectedValues(prev => ({
            ...prev,
            [optionId]: value
        }));
    };

    // Handle custom input changes
    const handleCustomInputChange = (optionId, value) => {
        setCustomInputs(prev => ({
            ...prev,
            [optionId]: value
        }));
    };

    // Render different input types based on option type
    const renderOptionInput = (option) => {
        const activeValues = option.values.filter(v => v.checked);

        switch (option.type) {
            case 'color':
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {activeValues.map((value) => {
                            const isSelected = selectedValues[option.id] === value.name;
                            return (
                                <div
                                    key={value.name}
                                    onClick={() => handleOptionSelect(option.id, value.name)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: getColorValue(value.name),
                                        border: isSelected ? '3px solid #000' : '2px solid #e1e1e1',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        boxShadow: isSelected ? '0 0 0 2px #fff, 0 0 0 4px #000' : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title={value.name}
                                >
                                    {isSelected && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            color: isLightColor(getColorValue(value.name)) ? '#000' : '#fff',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );

            case 'text':
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {activeValues.map((value) => {
                            const isSelected = selectedValues[option.id] === value.name;
                            return (
                                <Button
                                    key={value.name}
                                    variant={isSelected ? "primary" : "secondary"}
                                    size="medium"
                                    onClick={() => handleOptionSelect(option.id, value.name)}
                                    style={{
                                        minWidth: '60px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {value.name}
                                </Button>
                            );
                        })}
                    </div>
                );

            case 'number':
                return (
                    <Select
                        options={[
                            { label: 'Select an option', value: '' },
                            ...activeValues.map(v => ({ label: v.name, value: v.name }))
                        ]}
                        value={selectedValues[option.id] || ''}
                        onChange={(value) => handleOptionSelect(option.id, value)}
                    />
                );

            case 'image':
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {activeValues.map((value) => {
                            const isSelected = selectedValues[option.id] === value.name;
                            return (
                                <div
                                    key={value.name}
                                    onClick={() => handleOptionSelect(option.id, value.name)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        border: isSelected ? '3px solid #000' : '2px solid #e1e1e1',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f7f7f7',
                                        position: 'relative',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Text variant="bodySm" alignment="center">{value.name}</Text>
                                    {isSelected && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            backgroundColor: '#000',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px'
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );

            default:
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {activeValues.map((value) => {
                            const isSelected = selectedValues[option.id] === value.name;
                            return (
                                <Button
                                    key={value.name}
                                    variant={isSelected ? "primary" : "secondary"}
                                    size="medium"
                                    onClick={() => handleOptionSelect(option.id, value.name)}
                                >
                                    {value.name}
                                </Button>
                            );
                        })}
                    </div>
                );
        }
    };

    // Helper functions
    const getColorValue = (colorName) => {
        const colorMap = {
            'red': '#ff0000',
            'blue': '#0000ff',
            'green': '#008000',
            'black': '#000000',
            'white': '#ffffff',
            'yellow': '#ffff00',
            'orange': '#ffa500',
            'purple': '#800080',
            'pink': '#ffc0cb',
            'gray': '#808080',
            'grey': '#808080',
            'brown': '#a52a2a',
            'navy': '#000080',
            'maroon': '#800000',
            'teal': '#008080',
            'lime': '#00ff00'
        };
        return colorMap[colorName.toLowerCase()] || '#e1e1e1';
    };

    const isLightColor = (color) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 155;
    };

    return (
        <Card>
            <Box padding="500">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Text variant="headingMd" as="h2">Product Preview</Text>
                            <Text variant="bodySm" color="subdued">
                                Interactive preview of customer experience
                            </Text>
                        </div>
                        <Button
                            variant={isPreviewMode ? "primary" : "secondary"}
                            icon={isPreviewMode ? HideIcon : ViewIcon}
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                        >
                            {isPreviewMode ? 'Exit Preview' : 'Enter Preview'}
                        </Button>
                    </div>

                    <Divider />

                    {isPreviewMode ? (
                        <div style={{
                            backgroundColor: '#fff',
                            border: '1px solid #e1e1e1',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {/* Product Header */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <Text variant="headingLg" as="h1">Premium Product</Text>
                                    <Badge tone="success">In Stock</Badge>
                                </div>
                                <Text variant="bodyLg" color="subdued">$99.99</Text>
                            </div>

                            {/* Product Options */}
                            {activeOptions.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {activeOptions.map((option) => (
                                        <div key={option.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Text variant="bodyLg" fontWeight="semibold">
                                                    {option.name}
                                                </Text>
                                                {selectedValues[option.id] && (
                                                    <Badge tone="info">
                                                        {selectedValues[option.id]}
                                                    </Badge>
                                                )}
                                            </div>

                                            {renderOptionInput(option)}
                                        </div>
                                    ))}

                                    {/* Add to Cart Section */}
                                    <div style={{
                                        marginTop: '24px',
                                        paddingTop: '24px',
                                        borderTop: '1px solid #e1e1e1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px'
                                    }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Text variant="bodyMd">Qty:</Text>
                                                <Select
                                                    options={[
                                                        { label: '1', value: '1' },
                                                        { label: '2', value: '2' },
                                                        { label: '3', value: '3' },
                                                        { label: '4', value: '4' },
                                                        { label: '5', value: '5' }
                                                    ]}
                                                    value="1"
                                                    onChange={() => {}}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <Button
                                                primary
                                                size="large"
                                                style={{ flex: 1 }}
                                                disabled={activeOptions.some(opt => !selectedValues[opt.id])}
                                            >
                                                Add to Cart
                                            </Button>
                                            <Button size="large" variant="secondary">
                                                Buy Now
                                            </Button>
                                        </div>

                                        {/* Selection Summary */}
                                        {Object.keys(selectedValues).length > 0 && (
                                            <div style={{
                                                backgroundColor: '#f7f7f7',
                                                padding: '16px',
                                                borderRadius: '8px',
                                                marginTop: '16px'
                                            }}>
                                                <Text variant="bodyMd" fontWeight="semibold" style={{ marginBottom: '8px' }}>
                                                    Your Selection:
                                                </Text>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {Object.entries(selectedValues).map(([optionId, value]) => {
                                                        const option = activeOptions.find(opt => opt.id.toString() === optionId);
                                                        return option ? (
                                                            <Text key={optionId} variant="bodySm">
                                                                <strong>{option.name}:</strong> {value}
                                                            </Text>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Box textAlign="center" padding="800">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                        <Text variant="headingMd" color="subdued">
                                            No Active Options
                                        </Text>
                                        <Text variant="bodyMd" color="subdued">
                                            Create and enable options to see the interactive preview
                                        </Text>
                                    </div>
                                </Box>
                            )}
                        </div>
                    ) : (
                        <Box textAlign="center" padding="800">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    backgroundColor: '#f7f7f7',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed #c9c9c9'
                                }}>
                                    <ViewIcon style={{ width: '48px', height: '48px', color: '#999' }} />
                                </div>
                                <div>
                                    <Text variant="headingMd" color="subdued">
                                        Click "Enter Preview" to test your options
                                    </Text>
                                    <Text variant="bodyMd" color="subdued" style={{ marginTop: '8px' }}>
                                        See exactly how customers will interact with your product options
                                    </Text>
                                </div>
                            </div>
                        </Box>
                    )}
                </div>
            </Box>
        </Card>
    );
}
