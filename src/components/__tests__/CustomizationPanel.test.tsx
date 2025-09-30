import React from 'react';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomizationPanel from '../CustomizationPanel';
import { HumanizationSettings } from '../../types/humanization';

describe('CustomizationPanel', () => {
  // Increase timeout for slow-running tests
  jest.setTimeout(15000);

  const defaultSettings: HumanizationSettings = {
    formalityLevel: 5,
    creativityLevel: 5,
    vocabularyComplexity: 5,
    sentenceComplexity: 5,
    tone: 'neutral',
    audience: 'general',
    targetAudience: 'general',
    writingStyle: 'narrative',
    aiDetectionAvoidance: 5,
    linguisticFingerprinting: 5,
    personalityStrength: 5,
    subjectArea: 'general',
    preserveStructure: true,
    addTransitions: true,
    varyingSentenceLength: true
  };

  const mockOnSettingsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('should render all customization controls', () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    expect(screen.getByLabelText(/writing style/i)).toBeInTheDocument();
    expect(screen.getByText(/ai detection avoidance/i)).toBeInTheDocument();
    expect(screen.getByText(/advanced options/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/formality level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/creativity level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vocabulary complexity/i)).toBeInTheDocument();
  });

  it('should display current settings values', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    await waitFor(() => {
      const formalitySlider = screen.getByLabelText(/formality level/i);
      expect(formalitySlider).toHaveValue('5');
    });

    await waitFor(() => {
      const creativitySlider = screen.getByLabelText(/creativity level/i);
      expect(creativitySlider).toHaveValue('5');
    });
  });

  it('should call onSettingsChange when formality level changes', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const formalitySlider = screen.getByLabelText(/formality level/i);
    fireEvent.change(formalitySlider, { target: { value: 8 } });
    fireEvent.input(formalitySlider, { target: { value: 8 } });

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        formalityLevel: 8
      });
    });
  });

  it('should call onSettingsChange when creativity level changes', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const creativitySlider = screen.getByLabelText(/creativity level/i);
    fireEvent.change(creativitySlider, { target: { value: 7 } });
    fireEvent.input(creativitySlider, { target: { value: 7 } });

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        creativityLevel: 7
      });
    });
  });

  it('should update tone selection', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const toneSelect = screen.getByLabelText(/tone/i);
    await userEvent.click(toneSelect);
    
    const casualOption = screen.getByText(/casual/i);
    await userEvent.click(casualOption);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      tone: 'casual'
    });
  });

  it('should update writing style selection', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const styleSelect = screen.getByLabelText(/writing style/i);
    await userEvent.click(styleSelect);
    
    const technicalOption = screen.getByText(/technical/i);
    await userEvent.click(technicalOption);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      writingStyle: 'technical'
    });
  });

  it('should update target audience selection', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const audienceSelect = screen.getByLabelText(/target audience/i);
    await userEvent.click(audienceSelect);
    
    const expertOption = screen.getByText(/experts/i);
    await userEvent.click(expertOption);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      targetAudience: 'experts'
    });
  });

  it('should toggle preserve structure checkbox', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    // Expand the Advanced Options accordion first
    const advancedOptionsAccordion = screen.getByText(/advanced options/i);
    await userEvent.click(advancedOptionsAccordion);

    const preserveCheckbox = screen.getByRole('switch', { name: /preserve.*structure/i });
    await userEvent.click(preserveCheckbox);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      preserveStructure: false
    });
  });

  it('should toggle add transitions checkbox', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    // Expand the Advanced Options accordion first
    const advancedOptionsAccordion = screen.getByText(/advanced options/i);
    await userEvent.click(advancedOptionsAccordion);

    const transitionsCheckbox = screen.getByRole('switch', { name: /add.*transitions/i });
    await userEvent.click(transitionsCheckbox);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      addTransitions: false
    });
  });

  it('should update AI detection avoidance level', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const avoidanceSlider = screen.getByLabelText(/ai detection avoidance level/i);
    fireEvent.change(avoidanceSlider, { target: { value: 9 } });
    fireEvent.input(avoidanceSlider, { target: { value: 9 } });

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        aiDetectionAvoidance: 9
      });
    });
  });

  it('should show advanced settings when expanded', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const advancedToggle = screen.getByText(/advanced options/i);
    await userEvent.click(advancedToggle);

    expect(screen.getByLabelText(/linguistic fingerprinting/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/personality strength/i)).toBeInTheDocument();
  });

  it('should update subject area selection', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const subjectSelect = screen.getByLabelText(/subject area/i);
    await userEvent.click(subjectSelect);
    
    const technologyOption = screen.getByText(/technology/i);
    await userEvent.click(technologyOption);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      subjectArea: 'technology'
    });
  });

  it('should validate slider input ranges', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const formalitySlider = screen.getByLabelText(/formality level/i);
    
    // Test minimum boundary
    fireEvent.change(formalitySlider, { target: { value: 1 } });
    fireEvent.input(formalitySlider, { target: { value: 1 } });

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        formalityLevel: 1
      });
    });

    // Test maximum boundary
    fireEvent.change(formalitySlider, { target: { value: 10 } });
    fireEvent.input(formalitySlider, { target: { value: 10 } });

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        formalityLevel: 10
      });
    });
  });

  it('should reset to default settings', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    // Expand the Preset Management accordion first
    const presetManagementAccordion = screen.getByText(/preset management/i);
    await userEvent.click(presetManagementAccordion);

    const resetButton = screen.getByText(/reset to defaults/i);
    await userEvent.click(resetButton);

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        formalityLevel: 5,
        creativityLevel: 5,
        tone: 'neutral',
        writingStyle: 'narrative'
      })
    );
  });

  it('should show tooltips for complex settings', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const helpIcon = screen.getByLabelText(/help for ai detection avoidance/i);
    await userEvent.hover(helpIcon);

    await waitFor(() => {
      expect(screen.getByText(/higher values make text less detectable/i)).toBeInTheDocument();
    });
  });

  it('should handle rapid setting changes without errors', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    const formalitySlider = screen.getByLabelText(/formality level/i);
    
    // Test rapid changes: 5 -> 3 -> 7 -> 8 (avoid returning to default value)
    // Use numeric values for Material-UI sliders
    fireEvent.change(formalitySlider, { target: { value: 3 } });
    fireEvent.change(formalitySlider, { target: { value: 7 } });
    fireEvent.change(formalitySlider, { target: { value: 8 } });

    expect(mockOnSettingsChange).toHaveBeenCalledTimes(3); // Three distinct value changes
  });

  it('should maintain accessibility standards', async () => {
    render(
      <CustomizationPanel 
        settings={defaultSettings} 
        onSettingsChange={mockOnSettingsChange} 
      />
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByLabelText(/formality level/i)).toBeInTheDocument();
    });

    // Check all elements are present
    const formalitySlider = screen.getByLabelText(/formality level/i);
    const creativitySlider = screen.getByLabelText(/creativity level/i);
    const toneSelect = screen.getByLabelText(/tone/i);
    
    expect(formalitySlider).toBeInTheDocument();
    expect(creativitySlider).toBeInTheDocument();
    expect(toneSelect).toBeInTheDocument();
    expect(formalitySlider).toHaveAttribute('aria-valuemin', '1');
    expect(formalitySlider).toHaveAttribute('aria-valuemax', '10');
  });

  it('should save and load preset configurations', async () => {
    // Use a real state to track settings changes
    let currentSettings = { ...defaultSettings };
    const handleSettingsChange = (newSettings: any) => {
      currentSettings = newSettings;
      mockOnSettingsChange(newSettings);
    };

    const { rerender } = render(
      <CustomizationPanel 
        settings={currentSettings} 
        onSettingsChange={handleSettingsChange} 
      />
    );

    const formalitySlider = screen.getByLabelText(/formality level/i);
    
    // Use the same approach as other working tests
    fireEvent.change(formalitySlider, { target: { value: 8 } });
    fireEvent.input(formalitySlider, { target: { value: 8 } });
    
    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          formalityLevel: 8
        })
      );
    });

    // Re-render with updated settings
    rerender(
      <CustomizationPanel 
        settings={currentSettings} 
        onSettingsChange={handleSettingsChange} 
      />
    );

    // Expand the Preset Management accordion first
    const presetManagementAccordion = screen.getByText(/preset management/i);
    await userEvent.click(presetManagementAccordion);

    const savePresetButton = screen.getByText(/save preset/i);
    await userEvent.click(savePresetButton);

    const presetNameInput = screen.getByPlaceholderText(/preset name/i);
    await userEvent.type(presetNameInput, 'My Custom Preset');

    const confirmSaveButton = screen.getByTestId('save-preset-confirm');
    await userEvent.click(confirmSaveButton);

    // Wait for dialog to close and preset to be saved
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Wait for localStorage to be updated
    await waitFor(() => {
      const savedPresets = localStorage.getItem('humanization-presets');
      expect(savedPresets).toBeTruthy();
    }, { timeout: 5000 });

    // Wait for the preset to be properly saved
    await waitFor(() => {
      const savedPresets = localStorage.getItem('humanization-presets');
      const presets = JSON.parse(savedPresets!);
      expect(presets['My Custom Preset']).toBeDefined();
    }, { timeout: 5000 });

    // Validate the saved preset separately
    const savedPresets = localStorage.getItem('humanization-presets');
    expect(savedPresets).toBeTruthy();
    const presets = JSON.parse(savedPresets!);
    expect(presets['My Custom Preset']).toBeDefined();
    expect(presets['My Custom Preset'].formalityLevel).toBe(8);

    const presetSelect = screen.getByRole('combobox', { name: /load preset/i });
    await userEvent.click(presetSelect);
    
    const presetOption = screen.getByRole('option', { name: 'My Custom Preset' });
    await userEvent.click(presetOption);

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        formalityLevel: 8
      })
    );
  });
});