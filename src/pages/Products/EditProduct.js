import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Container, 
  Typography, Paper, CircularProgress 
} from '@mui/material';
import { productService } from '../../services/api';

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({
    brand: '',
    model: '',
    description: '',
    price: 0,
    quantity: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getById(id);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to load product');
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productService.update(id, product);
      navigate('/products');
    } catch (err) {
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : 
              name === 'quantity' ? parseInt(value) : 
              value
    }));
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Edit Product</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Brand"
            name="brand"
            fullWidth
            margin="normal"
            value={product.brand}
            onChange={handleChange}
            required
          />
          <TextField
            label="Model"
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
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            fullWidth
            margin="normal"
            value={product.price}
            onChange={handleChange}
            required
          />
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            fullWidth
            margin="normal"
            value={product.quantity}
            onChange={handleChange}
            required
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Product'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProduct;