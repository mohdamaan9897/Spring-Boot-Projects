package com.firstproject.FirstProject.util;

import org.springframework.stereotype.Component;

@Component
public class InvoiceNumberGenerator {
    private long lastInvoiceNumber = 0;

    public synchronized String generateNextInvoiceNumber(){
        lastInvoiceNumber++;
        return String.format("INV-%06d" , lastInvoiceNumber);
    }
}
