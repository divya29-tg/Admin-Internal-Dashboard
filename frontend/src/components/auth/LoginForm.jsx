import { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Alert, Fade } from '@mui/material';
import { Security as SecurityIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext.jsx';
import PinInput from '@/components/common/PinInput.jsx';

const PIN_LENGTH = 6;
const PASSWORD_SUFFIX = '@Trustgrid';

const STEPS = {
  USERNAME: 'username',
  CREDENTIAL: 'credential',
};

const LoginForm = () => {
  const { login, authError, authLoading } = useAuth();
  const [step, setStep] = useState(STEPS.USERNAME);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [formError, setFormError] = useState('');

  const handleNext = () => {
    if (!username.trim()) {
      setFormError('Enter your username.');
      return;
    }

    setFormError('');
    setStep(STEPS.CREDENTIAL);
  };

  const handleBack = () => {
    setFormError('');
    setStep(STEPS.USERNAME);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (step === STEPS.USERNAME) {
      handleNext();
      return;
    }

    if (pin.length !== PIN_LENGTH) {
      setFormError(`Enter all ${PIN_LENGTH} digits of your PIN.`);
      return;
    }

    setFormError('');
    login(username, `${pin}${PASSWORD_SUFFIX}`);
  };

  const displayError = formError || authError;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ background: '#0b0f19', p: 2 }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <SecurityIcon sx={{ fontSize: 50, color: '#3b82f6', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f8fafc' }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Access real-time analytics reports
            </Typography>
          </Box>

          {displayError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {displayError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {step === STEPS.USERNAME && (
              <Fade in={step === STEPS.USERNAME} timeout={250}>
                <Box>
                  <TextField
                    fullWidth
                    autoFocus
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <Button fullWidth type="submit" variant="contained" sx={{ py: 1.5, fontSize: 16 }}>
                    Next
                  </Button>
                </Box>
              </Fade>
            )}

            {step === STEPS.CREDENTIAL && (
              <Fade in={step === STEPS.CREDENTIAL} timeout={250}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 0.5, textAlign: 'center' }}>
                    Signed in as <strong style={{ color: '#f8fafc' }}>{username}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1.5, textAlign: 'center' }}>
                    Enter your {PIN_LENGTH}-digit PIN
                  </Typography>
                  <Box mb={3}>
                    <PinInput length={PIN_LENGTH} value={pin} onChange={setPin} disabled={authLoading} />
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={authLoading}
                    sx={{ py: 1.5, fontSize: 16, mb: 1.5 }}
                  >
                    {authLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <Button
                    fullWidth
                    type="button"
                    variant="text"
                    startIcon={<BackIcon />}
                    onClick={handleBack}
                    disabled={authLoading}
                    sx={{ color: '#94a3b8' }}
                  >
                    Back
                  </Button>
                </Box>
              </Fade>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;
