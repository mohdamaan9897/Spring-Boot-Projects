import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Container, Typography, 
  Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow,
  Select, MenuItem, InputLabel, FormControl,
  CircularProgress, IconButton, Box
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { productService, billService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const GenerateBill = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        setProducts(response.data.filter(p => p.quantity > 0));
      } catch (err) {
        setError('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

 const handleAddItem = () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    const existingIndex = items.findIndex(item => item.product.id === product.id);

       if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += parseInt(quantity);
      setItems(updatedItems);
    } else {
      setItems([...items, {
        product,
        quantity: parseInt(quantity)
      }]);
    }

    setSelectedProduct('');
    setQuantity(1);
    setError('');
  };

   const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleGenerateBill = async () => {
    if (!customerName || !customerPhone) {
      setError('Please enter customer details');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const billItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const response = await billService.generate(
        customerName,
        customerPhone,
        billItems
      );

      // Create download link for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${customerName}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setItems([]);
    } catch (err) {
      console.error('Bill generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h4" gutterBottom>Generate New Bill</Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Customer Name *"
            fullWidth
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <TextField
            label="Customer Phone *"
            fullWidth
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Add Products</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Product</InputLabel>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              label="Select Product"
            >
              {products.map(product => (
                <MenuItem key={product.id} value={product.id}>
                  {product.brand} {product.model} (₹{product.price}, Stock: {product.quantity})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, e.target.value))}
            inputProps={{ min: 1 }}
            sx={{ width: 120 }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleAddItem}
            disabled={!selectedProduct}
          >
            Add
          </Button>
        </Box>

        {items.length > 0 && (
          <>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product.brand} {item.product.model}</TableCell>
                      <TableCell>₹{item.product.price.toFixed(2)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleRemoveItem(index)} 
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Typography variant="h6">
                Subtotal: ₹{calculateTotal().toFixed(2)}
              </Typography>
              <Typography variant="h6">
                GST (18%): ₹{(calculateTotal() * 0.18).toFixed(2)}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Grand Total: ₹{(calculateTotal() * 1.18).toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGenerateBill}
              disabled={loading}
              fullWidth
              sx={{ py: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Generate Bill & Download PDF'
              )}
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default GenerateBill;