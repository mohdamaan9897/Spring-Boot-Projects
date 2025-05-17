import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Typography, 
  TextField, Button, Box, CircularProgress, Container
} from '@mui/material';
import { billService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const BillList = () => {
  const [bills, setBills] = useState([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchInvoice, setSearchInvoice] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  
const fetchBills = async () => {
  setLoading(true);
  setError('');
  
  try {
    let result;
    
    if (searchInvoice) {
      result = await billService.getByInvoiceNumber(searchInvoice);
    } 
    else if (searchDate) {
      result = await billService.getByDate(searchDate);
    }
    else if (searchPhone) {
      result = await billService.getByCustomerPhone(searchPhone);
    }
    else {
      result = await billService.getAll();
    }

    if (result.error) {
      setError(result.error);
    }
    setBills(result.data);
    
    // Debug logs
    console.log('Fetched bills:', result.data);
    console.log('Current search filters:', {
      searchPhone,
      searchInvoice,
      searchDate
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    setError('An unexpected error occurred');
    setBills([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBills();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBills();
  };

  const handleReset = () => {
    setSearchPhone('');
    setSearchInvoice('');
    setSearchDate(null);
    fetchBills();
  };

  const handleViewBill = (invoiceNumber) => {
    navigate(`/bills/${invoiceNumber}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Bill History</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Search Bills</Typography>
        <Box 
          component="form" 
          onSubmit={handleSearch}
          sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
        >
          <TextField
            label="Customer Phone"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Invoice Number"
            value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Date (YYYY-MM-DD)"
            placeholder="e.g., 2023-06-15"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ height: 56 }}
          >
            Search
          </Button>
          <Button 
            type="button"
            variant="outlined" 
            onClick={handleReset}
            disabled={loading}
            sx={{ height: 56 }}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total (₹)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.length > 0 ? (
              bills.map((bill) => (
                <TableRow key={bill.invoiceNumber}>
                  <TableCell>{bill.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(bill.date)}</TableCell>
                  <TableCell>{bill.customerName}</TableCell>
                  <TableCell>{bill.customerPhone}</TableCell>
                  <TableCell>₹{bill.grandTotal?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewBill(bill.invoiceNumber)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {!loading && 'No bills found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default BillList;