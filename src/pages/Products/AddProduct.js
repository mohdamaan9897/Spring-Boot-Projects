import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Container, 
  Typography, Paper, CircularProgress 
} from '@mui/material';
import { productService } from '../../services/api';

const AddProduct = () => {
  const [product, setProduct] = useState({
    brand: '',
    model: '',
    description: '',
    price: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!product.brand || !product.model || !product.price) {
      setError('Brand, Model and Price are required');
      setLoading(false);
      return;
    }

    try {
      const productData = {
        brand: product.brand.trim(),
        model: product.model.trim(),
        description: product.description.trim(),
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity) || 0
      };

      await productService.create(productData);
      navigate('/products');
    } catch (err) {
      console.error('Add product error:', err);
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Add Product</Typography>
        {error && (
          <Typography color="error" paragraph>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Brand *"
            name="brand"
            fullWidth
            margin="normal"
            value={product.brand}
            onChange={handleChange}
            required
          />
          <TextField
            label="Model *"
            name="model"
            fullWidth
            margin="normal"
            value={product.model}
            onChange={handleChange}
            required
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="normal"
            value={product.description}
            onChange={handleChange}
            multiline
            rows={3}
          />
          <TextField
            label="Price *"
            name="price"
            type="number"
            fullWidth
            margin="normal"
            value={product.price}
            onChange={handleChange}
            required
            inputProps={{ step: "0.01", min: "0" }}
          />
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            fullWidth
            margin="normal"
            value={product.quantity}
            onChange={handleChange}
            inputProps={{ min: "0" }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ mt: 3 }}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Add Product'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProduct;