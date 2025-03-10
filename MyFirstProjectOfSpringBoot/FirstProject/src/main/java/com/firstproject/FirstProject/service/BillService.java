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
        bill.setItems(items);

        double totalAmount = 0;
        for (BillItem item : items) {
            // Check if the product is null
            if (item.getProduct() == null || item.getProduct().getId() == null) {
                throw new RuntimeException("Product or Product ID is null in BillItem");
            }
            // Fetch the product from the database
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + item.getProduct().getId()));

            // Check if there's enough stock
            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getBrand() + " " + product.getModel());
            }

            // Reduce the product quantity
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            // Calculate total amount for the item
            totalAmount += product.getPrice() * item.getQuantity();

            // Link the bill item to the bill
            item.setBill(bill);
        }

        // Calculate GST and grand total
        double gstAmount = totalAmount * 0.18;
        double grandTotal = totalAmount + gstAmount;

        // Set amounts in the bill
        bill.setTotalAmount(totalAmount);
        bill.setGstAmount(gstAmount);
        bill.setGrandTotal(grandTotal);

        // Save the bill to the database
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
}