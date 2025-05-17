import React, { useState, useEffect } from 'react';
import { 
  Typography, Paper, Container, 
  Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow,
  Button, CircularProgress
} from '@mui/material';
import { billService } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const BillDetails = () => {
  const { invoiceNumber } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      setLoading(true);
      try {
        const response = await billService.getByInvoiceNumber(invoiceNumber);
        setBill(response.data);
      } catch (err) {
        setError('Failed to load bill details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [invoiceNumber]);

  const handleDownload = async () => {
    try {
      const response = await billService.getByInvoiceNumber(invoiceNumber);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download bill');
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!bill) return <Typography>Bill not found</Typography>;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Bill Details: {bill.invoiceNumber}
        </Typography>
        
        <Typography variant="h6">Customer: {bill.customerName}</Typography>
        <Typography variant="body1">Phone: {bill.customerPhone}</Typography>
        <Typography variant="body1">
          Date: {new Date(bill.date).toLocaleDateString()}
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product.brand} {item.product.model}</TableCell>
                  <TableCell>₹{item.product.price.toFixed(2)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Subtotal: ₹{bill.totalAmount.toFixed(2)}
        </Typography>
        <Typography variant="h6">
          GST (18%): ₹{bill.gstAmount.toFixed(2)}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
          Grand Total: ₹{bill.grandTotal.toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          sx={{ mt: 3 }}
        >
          Download PDF
        </Button>
      </Paper>
    </Container>
  );
};

export default BillDetails;