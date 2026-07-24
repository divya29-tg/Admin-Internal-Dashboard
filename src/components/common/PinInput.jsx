import { useRef } from 'react';
import { Box, TextField } from '@mui/material';

const PinInput = ({ length = 6, value, onChange, disabled }) => {
  const inputRefs = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index) => (event) => {
    const digit = event.target.value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join(''));

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <Box display="flex" gap={1.5} justifyContent="center">
      {digits.map((digit, index) => (
        <TextField
          key={index}
          inputRef={(el) => {
            inputRefs.current[index] = el;
          }}
          type="password"
          value={digit}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onPaste={handlePaste}
          disabled={disabled}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 1,
            'aria-label': `PIN digit ${index + 1}`,
            style: { textAlign: 'center', fontSize: 22, padding: '12px 0' },
          }}
          sx={{
            width: 48,
            '& .MuiOutlinedInput-root': {
              color: '#f8fafc',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default PinInput;
