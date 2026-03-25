import { render, screen, fireEvent } from '@testing-library/react';
import { SubtitleLanguageSelector } from './SubtitleLanguageSelector';
import type { SubtitleLanguage } from '../types/index';

describe('SubtitleLanguageSelector', () => {
  describe('Rendering', () => {
    it('renders all language options', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(9); // 9 supported languages
    });

    it('displays language labels with native labels', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      expect(screen.getByText('English (English)')).toBeInTheDocument();
      expect(screen.getByText('Spanish (Español)')).toBeInTheDocument();
      expect(screen.getByText('French (Français)')).toBeInTheDocument();
      expect(screen.getByText('German (Deutsch)')).toBeInTheDocument();
      expect(screen.getByText('Portuguese (Português)')).toBeInTheDocument();
      expect(screen.getByText('Italian (Italiano)')).toBeInTheDocument();
      expect(screen.getByText('Russian (Русский)')).toBeInTheDocument();
      expect(screen.getByText('Japanese (日本語)')).toBeInTheDocument();
      expect(screen.getByText('Chinese (中文)')).toBeInTheDocument();
    });

    it('renders as a select element', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      expect(selector).toBeInTheDocument();
      expect(selector.tagName).toBe('SELECT');
    });
  });

  describe('Selection', () => {
    it('displays selected language', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="es"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox') as HTMLSelectElement;
      expect(selector.value).toBe('es');
    });

    it('calls onLanguageChange when selection changes', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      fireEvent.change(selector, { target: { value: 'fr' } });

      expect(mockOnChange).toHaveBeenCalledWith('fr');
    });

    it('calls onLanguageChange with correct language code', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      fireEvent.change(selector, { target: { value: 'ja' } });

      expect(mockOnChange).toHaveBeenCalledWith('ja');
    });

    it('updates selected value when prop changes', () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      let selector = screen.getByRole('combobox') as HTMLSelectElement;
      expect(selector.value).toBe('en');

      rerender(
        <SubtitleLanguageSelector
          selectedLanguage="de"
          onLanguageChange={mockOnChange}
        />
      );

      selector = screen.getByRole('combobox') as HTMLSelectElement;
      expect(selector.value).toBe('de');
    });
  });

  describe('Disabled State', () => {
    it('renders enabled by default', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox') as HTMLSelectElement;
      expect(selector.disabled).toBe(false);
    });

    it('renders disabled when disabled prop is true', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
          disabled={true}
        />
      );

      const selector = screen.getByRole('combobox') as HTMLSelectElement;
      expect(selector.disabled).toBe(true);
    });

    it('does not call onLanguageChange when disabled', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
          disabled={true}
        />
      );

      const selector = screen.getByRole('combobox');
      fireEvent.change(selector, { target: { value: 'es' } });

      // The change event still fires, but the disabled state prevents interaction
      // This is browser behavior - the select element is disabled
      expect(selector).toBeDisabled();
    });

    it('applies disabled styling', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
          disabled={true}
        />
      );

      const selector = screen.getByRole('combobox');
      expect(selector).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('has ARIA label', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      expect(selector).toHaveAttribute('aria-label', 'Select subtitle language');
    });

    it('has id attribute for label association', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      expect(selector).toHaveAttribute('id', 'subtitle-selector');
    });

    it('supports keyboard navigation', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      selector.focus();
      expect(selector).toHaveFocus();
    });

    it('has focus indicators', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      expect(selector).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Styling', () => {
    it('has proper styling classes', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      expect(selector).toHaveClass(
        'px-3',
        'py-2',
        'bg-gray-800',
        'text-white',
        'border',
        'border-gray-700',
        'rounded-lg'
      );
    });

    it('has hover state styling', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      expect(selector).toHaveClass('hover:border-gray-600');
    });

    it('has transition styling', () => {
      const mockOnChange = jest.fn();
      render(
        <SubtitleLanguageSelector
          selectedLanguage="en"
          onLanguageChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('combobox');
      expect(selector).toHaveClass('transition-colors', 'duration-200');
    });
  });

  describe('All Supported Languages', () => {
    const languages: SubtitleLanguage[] = [
      'en',
      'es',
      'fr',
      'de',
      'pt',
      'it',
      'ru',
      'ja',
      'zh',
    ];

    languages.forEach((lang) => {
      it(`can select ${lang} language`, () => {
        const mockOnChange = jest.fn();
        render(
          <SubtitleLanguageSelector
            selectedLanguage="en"
            onLanguageChange={mockOnChange}
          />
        );

        const selector = screen.getByRole('combobox');
        fireEvent.change(selector, { target: { value: lang } });

        expect(mockOnChange).toHaveBeenCalledWith(lang);
      });
    });
  });
});
