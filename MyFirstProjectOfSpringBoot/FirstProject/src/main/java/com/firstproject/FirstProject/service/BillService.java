package com.firstproject.FirstProject.service;

import com.firstproject.FirstProject.Repository.BillRepository;
import com.firstproject.FirstProject.Repository.ProductRepository;
import com.firstproject.FirstProject.model.Bill;
import com.firstproject.FirstProject.model.BillItem;
import com.firstproject.FirstProject.model.Product;
import com.firstproject.FirstProject.util.InvoiceNumberGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InvoiceNumberGenerator invoiceNumberGenerator;

    public Bill generateBill(String customerName, String customerPhone, List<BillItem> items) {
        Bill bill = new Bill();
        bill.setCustomerName(customerName);
        bill.setCustomerPhone(customerPhone);
        bill.setDate(LocalDate.now());
        bill.setInvoiceNumber(invoiceNumberGenerator.generateNextInvoiceNumber());

        double totalAmount = 0;

        for (BillItem item : items) {
            // Fetch the complete product from database
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + item.getProduct().getId()));

            // Check stock
            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getBrand() + " " + product.getModel());
            }

            // Update stock
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            // Create a new BillItem with the complete product
            BillItem newItem = new BillItem();
            newItem.setProduct(product);  // Set the complete product object
            newItem.setQuantity(item.getQuantity());
            newItem.setBill(bill);

            // Calculate amount
            totalAmount += product.getPrice() * item.getQuantity();

            // Add to bill's items list
            if (bill.getItems() == null) {
                bill.setItems(new ArrayList<>());
            }
            bill.getItems().add(newItem);
        }

        // Calculate GST and grand total
        double gstAmount = totalAmount * 0.18;
        double grandTotal = totalAmount + gstAmount;

        bill.setTotalAmount(totalAmount);
        bill.setGstAmount(gstAmount);
        bill.setGrandTotal(grandTotal);

        return billRepository.save(bill);
    }

    public List<Bill> getBillsByCustomerPhone(String customerPhone) {
        return billRepository.findByCustomerPhone(customerPhone);
    }

    public List<Bill> getBillsByDate(LocalDate date) {
        return billRepository.findByDate(date);
    }

    public Bill getBillByInvoiceNumber(String invoiceNumber) {
        return billRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() ->
                        new RuntimeException("Bill not found with invoice number: " + invoiceNumber));
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }
}