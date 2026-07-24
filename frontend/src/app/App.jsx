import { CssBaseline, ThemeProvider } from '@mui/material';
import { darkTheme } from '../theme/darkTheme.js';
import AppRoutes from './AppRoutes.jsx';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
