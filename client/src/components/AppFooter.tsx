import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export default function AppFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box className="mui-footer-isolation-wrapper">
      {/* Top border separator */}
      <Box 
        sx={{ 
          width: '100%', 
          height: '2px', 
          bgcolor: '#e0e0e0',
          mt: 0
        }}
      />
      
      {/* Spacer */}
      <Box sx={{ height: '40px' }} />
      
      {/* Footer content */}
      <Container maxWidth="lg" sx={{ width: '100%', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.85em' }}>
            &copy; {currentYear} Microsoft
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
